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
        space-y-8
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

            Assignments

          </h2>

          <div className="
            space-y-5
          ">

            {assignments.map(
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

                    </h3>

                    </div>

{/* RIGHT */}
<div className="
  w-full
  lg:w-80
  space-y-5
">




  {/* STATUS */}
  <select
    value={
      tempAssignments[
        assignment.id
      ]?.status || ''
    }

    onChange={(e) =>

      setTempAssignments({

        ...tempAssignments,

        [assignment.id]: {

          ...tempAssignments[
            assignment.id
          ],

          status:
            e.target.value,
        },
      })

    }

    className="
      w-full
      border
      border-gray-300
      rounded-2xl
      px-4
      py-3
    "
  >

    <option value="Pending">
      Pending
    </option>

    <option value="Ongoing">
      Ongoing
    </option>

    <option value="Completed">
      Completed
    </option>

  </select>

  {/* PROGRESS */}
  <div>

    <input
      type="range"
      min="0"
      max="100"

      value={
        tempAssignments[
          assignment.id
        ]?.progress || 0
      }

      onChange={(e) =>

        setTempAssignments({

          ...tempAssignments,

          [assignment.id]: {

            ...tempAssignments[
              assignment.id
            ],

            progress:
              Number(
                e.target.value
              ),
          },
        })

      }

      className="
        w-full
      "
    />

    <div className="
      flex
      justify-between
      items-center
      mt-2
    ">

      <div className="
        text-sm
        text-gray-500
      ">

        {
          tempAssignments[
            assignment.id
          ]?.progress || 0
        }%

      </div>

      {(assignment.status !==
        tempAssignments[
          assignment.id
        ]?.status ||

        assignment.progress !==
        tempAssignments[
          assignment.id
        ]?.progress) && (

        <div className="
          text-orange-500
          text-sm
          font-semibold
        ">

          ● Unsaved Changes

        </div>

      )}

    </div>

  </div>

  {/* SAVE */}
  <button

    onClick={async () => {

      const temp =
        tempAssignments[
          assignment.id
        ]

      await updateTask(
        'assignments',
        assignment.id,
        'status',
        temp.status
      )

      await updateTask(
        'assignments',
        assignment.id,
        'progress',
        temp.progress
      )

      loadDashboard()

    }}

    className="
      w-full

      bg-blue-600
      hover:bg-blue-700

      text-white

      px-4
      py-3

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
          bg-linear-to-br
          from-purple-50
          to-white

          rounded-3xl
          shadow-xl

          border
          border-purple-200

          border-l-8
          border-l-purple-500

          p-8
        ">

          <h2 className="
            text-4xl
            font-bold
            text-blue-900
            mb-8
          ">

            Focal Roles

          </h2>

          <div className="
            space-y-8
          ">

            {focalRoles.map(
              (
                focal: any
              ) => (

              <div
                key={focal.id}
                className="
                  bg-white
                  border
                  border-purple-200
                  rounded-3xl
                  p-8
                "
              >

                <h3 className="
                  text-3xl
                  font-bold
                  text-blue-900
                ">

                  {focal.title}

                </h3>

                <p className="
                  text-gray-600
                  mt-3
                ">

                  {focal.description}

                </p>

                {/* FOCAL STATUS */}
                <div className="
                  mt-5
                ">

                  <select
                    value={
                      focal.status || ''
                    }

                    onChange={(e) =>
                      updateTask(
                        'focal_persons',
                        focal.id,
                        'status',
                        e.target.value
                      )
                    }

                    className="
                      border
                      border-gray-300
                      rounded-2xl
                      px-4
                      py-3
                    "
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Ongoing">
                      Ongoing
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>

                {/* INITIATIVES */}
                <div className="
                  mt-8
                  space-y-8
                ">

                  {focal.initiatives
                    ?.map(
                      (
                        initiative: any
                      ) => (

                      <div
                        key={initiative.id}
                        className="
                          bg-linear-to-br
                          from-orange-50
                          to-white

                          border
                          border-orange-200

                          rounded-3xl

                          p-6
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          lg:flex-row
                          lg:justify-between

                          gap-6
                        ">

                          <div className="
                            flex-1
                          ">

                            <p className="
                              text-sm
                              uppercase
                              tracking-wide
                              text-orange-500
                            ">

                              Initiative

                            </p>

                            <h4 className="
                              text-2xl
                              font-bold
                              text-blue-900
                              mt-2
                            ">

                              {initiative.title}

                            </h4>

                          </div>

                          <div className="
                            w-full
                            lg:w-80
                            space-y-5
                          ">

                            {/* STATUS */}
                            <select
                              value={
                                initiative.status || ''
                              }

                              onChange={(e) =>
                                updateTask(
                                  'initiatives',
                                  initiative.id,
                                  'status',
                                  e.target.value
                                )
                              }

                              className="
                                w-full
                                border
                                border-gray-300
                                rounded-2xl
                                px-4
                                py-3
                              "
                            >

                              <option value="Pending">
                                Pending
                              </option>

                              <option value="Ongoing">
                                Ongoing
                              </option>

                              <option value="Completed">
                                Completed
                              </option>

                            </select>

                            {/* PROGRESS */}
                            <div>

                              <input
                                type="range"
                                min="0"
                                max="100"

                                value={
                                  initiative.progress || 0
                                }

                                onChange={(e) =>
                                  updateTask(
                                    'initiatives',
                                    initiative.id,
                                    'progress',
                                    Number(
                                      e.target.value
                                    )
                                  )
                                }

                                className="
                                  w-full
                                "
                              />

                              <div className="
                                text-sm
                                text-gray-500
                                mt-2
                              ">

                                {
                                  initiative.progress || 0
                                }%

                              </div>

                            </div>

                          </div>

                        </div>

                        {/* TASKS */}
                        <div className="
                          mt-8
                          space-y-5
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
                                  bg-linear-to-br
                                  from-green-50
                                  to-white

                                  border
                                  border-green-200

                                  rounded-2xl

                                  p-6
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

                                    <h5 className="
                                      text-2xl
                                      font-bold
                                      text-blue-900
                                    ">

                                      {task.title}

                                    </h5>

                                  </div>

                                  {/* RIGHT */}
                                  <div className="
                                    w-full
                                    lg:w-80
                                    space-y-5
                                  ">

                                    {/* STATUS */}
                                    <select
                                      value={
                                        tempTasks[
                                          task.id
                                        ]?.status || ''
                                      }

                                      onChange={(e) =>

                                        setTempTasks({

                                          ...tempTasks,

                                          [task.id]: {

                                            ...tempTasks[
                                              task.id
                                            ],

                                            status:
                                              e.target.value,
                                          },
                                        })

                                      }

                                      className="
                                        w-full
                                        border
                                        border-gray-300
                                        rounded-2xl
                                        px-4
                                        py-3
                                      "
                                    >

                                      <option value="Pending">
                                        Pending
                                      </option>

                                      <option value="Ongoing">
                                        Ongoing
                                      </option>

                                      <option value="Completed">
                                        Completed
                                      </option>

                                    </select>

                                    {/* PROGRESS */}
                                    <div>

                                      <input
                                        type="range"
                                        min="0"
                                        max="100"

                                        value={
                                          tempTasks[
                                            task.id
                                          ]?.progress || 0
                                        }

                                        onChange={(e) =>

                                          setTempTasks({

                                            ...tempTasks,

                                            [task.id]: {

                                              ...tempTasks[
                                                task.id
                                              ],

                                              progress:
                                                Number(
                                                  e.target.value
                                                ),
                                            },
                                          })

                                        }

                                        className="
                                          w-full
                                        "
                                      />

                                      <div className="
                                        flex
                                        justify-between
                                        items-center
                                        mt-2
                                      ">

                                        <div className="
                                          text-sm
                                          text-gray-500
                                        ">

                                          {
                                            tempTasks[
                                              task.id
                                            ]?.progress || 0
                                          }%

                                        </div>

                                        {(task.status !==
                                          tempTasks[
                                            task.id
                                          ]?.status ||

                                          task.progress !==
                                          tempTasks[
                                            task.id
                                          ]?.progress) && (

                                          <div className="
                                            text-orange-500
                                            text-sm
                                            font-semibold
                                          ">

                                            ● Unsaved Changes

                                          </div>

                                        )}

                                      </div>

                                    </div>

                                    {/* REMARKS */}
                                    <textarea
                                      value={
                                        tempTasks[
                                          task.id
                                        ]?.remarks || ''
                                      }

                                      onChange={(e) =>

                                        setTempTasks({

                                          ...tempTasks,

                                          [task.id]: {

                                            ...tempTasks[
                                              task.id
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
                                        border-gray-300
                                        rounded-2xl
                                        px-4
                                        py-3
                                      "

                                      placeholder="
                                        Add remarks...
                                      "
                                    />

                                    {/* SAVE */}
                                    <button

                                      onClick={async () => {

                                        const temp =
                                          tempTasks[
                                            task.id
                                          ]

                                        await updateTask(
                                          'initiative_tasks',
                                          task.id,
                                          'status',
                                          temp.status
                                        )

                                        await updateTask(
                                          'initiative_tasks',
                                          task.id,
                                          'progress',
                                          temp.progress
                                        )

                                        await updateTask(
                                          'initiative_tasks',
                                          task.id,
                                          'remarks',
                                          temp.remarks
                                        )

                                        loadDashboard()

                                      }}

                                      className="
                                        w-full

                                        bg-green-600
                                        hover:bg-green-700

                                        text-white

                                        px-4
                                        py-3

                                        rounded-2xl

                                        font-semibold
                                      "
                                    >

                                      Save Task

                                    </button>

                                    {/* COMPLETE */}
                                    <button

                                      onClick={() =>

                                        updateTask(
                                          'initiative_tasks',
                                          task.id,
                                          'completed_at',
                                          new Date()
                                            .toISOString()
                                        )
                                      }

                                      className="
                                        w-full

                                        bg-blue-600
                                        hover:bg-blue-700

                                        text-white

                                        px-4
                                        py-3

                                        rounded-2xl

                                        font-semibold
                                      "
                                    >

                                      Mark Complete

                                    </button>

                                  </div>

                                  </div>

                                  </div>
                                    

                            ))}

                        </div>

                      </div>

                    ))}

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </ProtectedRoute>
  )
}