'use client'

import { useState } from 'react'
import { supabase }
from '@/lib/supabase'

export default function ActivityDetailsModal({

  open,
  onClose,
  activity,

  attendees,
  checklists,
  employees,

assignments,
refreshAssignments,

  addAttendee,

selectedEmployees,
setSelectedEmployees,

  canManageActivities,
  isOfficeChief,
  isAdmin,

  editActivity,
  deleteActivity,
  approveActivity,

  setSelectedActivity,
setDocumentDate,
setRecipients,
setPurpose,
setShowTravelOrderModal,

formatDate,
formatTime,

getDocumentType,
  

}: any){

const [activeTab, setActiveTab] =
  useState('overview')

  const [
  showManageAttendees,
  setShowManageAttendees
] = useState(false)

  const safeAttendees =
  Array.isArray(attendees)
    ? attendees
    : []

const safeChecklists =
  Array.isArray(checklists)
    ? checklists
    : []
    
const [
  attendeeSelection,
  setAttendeeSelection
] = useState<string[]>([])
    
const [
  selectedEmployee,
  setSelectedEmployee
] = useState('')

const [
  task,
  setTask
] = useState('')

const [
  deadline,
  setDeadline
] = useState('')

const [
  selectedTask,
  setSelectedTask
] = useState<any>(null)

const [
  showTaskDrawer,
  setShowTaskDrawer
] = useState(false)

const [
  isEditingTask,
  setIsEditingTask
] = useState(false)

const [
  editTaskData,
  setEditTaskData
] = useState<any>({})


if (!open || !activity) {
    return null
  }

const createAssignment =
  async () => {

    if (
      !selectedEmployee ||
      !task
    ) {
      return
    }

    const employee =

      employees.find(
        (emp:any) =>
          emp.id ===
          selectedEmployee
      )

    const { error } =
      await supabase

        .from('assignments')

        .insert([

          {
            activity_id:
              activity.id,

            employee_id:
              selectedEmployee,

            task,

            deadline,

            status:
              'pending',

            progress:
              0,

            assigned_by_name:
              'Office Chief',

            assigned_by_role:
              'office_chief',
          }

        ])

    if (error) {

      alert(
        error.message
      )

      return
    }

    setTask('')
    setDeadline('')
    setSelectedEmployee('')

    refreshAssignments()
  }


const updateTask =
  async () => {

    const { error } =
      await supabase

        .from('assignments')

        .update({

          task:
            editTaskData.task,

          status:
            editTaskData.status,

          progress:
            editTaskData.progress,

          deadline:
            editTaskData.deadline,

          priority:
            editTaskData.priority,

          remarks:
            editTaskData.remarks,

            employee_id:
            editTaskData.employee_id,

        })

        .eq(
          'id',
          editTaskData.id
        )

    if (error) {

      alert(error.message)

      return
    }

    if (
      editTaskData.status ===
      'completed'
    ) {

      editTaskData.completed_at =
        new Date()
          .toISOString()

    }


    refreshAssignments()

    setSelectedTask(
      editTaskData
    )

    setIsEditingTask(false)
  }



// MONITORING METRICS

const activityAssignments =

  assignments.filter(
    (item:any) =>
      item.activity_id ===
      activity?.id
  )

const totalTasks =
  activityAssignments.length

const completedTasks =
  activityAssignments.filter(
    (item:any) =>
      item.status ===
      'completed'
  ).length

const ongoingTasks =
  activityAssignments.filter(
    (item:any) =>
      item.status ===
      'ongoing'
  ).length

const pendingTasks =
  activityAssignments.filter(
    (item:any) =>
      item.status ===
      'pending'
  ).length

const overdueTasks =
  activityAssignments.filter(
    (item:any) => {

      if (
        !item.deadline
      ) return false

      return (
        new Date(
          item.deadline
        ) < new Date()

        &&

        item.status !==
        'completed'
      )
    }
  ).length

const activityProgress =

  totalTasks > 0

    ? Math.round(

        (
          completedTasks /
          totalTasks
        ) * 100

      )

    : 0


const personnelPerformance =

  safeAttendees

    .filter(
      (attendee:any) =>
        attendee.activity_id ===
        activity.id
    )

    .map(
      (attendee:any) => {

        const employeeTasks =

          activityAssignments.filter(
            (assignment:any) =>

              assignment.employee_id ===
              attendee.employee_id
          )

        const completed =

          employeeTasks.filter(
            (task:any) =>
              task.status ===
              'completed'
          ).length

        const pending =

          employeeTasks.filter(
            (task:any) =>
              task.status ===
              'pending'
          ).length

        const ongoing =

          employeeTasks.filter(
            (task:any) =>
              task.status ===
              'ongoing'
          ).length

        const completionRate =

          employeeTasks.length > 0

            ? Math.round(
                (
                  completed /
                  employeeTasks.length
                ) * 100
              )

            : 0

        return {

          ...attendee,

          assigned:
            employeeTasks.length,

          completed,

          pending,

          ongoing,

          completionRate,
        }

      }
    )



    const overdueAssignments =

  activityAssignments.filter(
    (item:any) => {

      if (
        !item.deadline
      ) return false

      return (

        new Date(
          item.deadline
        ) < new Date()

        &&

        item.status !==
        'completed'

      )
    }
  )


const selectedTaskAssignee =

  selectedTask

    ? safeAttendees.find(
        (attendee:any) =>

          attendee.employee_id ===
          selectedTask.employee_id
      )

    : null


// ACTIVITY HEALTH

let healthStatus = 'ON TRACK'
let healthColor = 'green'
let healthIcon = '🟢'
let healthMessage =
  'Activity progressing normally.'

if (
  overdueAssignments.length > 0
) {

  healthStatus = 'CRITICAL'
  healthColor = 'red'
  healthIcon = '🔴'
  healthMessage =
    'Overdue assignments require immediate action.'

}

else if (

  pendingTasks > 0 ||

  activityProgress < 70

) {

  healthStatus =
    'NEEDS ATTENTION'

  healthColor = 'yellow'

  healthIcon = '🟡'

  healthMessage =
    'Some assignments still require monitoring.'

}


    return (

    <div className="
      fixed
      inset-0
      bg-black/60
      z-99999
      flex
      items-center
      justify-center
    ">

      <div className="
        bg-white
        rounded-3xl
        w-full
        max-w-450

        h-screen
        md:h-[90vh]
        overflow-y-auto
        shadow-2xl
      ">

        <div className="
          relative
          z-20

          bg-linear-to-r
          from-blue-900
          via-blue-700
          to-orange-500

          text-white

          p-6

          border-b
          shadow-lg
          ">

          <div className="
          flex
          justify-between
          items-start
          ">

<div>

<div className="
inline-flex
items-center

px-3
py-1

rounded-full

bg-white/20

text-xs
font-semibold

mb-3
">

📋 Activity Operations Workspace

</div>

<h2 className="
text-xl
sm:text-2xl
md:text-4xl

font-black

leading-tight
wrap-break-word
">

{activity.title}

</h2>

<p className="
text-white/80
mt-2
">

{activity.location_name}

</p>

<div className="
mt-4

flex
flex-wrap
gap-3
">

<span className="
px-4
py-2

rounded-full

bg-green-500/20
border
border-green-300/30

text-green-100

font-semibold
">

{activity.approval_status}

</span>

<span className="
px-4
py-2

rounded-full

bg-white/15

font-medium
">

📅 {formatDate(activity.activity_date)}

</span>

<span className="
px-4
py-2

rounded-full

bg-white/15

font-medium
">

🕒 {formatTime(activity.activity_time)}

</span>

</div>

</div>

<button

onClick={onClose}

className="
bg-red-500

px-3
py-2

md:px-5
md:py-3

rounded-xl

text-sm
md:text-base

font-bold
"

>

✕ Close

</button>

</div>

        </div>

        <div className="p-6">

          <div className="
          sticky
          top-0
          z-30

          bg-white/95
          backdrop-blur-md

          border-b
          shadow-md

          py-4
          mb-8

          flex
          gap-3

          overflow-x-auto
        ">



{[
'overview',
'personnel',
'tasks',
'monitoring',
'orders'
].map((tab) => (

<button

key={tab}

onClick={() =>
setActiveTab(tab)
}

className={`
px-4
py-2

text-sm
md:text-base

whitespace-nowrap

rounded-2xl

font-semibold

transition-all

${
activeTab === tab

? `
bg-blue-700
text-white
shadow-lg
scale-105
`

: `
bg-gray-100
hover:bg-gray-200
`
}
`}
>

{tab}

</button>

))}

</div>

{activeTab === 'overview' && (

<div>

<div className="
grid
grid-cols-1

sm:grid-cols-2

xl:grid-cols-4
gap-4
mb-8
">

<div className="
bg-blue-50
rounded-2xl
p-4
">
  <p className="text-sm text-gray-500">
    Date
  </p>

  <p className="font-bold">
    {formatDate(activity.activity_date)}
  </p>
</div>

<div className="
bg-blue-50
rounded-2xl
p-4
">
  <p className="text-sm text-gray-500">
    Time
  </p>

  <p className="font-bold">
    {formatTime(activity.activity_time)}
  </p>
</div>

<div className="
bg-blue-50
rounded-2xl
p-4
">
  <p className="text-sm text-gray-500">
    Status
  </p>

  <p className="font-bold">
    {activity.approval_status}
  </p>
</div>

<div className="
bg-blue-50
rounded-2xl
p-4
">
  <p className="text-sm text-gray-500">
    Program
  </p>

  <p className="font-bold">
    {activity.program_name}
  </p>
</div>

</div>

<div className="mb-8">

<h3 className="
text-xl
font-bold
mb-4
">
Official Communication
</h3>

{activity.communication_url ? (

<a
  href={activity.communication_url}
  target="_blank"
  rel="noopener noreferrer"
  className="
  inline-flex
  items-center
  px-4
  py-3
  bg-blue-50
  border
  border-blue-200
  rounded-xl
  text-blue-700
  "
>

📄 View Official Communication

</a>

) : (

<div className="text-gray-500">
No communication attached.
</div>

)}




</div>


<h3 className="
text-xl
font-bold
mb-4
">
Assigned Personnel
(
{
safeAttendees.filter(
(a:any) =>
a.activity_id === activity?.id
).length
}
)
</h3>

{canManageActivities && (

<button

onClick={() => {

const currentAttendees =

safeAttendees

.filter(
(a:any) =>
a.activity_id ===
activity?.id
)

.map(
(a:any) =>
a.employee_id
)

setAttendeeSelection(
currentAttendees
)

setShowManageAttendees(
true
)

}}

className="
mb-4

px-4
py-2

bg-blue-600
text-white

rounded-xl
"

>

Manage Attendees

</button>

)}





<div className="
grid
md:grid-cols-2
gap-3
mb-8
">

{safeAttendees
  .filter(
    (attendee:any) =>
      attendee.activity_id ===
      activity?.id
  )
  .map(
    (attendee:any) => (

      <div
        key={attendee.id}
        className="
        bg-purple-50
        border
        border-purple-200
        rounded-2xl
        p-4
        "
      >

        <p className="
        font-bold
        text-blue-900
        ">
          {attendee.attendee_name}
        </p>

        <p className="
        text-sm
        text-gray-600
        ">
          {attendee.designation}
        </p>

        <p className="
        text-sm
        text-gray-500
        ">
          {attendee.division}
        </p>

      </div>

    )
  )
}

</div>

<h3 className="
text-xl
font-bold
mb-4
">
Preparation Checklist
(
{
safeChecklists.filter(
(i:any) =>
i.activity_id === activity.id
).length
}
)
</h3>

<div className="
space-y-3
">

{safeChecklists
  .filter(
    (item:any) =>
      item.activity_id ===
      activity?.id
  )
  .map(
    (item:any) => (

      <div
        key={item.id}
        className="
        flex
        items-center
        gap-4

        border
        rounded-xl

        p-4
        "
      >

        <input
          type="checkbox"
          checked={
            item.completed
          }
          readOnly
        />

        <span>
          {item.item}
        </span>

      </div>

    )
  )
}

</div>


<div className="
mt-10
pt-6
border-t

flex
flex-wrap
gap-3
">

{activity.approval_status !==
'approved' && (

<button
  onClick={() =>
    approveActivity(
      activity.id
    )
  }
  className="
  px-5
  py-3

  bg-green-600
  text-white

  rounded-xl
  "
>

Approve Activity

</button>

)}

<button
  onClick={() =>
    editActivity(activity)
  }
  className="
  px-5
  py-3

  bg-blue-600
  text-white

  rounded-xl
  "
>

Edit Activity

</button>

<button
  onClick={() =>
    deleteActivity(
      activity.id
    )
  }
  className="
  px-5
  py-3

  bg-red-600
  text-white

  rounded-xl
  "
>

Delete Activity

</button>

</div>

</div>

)}


{activeTab === 'personnel' && (

<div>

<h3 className="
text-2xl
font-bold
mb-6
">
Assigned Personnel
</h3>

<div className="
grid
md:grid-cols-2
gap-3
">

{safeAttendees

.filter(
(attendee:any) =>
attendee.activity_id ===
activity?.id
)

.map(
(attendee:any) => (

<div
key={attendee.id}
className="
bg-linear-to-r
from-purple-50
to-blue-50

border
border-purple-200

rounded-3xl

p-5

shadow-sm

hover:shadow-lg
transition
"
>

<p className="
font-bold
text-blue-900

wrap-break-word
">
{attendee.attendee_name}
</p>

<p className="
text-sm
text-gray-600
">
{attendee.designation}
</p>

<p className="
text-sm
text-gray-500
">
{attendee.division}
</p>

</div>

))

}

</div>

</div>

)}




{activeTab === 'monitoring' && (

<div>

<h3 className="
text-2xl
font-bold
mb-6
">
Activity Monitoring
</h3>

<div className={`
mb-8

border

rounded-3xl

p-6

${
healthColor === 'green'

? 'bg-green-50 border-green-200'

: healthColor === 'yellow'

? 'bg-yellow-50 border-yellow-200'

: 'bg-red-50 border-red-200'
}
`}>

<div className="
flex
items-center
justify-between
gap-4
">

<div>

<h4 className={`
text-xl
font-black

${
healthColor === 'green'

? 'text-green-700'

: healthColor === 'yellow'

? 'text-yellow-700'

: 'text-red-700'
}
`}>

{healthIcon}
{' '}
{healthStatus}

</h4>

<p className="
mt-2
text-gray-700
">

{healthMessage}

</p>

</div>

<div className="
text-5xl
">

{healthIcon}

</div>

</div>

</div>


<div className="
grid
grid-cols-2
lg:grid-cols-5
gap-4
mb-8
">

<div className="
bg-slate-50
border
rounded-2xl
p-4
">
<p className="text-sm text-gray-500">
Total Tasks
</p>

<p className="
text-3xl
font-black
">
{totalTasks}
</p>
</div>

<div className="
bg-green-50
border
border-green-200
rounded-2xl
p-4
">
<p className="text-sm text-gray-500">
Completed
</p>

<p className="
text-3xl
font-black
text-green-700
">
{completedTasks}
</p>
</div>

<div className="
bg-blue-50
border
border-blue-200
rounded-2xl
p-4
">
<p className="text-sm text-gray-500">
Ongoing
</p>

<p className="
text-3xl
font-black
text-blue-700
">
{ongoingTasks}
</p>
</div>

<div className="
bg-yellow-50
border
border-yellow-200
rounded-2xl
p-4
">
<p className="text-sm text-gray-500">
Pending
</p>

<p className="
text-3xl
font-black
text-yellow-700
">
{pendingTasks}
</p>
</div>

<div className="
bg-red-50
border
border-red-200
rounded-2xl
p-4
">
<p className="text-sm text-gray-500">
Overdue
</p>

<p className="
text-3xl
font-black
text-red-700
">
{overdueTasks}
</p>
</div>

</div>

<div className="
bg-white
border
rounded-3xl
p-6
">

<div className="
flex
justify-between
items-center
mb-3
">

<h4 className="
font-bold
text-lg
">
Activity Progress
</h4>

<span className="
font-black
text-blue-700
text-xl
">
{activityProgress}%
</span>

</div>

<div className="
w-full
h-4
bg-gray-200
rounded-full
overflow-hidden
">

<div
className="
h-full
bg-green-600
transition-all
duration-500
"
style={{
width:
`${activityProgress}%`
}}
/>

</div>

</div>


<div className="
mt-8
bg-white
border
rounded-3xl
overflow-hidden
">

<div className="
px-6
py-4
border-b
bg-slate-50
">

<h4 className="
font-bold
text-lg
">
Personnel Performance
</h4>

</div>



<div className="
overflow-x-auto
">

<table className="
w-full
text-sm
">

<thead>

<tr className="
bg-slate-100
text-left
">

<th className="p-4">
Personnel
</th>

<th className="p-4">
Assigned
</th>

<th className="p-4">
Completed
</th>

<th className="p-4">
Pending
</th>

<th className="p-4">
Rate
</th>

</tr>

</thead>

<tbody>

{personnelPerformance.map(
(person:any) => (

<tr
key={
person.employee_id
}
className="
border-t
"
>

<td className="
p-4
font-medium
">
{person.attendee_name}
</td>

<td className="p-4">
{person.assigned}
</td>

<td className="
p-4
text-green-700
font-semibold
">
{person.completed}
</td>

<td className="
p-4
text-orange-700
font-semibold
">
{person.pending}
</td>

<td className="p-4">

<span className={`
px-3
py-1
rounded-full
text-xs
font-bold

${
person.completionRate >= 80

? 'bg-green-100 text-green-700'

: person.completionRate >= 50

? 'bg-yellow-100 text-yellow-700'

: 'bg-red-100 text-red-700'
}
`}>

{person.completionRate}%

</span>

</td>

</tr>

))
}

</tbody>

</table>

</div>

</div>

<div className="
mt-8
bg-white
border
rounded-3xl
overflow-hidden
">

<div className="
px-6
py-4
border-b
bg-red-50
">

<h4 className="
font-bold
text-lg
text-red-700
">
Overdue Assignments
</h4>

</div>

{
overdueAssignments.length === 0 ? (

<div className="
p-8
text-center
text-green-700
font-medium
">

✅ No overdue assignments

</div>

) : (

<div className="
overflow-x-auto
">

<table className="
w-full
text-sm
">

<thead>

<tr className="
bg-slate-100
text-left
">

<th className="p-4">
Task
</th>

<th className="p-4">
Deadline
</th>

<th className="p-4">
Status
</th>

<th className="p-4">
Days Late
</th>

</tr>

</thead>

<tbody>

{overdueAssignments.map(
(item:any) => {

const daysLate =

Math.floor(

(
Date.now() -

new Date(
item.deadline
).getTime()

)

/

(1000 * 60 * 60 * 24)

)

return (

<tr

key={item.id}

onClick={() => {

  setSelectedTask(item)

  setEditTaskData(item)

  setShowTaskDrawer(true)

}}

className="
border-t
cursor-pointer
hover:bg-red-50
"
>

<td className="
p-4
font-medium
">
{item.task}
</td>

<td className="p-4">
{item.deadline}
</td>

<td className="
p-4
text-red-700
font-semibold
">
{item.status}
</td>

<td className="
p-4
font-bold
text-red-700
">
{daysLate}
day(s)
</td>

</tr>

)

})}

</tbody>

</table>

</div>

)

}
</div>



</div>

)}


{activeTab === 'tasks' && (

<div>

<h3 className="
text-2xl
font-bold
mb-6
">
Assignments
</h3>

<div className="
grid
md:grid-cols-3
gap-4
mb-6
">

<select

value={selectedEmployee}

onChange={(e) =>
setSelectedEmployee(
e.target.value
)
}

className="
border
rounded-xl
p-3
"
>

<option value="">
Select Employee
</option>

{safeAttendees

.filter(
(a:any) =>
a.activity_id ===
activity.id
)

.map(
(a:any) => (

<option
key={a.employee_id}
value={a.employee_id}
>

{a.attendee_name}

</option>

))

}

</select>

<input

value={task}

onChange={(e) =>
setTask(
e.target.value
)
}

placeholder="Task"

className="
border
rounded-xl
p-3
"
/>

<input

type="date"

value={deadline}

onChange={(e) =>
setDeadline(
e.target.value
)
}

className="
border
rounded-xl
p-3
"
/>

</div>

<button

onClick={createAssignment}

className="
bg-blue-600
text-white

px-5
py-3

rounded-xl
mb-8
"
>

Create Assignment

</button>

<div className="
space-y-3
">

{assignments

.filter(
(item:any) =>
item.activity_id ===
activity.id
)

.map(
(item:any) => (

<div

key={item.id}

onClick={() => {

  setSelectedTask(item)

  setEditTaskData(item)

  setShowTaskDrawer(true)

}}

className="
bg-white

border-l-8
border-blue-500

rounded-3xl

p-5

shadow-md

hover:shadow-xl

cursor-pointer

transition
"
>

<p className="
font-bold
">
{item.task}
</p>

<p>
Deadline:
{' '}
{item.deadline}
</p>

<span className={`
inline-block

px-3
py-1

rounded-full

text-sm
font-semibold

${
item.status === 'completed'
? 'bg-green-100 text-green-700'

: item.status === 'ongoing'
? 'bg-blue-100 text-blue-700'

: 'bg-orange-100 text-orange-700'
}
`}>
{item.status}
</span>

<p>
Progress:
{' '}
{item.progress || 0}
%
</p>

</div>

))

}

</div>

</div>

)}

{activeTab === 'orders' && (

<div>

<h3 className="
text-2xl
font-bold
mb-6
">
Travel Orders / Office Orders
</h3>

<p className="
text-gray-500
mb-6
">
Generate travel documents for
approved activities.
</p>

<button

disabled={
activity.approval_status !==
'approved'
}

onClick={() => {

const activityAttendees =

safeAttendees

.filter(
(a:any) =>
a.activity_id ===
activity.id
)

.map(
(a:any) =>
a.attendee_name
)

.join('\n')

setSelectedActivity(
activity
)

setDocumentDate(
formatDate(
activity.activity_date
)
)

setRecipients(
activityAttendees
)

setPurpose(

`In the interest of service, you are hereby authorized to travel to ${activity.location_name} to attend and participate in ${activity.title}.`

)

setShowTravelOrderModal(
true
)

}}

className={`
px-6
py-4

rounded-2xl

text-white
font-bold

${
activity.approval_status ===
'approved'

? 'bg-purple-600'
: 'bg-gray-300'
}
`}
>

Generate

{' '}

{
getDocumentType(
activity.location_name || ''
) === 'TO'
? 'Travel Order'
: 'Office Order'
}

</button>

</div>

)}


{showTaskDrawer && selectedTask && (

<div className="
fixed
inset-0

z-110000

bg-black/40

flex
justify-end
">

<div className="
bg-white

w-full
md:w-125

h-full

overflow-y-auto

shadow-2xl
">

<div className="
sticky
top-0

bg-blue-900
text-white

p-6

flex
justify-between
items-center
">

<div>

<h2 className="
text-xl
font-bold
">

Task Details

</h2>

<button

onClick={() =>

setIsEditingTask(
!isEditingTask
)

}

className="
mt-2

bg-yellow-500
text-white

px-3
py-2

rounded-xl

text-sm
"

>

✏ Edit Task

</button>

</div>

<button

onClick={() => {

  setShowTaskDrawer(false)

setSelectedTask(null)

setEditTaskData({})

setIsEditingTask(false)

}}

className="
bg-red-500

px-4
py-2

rounded-xl
"
>

Close

</button>

</div>

<div className="
p-6
space-y-6
">

<div>

<p className="
text-sm
text-gray-500
">
Task
</p>

<h3 className="
text-xl
font-bold
">
{isEditingTask ? (

<input

value={
editTaskData.task || ''
}

onChange={(e) =>

setEditTaskData({

...editTaskData,

task:
e.target.value

})

}

className="
w-full
border
rounded-xl
p-3
"
/>

) : (

selectedTask.task

)}
</h3>

</div>

<div className="
grid
grid-cols-2
gap-4
">

<div>

<p className="
text-sm
text-gray-500
">
Status
</p>

{isEditingTask ? (

<select

value={
editTaskData.status || 'pending'
}

onChange={(e) =>

setEditTaskData({

...editTaskData,

status:
e.target.value

})

}

className="
w-full
border
rounded-xl
p-3
"
>

<option value="pending">
Pending
</option>

<option value="ongoing">
Ongoing
</option>

<option value="completed">
Completed
</option>

</select>

) : (

<span className={`
inline-flex
px-3
py-1
rounded-full
text-sm
font-bold

${
selectedTask.status === 'completed'
? 'bg-green-100 text-green-700'

: selectedTask.status === 'ongoing'
? 'bg-blue-100 text-blue-700'

: 'bg-orange-100 text-orange-700'
}
`}>

{selectedTask.status}

</span>

)}

</div>

<div>

<p className="
text-sm
text-gray-500
">
Progress
</p>

{isEditingTask ? (

<div>

<input

type="range"

min="0"

max="100"

value={
editTaskData.progress || 0
}

onChange={(e) =>

setEditTaskData({

...editTaskData,

progress:
Number(
e.target.value
)

})

}

className="
w-full
"
/>

<p className="
font-bold
mt-2
">
{editTaskData.progress || 0}%
</p>

</div>

) : (

<div>

<p className="
font-semibold
mb-2
">
{selectedTask.progress || 0}%
</p>

<div className="
w-full
h-3
bg-slate-200
rounded-full
overflow-hidden
">

<div

className="
h-full
bg-blue-600
"

style={{
width:
`${selectedTask.progress || 0}%`
}}

/>

</div>

</div>

)}

</div>

<div>

<p className="
text-sm
text-gray-500
">
Deadline
</p>

{isEditingTask ? (

<input

type="date"

value={
editTaskData.deadline || ''
}

onChange={(e) =>

setEditTaskData({

...editTaskData,

deadline:
e.target.value

})

}

className="
w-full
border
rounded-xl
p-3
"
/>

) : (

<p className="
font-semibold
">

{
selectedTask.deadline ||
'No Deadline'
}

</p>

)}

</div>

<div>

<p className="
text-sm
text-gray-500
">
Priority
</p>

{isEditingTask ? (

<select

value={
editTaskData.priority || 'Normal'
}

onChange={(e) =>

setEditTaskData({

...editTaskData,

priority:
e.target.value

})

}

className="
w-full
border
rounded-xl
p-3
"
>

<option value="Low">
Low
</option>

<option value="Normal">
Normal
</option>

<option value="High">
High
</option>

<option value="Critical">
Critical
</option>

</select>

) : (

<p className="
font-semibold
">

{
selectedTask.priority ||
'Normal'
}

</p>

)}

</div>

</div>

<div>


<div>

<p className="
text-sm
text-gray-500
mb-2
">
Assigned To
</p>


{
isEditingTask && (

<select

value={
editTaskData.employee_id
}

onChange={(e) =>

setEditTaskData({

...editTaskData,

employee_id:
e.target.value

})

}

className="
mt-3
w-full

border
rounded-xl
p-3
"
>

{safeAttendees

.filter(
(a:any) =>
a.activity_id ===
activity.id
)

.map(
(a:any) => (

<option

key={
a.employee_id
}

value={
a.employee_id
}
>

{
a.attendee_name
}

</option>

))

}

</select>

)
}


<div className="
bg-blue-50
border
border-blue-200
rounded-xl
p-4
">

<p className="
font-bold
text-blue-900
">

{
selectedTaskAssignee
?.attendee_name ||

'Unknown Personnel'
}

</p>

<p className="
text-sm
text-gray-600
">

{
selectedTaskAssignee
?.designation ||
''
}

</p>

<p className="
text-sm
text-gray-500
">

{
selectedTaskAssignee
?.division ||
''
}

</p>

</div>

</div>


<p className="
text-sm
text-gray-500
mb-2
">
Assigned By
</p>

<p className="
font-semibold
">
{
selectedTask.assigned_by_name ||
'Office Chief'
}
</p>

<p className="
text-sm
text-gray-500
">
{
selectedTask.assigned_by_role
}
</p>

</div>

<div>

<p className="
text-sm
text-gray-500
mb-2
">
Remarks
</p>

{isEditingTask ? (

<textarea

rows={4}

value={
editTaskData.remarks || ''
}

onChange={(e) =>

setEditTaskData({

...editTaskData,

remarks:
e.target.value

})

}

className="
w-full
border
rounded-xl
p-3
"
/>

) : (

<div className="
bg-slate-50
border
rounded-xl
p-4
">

{
selectedTask.remarks ||
'No remarks available.'
}

</div>

)}

</div>


{isEditingTask && (

<button

onClick={updateTask}

className="
w-full

bg-blue-600
text-white

py-3

rounded-xl

font-bold

mt-4
"

>

Save Changes

</button>

)}

</div>

</div>

</div>

)}



{showManageAttendees && (

<div className="
fixed
inset-0

z-120000

bg-black/50

flex
items-center
justify-center
">

<div className="
bg-white

w-175
max-w-[95vw]

rounded-3xl

p-6
">

<h2 className="
text-2xl
font-bold
mb-4
">

Manage Attendees

</h2>

<div className="
max-h-100
overflow-y-auto

space-y-2
">

{employees.map(
(emp:any) => (

<label
key={emp.id}
className="
flex
items-center
gap-3

p-3

border
rounded-xl
"
>

<input

type="checkbox"

checked={
attendeeSelection.includes(
emp.id
)
}

onChange={(e) => {

if (
e.target.checked
) {

setAttendeeSelection(
[
...attendeeSelection,
emp.id
]
)

} else {

setAttendeeSelection(

attendeeSelection.filter(
(id) =>
id !== emp.id
)

)

}

}}

/>

<div>

<div className="
font-medium
">
{emp.name}
</div>

<div className="
text-sm
text-gray-500
">
{emp.designation}
</div>

</div>

</label>

))
}

</div>

<div className="
flex
justify-end
gap-3

mt-6
">

<button

onClick={() =>
setShowManageAttendees(
false
)
}

className="
px-4
py-2

border

rounded-xl
"

>

Cancel

</button>

<button

className="
px-4
py-2

bg-blue-600
text-white

rounded-xl
"

>

Save Changes

</button>

</div>

</div>

</div>

)}

        </div>
            
          </div>

        </div>




  )
}