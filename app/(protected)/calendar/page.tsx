'use client'

import {
  useEffect,
  useState,
} from 'react'

import FullCalendar from
  '@fullcalendar/react'

import dayGridPlugin from
  '@fullcalendar/daygrid'

import timeGridPlugin from
  '@fullcalendar/timegrid'

import interactionPlugin from
  '@fullcalendar/interaction'

import { supabase }
from '../../../lib/supabase'

export default function Page() {

  const [events,
    setEvents] =
    useState<any[]>([])

  const [selectedEvent,
    setSelectedEvent] =
    useState<any>(null)

  // FETCH EVENTS
  const fetchEvents =
    async () => {

      // AUTH USER
      const {
        data: {
          user,
        },
      } = await supabase

        .auth.getUser()

      // GET EMPLOYEE
      const {
        data: employee,
      } = await supabase

        .from('employees')

        .select('*')

        .eq(
          'user_id',
          user?.id
        )

        .single()

      // GET USER
      const {
        data: userData,
      } = await supabase

        .from('users')

        .select('*')

        .eq(
          'id',
          user?.id
        )

        .single()

      // SAFE ROLES
      const roles =

        Array.isArray(
          userData?.roles
        )

          ? userData.roles

          : userData?.roles

            ? [userData.roles]

            : userData?.role

              ? [userData.role]

              : []

      const isStaff =
        roles.includes(
          'staff'
        )

      const isAdmin =
        roles.includes(
          'admin'
        )

      const isChief =
        roles.includes(
          'division_chief'
        )

// AUTO UPDATE ACTIVITY STATUS

const {
  data: allActivities,
} = await supabase

  .from('activities')

  .select('*')

for (
  const activity of
  allActivities || []
) {

  let newStatus =
    'Upcoming'

  const today =
    new Date()

  const activityDate =
    new Date(
      activity.activity_date
    )

  // REMOVE TIME
  today.setHours(
    0, 0, 0, 0
  )

  activityDate.setHours(
    0, 0, 0, 0
  )

  if (
    activityDate <
    today
  ) {

    newStatus =
      'Completed'
  }

  else if (
    activityDate
      .getTime()

    ===

    today.getTime()
  ) {

    newStatus =
      'Ongoing'
  }

  // UPDATE ONLY IF CHANGED
  if (
    activity.status !==
    newStatus
  ) {

    await supabase

      .from('activities')

      .update({

        status:
          newStatus,

      })

      .eq(
        'id',
        activity.id
      )
  }
}

      // ACTIVITIES
      const {
        data: activities,
      } = await supabase

        .from('activities')

        .select('*')

      // ATTENDEES
      const {
        data: attendees,
      } = await supabase

        .from(
          'activity_attendees'
        )

        .select('*')

      // ASSIGNMENTS
      const {
        data: assignments,
      } = await supabase

        .from('assignments')

        .select(`
          *,
          activities(
            title,
            activity_date,
            activity_time
          )
        `)

        .eq(
          'employee_id',
          employee?.id
        )

// COLORS
const colors = [

  '#2563eb',
  '#16a34a',
  '#ea580c',
  '#9333ea',
  '#dc2626',
  '#0891b2',
  '#ca8a04',
  '#be123c',
  '#0f766e',
  '#7c3aed',

]

// ACTIVITY EVENTS
const activityEvents =

  (activities || []).map(
    (
      item: any
    ) => {

      // UNIQUE COLOR
      const colorIndex =

        item.id
          .split('')
          .reduce(
            (
              acc: number,
              char: string
            ) =>

              acc +
              char.charCodeAt(0),

            0
          )

        %

        colors.length

      return {

        id: item.id,

        title:
          item.title,

        start:
`${item.activity_date}T${item.activity_time || '00:00'}`,

        end:
`${item.activity_date}T23:59:00`,

        allDay: false,

        backgroundColor:
          colors[colorIndex],

        borderColor:
          colors[colorIndex],

        extendedProps: {

          type:
            'Activity',

          location:
            item.location_name,

          venue:
            item.venue_details,

          description:
            item.description,

          status:

            new Date(
              item.activity_date
            ) < new Date()

              ? 'Completed'

              : new Date(
                  item.activity_date
                ).toDateString()

                ===

                new Date()
                  .toDateString()

                  ? 'Ongoing'

                  : 'Upcoming',

          time:
            item.activity_time,

          attendees:

            attendees?.filter(
              (
                attendee: any
              ) =>

                attendee.activity_id ===
                item.id
            ) || [],
        },
      }

    }
  )

      // ORANGE EVENTS
      const assignmentEvents =

        isStaff

          ? (assignments || []).map(
              (
                item: any
              ) => ({

                id: item.id,

                title:
'You are selected to attend',

                start:
`${item.activities?.activity_date}T${item.activities?.activity_time || '00:00'}`,

end:
`${item.activities?.activity_date}T23:59:00`,

allDay: false,

                backgroundColor:
                  '#f97316',

                borderColor:
                  '#f97316',

                extendedProps: {

                  type:
                    'Assignment',

                  status:
                    item.status,

                  progress:
                    item.progress,

                  time:
                    item.activities
                      ?.activity_time,

                },
              })
            )

          : []

      setEvents([

        ...activityEvents,
        ...assignmentEvents,

      ])
    }

  useEffect(() => {

    fetchEvents()

  }, [])

  return (

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

          Operations Calendar

        </h1>

        <p className="
          text-gray-600
          mt-2
          text-lg
        ">

          Operational scheduling,
          activities,
          assignments,
          and deadlines

        </p>

      </div>

      {/* MAIN WRAPPER */}
<div className="
  w-full
">

        {/* CALENDAR */}
<div className="
  w-full

  bg-linear-to-br
  from-blue-50
  via-white
  to-orange-50

  rounded-3xl
  shadow-2xl

  border
  border-blue-400

  p-6
">

          <FullCalendar

          timeZone="local"

            plugins={[

              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,

            ]}

            initialView="dayGridMonth"

            headerToolbar={{

              left:
                'prev,next today',

              center:
                'title',

              right:
'dayGridMonth,timeGridWeek,timeGridDay'

            }}

            events={events}

            eventDidMount={(info) => {

  info.el.style.backgroundColor =
    info.event.backgroundColor

  info.el.style.borderColor =
    info.event.borderColor

}}

            height="auto"
            contentHeight="auto"
            expandRows={true}

            eventClick={(info) =>

              setSelectedEvent(
                info.event
              )
            }

            editable={false}

            selectable={true}

dayHeaderClassNames={(arg) => {

  // SUNDAY
  if (
    arg.date.getDay() === 0
  ) {

    return [
      'bg-red-100',
      'text-red-700',
      'font-bold',
    ]
  }

  return [
    'bg-blue-100',
    'text-blue-900',
    'font-bold',
  ]
}}

dayCellClassNames={(arg) => {

  // SUNDAY COLUMN
  if (
    arg.date.getDay() === 0
  ) {

    return [
      'bg-red-50'
    ]
  }

  return []
}}

eventClassNames={() => [

  'rounded-xl',

  'shadow-lg',

  'px-2',
  'py-1',

  'font-bold',

  'cursor-pointer',

  'border-0',
]}

buttonText={{
  today: 'Today',
  month: 'Month',
  week: 'Week',
  day: 'Day',
}}

          />



        </div>

        {/* EVENT MODAL */}
{selectedEvent && (

  <div className="
    fixed
    inset-0
    z-50

    bg-black/50
    backdrop-blur-sm

    flex
    items-center
    justify-center

    p-4
  ">

    <div className="
  bg-white

  w-full
  max-w-3xl

  rounded-3xl

  shadow-2xl

  overflow-hidden

  max-h-[90vh]

  flex
  flex-col
">

      {/* HEADER */}
      <div className="
        bg-linear-to-r
        from-blue-800
        via-blue-600
        to-orange-500

        p-8

        text-white
      ">

        <div className="
          flex
          justify-between
          items-start
          gap-4
        ">

          <div>

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

              📅 Operations Calendar

            </div>

            <h2 className="
              text-4xl
              font-black

              mt-4
            ">

              {
                selectedEvent.title
              }

            </h2>

          </div>

          {/* CLOSE */}
          <button

            onClick={() =>
              setSelectedEvent(null)
            }

            className="
              w-12
              h-12

              rounded-2xl

              bg-white/20
              hover:bg-red-500

              text-white

              text-2xl
              font-bold
            "
          >

            ×

          </button>

        </div>

      </div>

      {/* BODY */}
      <div className="
  p-8
  space-y-6

  overflow-y-auto
">

        {/* INFO GRID */}
        <div className="
          grid
          md:grid-cols-2
          gap-5
        ">

          {/* TYPE */}
          <div className="
            bg-blue-50
            border
            border-blue-100

            rounded-2xl

            p-5
          ">

            <p className="
              text-sm
              text-gray-500
            ">

              Event Type

            </p>

            <p className="
              text-xl
              font-bold
              text-blue-900
              mt-2
            ">

              {
                selectedEvent
                  .extendedProps
                  .type
              }

            </p>

          </div>

          {/* STATUS */}
          <div className="
            bg-orange-50
            border
            border-orange-100

            rounded-2xl

            p-5
          ">

            <p className="
              text-sm
              text-gray-500
            ">

              Status

            </p>

            <p className="
              text-xl
              font-bold
              text-orange-700
              mt-2
            ">

              {
                selectedEvent
                  .extendedProps
                  .status
              }

            </p>

          </div>

          {/* DATE */}
          <div className="
            bg-gray-50
            border

            rounded-2xl

            p-5
          ">

            <p className="
              text-sm
              text-gray-500
            ">

              Date

            </p>

            <p className="
              font-bold
              mt-2
            ">

              {
                selectedEvent?.start

                  ? new Date(
                      selectedEvent.start
                    ).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )

                  : 'N/A'
              }

            </p>

          </div>

          {/* TIME */}
          <div className="
            bg-gray-50
            border

            rounded-2xl

            p-5
          ">

            <p className="
              text-sm
              text-gray-500
            ">

              Time

            </p>

            <p className="
              font-bold
              mt-2
            ">

              {
                selectedEvent
                  ?.extendedProps
                  ?.time

                ? new Date(
                    `1970-01-01T${selectedEvent.extendedProps.time}`
                  ).toLocaleTimeString(
                    'en-US',
                    {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    }
                  )

                : 'N/A'
              }

            </p>

          </div>

        </div>

        {/* LOCATION */}
        {selectedEvent
          .extendedProps
          .location && (

          <div className="
            bg-blue-50
            border
            border-blue-100

            rounded-2xl

            p-5
          ">

            <p className="
              text-sm
              text-gray-500
            ">

              Location

            </p>

            <p className="
              font-semibold
              text-blue-900
              mt-2
            ">

              📍
              {' '}

              {
                selectedEvent
                  .extendedProps
                  .location
              }

            </p>

          </div>

        )}

   {/* VENUE */}
<div className="
  bg-purple-50
  border
  border-purple-100

  rounded-2xl

  p-5
">

  <p className="
    text-sm
    text-gray-500
  ">

    Venue Details

  </p>

  <p className="
    font-semibold
    text-purple-900
    mt-2
  ">

    🏛️
    {' '}

    {
      selectedEvent
        ?.extendedProps
        ?.venue ||

        'No venue specified'
    }

  </p>

</div>

        {/* DESCRIPTION */}
        {selectedEvent
          .extendedProps
          .description && (

          <div className="
            bg-gray-50
            border

            rounded-2xl

            p-5
          ">

            <p className="
              text-sm
              text-gray-500
            ">

              Description

            </p>

            <p className="
              mt-3
              text-gray-700
            ">

              {
                selectedEvent
                  .extendedProps
                  .description
              }

            </p>

          </div>

        )}

        {/* ATTENDEES */}
        {selectedEvent
          .extendedProps
          .attendees?.length > 0 && (

          <div>

            <h3 className="
              text-xl
              font-bold
              text-blue-900
              mb-4
            ">

              Attendees

            </h3>

            <div className="
              flex
              flex-wrap
              gap-3
            ">

              {selectedEvent
                .extendedProps
                .attendees
                .map(
                  (
                    attendee: any
                  ) => (

                  <div
                    key={attendee.id}

                    className="
                      bg-orange-100
                      text-orange-700

                      px-4
                      py-3

                      rounded-2xl

                      font-semibold
                    "
                  >

                    {
                      attendee.attendee_name
                    }

                  </div>

                ))}

            </div>

          </div>

        )}

      </div>

    </div>

  </div>

)}

      </div>

        <style>{`

/* TOOLBAR */
.fc .fc-toolbar {
  background: linear-gradient(
    to right,
    #1e3a8a,
    #2563eb

    
  );

  padding: 16px;
  border-radius: 20px;
  margin-bottom: 20px;
}

/* TOOLBAR TITLE */
.fc .fc-toolbar-title {
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
}

/* BUTTONS */
.fc .fc-button {
  background: white !important;
  border: none !important;
  color: #1e3a8a !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  padding: 10px 14px !important;

  margin-right: 8px !important;
}

/* ACTIVE BUTTON */
.fc .fc-button-active {
  background: #f97316 !important;
  color: white !important;
}

/* DAY HEADER */
.fc-col-header-cell {
  padding: 12px 0 !important;
  font-size: 14px;
  text-transform: uppercase;
}

/* SUNDAY HEADER */
.fc-col-header-cell.fc-day-sun {
  background: #fee2e2 !important;
  color: #b91c1c !important;
}

/* DAY CELL */
.fc-daygrid-day {
  transition: 0.2s ease;
}

.fc-daygrid-day:hover {
  background: #eff6ff;
}

/* SUNDAY COLUMN */
.fc-day-sun {
  background: #fff7ed;
}

/* TODAY */
.fc-day-today {
  background: #dbeafe !important;
}

/* EVENTS */
.fc-event {

  border-radius: 14px !important;

  padding: 6px 8px !important;

  font-size: 12px !important;

  font-weight: 700 !important;

  border: none !important;

  overflow: hidden !important;

  box-shadow:
    0 4px 12px rgba(0,0,0,0.15) !important;

  opacity: 1 !important;
}

/* EVENT MAIN */
.fc-event-main {

  color: white !important;

}

/* EVENT TITLE */
.fc-event-title,
.fc-event-time,
.fc-event-main {

  color: white !important;

  font-weight: 800 !important;
}

/* EVENT HOVER */
.fc-event:hover {

  transform: scale(1.03);

  transition: 0.2s ease;

  opacity: 0.92;

}

/* WRAP EVENT TEXT */
.fc-daygrid-event {
  white-space: normal !important;
  overflow: visible !important;
  display: block !important;
  min-height: 42px !important;
}

/* EVENT TITLE */
.fc-event-title {
  white-space: normal !important;
  word-break: break-word !important;
  overflow-wrap: break-word !important;
  line-height: 1.2 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

/* TITLE CONTAINER */
.fc-event-title-container {
  white-space: normal !important;
}

/* EVENT MAIN */
.fc-event-main {
  white-space: normal !important;
}

/* DAY CELL HEIGHT */
.fc-daygrid-day-frame {
  min-height: 130px !important;
}

/* EVENT HOVER */
.fc-event:hover {
  transform: scale(1.02);
  transition: 0.2s ease;
  opacity: 0.95;
}

/* EVENT DOT */
.fc-daygrid-event-dot {
  display: none !important;
}

/* EVENT BORDER */
.fc-event {
  border-left: 6px solid rgba(255,255,255,0.7) !important;
}

@media (max-width: 768px) {

  .fc-toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .fc-toolbar-title {
    font-size: 1.2rem !important;
  }

  .fc-daygrid-day-frame {
    min-height: 90px !important;
  }

}

`}</style>

  </div>

)
}