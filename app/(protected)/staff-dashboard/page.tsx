'use client'

import {
  useEffect,
  useState,
} from 'react'

import ProtectedRoute
from '@/components/ProtectedRoute'

import {
  supabase,
} from '@/lib/supabase'

export default function StaffDashboardPage() {

  const [employee,
    setEmployee] =
    useState<any>(null)

  const [assignments,
    setAssignments] =
    useState<any[]>([])

  const [focalRoles,
    setFocalRoles] =
    useState<any[]>([])

    const [notifications,
  setNotifications] =
  useState<any[]>([])

  const [loading,
    setLoading] =
    useState(true)

    // TEMP EDIT STATES
const [tempAssignments,
  setTempAssignments] =
  useState<any>({})

const [tempInitiatives,
  setTempInitiatives] =
  useState<any>({})

const [tempTasks,
  setTempTasks] =
  useState<any>({})


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
        'Completed'

      )

    }
  ).length

const dueTodayAssignments =

  assignments.filter(
    (a:any) => {

      if (!a.deadline)
        return false

      const today =

        new Date()
          .toISOString()
          .split('T')[0]

      return (

        a.deadline ===
        today

        &&

        a.status !==
        'Completed'

      )

    }
  ).length

const ongoingAssignments =

  assignments.filter(
    (a:any) =>

      a.status ===
      'Ongoing'
  ).length

const completedAssignments =

  assignments.filter(
    (a:any) =>

      a.status ===
      'Completed'
  ).length


  const pendingTasks =

  assignments.filter(
    (assignment:any) =>

      assignment.status ===
      'Pending'
  )

const ongoingTasks =

  assignments.filter(
    (assignment:any) =>

      assignment.status ===
      'Ongoing'
  )

const completedTasks =

  assignments.filter(
    (assignment:any) =>

      assignment.status ===
      'Completed'
  )


  const priorityAssignments =

  assignments

    .filter(
      (assignment:any) => {

        if (
          assignment.status ===
          'Completed'
        ) {

          return false
        }

        return true
      }
    )

    .sort(
      (a:any, b:any) => {

        const dateA =

          a.deadline

            ? new Date(
                a.deadline
              ).getTime()

            : Number.MAX_SAFE_INTEGER

        const dateB =

          b.deadline

            ? new Date(
                b.deadline
              ).getTime()

            : Number.MAX_SAFE_INTEGER

        return dateA - dateB
      }
    )

    .slice(0, 5)



    const deadlineWatch =

  assignments

    .filter(
      (assignment:any) => {

        if (
          assignment.status ===
          'Completed'
        ) {

          return false
        }

        return true

      }
    )

    .sort(
      (a:any, b:any) => {

        const dateA =

          a.deadline

            ? new Date(
                a.deadline
              ).getTime()

            : Number.MAX_SAFE_INTEGER

        const dateB =

          b.deadline

            ? new Date(
                b.deadline
              ).getTime()

            : Number.MAX_SAFE_INTEGER

        return dateA - dateB

      }
    )

    .slice(0, 5)


    const focalRoleSnapshot =

  focalRoles.map(
    (focal:any) => {

      const allTasks =

        focal.initiatives?.flatMap(
          (initiative:any) =>

            initiative
              .initiative_tasks || []
        ) || []

      const progress =

        allTasks.length > 0

          ? Math.round(

              allTasks.reduce(

                (
                  total:number,
                  task:any
                ) =>

                  total +

                  (
                    tempTasks[
                      task.id
                    ]?.progress ||

                    task.progress ||

                    0
                  ),

                0

              )

              /

              allTasks.length

            )

          : 0

      return {

        ...focal,

        progress

      }

    }
  )


const getDeadlineStatus = (
  deadline:string
) => {

  if (!deadline)
    return 'No Deadline'

  const today =
    new Date()

  const due =
    new Date(deadline)

  const diff =

    Math.ceil(

      (
        due.getTime() -
        today.getTime()

      ) /

      (
        1000 * 60 * 60 * 24
      )

    )

  if (diff < 0)
    return 'Overdue'

  if (diff === 0)
    return 'Due Today'

  if (diff <= 3)
    return 'Due Soon'

  return 'On Schedule'
}



  // UPDATE
  const updateTask = async (
    table: string,
    id: string,
    field: string,
    value: any
  ) => {

    const {
      error,
    } = await supabase

      .from(table)

      .update({
        [field]: value,
      })

      .eq('id', id)

    if (error) {

      console.error(error)

      return
    }

  }

  // LOAD DASHBOARD
  const loadDashboard =
    async () => {

      setLoading(true)

      // USER
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser()

      if (!user) {

        setLoading(false)

        return
      }

      // EMPLOYEE
      const {
        data: employeeData,
      } = await supabase

        .from('employees')

        .select('*')

        .eq(
          'user_id',
          user.id
        )

        .single()

      if (!employeeData) {

        setLoading(false)

        return
      }

      setEmployee(employeeData)


      // ASSIGNMENTS
      const {
        data: assignmentData,
      } = await supabase

        .from('assignments')

        .select(`
          *,
          activities(
            title,
            location_name
          )
        `)

        .eq(
          'employee_id',
          employeeData.id
        )

      setAssignments(
        assignmentData || []
      )

// TEMP ASSIGNMENTS
const assignmentTemp: any = {}

;(assignmentData || [])
  .forEach(
    (a: any) => {

      assignmentTemp[a.id] = {

        status:
          a.status || '',

        progress:
          a.progress || 0,
      }
    }
  )

setTempAssignments(
  assignmentTemp
)

      // FOCAL ROLES
      const {
        data: focalData,
      } = await supabase

        .from('focal_persons')

        .select('*')

        .eq(
          'employee_id',
          employeeData.id
        )

      const focalWithTasks =
        await Promise.all(

          (focalData || [])
            .map(
              async (
                focal: any
              ) => {

                // INITIATIVES
                const {
                  data: initiatives,
                } = await supabase

                  .from('initiatives')

                  .select('*')

                  .eq(
                    'focal_person_id',
                    focal.id
                  )

                const initiativesWithTasks =
                  await Promise.all(

                    (initiatives || [])
                      .map(
                        async (
                          initiative: any
                        ) => {

                          // TASKS
                          const {
                            data: tasks,
                          } = await supabase

                            .from(
                              'initiative_tasks'
                            )

                            .select('*')

                            .eq(
                              'initiative_id',
                              initiative.id
                            )

                          return {

                            ...initiative,

                            initiative_tasks:
                              tasks || [],
                          }
                        }
                      )
                  )

                return {

                  ...focal,

                  initiatives:
                    initiativesWithTasks,
                }
              }
            )
        )

// TEMP STATES
const initiativeTemp: any = {}
const taskTemp: any = {}

focalWithTasks.forEach(
  (focal: any) => {

    focal.initiatives?.forEach(
      (initiative: any) => {

        initiativeTemp[
          initiative.id
        ] = {

          status:
            initiative.status || '',

          progress:
            initiative.progress || 0,
        }

        initiative
          .initiative_tasks
          ?.forEach(
            (task: any) => {

              taskTemp[
                task.id
              ] = {

                status:
                  task.status || '',

                progress:
                  task.progress || 0,

                remarks:
                  task.remarks || '',
              }
            }
          )
      }
    )
  }
)

setTempInitiatives(
  initiativeTemp
)

setTempTasks(
  taskTemp
)

      setFocalRoles(
        focalWithTasks || []
      )

// NOTIFICATIONS

const {
  data: notificationData,
} = await supabase

  .from(
    'notifications'
  )

  .select('*')

  .order(
    'created_at',
    {
      ascending: false,
    }
  )

  .limit(5)

setNotifications(
  notificationData || []
)


      setLoading(false)
    }

  useEffect(() => {

    loadDashboard()

    // REALTIME
    const channel = supabase

      .channel(
        'staff-dashboard'
      )

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'initiative_tasks',
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
      ">

        <div className="
          text-3xl
          font-bold
          text-blue-900
        ">

          Loading Dashboard...

        </div>

      </div>
    )
  }

  return (

    <ProtectedRoute
      allowedRoles={[
        'staff',
        'admin',
      ]}
    >

      <div className="
  w-full
  min-w-0
  overflow-x-hidden

  space-y-4
  lg:space-y-6
">

        {/* HEADER */}
        <div className="
          bg-linear-to-br
          from-green-700
          to-green-900

          text-white

          rounded-3xl
          shadow-2xl

          p-8
        ">

          <h1 className="
            text-5xl
            font-bold
          ">

            Staff Dashboard

          </h1>

          <p className="
            text-green-100
            text-lg
            mt-4
          ">

            Welcome,
            {' '}
            {employee?.name}

          </p>

        </div>


{/* TODAY'S PRIORITIES */}

<div className="
grid
grid-cols-2
lg:grid-cols-4

gap-4
">

<div className="
bg-red-50
border
border-red-200

rounded-3xl

p-6
">

<p className="
text-sm
text-red-600
font-semibold
">
Overdue Tasks
</p>

<p className="
text-4xl
font-black
text-red-700
mt-2
">

{overdueAssignments}

</p>

</div>

<div className="
bg-orange-50
border
border-orange-200

rounded-3xl

p-6
">

<p className="
text-sm
text-orange-600
font-semibold
">
Due Today
</p>

<p className="
text-4xl
font-black
text-orange-700
mt-2
">

{dueTodayAssignments}

</p>

</div>

<div className="
bg-blue-50
border
border-blue-200

rounded-3xl

p-6
">

<p className="
text-sm
text-blue-600
font-semibold
">
Ongoing
</p>

<p className="
text-4xl
font-black
text-blue-700
mt-2
">

{ongoingAssignments}

</p>

</div>

<div className="
bg-green-50
border
border-green-200

rounded-3xl

p-6
">

<p className="
text-sm
text-green-600
font-semibold
">
Completed
</p>

<p className="
text-4xl
font-black
text-green-700
mt-2
">

{completedAssignments}

</p>

</div>

</div>


{/* MY WORK OVERVIEW */}

<div className="
grid
grid-cols-1
lg:grid-cols-2

gap-6
">

<div className="
bg-white

border
border-blue-200

rounded-3xl

shadow-xl

p-6
">

<h3 className="
text-xl
font-bold
text-blue-900

mb-4
">

📌 My Task Workspace

</h3>

<p className="
text-5xl
font-black
text-blue-700
">

{
assignments.length
}

</p>

<p className="
text-gray-500
mt-2
">

Total Assigned Tasks

</p>

</div>

<div className="
bg-white

border
border-purple-200

rounded-3xl

shadow-xl

p-6
">

<h3 className="
text-xl
font-bold
text-purple-900

mb-4
">

🎯 My Focal Roles

</h3>

<p className="
text-5xl
font-black
text-purple-700
">

{
focalRoles.length
}

</p>

<p className="
text-gray-500
mt-2
">

Assigned Responsibilities

</p>

</div>

</div>


{/* QUICK ACTIONS */}

<div className="
grid
grid-cols-1
md:grid-cols-3

gap-4
">

<a

href="/my-task"

className="
bg-blue-600
hover:bg-blue-700

text-white

rounded-3xl

p-6

shadow-xl

transition

hover:scale-[1.02]
"
>

<div className="
text-3xl
mb-3
">

📌

</div>

<div className="
font-bold
text-lg
">

Open My Tasks

</div>

<div className="
text-blue-100
text-sm
mt-1
">

Update progress, remarks, and accomplishments

</div>

</a>

<a

href="/my-focal-roles"

className="
bg-purple-600
hover:bg-purple-700

text-white

rounded-3xl

p-6

shadow-xl

transition

hover:scale-[1.02]
"
>

<div className="
text-3xl
mb-3
">

🎯

</div>

<div className="
font-bold
text-lg
">

Open Focal Roles

</div>

<div className="
text-purple-100
text-sm
mt-1
">

Update initiatives and tasks

</div>

</a>

<a

href="/notifications"

className="
bg-red-600
hover:bg-red-700

text-white

rounded-3xl

p-6

shadow-xl

transition

hover:scale-[1.02]
"
>

<div className="
text-3xl
mb-3
">

🔔

</div>

<div className="
font-bold
text-lg
">

View Notifications

</div>

<div className="
text-orange-100
text-sm
mt-1
">

Check latest updates

</div>

</a>

</div>


{/* NEEDS ATTENTION */}

<div className="
bg-linear-to-br
from-orange-50
to-white

border
border-orange-200

border-l-8
border-l-orange-500

rounded-3xl

shadow-xl

p-8
">

<h2 className="
text-3xl
font-bold
text-orange-700

mb-6
">

🔥 Needs Attention

</h2>

{priorityAssignments.length === 0 ? (

<div className="
text-gray-500
">

No pending assignments.

</div>

) : (

<div className="
space-y-4
">

{priorityAssignments.map(
(assignment:any) => (

<div

key={assignment.id}

className="
bg-white

border
border-orange-100

rounded-2xl

p-5
"
>

<div className="
flex
justify-between
items-start
gap-4
">

<div>

<p className="
font-bold
text-blue-900
">

{
assignment.task
}

</p>

<p className="
text-sm
text-gray-500
mt-1
">

{
assignment.activities?.title ||
'No Activity'
}

</p>

</div>

<div>

<span className={`
px-3
py-1

rounded-full

text-xs
font-bold

${
assignment.status ===
'Ongoing'

? 'bg-blue-100 text-blue-700'

: 'bg-orange-100 text-orange-700'
}
`}>

{
assignment.status
}

</span>

</div>

</div>

</div>

))
}

</div>

)}

</div>


{/* RECENT NOTIFICATIONS */}

<div className="
bg-white

border
border-yellow-200

border-l-8
border-l-yellow-500

rounded-3xl

shadow-xl

p-8
">

<h2 className="
text-3xl
font-bold
text-yellow-700

mb-6
">

🔔 Recent Notifications

</h2>

{notifications.length === 0 ? (

<div className="
text-gray-500
">

No notifications available.

</div>

) : (

<div className="
space-y-4
">

{notifications.map(
(notification:any) => (

<div

key={notification.id}

className="
border
border-yellow-100

rounded-2xl

p-4
"
>

<p className="
font-semibold
text-gray-900
">

{
notification.title ||
'Notification'
}

</p>

<p className="
text-sm
text-gray-500
mt-1
">

{
notification.message ||
notification.description ||
''
}

</p>

</div>

))
}

</div>

)}

</div>


{/* UPCOMING DEADLINES */}

<div className="
bg-white

border
border-red-200

border-l-8
border-l-red-500

rounded-3xl

shadow-xl

p-8
">

<h2 className="
text-3xl
font-bold
text-red-700

mb-6
">

⏰ Upcoming Deadlines

</h2>

{deadlineWatch.length === 0 ? (

<div className="
text-gray-500
">

No upcoming deadlines.

</div>

) : (

<div className="
space-y-4
">

{deadlineWatch.map(
(assignment:any) => (

<div

key={assignment.id}

className="
border
rounded-2xl

p-4
"
>

<div className="
flex
justify-between
items-start
gap-4
">

<div>

<p className="
font-bold
text-blue-900
">

{
assignment.task
}

</p>

<p className="
text-sm
text-gray-500
">

{
assignment.activities
  ?.title ||
'No Activity'
}

</p>

</div>

<div>

<span className={`
px-3
py-1

rounded-full

text-xs
font-bold

${
getDeadlineStatus(
assignment.deadline
) === 'Overdue'

? 'bg-red-100 text-red-700'

: getDeadlineStatus(
assignment.deadline
) === 'Due Today'

? 'bg-orange-100 text-orange-700'

: getDeadlineStatus(
assignment.deadline
) === 'Due Soon'

? 'bg-yellow-100 text-yellow-700'

: 'bg-green-100 text-green-700'
}
`}>

{
getDeadlineStatus(
assignment.deadline
)
}

</span>

</div>

</div>

<p className="
text-sm
text-gray-500
mt-3
">

Deadline:

{
assignment.deadline ||
'Not Set'
}

</p>

</div>

))
}

</div>

)}

</div>


{/* MY FOCAL ROLES SNAPSHOT */}

<div className="
bg-white

border
border-purple-200

border-l-8
border-l-purple-500

rounded-3xl

shadow-xl

p-8
">

<h2 className="
text-3xl
font-bold
text-purple-700

mb-6
">

🎯 My Focal Roles

</h2>

{focalRoleSnapshot.length === 0 ? (

<div className="
text-gray-500
">

No focal roles assigned.

</div>

) : (

<div className="
space-y-5
">

{focalRoleSnapshot.map(
(focal:any) => (

<div

key={focal.id}

className="
border
border-purple-100

rounded-2xl

p-5
"
>

<div className="
flex
justify-between
items-center
mb-3
">

<h3 className="
font-bold
text-lg
text-blue-900
">

{
focal.focal_role ||
focal.name
}

</h3>

<span className={`
px-3
py-1

rounded-full

text-xs
font-bold

${
focal.progress === 100

? 'bg-green-100 text-green-700'

: focal.progress > 0

? 'bg-blue-100 text-blue-700'

: 'bg-yellow-100 text-yellow-700'
}
`}>

{
focal.progress === 100

? 'Completed'

: focal.progress > 0

? 'Ongoing'

: 'Pending'
}

</span>

</div>

<div className="
w-full
h-3

bg-slate-200

rounded-full
overflow-hidden
">

<div

className={`
h-full

${
focal.progress === 100

? 'bg-green-600'

: focal.progress > 0

? 'bg-blue-600'

: 'bg-yellow-500'
}
`}

style={{
width:
`${focal.progress}%`
}}


/>

</div>

<div className="
text-sm
text-gray-500
mt-2
">

{
focal.progress
}
% Complete

</div>

</div>

))
}

</div>

)}

</div>


{/* TASK WORKSPACE */}

<div className="
grid
grid-cols-1
xl:grid-cols-3

gap-6
">

{/* PENDING */}

<div className="
bg-white

rounded-3xl

border
border-yellow-200

shadow-xl

p-6
">

<h2 className="
text-2xl
font-bold
text-yellow-700

mb-5
">

📌 Pending

</h2>

<div className="
space-y-3
">

{pendingTasks
.slice(0,5)
.map(
(task:any) => (

<div

key={task.id}

className="
border

rounded-2xl

p-4
"
>

<div className="
font-semibold
">

{task.task}

</div>

<div className="
text-xs
text-gray-500
mt-1
">

{
task.deadline ||
'No Deadline'
}

</div>

</div>

))
}

</div>

</div>

{/* ONGOING */}

<div className="
bg-white

rounded-3xl

border
border-blue-200

shadow-xl

p-6
">

<h2 className="
text-2xl
font-bold
text-blue-700

mb-5
">

🔵 Ongoing

</h2>

<div className="
space-y-3
">

{ongoingTasks
.slice(0,5)
.map(
(task:any) => (

<div

key={task.id}

className="
border

rounded-2xl

p-4
"
>

<div className="
font-semibold
">

{task.task}

</div>

<div className="
text-xs
text-gray-500
mt-1
">

{
task.deadline ||
'No Deadline'
}

</div>

</div>

))
}

</div>

</div>

{/* COMPLETED */}

<div className="
bg-white

rounded-3xl

border
border-green-200

shadow-xl

p-6
">

<h2 className="
text-2xl
font-bold
text-green-700

mb-5
">

✅ Completed

</h2>

<div className="
space-y-3
">

{completedTasks
.slice(0,5)
.map(
(task:any) => (

<div

key={task.id}

className="
border

rounded-2xl

p-4
"
>

<div className="
font-semibold
">

{task.task}

</div>

<div className="
text-xs
text-gray-500
mt-1
">

{
task.deadline ||
'No Deadline'
}

</div>

</div>

))
}

</div>

</div>

</div>


        {/* ASSIGNMENTS */}
        <div className="
          bg-linear-to-br
          from-blue-50
          to-white

          rounded-3xl
          shadow-xl

          border
          border-blue-200

          border-l-8
          border-l-blue-500

          p-8
        ">

          <h2 className="
            text-4xl
            font-bold
            text-blue-900
            mb-8
          ">

            Tasks

          </h2>

          <div className="
            space-y-5
          ">

            {assignments.slice(0,5).map(
              (
                assignment: any
              ) => (

              <div
                key={assignment.id}
                className="
                  bg-white
                  border
                  border-blue-200
                  rounded-2xl
                  p-6
                  shadow-md
                "
              >

                <div className="
                  flex
                  flex-col
                  lg:flex-row
                  lg:justify-between
                  gap-8
                ">

                  {/* LEFT */}
                  <div className="
                    flex-1
                  ">

                    <p className="
                      text-sm
                      uppercase
                      tracking-wide
                      text-orange-500
                      mb-2
                    ">

                      {
                        assignment.activities
                          ?.title
                      }

                    </p>

                    <h3 className="
                      text-2xl
                      font-bold
                      text-blue-900
                    ">

                      {assignment.task}


                        <div className="
                        mt-4
                        ">

                        <div className="
                        w-full
                        h-3

                        bg-slate-200

                        rounded-full
                        overflow-hidden
                        ">

                        <div

                          className={`
                          h-full

                          ${
                          (tempAssignments[
                          assignment.id
                          ]?.progress || 0) >= 100

                          ? 'bg-green-600'

                          : (tempAssignments[
                          assignment.id
                          ]?.progress || 0) >= 50

                          ? 'bg-blue-600'

                          : 'bg-orange-500'
                          }
                          `}

                          style={{
                          width:
                          `${tempAssignments[
                          assignment.id
                          ]?.progress || 0}%`
                          }}

                          />

                        </div>

                        </div>


                    </h3>


<div className="
flex
flex-wrap
gap-2

mt-3
">

<span className="
px-3
py-1

bg-blue-100
text-blue-700

rounded-full

text-xs
font-bold
">

{
assignment.status
}

</span>

<span className={`
px-3
py-1

rounded-full

text-xs
font-bold

${
getDeadlineStatus(
assignment.deadline
) === 'Overdue'

? 'bg-red-100 text-red-700'

: getDeadlineStatus(
assignment.deadline
) === 'Due Today'

? 'bg-orange-100 text-orange-700'

: getDeadlineStatus(
assignment.deadline
) === 'Due Soon'

? 'bg-yellow-100 text-yellow-700'

: 'bg-green-100 text-green-700'
}
`}>

{
getDeadlineStatus(
assignment.deadline
)
}

</span>

</div>


<p className="
text-sm
text-gray-500

mt-3
">

Deadline:

{
assignment.deadline ||

'Not Set'
}

</p>

<div className="
mt-4
">

<div className="
w-full
h-3

bg-slate-200

rounded-full
overflow-hidden
">

<div

className={`
h-full

${
(tempAssignments[
assignment.id
]?.progress || 0) >= 100

? 'bg-green-600'

: (tempAssignments[
assignment.id
]?.progress || 0) >= 50

? 'bg-blue-600'

: 'bg-orange-500'
}
`}

style={{
width:
`${tempAssignments[
assignment.id
]?.progress || 0}%`
}}

/>

</div>

<p className="
text-sm
text-gray-500
mt-2
">

{
tempAssignments[
assignment.id
]?.progress || 0
}%
Complete

</p>

</div>

</div>

</div>

</div>

))}

          </div>

        </div>

 
      </div>

    </ProtectedRoute>
  )
}