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

      // BLUE EVENTS
      const activityEvents =

        (activities || []).map(
          (
            item: any
          ) => ({

            id: item.id,

            title:
              item.title,

            start:
              item.activity_date,

            backgroundColor:
              '#2563eb',

            borderColor:
              '#2563eb',

            extendedProps: {

              type:
                'Activity',

              location:
                item.location_name,

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
          })
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
                  item.activities
                    ?.activity_date,

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

      {/* MAIN GRID */}
      <div className="
        grid
        grid-cols-1
        xl:grid-cols-4
        gap-6
      ">

        {/* CALENDAR */}
<div className="
  xl:col-span-3

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
  'border-0',
  'shadow-md',
  'px-2',
  'py-1',
  'font-semibold',
]}

buttonText={{
  today: 'Today',
  month: 'Month',
  week: 'Week',
  day: 'Day',
}}

          />



        </div>

        {/* SIDE PANEL */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          border

          p-6

          h-fit
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">

            Event Details

          </h2>

          {!selectedEvent && (

            <div className="
              text-gray-400
              italic
            ">

              Select an event
              from the calendar

            </div>

          )}

          {selectedEvent && (

            <div className="
              space-y-4
            ">

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Event

                </p>

                <h3 className="
                  text-2xl
                  font-bold
                  text-blue-900
                ">

                  {
                    selectedEvent.title
                  }

                </h3>

              </div>

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Type

                </p>

                <div className="
                  inline-flex

                  px-4 py-2

                  rounded-full

                  bg-blue-100
                  text-blue-700

                  font-semibold
                ">

                  {
                    selectedEvent
                      .extendedProps
                      .type
                  }

                </div>

              </div>

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Date

                </p>

                <p className="
                  font-semibold
                ">

                  {
  selectedEvent
    ?.start

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

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Time

                </p>

                <p className="
                  font-semibold
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

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Status

                </p>

                <p className="
                  font-semibold
                ">

                  {
                    selectedEvent
                      .extendedProps
                      .status || 'N/A'
                  }

                </p>

              </div>

              {selectedEvent
                .extendedProps
                .location && (

                <div>

                  <p className="
                    text-sm
                    text-gray-500
                  ">

                    Location

                  </p>

                  <p className="
                    font-semibold
                  ">

                    {
                      selectedEvent
                        .extendedProps
                        .location
                    }

                  </p>

                </div>

              )}

              {selectedEvent
                .extendedProps
                .description && (

                <div>

                  <p className="
                    text-sm
                    text-gray-500
                  ">

                    Description

                  </p>

                  <p className="
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

                  <p className="
                    text-sm
                    text-gray-500
                    mb-2
                  ">

                    Attendees

                  </p>

                  <div className="
                    space-y-2
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

                            px-4 py-2

                            rounded-xl

                            text-sm
                            font-medium
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

          )}

        </div>

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
  border-radius: 10px !important;
  padding: 4px 6px !important;
  font-size: 12px !important;
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

`}</style>

  </div>

)
}