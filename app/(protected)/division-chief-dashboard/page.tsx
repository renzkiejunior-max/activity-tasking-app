
'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link
from 'next/link'

import ProtectedRoute
from '@/components/ProtectedRoute'

import { supabase }
from '@/lib/supabase'

import { useAuth }
from '@/contexts/AuthContext'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function Page() {

  const { userData } =
    useAuth()

  // COUNTS
  const [employeeCount,
    setEmployeeCount] =
    useState(0)

  const [assignmentCount,
    setAssignmentCount] =
    useState(0)

  const [pendingTasks,
    setPendingTasks] =
    useState(0)

  const [completedTasks,
    setCompletedTasks] =
    useState(0)

  const [overdueTasks,
    setOverdueTasks] =
    useState(0)

  // FEEDS
  const [recentAssignments,
    setRecentAssignments] =
    useState<any[]>([])

  const [recentActivities,
    setRecentActivities] =
    useState<any[]>([])

  // EMPLOYEES
  const [employees,
    setEmployees] =
    useState<any[]>([])

  // CHIEF PROFILE
  const [chiefProfile,
    setChiefProfile] =
    useState<any>(null)

  // CHART
  const [statusData,
    setStatusData] =
    useState<any[]>([])

  const STATUS_COLORS = [

    '#f97316',
    '#22c55e',
    '#ef4444',

  ]

  // LOAD DASHBOARD
  const loadDashboard =
    async () => {

      const division =
        userData?.division

      // CHIEF PROFILE
      const {
        data: chiefData,
      } = await supabase

        .from('employees')

        .select('*')

        .eq(
          'email',
          userData?.email
        )

        .single()

      setChiefProfile(
        chiefData
      )

      // EMPLOYEES
      const {
        data: divisionEmployees,
      } = await supabase

        .from('employees')

        .select(`
          *,
          assignments(
            id
          ),

          focal_persons(
            id,
            title,
            description
          )

        `)

        .eq(
          'division',
          division
        )

      setEmployees(
        divisionEmployees || []
      )

      setEmployeeCount(
        divisionEmployees?.filter(
          (employee: any) =>

            employee.email !==
            userData?.email
        ).length || 0
      )

      // ASSIGNMENTS
      const {
        data: assignments,
      } = await supabase

        .from('assignments')

        .select(`
          *,
          employees(
            name,
            division,
            photo_url
          ),
          activities(
            title
          )
        `)

        .order('created_at', {
          ascending: false,
        })

      setAssignmentCount(
        assignments?.length || 0
      )

      setRecentAssignments(
        assignments?.slice(0, 5) || []
      )

      // COUNTS
      const pending =
        assignments?.filter(
          (a: any) =>
            a.status === 'pending'
        ).length || 0

      const completed =
        assignments?.filter(
          (a: any) =>
            a.status === 'completed'
        ).length || 0

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

      setPendingTasks(
        pending
      )

      setCompletedTasks(
        completed
      )

      setOverdueTasks(
        overdue
      )

      // CHART
      setStatusData([

        {
          name: 'Pending',
          value: pending,
        },

        {
          name: 'Completed',
          value: completed,
        },

        {
          name: 'Overdue',
          value: overdue,
        },

      ])

      // ACTIVITIES
      const {
        data: activities,
      } = await supabase

        .from('activities')

        .select('*')

        .order('created_at', {
          ascending: false,
        })

      setRecentActivities(
        activities?.slice(0, 5) || []
      )
  }

  // REALTIME
  useEffect(() => {

    if (!userData) return

    loadDashboard()

    const channel = supabase

      .channel(
        'division-dashboard'
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

  }, [userData])

  return (

    <ProtectedRoute
      allowedRoles={[
        'division_chief',
      ]}
    >

      <div className="
        space-y-8
      ">

        {/* HEADER */}
        <div>

          <h1 className="
            text-5xl
            font-bold
            text-blue-900
          ">
            Division Chief Dashboard
          </h1>

          <p className="
            text-gray-700
            mt-3
            text-lg
          ">
            Division operations and personnel monitoring
          </p>

        </div>

        {/* SUMMARY */}
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-5
          gap-6
        ">

          <Card
            title="Personnel"
            value={employeeCount}
            color="
              bg-gradient-to-br
              from-green-500
              to-green-700
            "
          />

          <Card
            title="Assignments"
            value={assignmentCount}
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

        {/* DIVISION WORKSPACE */}
        <div className="
          grid
          grid-cols-1
          xl:grid-cols-[380px_1fr]
          gap-6
        ">

          {/* CHIEF PROFILE */}
          <div className="
            bg-linear-to-b
            from-blue-900
            to-blue-950

            text-white

            rounded-3xl
            shadow-2xl

            overflow-hidden
          ">

            <div className="
              p-8
            ">

              <div className="
                flex
                flex-col
                items-center
                text-center
              ">

                {/* PHOTO */}
                {chiefProfile?.photo_url ? (

                  <img
  src={
    chiefProfile?.photo_url &&
    chiefProfile?.photo_url.startsWith('http')

      ? chiefProfile?.photo_url

      : '/images/default-avatar.png'
  }
                    alt={chiefProfile.name}
                    className="
                      w-36
                      h-36

                      rounded-full
                      object-cover

                      border-4
                      border-orange-400
                    "
                  />

                ) : (

                  <div className="
                    w-36
                    h-36

                    rounded-full

                    bg-orange-500

                    flex
                    items-center
                    justify-center

                    text-5xl
                    font-bold
                  ">

                    {
                      chiefProfile?.name
                        ?.charAt(0)
                        ?.toUpperCase()
                    }

                  </div>

                )}

                {/* NAME */}
                <h2 className="
                  text-3xl
                  font-bold
                  mt-6
                  leading-tight
                ">

                  {chiefProfile?.name}

                </h2>

                {/* DESIGNATION */}
                <p className="
                  text-blue-100
                  mt-3
                ">

                  {chiefProfile?.designation}

                </p>

                {/* DIVISION */}
                <p className="
                  text-orange-300
                  font-medium
                  mt-1
                ">

                  {chiefProfile?.division}

                </p>

                {/* STATUS */}
                <div className="
                  flex
                  items-center
                  gap-3
                  mt-6
                ">

                  <div className={`
                    w-4
                    h-4
                    rounded-full

                    ${
                      chiefProfile?.online_status ===
                      'online'

                        ? 'bg-green-500'

                        : 'bg-gray-400'
                    }
                  `} />

                  <span className="
                    text-sm
                  ">

                    {
                      chiefProfile?.online_status ||
                      'offline'
                    }

                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* PERSONNEL GRID */}
          <div className="
            bg-white
            rounded-3xl
            shadow-xl
            border

            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-8
            ">

              <h2 className="
                text-3xl
                font-bold
                text-blue-900
              ">

                Division Personnel

              </h2>

              <div className="
                text-gray-500
                text-sm
              ">

                {
                  employees.filter(
                    (employee: any) =>

                      employee.email !==
                      userData?.email
                  ).length
                }
                {' '}
                Personnel

              </div>

            </div>

            {/* GRID */}
            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-3
              2xl:grid-cols-4

              gap-6
            ">

              {employees

                .filter(
                  (employee: any) =>

                    employee.email !==
                    userData?.email
                )

                .map(
                  (employee: any) => (

                  <Link
                    key={employee.id}
                    href={`/division-chief-dashboard/employee/${employee.id}`}
                  >

                    <div className="
                      bg-linear-to-br
                      from-blue-800
                      to-blue-900

                      hover:scale-[1.02]

                      rounded-3xl

                      p-6

                      transition-all

                      text-white

                      shadow-lg

                      h-full
                    ">

                      {/* TOP */}
                      <div className="
                        flex
                        items-start
                        justify-between
                      ">

                        {/* PHOTO */}
                        {employee.photo_url ? (

                          <img
                            src={employee.photo_url}
                            alt={employee.name}
                            className="
                              w-24
                              h-24

                              rounded-full
                              object-cover

                              border-4
                              border-white/20
                            "
                          />

                        ) : (

                          <div className="
                            w-24
                            h-24

                            rounded-full

                            bg-orange-500

                            flex
                            items-center
                            justify-center

                            text-3xl
                            font-bold
                          ">

                            {
                              employee.name
                                ?.charAt(0)
                                ?.toUpperCase()
                            }

                          </div>

                        )}

                        {/* STATUS */}
                        <div className="
                          flex
                          items-center
                          gap-2
                        ">

                          <div className={`
                            w-4
                            h-4
                            rounded-full

                            ${
                              employee.online_status ===
                              'online'

                                ? 'bg-green-500'

                                : 'bg-gray-400'
                            }
                          `} />

                          <span className="
                            text-sm
                            text-blue-100
                          ">

                            {
                              employee.online_status ||
                              'offline'
                            }

                          </span>

                        </div>

                      </div>

                      {/* INFO */}
                      <div className="
                        mt-6
                      ">

                        <h3 className="
                          text-2xl
                          font-bold
                          leading-tight

                          break-word
                        ">

                          {employee.name}

                        </h3>

                        <p className="
                          text-blue-100
                          mt-3

                          leading-relaxed
                        ">

                          {employee.designation}

                        </p>

{/* FOCAL PERSONS */}
{employee.focal_persons
  ?.length > 0 && (

  <div className="
    mt-5
    space-y-3
  ">

    {employee.focal_persons.map(
      (
        focal: any
      ) => (

      <div
        key={focal.id}
        className="
          bg-white/10

          border
          border-white/10

          rounded-2xl

          p-4
        "
      >

        <p className="
          text-xs
          uppercase
          tracking-wide

          text-orange-200
        ">

          Focal Person

        </p>

        <h4 className="
          text-lg
          font-bold
          mt-2
        ">

          {focal.title}

        </h4>

        {focal.description && (

          <p className="
            text-sm
            text-blue-100
            mt-2
            leading-relaxed
          ">

            {focal.description}

          </p>

        )}

      </div>

    ))}

  </div>

)}

                        {/* TASKS */}
                        <div className="
                          mt-6
                        ">

                          <span className="
                            text-orange-300
                            font-medium
                          ">

                            📋
                            {' '}
                            {
                              employee.assignments
                                ?.length || 0
                            }
                            {' '}
                            Tasks

                          </span>

                        </div>

                      </div>

                    </div>

                  </Link>

                ))}

            </div>

          </div>

        </div>

        {/* CHART */}
        <div className="
  w-full
  h-87.5
">

  <ResponsiveContainer
    width="100%"
    height="100%"
  >

    <PieChart>

      <Pie
        data={statusData}
        dataKey="value"
        nameKey="name"
        outerRadius={130}
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

      <Legend />

    </PieChart>

  </ResponsiveContainer>

</div>

        </div>

        {/* FEEDS */}
        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-6
        ">

          {/* ASSIGNMENTS */}
          <div className="
            bg-white
            rounded-3xl
            shadow-xl
            p-6
            border
          ">

            <h2 className="
              text-3xl
              font-bold
              text-blue-900
              mb-6
            ">
              Recent Assignments
            </h2>

            <div className="
              space-y-5
            ">

              {recentAssignments.map(
                (assign: any) => (

                <div
                  key={assign.id}
                  className="
                    border
                    rounded-3xl
                    p-5
                  "
                >

                  <h3 className="
                    font-bold
                    text-blue-900
                    text-lg
                  ">
                    {assign.employees?.name}
                  </h3>

                  <p className="
                    text-gray-700
                    mt-2
                  ">
                    {assign.task}
                  </p>

                  <p className="
                    text-sm
                    text-orange-600
                    mt-3
                  ">
                    {
                      assign.activities?.title
                    }
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* ACTIVITIES */}
          <div className="
            bg-white
            rounded-3xl
            shadow-xl
            p-6
            border
          ">

            <h2 className="
              text-3xl
              font-bold
              text-blue-900
              mb-6
            ">
              Recent Activities
            </h2>

            <div className="
              space-y-5
            ">

              {recentActivities.map(
                (activity: any) => (

                <div
                  key={activity.id}
                  className="
                    border
                    rounded-3xl
                    p-5
                  "
                >

                  <h3 className="
                    font-bold
                    text-blue-900
                    text-lg
                  ">
                    {activity.title}
                  </h3>

                  <p className="
                    text-gray-600
                    mt-2
                  ">
                    {activity.activity_date}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

    </ProtectedRoute>
  )
}

// CARD
function Card({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: string
}) {

  return (

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
        text-6xl
        font-bold
        mt-5
      ">
        {value}
      </p>

    </div>
  )
}
