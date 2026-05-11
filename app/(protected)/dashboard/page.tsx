'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../../lib/supabase'

import { useAuth }
from '../../../contexts/AuthContext'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function Page() {

  const {
    userData,
    loading,
  } = useAuth()

  // COUNTS
  const [employeeCount, setEmployeeCount] =
    useState(0)

  const [activeEmployees, setActiveEmployees] =
    useState(0)

  const [activityCount, setActivityCount] =
    useState(0)

  const [upcomingActivities, setUpcomingActivities] =
    useState(0)

  const [assignmentCount, setAssignmentCount] =
    useState(0)

  // TASK COUNTS
  const [pendingTasks, setPendingTasks] =
    useState(0)

  const [ongoingTasks, setOngoingTasks] =
    useState(0)

  const [completedTasks, setCompletedTasks] =
    useState(0)

  const [overdueTasks, setOverdueTasks] =
    useState(0)

  // FEEDS
  const [recentActivities, setRecentActivities] =
    useState<any[]>([])

  const [recentAssignments, setRecentAssignments] =
    useState<any[]>([])

  const [liveFeed, setLiveFeed] =
    useState<any[]>([])

  // ANALYTICS
  const [statusData, setStatusData] =
    useState<any[]>([])

  const [divisionData, setDivisionData] =
    useState<any[]>([])

  const [workloadData, setWorkloadData] =
    useState<any[]>([])

  // CHART COLORS
  const STATUS_COLORS = [

    '#f59e0b',
    '#3b82f6',
    '#10b981',
    '#ef4444',

  ]

  // LOAD DASHBOARD
  const loadDashboard =
    async () => {

      // COUNTS
      const [
        { count: e },
        { count: a },
        { count: as },
      ] = await Promise.all([

        supabase
          .from('employees')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('activities')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('assignments')
          .select('*', {
            count: 'exact',
            head: true,
          }),

      ])

      setEmployeeCount(e || 0)
      setActivityCount(a || 0)
      setAssignmentCount(as || 0)

      // EMPLOYEES
      const { data: employees } =
        await supabase
          .from('employees')
          .select('*')

      const active =
        employees?.filter(
          (e: any) =>
            e.status === 'active'
        ).length || 0

      setActiveEmployees(active)

      // ACTIVITIES
      const { data: activities } =
        await supabase
          .from('activities')
          .select('*')
          .order('activity_date', {
            ascending: true,
          })

      const today =
        new Date()

      const upcoming =
        activities?.filter(
          (a: any) =>
            new Date(
              a.activity_date
            ) >= today
        ).length || 0

      setUpcomingActivities(
        upcoming
      )

      setRecentActivities(
        activities?.slice(0, 5) || []
      )

      // ASSIGNMENTS
      const { data: assignments } =
        await supabase
          .from('assignments')
          .select(`
            *,
            employees(
              name,
              photo_url,
              division
            ),
            activities(
              title
            )
          `)
          .order('created_at', {
            ascending: false,
          })

      setRecentAssignments(
        assignments?.slice(0, 5) || []
      )

      // TASK STATUS
      const pending =
        assignments?.filter(
          (a: any) =>
            a.status === 'pending'
        ).length || 0

      const ongoing =
        assignments?.filter(
          (a: any) =>
            a.status === 'ongoing'
        ).length || 0

      const completed =
        assignments?.filter(
          (a: any) =>
            a.status === 'completed'
        ).length || 0

      const cancelled =
        assignments?.filter(
          (a: any) =>
            a.status === 'cancelled'
        ).length || 0

      // OVERDUE
      const overdue =
        assignments?.filter(
          (a: any) => {

            if (
              !a.deadline ||
              a.status === 'completed'
            ) {

              return false
            }

            return (
              new Date(
                a.deadline
              ) < new Date()
            )
          }
        ).length || 0

      setPendingTasks(pending)
      setOngoingTasks(ongoing)
      setCompletedTasks(completed)
      setOverdueTasks(overdue)

      // STATUS CHART
      setStatusData([

        {
          name: 'Pending',
          value: pending,
        },

        {
          name: 'Ongoing',
          value: ongoing,
        },

        {
          name: 'Completed',
          value: completed,
        },

        {
          name: 'Cancelled',
          value: cancelled,
        },

      ])

      // DIVISION ANALYTICS
      const divisions = [

        'Admin and Training Division',

        'Operations and Warning Division',

        'Planning and Research Division',

      ]

      const analytics =
        divisions.map(
          (division) => {

            const divisionEmployees =
              employees?.filter(
                (e: any) =>
                  e.division === division
              ) || []

            return {

              division,

              employees:
                divisionEmployees.length,

            }
          }
        )

      setDivisionData(
        analytics
      )

      // WORKLOAD
      const workload =
        employees?.map(
          (employee: any) => {

            const taskCount =
              assignments?.filter(
                (a: any) =>
                  a.employee_id ===
                  employee.id
              ).length || 0

            return {

              name: employee.name,

              tasks: taskCount,

            }
          }
        ) || []

      setWorkloadData(
        workload.slice(0, 8)
      )

      // LIVE FEED
      const feed = [

        ...(assignments || []).map(
          (a: any) => ({

            type: 'assignment',

            text:
              `${a.employees?.name}
updated task status.`,

            created_at:
              a.created_at,

          })
        ),

        ...(activities || []).map(
          (a: any) => ({

            type: 'activity',

            text:
              `New activity:
${a.title}`,

            created_at:
              a.created_at,

          })
        ),

      ]

      feed.sort(
        (a: any, b: any) =>

          new Date(
            b.created_at
          ).getTime() -

          new Date(
            a.created_at
          ).getTime()
      )

      setLiveFeed(
        feed.slice(0, 8)
      )
  }

  // REALTIME
  useEffect(() => {

    loadDashboard()

    const channel = supabase

      .channel(
        'dashboard-live'
      )

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },

        () => {

          loadDashboard()

        }
      )

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'assignments',
        },

        () => {

          loadDashboard()

        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )

    }

  }, [])

  // LOADING
  if (loading) {

    return (

      <div className="
        min-h-screen
        flex
        items-center
        justify-center
        text-xl
        font-semibold
        text-blue-900
      ">

        Loading Dashboard...

      </div>
    )
  }

  // CARD COMPONENT
  const Card = ({
    title,
    value,
    color,
  }: {
    title: string
    value: number
    color: string
  }) => (

    <div
      className={`
        rounded-3xl
        p-6
        text-white
        shadow-2xl
        transition
        hover:scale-[1.02]
        ${color}
      `}
    >

      <h3 className="
        text-sm
        uppercase
        tracking-wide
      ">
        {title}
      </h3>

      <p className="
        text-5xl
        font-bold
        mt-4
      ">
        {value}
      </p>

    </div>
  )

  return (

    <div className="
      space-y-8
      w-full
      min-w-0
    ">

      {/* HEADER */}
      <div>

        <h1 className="
          text-4xl
          font-bold
          text-blue-900
        ">
          Executive Dashboard
        </h1>

        <p className="
          text-gray-700
          mt-2
        ">
          Activity Tasking Management System
        </p>

      </div>

      {/* SUMMARY */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-7
        gap-6
      ">

        <Card
          title="Employees"
          value={employeeCount}
          color="
            bg-gradient-to-br
            from-green-500
            to-green-700
          "
        />

        <Card
          title="Active"
          value={activeEmployees}
          color="
            bg-gradient-to-br
            from-emerald-500
            to-emerald-700
          "
        />

        <Card
          title="Activities"
          value={activityCount}
          color="
            bg-gradient-to-br
            from-yellow-400
            to-orange-500
          "
        />

        <Card
          title="Upcoming"
          value={upcomingActivities}
          color="
            bg-gradient-to-br
            from-blue-500
            to-blue-700
          "
        />

        <Card
          title="Pending"
          value={pendingTasks}
          color="
            bg-gradient-to-br
            from-orange-500
            to-orange-700
          "
        />

        <Card
          title="Completed"
          value={completedTasks}
          color="
            bg-gradient-to-br
            from-purple-500
            to-purple-700
          "
        />

        <Card
          title="Overdue"
          value={overdueTasks}
          color="
            bg-gradient-to-br
            from-red-500
            to-red-700
          "
        />

      </div>

      {/* CHARTS */}
      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

        {/* PIE */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">
            Task Status Analytics
          </h2>

          <div
            style={{
              width: '100%',
              height: 320,
            }}
          >

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >

                  {statusData.map(
                    (
                      entry: any,
                      index: number
                    ) => (

                      <Cell
                        key={index}
                        fill={
                          STATUS_COLORS[
                            index %
                            STATUS_COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* DIVISION */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">
            Division Analytics
          </h2>

          <div
            style={{
              width: '100%',
              height: 320,
            }}
          >

            <ResponsiveContainer>

              <BarChart
                data={divisionData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="division"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="employees"
                  fill="#2563eb"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* WORKLOAD */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
          lg:col-span-2
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">
            Personnel Workload
          </h2>

          <div
            style={{
              width: '100%',
              height: 350,
            }}
          >

            <ResponsiveContainer>

              <BarChart
                data={workloadData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="tasks"
                  fill="#f97316"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* FEEDS */}
      <div className="
        grid
        grid-cols-1
        lg:grid-cols-3
        gap-6
      ">

        {/* ACTIVITIES */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">
            Recent Activities
          </h2>

          <div className="
            space-y-4
          ">

            {recentActivities.map(
              (activity: any) => (

              <div
                key={activity.id}
                className="
                  border
                  rounded-2xl
                  p-4
                "
              >

                <h3 className="
                  font-bold
                  text-blue-900
                ">
                  {activity.title}
                </h3>

                <p className="
                  text-gray-600
                  mt-1
                ">
                  {activity.activity_date}
                </p>

              </div>

            ))}

          </div>

        </div>

        {/* ASSIGNMENTS */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">
            Recent Assignments
          </h2>

          <div className="
            space-y-4
          ">

            {recentAssignments.map(
              (assign: any) => (

              <div
                key={assign.id}
                className="
                  border
                  rounded-2xl
                  p-4
                  flex
                  items-center
                  gap-4
                "
              >

                {assign.employees?.photo_url ? (

                  <img
                    src={
                      assign.employees.photo_url
                    }
                    alt="Employee"
                    className="
                      w-14 h-14
                      rounded-full
                      object-cover
                    "
                  />

                ) : (

                  <div className="
                    w-14 h-14
                    rounded-full
                    bg-blue-100
                    text-blue-700
                    flex
                    items-center
                    justify-center
                    font-bold
                  ">

                    {
                      assign.employees?.name
                        ?.charAt(0)
                    }

                  </div>

                )}

                <div>

                  <h3 className="
                    font-bold
                    text-blue-900
                  ">
                    {assign.employees?.name}
                  </h3>

                  <p className="
                    text-gray-600
                  ">
                    {assign.task}
                  </p>

                  <p className="
                    text-sm
                    text-orange-600
                    mt-1
                  ">
                    {
                      assign.activities?.title
                    }
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* LIVE FEED */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">
            Live Operations Feed
          </h2>

          <div className="
            space-y-4
          ">

            {liveFeed.map(
              (
                item: any,
                index: number
              ) => (

              <div
                key={index}
                className="
                  border-l-4
                  border-blue-500
                  bg-blue-50
                  rounded-2xl
                  p-4
                "
              >

                <p className="
                  font-medium
                  text-gray-800
                ">
                  {item.text}
                </p>

                <p className="
                  text-sm
                  text-gray-500
                  mt-1
                ">
                  {
                    new Date(
                      item.created_at
                    ).toLocaleString()
                  }
                </p>

              </div>

            ))}

            

          </div>

        </div>

      </div>

    </div>
  )
  
}

