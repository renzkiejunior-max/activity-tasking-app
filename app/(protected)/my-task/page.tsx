'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../../lib/supabase'

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

    // TEMP STATES
const [tempAssignments,
  setTempAssignments] =
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
  
    useEffect(() => {

    fetchData()

  }, [])

  return (

    <div className="
      space-y-6
    ">

      {/* HEADER */}
      <div>

        <h1 className="
          text-4xl
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
          rounded-3xl
          shadow-xl
          border

          p-6

          flex
          items-center
          gap-6
        ">

          {/* PHOTO */}
          <img

            src={
              employee.photo_url ||

              '/default-avatar.png'
            }

            alt="Employee"

            className="
              w-28
              h-28

              rounded-full

              object-cover

              border-4
              border-blue-200

              shadow-lg
            "
          />

          {/* INFO */}
          <div>

            <h2 className="
              text-4xl
              font-bold
              text-blue-900
            ">

              {employee.name}

            </h2>

            <p className="
              text-lg
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
  rounded-3xl
  shadow-xl
  border
  p-6
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
          p-5
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

  const value =
    e.target.value

  setTempAssignments({

    ...tempAssignments,

    [item.id]: {

      ...tempAssignments[
        item.id
      ],

      status: value,

      progress:
        value ===
        'completed'

          ? 100

          : tempAssignments[
              item.id
            ]?.progress || 0,
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

  {/* STATUS */}
<div className="
  mt-5
">

  <p className="
    text-sm
    text-gray-500
    mb-2
  ">

    Status

  </p>

  <select

    value={
      tempAssignments[
        item.id
      ]?.status || ''
    }

    onChange={(e) => {

      const value =
        e.target.value

      setTempAssignments({

        ...tempAssignments,

        [item.id]: {

          ...tempAssignments[
            item.id
          ],

          status: value,

          progress:
            value ===
            'completed'

              ? 100

              : tempAssignments[
                  item.id
                ]?.progress || 0,
        },
      })

    }}

    className="
      w-full
      border
      rounded-2xl
      px-4 py-3
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

</div>

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
        border
        rounded-2xl
        px-4 py-3
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

      {/* ACTIVITIES */}
      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        border
        p-6
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
                p-5
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

                    px-5 py-3

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