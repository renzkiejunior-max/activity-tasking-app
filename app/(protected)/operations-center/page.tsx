'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import {
  supabase
} from '@/lib/supabase'


export default function OperationsCenterPage() {

    const [
  activities,
  setActivities
] = useState<any[]>([])

const [
  assignments,
  setAssignments
] = useState<any[]>([])

const [
  employees,
  setEmployees
] = useState<any[]>([])

const [
  activityLogs,
  setActivityLogs
] = useState<any[]>([])



useEffect(() => {

    
  const loadData =
    async () => {

      const {
        data: activityData
      } = await supabase

        .from('activities')
        .select('*')

      const {
        data: assignmentData
      } = await supabase

        .from('assignments')
        .select('*')

      const {
        data: employeeData
      } = await supabase

        .from('employees')
        .select('*')

      setActivities(
        activityData || []
      )

      setAssignments(
        assignmentData || []
      )

      
        const {
        data: logsData
        } = await supabase

        .from(
            'assignment_logs'
        )

        .select('*')

        .order(
            'created_at',
            {
            ascending: false
            }
        )

        .limit(15)

        setActivityLogs(
        logsData || []
        )


    }

  loadData()

}, [])

// =====================
// METRICS
// =====================

const activeActivities =

  activities

    .filter(
      (activity:any) =>

        activity.approval_status ===
        'approved'
    )

    .slice(0, 5)

    .map(
      (activity:any) => {

        const activityTasks =

          assignments.filter(
            (assignment:any) =>

              assignment.activity_id ===
              activity.id
          )

        const completed =

          activityTasks.filter(
            (task:any) =>

              task.status ===
              'completed'
          ).length

        const ongoing =

          activityTasks.filter(
            (task:any) =>

              task.status ===
              'ongoing'
          ).length

        const pending =

          activityTasks.filter(
            (task:any) =>

              task.status ===
              'pending'
          ).length

        const progress =

          activityTasks.length > 0

            ? Math.round(

                (
                  completed /
                  activityTasks.length
                ) * 100

              )

            : 0

        return {

          ...activity,

          completed,

          ongoing,

          pending,

          progress,

          totalTasks:
            activityTasks.length

        }

      }
    )


const pendingReviews =

  activities.filter(
    (a:any) =>

      a.approval_status ===
      'pending'
  ).length

const overdueAssignments =


  assignments.filter(
    (a:any) => {

      if (!a.deadline)
        return false

      return (

        new Date(
          a.deadline
        ) < new Date()

        &&

        a.status !==
        'completed'

      )
    }
  ).length



  return (

    <div className="
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

          🎯 Operations Center

        </p>

        <h1 className="
          text-4xl
          font-black

          mt-5
        ">

          Office Chief Command Workspace

        </h1>

        <p className="
          text-blue-100
          mt-3
          max-w-3xl
        ">

          Monitor operational priorities,
          active activities,
          assignments,
          and office-wide updates.

        </p>

      </div>

      {/* WORKSPACE */}
      <div className="
        grid
        grid-cols-1
        xl:grid-cols-[320px_1fr_350px]

        gap-6
      ">

        {/* ATTENTION REQUIRED */}
        <div className="
          bg-white

          border

          rounded-3xl

          shadow-xl

          p-6
        ">

          <h2 className="
            text-xl
            font-black
            text-red-600

            mb-5
          ">

            🚨 Attention Required

          </h2>

          <div className="
            space-y-4
          ">

            <div className="
              border
              rounded-2xl
              p-4
            ">

              <div className="
                flex
                justify-between
                items-center
                ">

                <span>
                Pending Reviews
                </span>

                <span className="
                font-black
                text-orange-600
                ">

                {pendingReviews}

                </span>

                </div>

            </div>

            <div className="
              border
              rounded-2xl
              p-4
            ">

              <div className="
                flex
                justify-between
                items-center
                ">

                <span>
                Overdue Assignments
                </span>

                <span className="
                font-black
                text-red-600
                ">

                {
                overdueAssignments
                }

                </span>

                </div>

            </div>

            

          </div>

        </div>

        {/* ACTIVE OPERATIONS */}
        <div className="
          bg-white

          border

          rounded-3xl

          shadow-xl

          p-6
        ">

          <h2 className="
            text-xl
            font-black
            text-blue-900

            mb-5
          ">

            📊 Active Operations

          </h2>

          <div className="
            space-y-4
          ">

            <div className="
space-y-4
">

{activeActivities.length === 0 ? (

<div className="
border
rounded-2xl
p-6
text-center
text-gray-500
">

No active activities

</div>

) : (

activeActivities.map(
(activity:any) => (

<div

key={activity.id}

className="
border
rounded-2xl
p-5

hover:shadow-lg

transition
"
>

<div className="
flex
justify-between
items-start
gap-4
">

<div>

<h3 className="
font-bold
text-lg
">

{
activity.title ||
activity.activity_name
}

</h3>

<p className="
text-sm
text-gray-500
">

{
activity.totalTasks
}

task(s)

</p>

</div>

<div className="
text-blue-700
font-black
text-xl
">

<div className="
flex
items-center
gap-2
">

<span className="
text-blue-700
font-black
text-xl
">

{activity.progress}%

</span>

<span className={`
text-xs
font-bold
px-2
py-1
rounded-full

${
activity.progress >= 80

? 'bg-green-100 text-green-700'

: activity.progress >= 50

? 'bg-yellow-100 text-yellow-700'

: 'bg-red-100 text-red-700'
}
`}>

{
activity.progress >= 80

? 'ON TRACK'

: activity.progress >= 50

? 'WATCH'

: 'AT RISK'
}

</span>

</div>

</div>

</div>

<div className="
mt-4

w-full
h-3

bg-slate-200

rounded-full
overflow-hidden
">

<div

className="
h-full
bg-green-600
"

style={{
width:
`${activity.progress}%`
}}

/>

</div>

<div className="
grid
grid-cols-3

gap-3

mt-4
text-sm
"
>

<div>

<div className="
flex
items-center
gap-2
">

<span className="
text-green-700
font-bold
text-lg
">

{activity.completed}

</span>

<span>
Completed
</span>

</div>

</div>

<div>

<div className="
flex
items-center
gap-2
">

<span className="
text-blue-700
font-bold
text-lg
">

{activity.ongoing}

</span>

<span>
Ongoing
</span>

</div>

</div>

<div>

<div className="
flex
items-center
gap-2
">

<span className="
text-orange-700
font-bold
text-lg
">

{activity.pending}

</span>

<span>
Pending
</span>

</div>

</div>

</div>

</div>

))
)}

</div>

          </div>

        </div>

        {/* LIVE FEED */}
        <div className="
          bg-white

          border

          rounded-3xl

          shadow-xl

          p-6
        ">

          <h2 className="
            text-xl
            font-black
            text-emerald-700

            mb-5
          ">

            ⚡ Live Activity Feed

          </h2>

          <div className="
            space-y-4
          ">

            <div className="
            space-y-4
            ">

            {activityLogs.length === 0 ? (

            <div className="
            text-gray-500
            ">

            No activity recorded.

            </div>

            ) : (

            activityLogs.map(
            (log:any) => (

            <div

            key={log.id}

            className="
            border-l-4
            border-blue-500

            pl-4
            py-2
            "
            >

            <p className="
            font-semibold
            text-sm
            ">

            {log.action}

            </p>

            <p className="
            text-xs
            text-gray-600
            ">

            {log.changed_by}

            </p>

            <p className="
            text-xs
            text-gray-500
            ">

            {
            new Date(
            log.created_at
            ).toLocaleString()
            }

            </p>

            {log.old_value && (

            <p className="
            text-xs
            text-blue-700
            mt-1
            ">

            {log.old_value}

            {' → '}

            {log.new_value}

            </p>

            )}

            </div>

            ))
            )}

            </div>

          </div>

        </div>

      </div>

    </div>

  )
}