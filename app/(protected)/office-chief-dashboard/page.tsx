'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link
from 'next/link'

import { supabase }
from '@/lib/supabase'

export default function Page() {


  const [
  activities,
  setActivities,
] = useState<any[]>([])

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

useEffect(() => {

  const loadDashboard =
    async () => {

      // ACTIVITIES
      const {
        data: activitiesData,
      } = await supabase

        .from('activities')

        .select('*')

        .order(
          'activity_date',
          {
            ascending: false,
          }
        )

      // ASSIGNMENTS
      const {
        data: assignmentsData,
      } = await supabase

        .from('assignments')

        .select('*')

      // EMPLOYEES
      const {
        data: employeesData,
      } = await supabase

        .from('employees')

        .select('*')

      setActivities(
        activitiesData || []
      )

      setAssignments(
        assignmentsData || []
      )

      setEmployees(
        employeesData || []
      )
    }

  loadDashboard()

}, [])


const pendingReviews =

  activities.filter(
    (a: any) =>

      a.approval_status ===
      'pending'
  ).length

const approvedActivities =

  activities.filter(
    (a: any) =>

      a.approval_status ===
      'approved'
  ).length

const activeAssignments =

  assignments.filter(
    (a: any) =>

      a.status !==
      'completed'
  ).length

const activeDivisions =

  new Set(

    employees.map(
      (e: any) =>
        e.division
    )

  ).size

// URGENT ACTIVITIES
const urgentActivities =

  activities.filter(
    (activity: any) => {

      const activityDate =
        new Date(
          activity.activity_date
        )

      const now =
        new Date()

      const diffHours =

        (
          activityDate.getTime() -
          now.getTime()
        )

        / (1000 * 60 * 60)

      return (
        diffHours >= 0 &&
        diffHours <= 72
      )
    }
  )

// OVERDUE ASSIGNMENTS
const overdueAssignments =

  assignments.filter(
    (assign: any) => {

      if (
        !assign.timeline
      ) return false

      return (

        new Date(
          assign.timeline
        ) < new Date()

      )
    }
  )

// DIVISION STATUS
const divisionStats =

  employees.reduce(
    (
      acc: any,
      emp: any
    ) => {

      const division =
        emp.division ||
        'Unassigned'

      if (
        !acc[division]
      ) {

        acc[division] = 0
      }

      acc[division]++

      return acc

    },

    {}
  )

  return (

    <div className="
      p-6
      space-y-6
    ">

      {/* HEADER */}
      <div className="
        bg-linear-to-r
        from-blue-900
        via-blue-700
        to-blue-500

        rounded-3xl

        p-8

        text-white
      ">

        <p className="
          inline-flex
          items-center
          gap-2

          bg-white/20

          px-4
          py-2

          rounded-full

          text-sm
        ">

          🏢 Office Command Center

        </p>

        <h1 className="
          text-4xl
          font-black

          mt-5
        ">

          Office Chief Dashboard

        </h1>

        <p className="
          text-blue-100
          mt-3

          max-w-2xl
        ">

          Monitor office-wide
          activities, personnel,
          operational assignments,
          division performance,
          and emergency coordination.

        </p>

      </div>

{/* MOBILE ANALYTICS TOGGLE */}
<div className="
  md:hidden
">

  <button

    onClick={() =>

      setShowAnalytics(
        !showAnalytics
      )
    }

    className="
      w-full

      bg-blue-900
      text-white

      rounded-2xl

      px-5
      py-4

      font-bold

      shadow-lg
    "
  >

    {
      showAnalytics

        ? 'Hide Analytics'

        : 'Show Analytics'
    }

  </button>

</div>


{/* LIVE STATS */}
<div
  className={`

    ${
      showAnalytics
        ? 'block'
        : 'hidden'
    }

    md:block
  `}
>

  <div className="
    grid
    grid-cols-1
    md:grid-cols-2
    xl:grid-cols-4

    gap-5
  ">

  {/* PENDING */}
  <div className="
    bg-linear-to-br
    from-orange-400
    to-orange-600

    rounded-3xl

    p-6

    text-white

    shadow-xl
  ">

    <p className="
      text-sm
      uppercase
      tracking-wider
    ">

      Pending Reviews

    </p>

    <h2 className="
      text-5xl
      font-black
      mt-3
    ">

      {pendingReviews}

    </h2>

  </div>

  {/* APPROVED */}
  <div className="
    bg-linear-to-br
    from-blue-700
    to-blue-900

    rounded-3xl

    p-6

    text-white

    shadow-xl
  ">

    <p className="
      text-sm
      uppercase
      tracking-wider
    ">

      Approved Activities

    </p>

    <h2 className="
      text-5xl
      font-black
      mt-3
    ">

      {approvedActivities}

    </h2>

  </div>

  {/* ASSIGNMENTS */}
  <div className="
    bg-linear-to-br
    from-emerald-500
    to-emerald-700

    rounded-3xl

    p-6

    text-white

    shadow-xl
  ">

    <p className="
      text-sm
      uppercase
      tracking-wider
    ">

      Active Assignments

    </p>

    <h2 className="
      text-5xl
      font-black
      mt-3
    ">

      {activeAssignments}

    </h2>

  </div>

  {/* DIVISIONS */}
  <div className="
    bg-linear-to-br
    from-purple-500
    to-purple-700

    rounded-3xl

    p-6

    text-white

    shadow-xl
  ">

    <p className="
      text-sm
      uppercase
      tracking-wider
    ">

      Active Divisions

    </p>

    <h2 className="
      text-5xl
      font-black
      mt-3
    ">

      {activeDivisions}

    </h2>

  </div>

</div>

</div>


{/* PENDING ACTIONS */}
<div className="
  bg-white

  border

  rounded-3xl

  shadow-xl

  p-6
">

  <div className="
    flex
    items-center
    justify-between

    mb-5
  ">

    <h2 className="
      text-2xl
      font-black
      text-red-600
    ">

      Pending Actions

    </h2>

    <div className="
      text-4xl
    ">

      🚨

    </div>

  </div>

  <div className="
    grid
    md:grid-cols-2
    xl:grid-cols-4

    gap-4
  ">

    {/* PENDING REVIEWS */}
<Link
  href="/activities"
>

  <div className="
    bg-orange-50

    border
    border-orange-200

    rounded-2xl

    p-4

    cursor-pointer

    hover:scale-[1.02]
    hover:shadow-lg

    transition
  ">

    <div className="
      flex
      items-center
      justify-between
    ">

      <h3 className="
        text-sm
        font-bold
        text-orange-700
      ">

        Activities Awaiting Approval

      </h3>

      <span className="
        text-xl
      ">

        →
      </span>

    </div>

    <p className="
      text-4xl
      font-black
      text-orange-600

      mt-3
    ">

      {pendingReviews}

    </p>

  </div>

</Link>

    {/* OVERDUE */}
<Link
  href="/office-assignments"
>

  <div className="
    bg-red-50

    border
    border-red-200

    rounded-2xl

    p-4

    cursor-pointer

    hover:scale-[1.02]
    hover:shadow-lg

    transition
  ">

    <div className="
      flex
      items-center
      justify-between
    ">

      <h3 className="
        text-sm
        font-bold
        text-red-700
      ">

        Overdue Assignments

      </h3>

      <span className="
        text-xl
      ">

        →
      </span>

    </div>

    <p className="
      text-4xl
      font-black
      text-red-600

      mt-3
    ">

      {
        overdueAssignments.length
      }

    </p>

  </div>

</Link>

    {/* URGENT */}
<Link
  href="/activities"
>

  <div className="
    bg-blue-50

    border
    border-blue-200

    rounded-2xl

    p-4

    cursor-pointer

    hover:scale-[1.02]
    hover:shadow-lg

    transition
  ">

    <div className="
      flex
      items-center
      justify-between
    ">

      <h3 className="
        text-sm
        font-bold
        text-blue-700
      ">

        Urgent Activities

      </h3>

      <span className="
        text-xl
      ">

        →
      </span>

    </div>

    <p className="
      text-4xl
      font-black
      text-blue-700

      mt-3
    ">

      {
        urgentActivities.length
      }

    </p>

  </div>

</Link>

    {/* ACTIVE */}
<Link
  href="/office-personnel"
>

  <div className="
    bg-emerald-50

    border
    border-emerald-200

    rounded-2xl

    p-4

    cursor-pointer

    hover:scale-[1.02]
    hover:shadow-lg

    transition
  ">

    <div className="
      flex
      items-center
      justify-between
    ">

      <h3 className="
        text-sm
        font-bold
        text-emerald-700
      ">

        Active Personnel

      </h3>

      <span className="
        text-xl
      ">

        →
      </span>

    </div>

    <p className="
      text-4xl
      font-black
      text-emerald-700

      mt-3
    ">

      {employees.length}

    </p>

  </div>

</Link>

  </div>

</div>


{/* OPERATION PANELS */}
<div className="
  grid
  xl:grid-cols-2
  gap-6
">

  {/* RECENT ACTIVITIES */}
  <div className="
    bg-white

    border

    rounded-3xl

    shadow-xl

    p-6
  ">

    <div className="
      flex
      items-center
      justify-between

      mb-5
    ">

      <h2 className="
        text-2xl
        font-black
        text-blue-900
      ">

        Recent Activity Reviews

      </h2>

      <Link

        href="/activities"

        className="
          text-sm
          font-bold

          text-blue-700
        "
      >

        View All →

      </Link>

    </div>

    <div className="
      space-y-4
    ">

      {activities

        .slice(0, 5)

        .map(
          (activity: any) => (

          <div

            key={activity.id}

            className="
              border

              rounded-2xl

              p-4
            "
          >

            <div className="
              flex
              items-start
              justify-between

              gap-3
            ">

              <div>

                <h3 className="
                  font-bold
                  text-blue-900
                ">

                  {activity.title}

                </h3>

                <p className="
                  text-sm
                  text-gray-500

                  mt-1
                ">

                  📅
                  {' '}
                  {
                    activity.activity_date
                  }

                </p>

              </div>

              <span className={`

                px-3
                py-1

                rounded-full

                text-xs
                font-bold

                ${
                  activity.approval_status ===
                  'approved'

                    ? `
                      bg-emerald-100
                      text-emerald-700
                    `

                    : `
                      bg-orange-100
                      text-orange-700
                    `
                }
              `}>

                {
                  activity.approval_status ||
                  'pending'
                }

              </span>

            </div>

          </div>

        ))}

    </div>

  </div>

  {/* DEPLOYMENT */}
  <div className="
    bg-white

    border

    rounded-3xl

    shadow-xl

    p-6
  ">

    <h2 className="
      text-2xl
      font-black
      text-blue-900

      mb-5
    ">

      Personnel Deployment

    </h2>

    <div className="
      space-y-4
    ">

      {assignments

        .slice(0, 5)

        .map(
          (assign: any) => (

          <div

            key={assign.id}

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

              {assign.task}

            </h3>

            <p className="
              text-sm
              text-gray-600

              mt-1
            ">

              📅
              {' '}
              {
                assign.timeline ||
                'No deadline'
              }

            </p>

          </div>

        ))}

    </div>

  </div>

</div>


{/* DIVISION STATUS */}
<div className="
  bg-white

  border

  rounded-3xl

  shadow-xl

  p-6
">

  <div className="
    flex
    items-center
    justify-between

    mb-5
  ">

    <h2 className="
      text-2xl
      font-black
      text-purple-700
    ">

      Division Status

    </h2>

    <div className="
      text-4xl
    ">

      🏢

    </div>

  </div>

  <div className="
    space-y-4
  ">

    {Object.entries(
      divisionStats
    ).map(
      (
        [division, count]: any
      ) => (

      <div

        key={division}

        className="
          border

          rounded-2xl

          p-4
        "
      >

        <div className="
          flex
          items-center
          justify-between
        ">

          <div>

            <h3 className="
              font-bold
              text-blue-900
            ">

              {division}

            </h3>

            <p className="
              text-sm
              text-gray-600

              mt-1
            ">

              Personnel Active

            </p>

          </div>

          <div className="
            text-4xl
            font-black
            text-purple-700
          ">

            {count}

          </div>

        </div>

      </div>

    ))}

  </div>

</div>


{/* URGENT ACTIVITIES */}
<div className="
  bg-white

  border

  rounded-3xl

  shadow-xl

  p-6
">

  <div className="
    flex
    items-center
    justify-between

    mb-5
  ">

    <h2 className="
      text-2xl
      font-black
      text-red-600
    ">

      Urgent Activities

    </h2>

    <div className="
      text-4xl
    ">

      ⏰

    </div>

  </div>

  <div className="
    space-y-4
  ">

    {urgentActivities.length === 0 && (

      <div className="
        text-gray-500
      ">

        No urgent activities.

      </div>

    )}

    {urgentActivities.map(
      (activity: any) => (

      <div

        key={activity.id}

        className="
          border

          rounded-2xl

          p-4
        "
      >

        <div className="
          flex
          items-start
          justify-between

          gap-4
        ">

          <div>

            <h3 className="
              font-bold
              text-blue-900
            ">

              {activity.title}

            </h3>

            <p className="
              text-sm
              text-gray-600

              mt-2
            ">

              📅
              {' '}
              {
                activity.activity_date
              }

            </p>

            <p className="
              text-sm
              text-gray-600

              mt-1
            ">

              📍
              {' '}
              {
                activity.location_name
              }

            </p>

          </div>

          <span className="
            bg-red-100
            text-red-700

            px-3
            py-1

            rounded-full

            text-xs
            font-bold
          ">

            URGENT

          </span>

        </div>

      </div>

    ))}

  </div>

</div>

    </div>
  )
}