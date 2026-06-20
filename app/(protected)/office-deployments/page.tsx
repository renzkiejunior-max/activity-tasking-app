'use client'

import { useEffect,
  useState } from 'react'

import {
  supabase
} from '@/lib/supabase'


import ProtectedRoute
from '@/components/ProtectedRoute'


export default function Page() {

const [
  deployments,
  setDeployments
] = useState<any[]>([])


useEffect(() => {

  fetchDeployments()

}, [])

console.log(
  'FETCHING DEPLOYMENTS'
)


const fetchDeployments =
async () => {

  const {
    data,
    error
  } = await supabase

    .from('assignments')

    .select(`
      *,
      employees(
        name,
        photo_url
      ),
      activities(
        title,
        activity_date,
        activity_time,
        location_name,
        venue_details
        )
    `)

  console.log(
  'FIRST DEPLOYMENT',
  data?.[0]
)

console.log(
  'EMPLOYEE DATA',
  data?.[0]?.employees
)

console.log(
  'ACTIVITY DATA',
  data?.[0]?.activities
)

console.log(
  'TIME VALUE',
  data?.[0]?.activities?.activity_time
)

setDeployments(
  data || []
)


}


const today =

new Date()
.toISOString()
.split('T')[0]


const tomorrow =

new Date()

tomorrow.setDate(
  tomorrow.getDate() + 1
)

const tomorrowDate =

tomorrow
.toISOString()
.split('T')[0]

const deployedToday =

deployments.filter(
  (d:any) => {

    const date =

      d.activities
        ?.activity_date

    return (
      date === today
    )

  }
)

const scheduledTomorrow =

deployments.filter(
  (d:any) => {

    const date =

      d.activities
        ?.activity_date

    return (
      date === tomorrowDate
    )

  }
)


const upcomingDeployments =

deployments.filter(
  (d:any) => {

    const activityDate =

      d.activities
        ?.activity_date

    return (

      activityDate &&

      activityDate >
      today
    )

  }
)

const assignedEmployeeIds =

deployments.map(
  (d:any) =>

    d.employee_id
)

const availablePersonnel =

deployments.filter(
  (d:any) =>

    !assignedEmployeeIds.includes(
      d.employee_id
    )
)

const assignedPersonnelCount =

new Set(

  deployments.map(
    (d:any) =>
      d.employee_id
  )

).size

const deploymentRecordCount =

new Set(

  deployments.map(
    (d:any) =>
      d.activity_id
  )

).size


const formatActivityDate = (
  date:string
) => {

  return new Date(
    date
  ).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

}


const formatTime = (time: string) => {
  if (!time) return 'No Time'

  const [hours, minutes] = time.split(':')

  const date = new Date()

  date.setHours(Number(hours))
  date.setMinutes(Number(minutes))

  return date.toLocaleTimeString(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }
  )
}

const groupedUpcoming =

Object.values(

  upcomingDeployments.reduce(
    (acc:any, item:any) => {

      const activityId =

        item.activity_id

      if (
        !acc[activityId]
      ) {

        acc[activityId] = {

          activity:
            item.activities,

          attendees: [],
        }

      }

      acc[activityId]
        .attendees
        .push(
          item.employees?.name
        )

      return acc

    },

    {}
  )

)

  return (

    <ProtectedRoute
      allowedRoles={[
        'division_chief'
      ]}
    >

      <div className="
        space-y-6
      ">

        {/* HEADER */}

        <div>

          <h1 className="
            text-5xl
            font-bold
            text-blue-900
          ">
            

            Personnel Deployments

          </h1>

          <p className="
            text-gray-600
            mt-2
          ">

            Monitor personnel deployed today,
            upcoming deployments,
            and available personnel.

          </p>


          <div className="
mt-6

bg-linear-to-br
from-red-500
to-red-700

text-white

rounded-3xl

p-6

shadow-xl
">

<h2 className="
text-2xl
font-bold
">

🚨 Today's Deployment Status

</h2>

<p className="
mt-2
text-orange-100
">

Monitor personnel deployed,
scheduled activities,
and workforce availability.

</p>

</div>

        </div>

        {/* SUMMARY */}

        <div className="
          grid
          grid-cols-2
          xl:grid-cols-4

          gap-4
        ">

          <Card
            title="Deployed Today"
            value={deployedToday.length}
            color="
              bg-gradient-to-br
              from-blue-500
              to-blue-700
            "
          />

          <Card
            title="Scheduled Tomorrow"
            value={scheduledTomorrow.length}
            color="
              bg-gradient-to-br
              from-orange-500
              to-orange-700
            "
          />

          <Card
            title="Assigned Personnel"
            value={assignedPersonnelCount}
            color="
              bg-gradient-to-br
              from-green-500
              to-green-700
            "
          />

          <Card
            title="Deployment Records"
            value={deploymentRecordCount}
            color="
              bg-gradient-to-br
              from-purple-500
              to-purple-700
            "
          />

        </div>

        <div className="
flex
flex-wrap

gap-3
">

<button className="
px-4
py-2

rounded-2xl

bg-blue-700
text-white

font-medium
">

Today

</button>

<button className="
px-4
py-2

rounded-2xl

border

font-medium
">

Tomorrow

</button>

<button className="
px-4
py-2

rounded-2xl

border

font-medium
">

This Week

</button>

<button className="
px-4
py-2

rounded-2xl

border

font-medium
">

All

</button>

</div>

        {/* DEPLOYED TODAY */}

        <div className="
          bg-white

          rounded-3xl

          shadow-xl

          border

          p-6
        ">

          <h2 className="
            text-3xl
            font-bold
            text-blue-900

            mb-6
          ">

            🚚 Deployed Today

          </h2>


          <div className="
overflow-x-auto
">

<table className="
w-full
">

<thead>

<tr className="
border-b
">

<th className="
text-left
py-3
">
Employee
</th>

<th className="
text-left
py-3
">
Activity
</th>

<th className="
text-left
py-3
">
Location
</th>

<th className="
text-left
py-3
">
Status
</th>

</tr>

</thead>

<tbody>

{deployedToday.length > 0 ? (

  deployedToday.map(
    (item:any) => (

      <tr
        key={item.id}
        className="
        border-b
        "
      >

        <td className="
        py-4
        ">

          {
            item.employees
              ?.name
          }

        </td>

        <td>

          {
            item.activities
              ?.title
          }

        </td>

        <td>

          {
            item.activities
              ?.location_name
          }

        </td>

        <td>

          <span className="
          bg-green-100
          text-green-700

          px-3
          py-1

          rounded-full

          text-sm
          "
          >

            Deployed

          </span>

        </td>

      </tr>

    )
  )

) : (

<tr>

<td
colSpan={4}
className="
py-4
text-center
text-gray-500
"
>

No deployment records

</td>

</tr>

)}

</tbody>

</table>

</div>


        </div>

        <div className="
bg-white

rounded-3xl

shadow-xl

border

p-6
">

<h2 className="
text-3xl
font-bold
text-blue-900

mb-6
">

📅 Upcoming Deployments

</h2>


<div className="
overflow-x-auto
">

<div className="
grid
gap-4
">

{
groupedUpcoming.length > 0

? (

groupedUpcoming.map(
(item:any,index) => (

<div

key={index}

className="
border

rounded-3xl

p-6

bg-slate-50
"
>

<h3 className="
text-xl
font-bold
text-blue-900
">

{
item.activity?.title
}

</h3>

<p className="
text-gray-600
mt-2
">

📅

{
formatActivityDate(
item.activity
?.activity_date
)
}

</p>

<p className="
text-gray-600
">

🕒

{
formatTime(
  item.activity
    ?.activity_time
)
}

</p>

<p className="
text-gray-600
">

📍

{
item.activity
?.location_name
}

</p>

<div className="
mt-4
">

<p className="
font-semibold
mb-2
">

Personnel Assigned
(
{
item.attendees.length
}
)

</p>

<ul className="
space-y-1
">

{
item.attendees.map(
(
name:string,
idx:number
) => (

<li key={idx}>

👤 {name}

</li>

))
}

</ul>

</div>

</div>

))

)

: (

<div className="
text-center
text-gray-500

py-8
">

No upcoming deployments

</div>

)

}

</div>

</div>


</div>

<div className="
bg-white

rounded-3xl

shadow-xl

border

p-6
">

<h2 className="
text-3xl
font-bold
text-blue-900

mb-6
">

👥 Available Personnel

</h2>

<div className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-3

gap-4
">

<div className="
border

rounded-2xl

p-4
">

<h3 className="
font-bold
">

No available personnel

</h3>

<p className="
text-sm
text-gray-500
mt-2
">

Available personnel
will appear here.

</p>

</div>

</div>


</div>


      </div>

    </ProtectedRoute>

  )

}

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

        shadow-xl

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

}