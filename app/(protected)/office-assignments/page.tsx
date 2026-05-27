'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '@/lib/supabase'

export default function Page() {

  const [
    assignments,
    setAssignments,
  ] = useState<any[]>([])

  const [
    employees,
    setEmployees,
  ] = useState<any[]>([])

  const [
    showAnalytics,
    setShowAnalytics,
  ] = useState(false)

  const [
    search,
    setSearch,
  ] = useState('')

  // FETCH ASSIGNMENTS
  const fetchAssignments =
    async () => {

      const { data } =
        await supabase

          .from('assignments')

          .select(`
            *,
            employees(
              name,
              photo_url,
              email,
              division,
              designation
            ),
            activities(
              title,
              activity_date,
              activity_time,
              focal_person,
              location_name,
              venue_details
            )
          `)

          .order(
            'created_at',
            {
              ascending: false,
            }
          )

      setAssignments(
        data || []
      )
    }

  // FETCH EMPLOYEES
  const fetchEmployees =
    async () => {

      const { data } =
        await supabase

          .from('employees')

          .select('*')

      setEmployees(
        data || []
      )
    }

  // LOAD
  useEffect(() => {

    fetchAssignments()
    fetchEmployees()

  }, [])

  // SEARCH FILTER
  const filteredAssignments =

    assignments.filter(
      (assign: any) => {

        const searchText =
          search.toLowerCase()

        return (

          assign.task
            ?.toLowerCase()
            .includes(searchText)

          ||

          assign.activities
            ?.title
            ?.toLowerCase()
            .includes(searchText)

          ||

          assign.employees
            ?.name
            ?.toLowerCase()
            .includes(searchText)

        )
      }
    )

  // GROUP ASSIGNMENTS
  const groupedAssignments =
    Object.values(

      filteredAssignments.reduce(
        (
          acc: any,
          assign: any
        ) => {

          const key =
            `${
              assign.activity_id ||
              'personal'
            }-${assign.task}`

          if (!acc[key]) {

            acc[key] = {

              ...assign,

              employeesList: [],
            }
          }

          acc[key]
            .employeesList
            .push(assign)

          return acc

        },

        {}
      )
    )

  // KPI
  const pendingCount =

    assignments.filter(
      (a: any) =>
        a.status ===
        'pending'
    ).length

  const ongoingCount =

    assignments.filter(
      (a: any) =>
        a.status ===
        'ongoing'
    ).length

  const completedCount =

    assignments.filter(
      (a: any) =>
        a.status ===
        'completed'
    ).length

  const urgentCount =

    assignments.filter(
      (a: any) =>
        a.priority ===
        'urgent'
    ).length

  // PRIORITY COLORS
  const getPriorityColor =
    (
      priority: string
    ) => {

      if (
        priority ===
        'urgent'
      ) {

        return `
          bg-red-100
          text-red-700
        `
      }

      if (
        priority ===
        'high'
      ) {

        return `
          bg-orange-100
          text-orange-700
        `
      }

      if (
        priority ===
        'medium'
      ) {

        return `
          bg-blue-100
          text-blue-700
        `
      }

      return `
        bg-gray-100
        text-gray-700
      `
    }

  return (

    <div className="
      p-4
      lg:p-6

      space-y-6
    ">

      {/* HEADER */}
      <div className="
        bg-linear-to-r
        from-blue-900
        via-blue-700
        to-blue-500

        rounded-3xl

        p-6
        lg:p-8

        text-white

        shadow-2xl
      ">

        <div className="
          inline-flex
          items-center
          gap-2

          bg-white/20

          px-4
          py-2

          rounded-full

          text-sm
          font-semibold
        ">

          📌 Office Deployment Center

        </div>

        <h1 className="
          text-4xl
          lg:text-5xl

          font-black

          mt-5
        ">

          Office Assignments

        </h1>

        <p className="
          text-blue-100
          mt-3

          max-w-3xl
        ">

          Monitor office-wide
          operational deployments,
          personnel assignments,
          division workload,
          overdue tasks,
          and operational progress.

        </p>

      </div>

      {/* SEARCH */}
      <div className="
        bg-white

        border

        rounded-3xl

        shadow-lg

        p-5
      ">

        <input

          type="text"

          placeholder="
            Search assignments,
            personnel,
            activities...
          "

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          className="
            w-full

            border
            border-gray-200

            rounded-2xl

            px-5
            py-4
          "
        />

      </div>

      {/* ANALYTICS TOGGLE */}
      <div className="
        flex
        justify-end
      ">

        <button

          onClick={() =>
            setShowAnalytics(
              !showAnalytics
            )
          }

          className="
            bg-blue-600
            hover:bg-blue-700

            text-white

            px-5
            py-3

            rounded-2xl

            font-semibold

            shadow-lg
          "
        >

          {
            showAnalytics

              ? 'Hide Analytics'

              : 'View Analytics'
          }

        </button>

      </div>

      {/* KPI */}
      {showAnalytics && (

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4

          gap-4
        ">

          {/* PENDING */}
          <div className="
            bg-white
            rounded-3xl
            shadow-lg
            border
            p-5
          ">

            <p className="
              text-gray-500
              text-sm
            ">

              Pending

            </p>

            <h2 className="
              text-4xl
              font-black
              text-orange-500
              mt-2
            ">

              {pendingCount}

            </h2>

          </div>

          {/* ONGOING */}
          <div className="
            bg-white
            rounded-3xl
            shadow-lg
            border
            p-5
          ">

            <p className="
              text-gray-500
              text-sm
            ">

              Ongoing

            </p>

            <h2 className="
              text-4xl
              font-black
              text-blue-600
              mt-2
            ">

              {ongoingCount}

            </h2>

          </div>

          {/* COMPLETED */}
          <div className="
            bg-white
            rounded-3xl
            shadow-lg
            border
            p-5
          ">

            <p className="
              text-gray-500
              text-sm
            ">

              Completed

            </p>

            <h2 className="
              text-4xl
              font-black
              text-green-600
              mt-2
            ">

              {completedCount}

            </h2>

          </div>

          {/* URGENT */}
          <div className="
            bg-white
            rounded-3xl
            shadow-lg
            border
            p-5
          ">

            <p className="
              text-gray-500
              text-sm
            ">

              Urgent

            </p>

            <h2 className="
              text-4xl
              font-black
              text-red-600
              mt-2
            ">

              {urgentCount}

            </h2>

          </div>

        </div>

      )}

      {/* ASSIGNMENTS */}
      <div className="
        space-y-6
      ">

        {groupedAssignments.map(
          (assign: any) => {

            const currentProgress =
              assign.progress || 0

            const today =
              new Date()

            const deadlineDate =
              assign.deadline
                ? new Date(
                    assign.deadline
                  )
                : null

            const overdue =
              deadlineDate &&
              deadlineDate < today &&
              assign.progress < 100

            return (

              <div
                key={assign.id}
                className="
                  bg-white

                  rounded-3xl

                  shadow-xl

                  border

                  p-6
                "
              >

                {/* TOP */}
                <div className="
                  flex
                  flex-col
                  md:flex-row

                  md:justify-between

                  gap-5
                ">

                  {/* LEFT */}
                  <div className="
                    flex-1
                  ">

                    {/* TITLE */}
                    <h2 className="
                      text-3xl
                      font-black
                      text-blue-900
                    ">

                      {
                        assign.activities
                        ?.title ||

                        'Personal Task'
                      }

                    </h2>

                    {/* TASK */}
                    <div className="
                      mt-5

                      bg-gray-50

                      border

                      rounded-2xl

                      p-5
                    ">

                      <p className="
                        text-sm
                        text-gray-500
                        mb-2
                      ">

                        Assigned Task

                      </p>

                      <p className="
                        text-lg
                        font-semibold
                        text-black
                      ">

                        {assign.task}

                      </p>

                    </div>

                    {/* DETAILS */}
                    <div className="
                      mt-5

                      grid
                      md:grid-cols-2

                      gap-3
                      text-sm
                    ">

                      <div className="
                        bg-blue-50

                        border
                        border-blue-100

                        rounded-2xl

                        p-4
                      ">

                        👤

                        {' '}

                        <span className="
                          font-semibold
                        ">

                          {
                            assign.activities
                              ?.focal_person ||

                              'N/A'
                          }

                        </span>

                      </div>

                      <div className="
                        bg-gray-50

                        border

                        rounded-2xl

                        p-4
                      ">

                        📍

                        {' '}

                        {
                          assign.activities
                            ?.location_name ||

                            'No location'
                        }

                      </div>

                    </div>

                    {/* DEADLINE */}
                    <div className="
                      mt-4

                      inline-flex
                      items-center
                      gap-2

                      bg-red-50

                      border
                      border-red-100

                      rounded-full

                      px-4
                      py-2

                      text-sm
                    ">

                      ⏰

                      <span className="
                        font-semibold
                        text-red-700
                      ">

                        Deadline:

                      </span>

                      <span className="
                        text-red-600
                      ">

                        {
                          assign.deadline ||

                          'No deadline'
                        }

                      </span>

                    </div>

                    {/* ASSIGNED BY */}
                    <div className="
                      mt-5

                      inline-flex
                      items-center
                      gap-2

                      bg-green-50

                      border
                      border-green-100

                      rounded-full

                      px-4
                      py-2

                      text-sm
                    ">

                      👨‍💼

                      <span className="
                        font-semibold
                        text-green-800
                      ">

                        Assigned by:

                      </span>

                      <span className="
                        text-green-700
                      ">

                        {
                          assign
                            .assigned_by_name
                        }

                        {' '}

                        (
                        {
                          assign
                            .assigned_by_role
                        }
                        )

                      </span>

                    </div>

                    {/* PERSONNEL */}
                    <div className="
                      mt-6
                    ">

                      <p className="
                        text-sm
                        font-semibold
                        text-gray-500
                        mb-4
                      ">

                        Assigned Personnel

                      </p>

                      <div className="
                        flex
                        flex-wrap
                        gap-3
                      ">

                        {assign
                          .employeesList
                          .map(
                            (
                              empAssign: any
                            ) => (

                            <div
                              key={
                                empAssign.id
                              }

                              className="
                                flex
                                items-center
                                gap-3

                                bg-white

                                border

                                rounded-2xl

                                px-4
                                py-3

                                shadow-sm
                              "
                            >

                              {empAssign
                                .employees
                                ?.photo_url ? (

                                <img
                                  src={
                                    empAssign
                                      .employees
                                      ?.photo_url
                                  }

                                  alt="Employee"

                                  className="
                                    w-12
                                    h-12

                                    rounded-full

                                    object-cover
                                  "
                                />

                              ) : (

                                <div className="
                                  w-12
                                  h-12

                                  rounded-full

                                  bg-blue-100
                                  text-blue-700

                                  flex
                                  items-center
                                  justify-center

                                  font-bold
                                ">

                                  {
                                    empAssign
                                      .employees
                                      ?.name
                                      ?.charAt(0)
                                  }

                                </div>

                              )}

                              <div>

                                <p className="
                                  font-semibold
                                  text-blue-900
                                ">

                                  {
                                    empAssign
                                      .employees
                                      ?.name
                                  }

                                </p>

                                <p className="
                                  text-xs
                                  text-gray-500
                                ">

                                  {
                                    empAssign
                                      .employees
                                      ?.designation
                                  }

                                </p>

                                <p className="
                                  text-xs
                                  text-purple-600
                                  font-medium
                                ">

                                  {
                                    empAssign
                                      .employees
                                      ?.division
                                  }

                                </p>

                              </div>

                            </div>

                        ))}

                      </div>

                    </div>

                    {/* PROGRESS */}
                    <div className="
                      mt-5
                    ">

                      <div className="
                        flex
                        justify-between

                        text-sm

                        mb-2
                      ">

                        <span className="
                          font-semibold
                        ">

                          Progress

                        </span>

                        <span className="
                          font-bold
                        ">

                          {currentProgress}%

                        </span>

                      </div>

                      <div className="
                        h-4

                        bg-gray-200

                        rounded-full

                        overflow-hidden
                      ">

                        <div
                          className={`
                            h-full

                            ${
                              currentProgress >= 100

                                ? 'bg-green-500'

                                : currentProgress >= 50

                                ? 'bg-blue-500'

                                : 'bg-orange-500'
                            }
                          `}
                          style={{
                            width:
                              `${currentProgress}%`
                          }}
                        />

                      </div>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="
                    flex
                    items-start
                    gap-3

                    shrink-0
                  ">

                    {/* PRIORITY */}
                    <span className={`
                      inline-flex
                      items-center
                      justify-center

                      h-10
                      min-w-22.5

                      px-4

                      rounded-full

                      text-sm
                      font-semibold

                      whitespace-nowrap

                      ${
                        getPriorityColor(
                          assign.priority
                        )
                      }
                    `}>

                      {assign.priority}

                    </span>

                    {/* OVERDUE */}
                    {overdue && (

                      <div className="
                        h-10

                        px-4

                        rounded-xl

                        flex
                        items-center

                        bg-red-100
                        text-red-700

                        text-sm
                        font-bold
                      ">

                        OVERDUE

                      </div>

                    )}

                    {/* STATUS */}
                    <div className={`
                      h-10

                      px-4

                      rounded-xl

                      flex
                      items-center

                      text-sm
                      font-semibold

                      ${
                        assign.status ===
                        'completed'

                          ? `
                            bg-green-100
                            text-green-700
                          `

                          : assign.status ===
                            'ongoing'

                          ? `
                            bg-blue-100
                            text-blue-700
                          `

                          : `
                            bg-orange-100
                            text-orange-700
                          `
                      }
                    `}>

                      {assign.status}

                    </div>

                  </div>

                </div>

              </div>

            )
          }
        )}

      </div>

    </div>
  )
}