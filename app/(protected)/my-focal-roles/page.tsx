'use client'

import {
  useEffect,
  useState,
} from 'react'

import ProtectedRoute
from '@/components/ProtectedRoute'

import {
  supabase
} from '@/lib/supabase'

export default function MyFocalRolesPage() {

const [
  focalRoles,
  setFocalRoles
] = useState<any[]>([])

const [
  tempTasks,
  setTempTasks
] = useState<any>({})

const [
  expandedFocal,
  setExpandedFocal
] = useState<number | null>(
  null
)


const loadDashboard =
async () => {

// AUTH USER
const {
  data: {
    user,
  },
} = await supabase
  .auth.getUser()

if (!user) return

// EMPLOYEE RECORD
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

// ONLY MY FOCAL ROLES
const {
  data
} = await supabase

  .from(
    'focal_persons'
  )

  .select(`
    *,
    initiatives (
      *,
      initiative_tasks (*)
    )
  `)

  .eq(
    'employee_id',
    employeeData.id
  )

setFocalRoles(
  data || []
)

// TEMP TASKS
const tempData: any = {}

;(data || [])
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

                  tempData[
                    task.id
                  ] = {

                    progress:
                      task.progress || 0,

                    status:
                      task.status || 'Pending',

                    remarks:
                      task.remarks || '',
                  }

                }
              )

          }
        )

    }
  )

setTempTasks(
  tempData
)

}

useEffect(() => {

  loadDashboard()

}, [])

const updateTask =
async (
  table: string,
  id: number,
  field: string,
  value: any
) => {

  await supabase

    .from(table)

    .update({
      [field]: value
    })

    .eq(
      'id',
      id
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
        space-y-6
      ">

        {/* HEADER */}
        <div
  style={{
    background:
      'linear-gradient(135deg,#7e22ce,#6d28d9,#312e81)'
  }}
  className="
    text-white

    rounded-3xl

    p-8

    shadow-xl
  "
>

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

    mb-5
  ">

    🎯 Focal Responsibilities

  </div>

  <h1 className="
    text-3xl
    md:text-5xl

    font-black
  ">

    Focal Roles

  </h1>

  <p className="
    mt-4

    text-purple-100

    max-w-3xl
  ">

    Manage your focal person responsibilities,
    initiatives, and initiative tasks.

  </p>

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
  ) => {

    const totalInitiatives =

      focal.initiatives?.length || 0

    const totalTasks =

      focal.initiatives?.reduce(

        (
          total:number,
          initiative:any
        ) =>

          total +

          (
            initiative
              .initiative_tasks
              ?.length || 0
          ),

        0

      ) || 0

    const allTasks =

  focal.initiatives?.flatMap(
    (initiative:any) =>

      initiative.initiative_tasks || []
  ) || []

const avgProgress =

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


        const completedTasks =

  focal.initiatives?.reduce(

    (
      total:number,
      initiative:any
    ) =>

      total +

      (

        initiative
          .initiative_tasks
          ?.filter(
            (task:any) =>

              task.status ===
              'Completed'
          )
          .length || 0

      ),

    0

  ) || 0


  const focalStatus =

  avgProgress === 100

    ? 'Completed'

    : avgProgress > 0

      ? 'Ongoing'

      : 'Pending'

    return (
      


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

                <button

  onClick={() =>

    setExpandedFocal(

      expandedFocal ===
      focal.id

      ? null

      : focal.id

    )

  }

  className="
    w-full

    flex
    justify-between
    items-center

    text-left
  "
>

  <div>

    <h3 className="
      text-3xl
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


    <div className="
flex
flex-wrap
gap-3

mt-4
">

<span className="
px-3
py-1

bg-green-100
text-green-700

rounded-full

text-xs
font-semibold
">

{totalTasks}
 Tasks

</span>

<span className="
px-3
py-1

bg-emerald-100
text-emerald-700

rounded-full

text-xs
font-semibold
">

{completedTasks}
 Completed

</span>

<span className="
px-3
py-1

bg-purple-100
text-purple-700

rounded-full

text-xs
font-semibold
">

{avgProgress}%
 Progress

</span>


<span className={`
px-3
py-1

rounded-full

text-xs
font-semibold

${
  focalStatus === 'Completed'
    ? 'bg-green-100 text-green-700'

    : focalStatus === 'Ongoing'
    ? 'bg-blue-100 text-blue-700'

    : 'bg-yellow-100 text-yellow-700'
}
`}>

{focalStatus}

</span>


</div>


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
          avgProgress >= 100
            ? 'bg-green-600'

            : avgProgress >= 75
            ? 'bg-blue-600'

            : avgProgress >= 50
            ? 'bg-blue-500'

            : 'bg-red-500'
        }
      `}

      style={{
        width: `${avgProgress}%`
      }}

    />

  </div>

</div>


  </div>

  <div className="
    text-3xl
    font-bold
    text-purple-700
  ">

    {
      expandedFocal ===
      focal.id

      ? '−'

      : '+'
    }

  </div>

</button>

                            {
                expandedFocal ===
                focal.id && (
                    
                <>

                

                {/* INITIATIVES */}
                <div className="
                  mt-8
                  space-y-8
                ">

{focal.initiatives
  ?.map(
    (
      initiative: any
    ) => {

      const initiativeProgress =

        initiative.initiative_tasks?.length

          ? Math.round(

              initiative.initiative_tasks.reduce(

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

              initiative.initiative_tasks.length

            )

          : 0

      const initiativeStatus =

        initiativeProgress === 100

          ? 'Completed'

          : initiativeProgress > 0

            ? 'Ongoing'

            : 'Pending'

      return (

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

                              <div className="
                              mt-4
                              ">

                              <div className="
                              inline-flex

                              px-3
                              py-1

                              rounded-full

                              bg-blue-100
                              text-blue-700

                              text-sm
                              font-semibold
                              ">

                              {initiativeStatus}

                              </div>

                              <div className="
                              mt-4

                              w-full
                              h-3

                              bg-slate-200

                              rounded-full
                              overflow-hidden
                              ">

                              <div

                              className="
                              h-full
                              bg-green-600
                              "

                              style={{
                              width:
                              `${initiativeProgress}%`
                              }}

                              />

                              </div>

                              <div className="
                              text-sm
                              text-gray-500
                              mt-2
                              ">

                              {initiativeProgress}%

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

                                      onChange={(e) => {

                                        const status =
                                          e.target.value

                                        let progress = 0

                                        if (
                                          status ===
                                          'Completed'
                                        ) {

                                          progress = 100

                                        } else if (
                                          status ===
                                          'Ongoing'
                                        ) {

                                          progress = 50
                                        }

                                        setTempTasks({

                                          ...tempTasks,

                                          [task.id]: {

                                            ...tempTasks[
                                              task.id
                                            ],

                                            status,

                                            progress
                                          }
                                        })

                                      }}

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

                                        disabled

                                        value={
                                          tempTasks[
                                            task.id
                                          ]?.progress || 0
                                        }

                                        className="
                                          w-full

                                          cursor-not-allowed

                                          opacity-70
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
                                    

                                  </div>

                                  </div>

                                  

                                  </div>
                              

                            ))}

                        </div>

                        

                      </div>

                      

                    )})}

                </div>
                
                </>

              )}

              </div>

                 )

            })}

          </div>

        </div>


      </div>

    </ProtectedRoute>

  )

}