
'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
} from 'next/navigation'

import Link
from 'next/link'

import ProtectedRoute
from '@/components/ProtectedRoute'

import { supabase }
from '@/lib/supabase'

export default function Page() {

  const params =
    useParams()

  const employeeId = Array.isArray(
    params?.id
  )
    ? params.id[0]
    : params?.id

  const [employee,
    setEmployee] =
    useState<any>(null)

  const [loading,
    setLoading] =
    useState(true)

  // LOAD EMPLOYEE
  const loadEmployee =
    async () => {

      setLoading(true)

      // EMPLOYEE
      const {
        data: employeeData,
        error: employeeError,
      } = await supabase

        .from('employees')

        .select(`
          *,

          assignments(
            *,

            activities(
              title,
              focal_person,
              program_name,
              location_name
            )
          )
        `)

        .eq(
          'id',
          String(employeeId)
        )

        .single()

      // ERROR
      if (
        employeeError ||
        !employeeData
      ) {

        console.error(
          employeeError
        )

        setEmployee(null)

        setLoading(false)

        return
      }

      // FOCAL PERSONS
      const {
        data: focalPersonsData,
      } = await supabase

        .from('focal_persons')

        .select('*')

        .eq(
          'employee_id',
          String(employeeId)
        )

      const focalPersons =
        await Promise.all(

          (focalPersonsData || [])
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

      // MERGE
      setEmployee({

        ...employeeData,

        focal_persons:
          focalPersons || [],

      })

      setLoading(false)
    }

  useEffect(() => {

    if (
      !employeeId ||
      typeof employeeId !==
      'string'
    ) {

      return
    }

    loadEmployee()

    // REALTIME
    const channel = supabase

      .channel(
        'employee-details'
      )

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'initiative_tasks',
        },

        () => {

          loadEmployee()

        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )

    }

  }, [employeeId])

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
          text-2xl
          font-bold
          text-blue-900
        ">

          Loading Employee...

        </div>

      </div>
    )
  }

  // NO EMPLOYEE
  if (!employee) {

    return (

      <div className="
        min-h-screen

        flex
        items-center
        justify-center
      ">

        <div className="
          text-2xl
          font-bold
          text-red-600
        ">

          Employee Not Found

        </div>

      </div>
    )
  }

  return (

    <ProtectedRoute
      allowedRoles={[
        'division_chief',
        'admin',
      ]}
    >

      <div className="
        space-y-8
      ">

        {/* BACK */}
        <Link
          href="/division-chief-dashboard"
          className="
            inline-flex
            items-center
            gap-2

            text-blue-700
            font-medium

            hover:text-blue-900
          "
        >

          ← Back to Dashboard

        </Link>

        {/* PROFILE */}
        <div className="
          bg-linear-to-br
          from-blue-900
          to-blue-950

          text-white

          rounded-3xl
          shadow-2xl

          p-8
        ">

          <div className="
            flex
            flex-col
            md:flex-row
            gap-8
            items-center
          ">

            {/* PHOTO */}
            {employee.photo_url ? (

              <img
                src={
                  employee.photo_url &&
                  employee.photo_url.startsWith(
                    'http'
                  )

                    ? employee.photo_url

                    : '/images/default-avatar.png'
                }
                alt={employee.name}
                className="
                  w-40
                  h-40

                  rounded-full
                  object-cover

                  border-4
                  border-orange-400
                "
              />

            ) : (

              <div className="
                w-40
                h-40

                rounded-full

                bg-orange-500

                flex
                items-center
                justify-center

                text-6xl
                font-bold
              ">

                {
                  employee.name
                    ?.charAt(0)
                    ?.toUpperCase()
                }

              </div>

            )}

            {/* INFO */}
            <div>

              <h1 className="
                text-5xl
                font-bold
                leading-tight
              ">

                {employee.name}

              </h1>

              <p className="
                text-blue-100
                text-xl
                mt-4
              ">

                {employee.designation}

              </p>

              <p className="
                text-orange-300
                font-medium
                mt-2
              ">

                {employee.division}

              </p>

              <div className="
                flex
                flex-wrap
                gap-4
                mt-6
              ">

                {/* ASSIGNMENTS COUNT */}
                <div className="
                  bg-white/10
                  rounded-2xl
                  px-5
                  py-3
                ">

                  <p className="
                    text-xs
                    uppercase
                    tracking-wide
                    text-blue-200
                  ">

                    Assignments

                  </p>

                  <p className="
                    text-3xl
                    font-bold
                    mt-1
                  ">

                    {
                      employee.assignments
                        ?.length || 0
                    }

                  </p>

                </div>

                {/* FOCAL ROLES COUNT */}
                <div className="
                  bg-white/10
                  rounded-2xl
                  px-5
                  py-3
                ">

                  <p className="
                    text-xs
                    uppercase
                    tracking-wide
                    text-blue-200
                  ">

                    Focal Roles

                  </p>

                  <p className="
                    text-3xl
                    font-bold
                    mt-1
                  ">

                    {
                      employee.focal_persons
                        ?.length || 0
                    }

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ASSIGNMENTS */}
        {employee.assignments
          ?.length > 0 && (

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

            <div className="
              flex
              items-center
              justify-between
              mb-8
            ">

              <div>

                <h2 className="
                  text-4xl
                  font-bold
                  text-blue-900
                ">

                  Assignments

                </h2>

                <p className="
                  text-gray-600
                  mt-2
                ">

                  Personnel operational taskings

                </p>

              </div>

            </div>

            <div className="
              space-y-5
            ">

              {employee.assignments.map(
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
                    lg:items-start
                    lg:justify-between
                    gap-6
                  ">

                    {/* LEFT */}
                    <div className="
                      flex-1
                    ">

                      {/* ACTIVITY TITLE */}
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

                      {/* TASK */}
                      <h3 className="
                        text-2xl
                        font-bold
                        text-blue-900
                      ">

                        {assignment.task}

                      </h3>

                      {/* REMARKS */}
                      {assignment.remarks && (

                        <p className="
                          text-gray-600
                          mt-3
                        ">

                          {assignment.remarks}

                        </p>

                      )}

                      {/* TAGS */}
                      <div className="
                        flex
                        flex-wrap
                        gap-3
                        mt-5
                      ">

                        <span className="
                          bg-blue-100
                          text-blue-700

                          text-xs

                          px-4
                          py-2

                          rounded-full
                        ">

                          Priority:
                          {' '}
                          {assignment.priority}

                        </span>

                        {assignment.deadline && (

                          <span className="
                            bg-red-100
                            text-red-700

                            text-xs

                            px-4
                            py-2

                            rounded-full
                          ">

                            Deadline:
                            {' '}
                            {assignment.deadline}

                          </span>

                        )}

                      </div>

                    </div>

                    {/* RIGHT */}
                    <div className="
                      w-full
                      lg:w-56
                    ">

                      <div className="
                        flex
                        flex-col
                        gap-4
                      ">

                        {/* STATUS */}
                        <span className={`
                          w-fit

                          px-4
                          py-2

                          rounded-full

                          text-sm
                          font-medium

                          ${
                            assignment.status ===
                            'Completed'

                              ? `
                                bg-green-100
                                text-green-700
                              `

                              : assignment.status ===
                                'Ongoing'

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

                          {assignment.status}

                        </span>

                        {/* PROGRESS */}
                        <div>

                          <div className="
                            flex
                            justify-between

                            text-xs
                            text-gray-500

                            mb-2
                          ">

                            <span>
                              Progress
                            </span>

                            <span>
                              {
                                assignment.progress || 0
                              }%
                            </span>

                          </div>

                          <div className="
                            w-full
                            h-3

                            bg-gray-200

                            rounded-full

                            overflow-hidden
                          ">

                            <div
                              className="
                                h-full

                                bg-blue-500

                                rounded-full
                              "
                              style={{
                                width: `${
                                  assignment.progress || 0
                                }%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

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

          <div className="
            mb-8
          ">

            <h2 className="
              text-4xl
              font-bold
              text-blue-900
            ">

              Focal Roles

            </h2>

            <p className="
              text-gray-600
              mt-2
            ">

              Operational initiatives and compliance monitoring

            </p>

          </div>

          <div className="
            space-y-8
          ">

            {employee.focal_persons.map(
              (
                focal: any
              ) => (

              <div
                key={focal.id}
                className="
                  bg-linear-to-br
                  from-purple-50
                  to-white

                  rounded-3xl
                  shadow-lg

                  border
                  border-purple-200

                  p-8
                "
              >

                {/* HEADER */}
                <div>

                  <p className="
                    text-sm
                    uppercase
                    tracking-wide

                    text-purple-500
                  ">

                    Focal Role

                  </p>

                  <h3 className="
                    text-3xl
                    font-bold
                    text-blue-900
                    mt-2
                  ">

                    {focal.title}

                  </h3>

                  {focal.description && (

                    <p className="
                      text-gray-600
                      mt-4
                    ">

                      {focal.description}

                    </p>

                  )}

                </div>

                {/* INITIATIVES */}
                {focal.initiatives
                  ?.length > 0 && (

                  <div className="
                    mt-10
                    space-y-8
                  ">

                    {focal.initiatives.map(
                      (
                        initiative: any
                      ) => (

                      <div
                        key={initiative.id}
                        className="
                          border
                          border-orange-200

                          rounded-3xl

                          p-6

                          bg-linear-to-br
                          from-orange-50
                          to-white
                        "
                      >

                        {/* INITIATIVE */}
                        <div className="
                          flex
                          flex-col
                          lg:flex-row
                          lg:justify-between
                          gap-4
                        ">

                          <div>

                            <p className="
                              text-sm
                              uppercase
                              tracking-wide

                              text-orange-500
                            ">

                              Initiative

                            </p>

                            <h4 className="
                              text-3xl
                              font-bold
                              text-blue-900
                              mt-2
                            ">

                              {initiative.title}

                            </h4>

                            {initiative.description && (

                              <p className="
                                text-gray-600
                                mt-4
                              ">

                                {initiative.description}

                              </p>

                            )}

                          </div>

                          {/* STATUS */}
                          <span className={`
                            h-fit

                            px-5
                            py-3

                            rounded-full

                            text-sm
                            font-medium

                            ${
                              initiative.status ===
                              'Completed'

                                ? `
                                  bg-green-100
                                  text-green-700
                                `

                                : initiative.status ===
                                  'Ongoing'

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

                            {initiative.status}

                          </span>

                        </div>

                        {/* TASKS */}
                        {initiative
                          .initiative_tasks
                          ?.length > 0 && (

                          <div className="
                            mt-10
                            space-y-5
                          ">

                            {initiative
                              .initiative_tasks
                              .map(
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

                                    shadow-md
                                  "
                                >

                                  <div className="
                                    flex
                                    flex-col
                                    lg:flex-row
                                    lg:justify-between
                                    gap-6
                                  ">

                                    {/* LEFT */}
                                    <div className="
                                      flex-1
                                    ">

                                      <p className="
                                        text-sm
                                        uppercase
                                        tracking-wide

                                        text-green-600

                                        mb-2
                                      ">

                                        {initiative.title}

                                      </p>

                                      <h5 className="
                                        text-2xl
                                        font-bold
                                        text-blue-900
                                      ">

                                        {task.title}

                                      </h5>

                                      {task.description && (

                                        <p className="
                                          text-gray-600
                                          mt-3
                                        ">

                                          {task.description}

                                        </p>

                                      )}

                                      {/* TAGS */}
                                      <div className="
                                        flex
                                        flex-wrap
                                        gap-3
                                        mt-5
                                      ">

                                        <span className="
                                          bg-green-100
                                          text-green-700

                                          text-xs

                                          px-4
                                          py-2

                                          rounded-full
                                        ">

                                          Priority:
                                          {' '}
                                          {task.priority}

                                        </span>

                                        {task.deadline && (

                                          <span className="
                                            bg-red-100
                                            text-red-700

                                            text-xs

                                            px-4
                                            py-2

                                            rounded-full
                                          ">

                                            Deadline:
                                            {' '}
                                            {task.deadline}

                                          </span>

                                        )}

                                      </div>

                                    </div>

                                    {/* RIGHT */}
                                    <div className="
                                      w-full
                                      lg:w-56
                                    ">

                                      <div className="
                                        flex
                                        flex-col
                                        gap-4
                                      ">

                                        {/* STATUS */}
                                        <span className={`
                                          w-fit

                                          px-4
                                          py-2

                                          rounded-full

                                          text-sm
                                          font-medium

                                          ${
                                            task.status ===
                                            'Completed'

                                              ? `
                                                bg-green-100
                                                text-green-700
                                              `

                                              : task.status ===
                                                'Ongoing'

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

                                          {task.status}

                                        </span>

                                        {/* PROGRESS */}
                                        <div>

                                          <div className="
                                            flex
                                            justify-between

                                            text-xs
                                            text-gray-500

                                            mb-2
                                          ">

                                            <span>
                                              Progress
                                            </span>

                                            <span>
                                              {
                                                task.progress || 0
                                              }%
                                            </span>

                                          </div>

                                          <div className="
                                            w-full
                                            h-3

                                            bg-gray-200

                                            rounded-full

                                            overflow-hidden
                                          ">

                                            <div
                                              className="
                                                h-full

                                                bg-green-500

                                                rounded-full
                                              "
                                              style={{
                                                width: `${
                                                  task.progress || 0
                                                }%`,
                                              }}
                                            />

                                          </div>

                                        </div>

                                      </div>

                                    </div>

                                  </div>

                                </div>

                              ))}

                          </div>

                        )}

                      </div>

                    ))}

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>

      </div>

    </ProtectedRoute>
  )
}
