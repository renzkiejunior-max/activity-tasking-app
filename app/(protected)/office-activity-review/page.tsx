'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  supabase,
} from '@/lib/supabase'

export default function Page() {

  const [
    activities,
    setActivities,
  ] = useState<any[]>([])

  const [
    employees,
    setEmployees,
  ] = useState<any[]>([])

  const [
    selectedEmployees,
    setSelectedEmployees,
  ] = useState<string[]>([])

  // ======================
  // FETCH ACTIVITIES
  // ======================

  const fetchActivities =
    async () => {

      const {
        data,
      } = await supabase

        .from('activities')

        .select('*')

        .eq(
          'approval_status',
          'pending'
        )

        .order(
          'created_at',
          {
            ascending: false,
          }
        )

      setActivities(
        data || []
      )
    }

  // ======================
  // FETCH EMPLOYEES
  // ======================

  const fetchEmployees =
    async () => {

      const {
        data,
      } = await supabase

        .from('employees')

        .select('*')

        .order(
          'name',
          {
            ascending: true,
          }
        )

      setEmployees(
        data || []
      )
    }

  // ======================
  // APPROVE ACTIVITY
  // ======================

  const approveActivity =
    async (
      activityId: string
    ) => {

      const {
        data: {
          user,
        },
      } = await supabase
        .auth
        .getUser()

      if (!user) return

      // GET EMPLOYEE
      const {
        data: employee,
      } = await supabase

        .from('employees')

        .select('*')

        .eq(
          'user_id',
          user.id
        )

        .single()

      // SAVE ATTENDEES
      for (
        const employeeId
        of selectedEmployees
      ) {

        const emp =
          employees.find(
            (
              e: any
            ) =>

              e.id ===
              employeeId
          )

        await supabase

          .from(
            'activity_attendees'
          )

          .insert({

            activity_id:
              activityId,

            employee_id:
              employeeId,

            attendee_name:
              emp?.name,

            designation:
              emp?.designation,

            division:
              emp?.division,

            attendance_status:
              'Pending',
          })
      }

      // APPROVE
      const { error } =
        await supabase

          .from('activities')

          .update({

            approval_status:
              'approved',

            reviewed_by:
              employee?.name,

            approved_at:
              new Date()
                .toISOString(),
          })

          .eq(
            'id',
            activityId
          )

      if (error) {

        return alert(
          error.message
        )
      }

      alert(
        'Activity approved'
      )

      fetchActivities()
    }

  // ======================
  // REJECT
  // ======================

  const rejectActivity =
    async (
      activityId: string
    ) => {

      const { error } =
        await supabase

          .from('activities')

          .update({

            approval_status:
              'rejected',
          })

          .eq(
            'id',
            activityId
          )

      if (error) {

        return alert(
          error.message
        )
      }

      alert(
        'Activity rejected'
      )

      fetchActivities()
    }

  // ======================
  // INIT
  // ======================

  useEffect(() => {

    fetchActivities()

    fetchEmployees()

  }, [])

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

          📅 Activity Approval

        </p>

        <h1 className="
          text-4xl
          font-black

          mt-5
        ">

          Office Activity Review

        </h1>

        <p className="
          text-blue-100
          mt-3
          max-w-2xl
        ">

          Review submitted
          operational activities,
          assign attendees,
          and approve deployment.

        </p>

      </div>

      {/* ACTIVITIES */}
      <div className="
        space-y-6
      ">

        {activities.map(
          (
            activity: any
          ) => (

          <div
            key={activity.id}
            className="
              bg-white

              border

              rounded-3xl

              shadow-lg

              p-6
            "
          >

            {/* TITLE */}
            <div className="
              flex
              items-start
              justify-between

              gap-4
            ">

              <div>

                <h2 className="
                  text-3xl
                  font-black
                  text-blue-900
                ">

                  {activity.title}

                </h2>

                <p className="
                  text-gray-600
                  mt-2
                ">

                  {
                    activity.description
                  }

                </p>

              </div>

              <div className="
                bg-yellow-100
                text-yellow-800

                px-4
                py-2

                rounded-full

                text-sm
                font-semibold
              ">

                Pending Review

              </div>

            </div>

            {/* DETAILS */}
            <div className="
              grid
              md:grid-cols-3
              gap-4

              mt-6
            ">

              <div className="
                bg-blue-50

                border

                rounded-2xl

                p-4
              ">

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Date

                </p>

                <p className="
                  font-bold
                  text-blue-900

                  mt-1
                ">

                  {
                    activity.activity_date
                  }

                </p>

              </div>

              <div className="
                bg-green-50

                border

                rounded-2xl

                p-4
              ">

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Venue

                </p>

                <p className="
                  font-bold
                  text-green-900

                  mt-1
                ">

                  {
                    activity.location_name
                  }

                </p>

              </div>

              <div className="
                bg-purple-50

                border

                rounded-2xl

                p-4
              ">

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Focal Person

                </p>

                <p className="
                  font-bold
                  text-purple-900

                  mt-1
                ">

                  {
                    activity.focal_person
                  }

                </p>

              </div>

            </div>

            {/* SELECT ATTENDEES */}
            <div className="
              mt-8
            ">

              <h3 className="
                text-xl
                font-bold
                text-blue-900

                mb-4
              ">

                Select Attendees

              </h3>

              <div className="
                grid
                md:grid-cols-2
                gap-3
              ">

                {employees.map(
                  (
                    emp: any
                  ) => (

                  <label

                    key={emp.id}

                    className="
                      flex
                      items-center
                      gap-3

                      border

                      rounded-2xl

                      p-3

                      cursor-pointer

                      hover:bg-blue-50
                    "
                  >

                    <input

                      type="checkbox"

                      checked={
                        selectedEmployees
                          .includes(
                            emp.id
                          )
                      }

                      onChange={(
                        e
                      ) => {

                        if (
                          e.target.checked
                        ) {

                          setSelectedEmployees([
                            ...selectedEmployees,
                            emp.id,
                          ])

                        } else {

                          setSelectedEmployees(

                            selectedEmployees.filter(
                              (
                                id
                              ) =>

                                id !==
                                emp.id
                            )
                          )
                        }
                      }}
                    />

                    <div>

                      <p className="
                        font-semibold
                      ">

                        {emp.name}

                      </p>

                      <p className="
                        text-sm
                        text-gray-500
                      ">

                        {
                          emp.division
                        }

                      </p>

                    </div>

                  </label>
                ))}

              </div>

            </div>

            {/* ACTIONS */}
            <div className="
              flex
              flex-wrap
              gap-3

              mt-8
            ">

              <button

                onClick={() =>
                  approveActivity(
                    activity.id
                  )
                }

                className="
                  bg-green-600
                  hover:bg-green-700

                  text-white

                  px-6
                  py-3

                  rounded-2xl

                  font-semibold
                "
              >

                Approve Activity

              </button>

              <button

                onClick={() =>
                  rejectActivity(
                    activity.id
                  )
                }

                className="
                  bg-red-500
                  hover:bg-red-600

                  text-white

                  px-6
                  py-3

                  rounded-2xl

                  font-semibold
                "
              >

                Reject

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}