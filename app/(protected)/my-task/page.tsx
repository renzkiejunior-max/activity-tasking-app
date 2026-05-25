'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../../lib/supabase'

    import {
  syncOfflineData,
} from '../../../lib/sync-offline'

import {
  offlineDB,
} from '../../../lib/offline-db'

export default function Page() {

  const [employee,
    setEmployee] =
    useState<any>(null)

  const [assignments,
    setAssignments] =
    useState<any[]>([])

  const [activities,
    setActivities] =
    useState<any[]>([])

    const [focalRoles,
  setFocalRoles] =
  useState<any[]>([])

    // TEMP STATES
const [tempAssignments,
  setTempAssignments] =
  useState<any>({})

  const [tempFocalTasks,
  setTempFocalTasks] =
  useState<any>({})

  // UPDATE ATTENDANCE
  const updateAttendance =
    async (
      attendeeId: string,
      status: string
    ) => {

      const { error } =
        await supabase

          .from(
            'activity_attendees'
          )

          .update({

            attendance_status:
              status,

          })

          .eq(
            'id',
            attendeeId
          )

      if (error) {

        return alert(
          error.message
        )
      }

      fetchData()

      alert(
        `Attendance ${status}`
      )
    }



  // LOAD
  const fetchData =
    async () => {

      // AUTH USER
      const {
        data: {
          user,
        },
      } = await supabase

        .auth.getUser()

      if (!user) return

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

      if (!employeeData)
        return

      setEmployee(
        employeeData
      )

      // ASSIGNMENTS
      const {
        data: assignmentData,
      } = await supabase

        .from('assignments')

        .select(`
          *,
          assigned_by_name,
          assigned_by_role,

          activities(
            title,
            activity_date,
            activity_time,
            location_name
          )
        `)

        .eq(
          'employee_id',
          employeeData.id
        )

        .order(
          'created_at',
          {
            ascending: false,
          }
        )

      setAssignments(
        assignmentData || []
      )

// TEMP DATA
const tempData: any = {}

;(assignmentData || [])
  .forEach(
    (item: any) => {

      tempData[item.id] = {

        progress:
          item.progress || 0,

        status:
          item.status || 'pending',

        remarks:
          item.remarks || '',
      }
    }
  )

setTempAssignments(
  tempData
)

      // ATTENDEE ACTIVITIES
      const {
        data: attendeeData,
      } = await supabase

        .from(
          'activity_attendees'
        )

        .select(`
          *,
          activities(
            title,
            activity_date,
            activity_time,
            location_name
          )
        `)

        .eq(
          'employee_id',
          employeeData.id
        )

      setActivities(
        attendeeData || []
      )

// FOCAL ROLES
const {
  data: focalData,
} = await supabase

  .from('focal_persons')

  .select(`
    *,
    initiatives(
      *,
      initiative_tasks(*)
    )
  `)

  .eq(
    'employee_id',
    employeeData.id
  )

setFocalRoles(
  focalData || []
)

// TEMP FOCAL TASKS
const focalTemp: any = {}

;(focalData || [])
  .forEach(
    (focal: any) => {

      focal.initiatives
        ?.forEach(
          (
            initiative: any
          ) => {

            initiative
              .initiative_tasks
              ?.forEach(
                (
                  task: any
                ) => {

                  focalTemp[
                    task.id
                  ] = {

                    progress:
                      task.progress || 0,

                    status:
                      task.status || 'pending',
                  }
                }
              )
          }
        )
    }
  )

setTempFocalTasks(
  focalTemp
)

    }

    

  // SAVE TASK UPDATE
const saveTaskUpdate =
  async (
    assignmentId: string
  ) => {

    const temp =
      tempAssignments[
        assignmentId
      ]

    const payload: any = {

      progress:
        temp.progress,

      status:
        temp.status,

      remarks:
        temp.remarks,
    }

// OFFLINE MODE
if (!navigator.onLine) {

  await offlineDB
    .queue
    .add({

      table:
        'assignments',

      recordId:
        assignmentId,

      payload,

      action:
        'update',
    })

  alert(
    'Saved offline. Will sync automatically when internet returns.'
  )

  return
}

    // AUTO STATUS
if (
  temp.progress === 100
) {

  payload.status =
    'completed'

  payload.completed_at =
    new Date()
      .toISOString()

} else if (
  temp.progress > 0
) {

  payload.status =
    'ongoing'

  payload.completed_at =
    null

} else {

  payload.status =
    'pending'

  payload.completed_at =
    null
}

    const { error } =
      await supabase

        .from('assignments')

        .update(payload)

        .eq(
          'id',
          assignmentId
        )

    if (error) {

      return alert(
        error.message
      )
    }

    alert(
      'Task updated successfully'
    )

    fetchData()
}
  
const saveFocalTask =
  async (
    taskId: string
  ) => {

    const temp =
      tempFocalTasks[
        taskId
      ]

    const payload: any = {

      progress:
        temp.progress,

      status:
        temp.status,
    }

    // AUTO STATUS
    if (
      temp.progress === 100
    ) {

      payload.status =
        'completed'

    } else if (
      temp.progress > 0
    ) {

      payload.status =
        'ongoing'

    } else {

      payload.status =
        'pending'
    }

    const { error } =
      await supabase

        .from(
          'initiative_tasks'
        )

        .update(payload)

        .eq(
          'id',
          taskId
        )

    if (error) {

      return alert(
        error.message
      )
    }

    alert(
      'Focal task updated successfully'
    )

    fetchData()
}

useEffect(() => {

  fetchData()

  // INTERNET RESTORED
  const handleOnline =
    async () => {

      await syncOfflineData()

      alert(
        'Offline data synced successfully.'
      )
    }

  window.addEventListener(
    'online',
    handleOnline
  )

  return () =>

    window.removeEventListener(
      'online',
      handleOnline
    )

}, [])


  return (

    <div className="
  w-full
  max-w-full
  min-w-0

  overflow-x-hidden

  space-y-4
  lg:space-y-6
">

      {/* HEADER */}
      <div>

        <h1 className="
          text-2xl
          lg:text-4xl
          font-bold
          text-blue-900
        ">

          My Task

        </h1>

        <p className="
          text-gray-600
          mt-2
        ">

          Assigned tasks,
          activities,
          and operational responsibilities

        </p>

      </div>

      {/* PROFILE */}
      {employee && (

        <div className="
  bg-orange-300

  rounded-2xl
  lg:rounded-2xl

  shadow-xl
  border

  p-4
  lg:p-6

  flex
  items-center

  gap-4
  lg:gap-6

  min-w-0
">

          {/* PHOTO */}
          <img

            src={
              employee.photo_url ||

              '/default-avatar.png'
            }

            alt="Employee"

            className="
              w-20
              h-20

              lg:w-28
              lg:h-28

              rounded-full

              object-cover

              border-4
              border-blue-200

              shadow-lg
            "
          />

          {/* INFO */}

          <div className="
          flex-1
           min-w-0
            ">

            <h2 className="
              text-2xl
lg:text-4xl

font-bold
text-blue-900

leading-tight

wrap-break-word
            ">

              {employee.name}

            </h2>

            <p className="
              text-sm
              lg:text-lg
              text-gray-700
              mt-2
            ">

              {employee.designation}

            </p>

            <p className="
              text-gray-600
            ">

              {employee.division}

            </p>

          </div>

        </div>

      )}

      {/* ASSIGNMENTS */}
<div className="
  bg-white
  rounded-2xl
lg:rounded-3xl

shadow-xl
border

p-4
lg:p-6
">

  <h2 className="
    text-2xl
    font-bold
    text-blue-900
    mb-5
  ">

    My Assignments

  </h2>

  <div className="
    space-y-4
  ">

    {assignments.map(
      (
        item: any
      ) => (

      <div
        key={item.id}
        className="
          border
          rounded-2xl

p-4
lg:p-5
          bg-blue-50
        "
      >

        <h3 className="
          text-xl
          font-bold
          text-blue-900
        ">

          {item.task}

        </h3>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4

          mt-4
        ">

          {/* ACTIVITY */}
          <div>

            <p className="
              text-sm
              text-gray-500
            ">

              Activity

            </p>

            <p className="
              font-semibold
            ">

              {
                item.activities
                  ?.title || 'N/A'
              }

            </p>

          </div>

          {/* DATE */}
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
                item.activities
                  ?.activity_date

                  ? new Date(
                      item.activities
                        .activity_date
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
                item.activities
                  ?.activity_time

                  ? new Date(
                      `1970-01-01T${item.activities.activity_time}`
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

          {/* STATUS */}
          <div>

            <p className="
              text-sm
              text-gray-500
              mb-2
            ">

              Status

            </p>

            <div className="
              inline-flex

              px-4 py-2

              rounded-full

              bg-orange-100
              text-orange-700

              text-sm
              font-semibold
            ">

              {item.status}

            </div>

          </div>

{/* ASSIGNED BY */}
<div className="
  md:col-span-2
">

  <div className="
    mt-2

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
        item
          .assigned_by_name
      }

      {' '}

      (
      {
        item
          .assigned_by_role
      }
      )

    </span>

  </div>

</div>


          {/* PROGRESS */}
<div className="
  md:col-span-2
">

  <div className="
    flex
    justify-between
    items-center
    mb-2
  ">

    <p className="
      text-sm
      text-gray-500
    ">

      Progress

    </p>

    {(item.progress !==
      tempAssignments[
        item.id
      ]?.progress ||

      item.status !==
      tempAssignments[
        item.id
      ]?.status ||

      item.remarks !==
      tempAssignments[
        item.id
      ]?.remarks) && (

      <div className="
        text-orange-500
        text-sm
        font-semibold
      ">

        ● Unsaved Changes

      </div>

    )}

  </div>

  {/* PROGRESS BAR */}
  <div className="
    w-full
    bg-gray-200
    rounded-full
    h-4
    mt-2
  ">

    <div

      className="
        bg-blue-600
        h-4
        rounded-full
      "

      style={{
        width:
`${tempAssignments[item.id]?.progress || 0}%`
      }}
    />

  </div>

  {/* SLIDER */}
  <input
    type="range"
    min={0}
    max={100}
    step={5}

    value={
      tempAssignments[
        item.id
      ]?.progress || 0
    }

    onChange={(e) => {

  const progress =
    Number(
      e.target.value
    )

  setTempAssignments({

    ...tempAssignments,

    [item.id]: {

      ...tempAssignments[
        item.id
      ],

      progress,

      status:

        progress === 100

          ? 'completed'

          : progress > 0

            ? 'ongoing'

            : 'pending',
    },
  })

}}

    className="
      w-full
      mt-4
    "
  />

  <p className="
    text-sm
    mt-2
    font-semibold
  ">

    {
      tempAssignments[
        item.id
      ]?.progress || 0
    }%

  </p>

  

  {/* REMARKS */}
  <div className="
    mt-5
  ">

    <p className="
      text-sm
      text-gray-500
      mb-2
    ">

      Remarks

    </p>

    <textarea

      value={
        tempAssignments[
          item.id
        ]?.remarks || ''
      }

      onChange={(e) =>

        setTempAssignments({

          ...tempAssignments,

          [item.id]: {

            ...tempAssignments[
              item.id
            ],

            remarks:
              e.target.value,
          },
        })

      }

      rows={4}

      className="
  w-full
  max-w-full

  border

  rounded-2xl

  px-4 py-3

  resize-none
"

      placeholder="
        Add accomplishment,
        updates,
        issues,
        or remarks...
      "
    />

  </div>

  {/* SAVE BUTTON */}
  <button

    onClick={() =>
      saveTaskUpdate(
        item.id
      )
    }

    className="
      mt-5
      w-full

      bg-blue-600
      hover:bg-blue-700

      text-white

      px-5 py-4

      rounded-2xl

      font-semibold
    "
  >

    Save Changes

  </button>

</div>

        </div>

      </div>

    ))}

  </div>

</div>


{/* FOCAL ROLES */}
<div className="
  bg-white
  rounded-2xl
lg:rounded-3xl

shadow-xl
border

p-4
lg:p-6
">

  <h2 className="
    text-2xl
    font-bold
    text-purple-900
    mb-5
  ">

    My Focal Roles

  </h2>

  <div className="
  w-full
  min-w-0

  overflow-x-hidden

  space-y-4
  lg:space-y-6
">

    {focalRoles.map(
      (
        focal: any
      ) => (

      <div
        key={focal.id}
        className="
          rounded-3xl
          border
          border-purple-200
          bg-linear-to-br
          from-purple-50
          to-white
          p-6
        "
      >

        <h3 className="
          text-2xl
          font-bold
          text-blue-900
        ">

          {focal.title}

        </h3>

        <p className="
          text-gray-600
          mt-2
        ">

          {focal.description}

        </p>

        {/* INITIATIVES */}
        <div className="
          mt-6
          space-y-4
        ">

          {focal.initiatives
            ?.map(
              (
                initiative: any
              ) => (

              <div
                key={initiative.id}
                className="
                  rounded-2xl
                  border
                  border-orange-200
                  bg-linear-to-br
                  from-orange-50
                  to-white
                  p-5
                "
              >

                <h4 className="
                  text-xl
                  font-bold
                  text-blue-900
                ">

                  {initiative.title}

                </h4>

                {/* TASKS */}
                <div className="
                  mt-5
                  space-y-3
                ">

                  {initiative
                    .initiative_tasks
                    ?.map(
                      (
                        task: any
                      ) => (

                      <div
                        key={task.id}
                        className="
                          rounded-2xl
                          border
                          border-green-200
                          bg-linear-to-br
                          from-green-50
                          to-white
                          p-4
                        "
                      >

                        <div className="
  space-y-4
">

  <div className="
  flex
  flex-col
  sm:flex-row

  justify-between

  sm:items-center

  gap-4

  min-w-0
">

    <div>

      <h5 className="
        text-lg
        font-bold
        text-blue-900
      ">

        {task.title}

      </h5>

      <p className="
        text-sm
        text-gray-500
        mt-1
      ">

        Progress:
        {' '}
        {
          tempFocalTasks[
            task.id
          ]?.progress || 0
        }%

      </p>

    </div>

    <div className={`
      px-4
      py-2
      rounded-full
      text-sm
      font-semibold

      ${
        tempFocalTasks[
          task.id
        ]?.status ===
        'completed'

          ? `
            bg-green-100
            text-green-700
          `

          : tempFocalTasks[
              task.id
            ]?.status ===
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

      {
        tempFocalTasks[
          task.id
        ]?.status || 'pending'
      }

    </div>

  </div>

  {/* PROGRESS BAR */}
  <div className="
    w-full
    bg-gray-200
    rounded-full
    h-4
  ">

    <div

      className="
        bg-purple-600
        h-4
        rounded-full
      "

      style={{
        width:
`${tempFocalTasks[task.id]?.progress || 0}%`
      }}
    />

  </div>

  {/* SLIDER */}
  <input
    type="range"
    min={0}
    max={100}
    step={5}

    value={
      tempFocalTasks[
        task.id
      ]?.progress || 0
    }

    onChange={(e) => {

      const progress =
        Number(
          e.target.value
        )

      setTempFocalTasks({

        ...tempFocalTasks,

        [task.id]: {

          ...tempFocalTasks[
            task.id
          ],

          progress,

          status:

            progress === 100

              ? 'completed'

              : progress > 0

                ? 'ongoing'

                : 'pending',
        },
      })

    }}

    className="
      w-full
    "
  />

  {/* SAVE */}
  <button

    onClick={() =>
      saveFocalTask(
        task.id
      )
    }

    className="
      w-full

      bg-purple-600
      hover:bg-purple-700

      text-white

      py-3

      rounded-2xl

      font-semibold
    "
  >

    Save Focal Task

  </button>

</div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )
          )}

      </div>

      </div>

    ))}

  </div>

</div>


      {/* ACTIVITIES */}
      <div className="
        bg-white
        rounded-2xl
lg:rounded-3xl

shadow-xl
border

p-4
lg:p-6
      ">

        <h2 className="
          text-2xl
          font-bold
          text-blue-900
          mb-5
        ">

          My Activities

        </h2>

        <div className="
          space-y-4
        ">

          {activities.map(
            (
              item: any
            ) => (

            <div
              key={item.id}
              className="
                border
                rounded-2xl

p-4
lg:p-5
                bg-purple-50
              "
            >

              <h3 className="
                text-xl
                font-bold
                text-blue-900
              ">

                {
                  item.activities
                    ?.title
                }

              </h3>

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-3

                mt-4
              ">

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
  item.activities
    ?.activity_date

    ? new Date(
        item.activities
          .activity_date
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
  item.activities
    ?.activity_time

    ? new Date(
        `1970-01-01T${item.activities.activity_time}`
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

                    Location

                  </p>

                  <p className="
                    font-semibold
                  ">

                    {
                      item.activities
                        ?.location_name
                    }

                  </p>

                </div>

                <div>

                  <p className="
                    text-sm
                    text-gray-500
                    mb-2
                  ">

                    Attendance Status

                  </p>

                  <span className={`

                    px-4 py-2

                    rounded-full

                    text-sm
                    font-semibold

                    ${
                      item.attendance_status ===
                      'Confirmed'

                        ? `
                          bg-green-100
                          text-green-700
                        `

                        : item.attendance_status ===
                          'Declined'

                          ? `
                            bg-red-100
                            text-red-700
                          `

                          : `
                            bg-orange-100
                            text-orange-700
                          `
                    }
                  `}>

                    {
                      item.attendance_status
                    }

                  </span>

                </div>

              </div>

              {/* ACTIONS */}
              <div className="
                flex
                flex-wrap
                gap-3
                mt-6
              ">

                <button

                  onClick={() =>
                    updateAttendance(
                      item.id,
                      'Confirmed'
                    )
                  }

                  className="
                    bg-green-600
                    hover:bg-green-700

                    text-white

                    px-4 py-2.5
                    lg:px-5 lg:py-3

                    rounded-2xl

                    font-semibold
                  "
                >

                  Confirm Attendance

                </button>

                <button

                  onClick={() =>
                    updateAttendance(
                      item.id,
                      'Declined'
                    )
                  }

                  className="
                    bg-red-600
                    hover:bg-red-700

                    text-white

                    px-5 py-3

                    rounded-2xl

                    font-semibold
                  "
                >

                  Unable to Attend

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

   
  )
}