'use client'

import { useEffect, useState }
from 'react'

import { supabase }
from '../../../lib/supabase'

export default function Page() {

  const [activities, setActivities] =
    useState<any[]>([])

  // LOAD
  const loadTimeline = async () => {

    // ACTIVITIES
    const { data: activityData } =
      await supabase
        .from('activities')
        .select('*')
        .order('activity_date', {
          ascending: true,
        })

    // ASSIGNMENTS
    const { data: assignments } =
      await supabase
        .from('assignments')
        .select(`
          *,
          employees(
            name,
            photo_url
          )
        `)

    // GROUP TASKS
    const groupedActivities =
  activityData?.map(
    (activity) => {

      const relatedAssignments =
        assignments?.filter(
          (assign: any) =>
            assign.activity_id ===
            activity.id
        ) || []

      // GROUP BY TASK
      const groupedTasks =
        Object.values(

          relatedAssignments
            .reduce(
              (
                acc: any,
                item: any
              ) => {

                const task =
                  item.task

                if (
                  !acc[task]
                ) {

                  acc[task] = {

                    task,

                    deadline:
                      item.deadline,

                    status:
                      item.status,

                    employees: [],
                  }
                }

                acc[task]
                  .employees
                  .push(item.employees)

                return acc

              },

              {}
            )
        )

      return {

        ...activity,

        assignments:
          groupedTasks,
      }
    }
  )

    setActivities(
      groupedActivities || []
    )
  }

  useEffect(() => {
    loadTimeline()
  }, [])

  // STATUS COLORS
  const getStatusColor = (
    status: string
  ) => {

    if (status === 'completed') {
      return `
        bg-green-100
        text-green-700
      `
    }

    if (status === 'ongoing') {
      return `
        bg-blue-100
        text-blue-700
      `
    }

    if (status === 'cancelled') {
      return `
        bg-red-100
        text-red-700
      `
    }

    return `
      bg-orange-100
      text-orange-700
    `
  }

  return (

    <div className="
  w-full
  min-w-0
  overflow-x-hidden

  space-y-4
  lg:space-y-6
">

      {/* HEADER */}
      <div>

        <h1 className="
          text-4xl
          font-bold
          text-blue-900
        ">
          Operations Timeline
        </h1>

        <p className="
          text-gray-600
          mt-2
        ">
          Activity-based operational
          workflow monitoring
        </p>

      </div>

      {/* ACTIVITIES */}
      {activities.map(
        (activity: any) => (

        <div
          key={activity.id}
          className="
            bg-white
            rounded-3xl
            shadow-xl
            border
            overflow-hidden
          "
        >

          {/* ACTIVITY HEADER */}
          <div className="
            bg-linear-to-r
            from-blue-700
            to-blue-900

            text-white
            p-6
          ">

            <div className="
              flex
              items-start
              justify-between
              gap-4
            ">

              <div>

                <h2 className="
                  text-3xl
                  font-bold
                ">
                  📅 {activity.title}
                </h2>

                <p className="
                  mt-3
                  text-blue-100
                ">
                  {activity.description}
                </p>

              </div>

              <div className="
                text-right
              ">

                <p className="
                  font-bold
                  text-xl
                ">
                  {activity.activity_date}
                </p>

                <p className="
                  text-blue-100
                  mt-1
                ">
                  🕒
                  {' '}
                  {activity.activity_time}
                </p>

              </div>

            </div>

          </div>
          

          {/* TIMELINE */}
          <div className="
            relative
            p-8
          ">

            {/* LINE */}
            <div className="
              absolute
              left-14
              top-0
              bottom-0
              w-1
              bg-blue-100
            " />

            <div className="
              space-y-8
            ">

              {/* ACTIVITY PROPER */}
              <div className="
                relative
                pl-24
              ">

                {/* ICON */}
                <div className="
                  absolute
                  left-0
                  top-2

                  w-10 h-10
                  rounded-full

                  bg-blue-600
                  text-white

                  flex
                  items-center
                  justify-center

                  shadow-lg
                ">
                  📅
                </div>

                {/* CARD */}
                <div className="
                  bg-blue-50
                  border-l-4
                  border-blue-500
                  rounded-2xl
                  p-5
                ">

                  <h3 className="
                    text-xl
                    font-bold
                    text-blue-900
                  ">
                    Activity Proper
                  </h3>

                  <p className="
                    text-gray-700
                    mt-2
                  ">
                    Main operational activity.
                  </p>

                </div>

              </div>

              {/* ASSIGNMENTS */}
              {activity.assignments.map(
                (assign: any) => (

                <div
                  key={`${activity.id}-${assign.task}`}
                  className="
                    relative
                    pl-24
                  "
                >

                  {/* ICON */}
                  <div className="
                    absolute
                    left-0
                    top-2

                    w-10 h-10
                    rounded-full

                    bg-orange-500
                    text-white

                    flex
                    items-center
                    justify-center

                    shadow-lg
                  ">
                    📋
                  </div>

                  {/* CARD */}
                  <div className="
                    bg-orange-50
                    border-l-4
                    border-orange-500
                    rounded-2xl
                    p-5
                  ">

                    {/* TOP */}
                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    ">

                      <div>

                        <h3 className="
                          text-xl
                          font-bold
                          text-blue-900
                        ">
                          {assign.task}
                        </h3>

                        <p className="
                          text-gray-600
                          mt-2
                        ">
                          Deadline:
                          {' '}
                          {assign.deadline}
                        </p>

                      </div>

                      {/* STATUS */}
                      <span className={`
                        px-4 py-2
                        rounded-full
                        text-sm
                        font-semibold

                        ${getStatusColor(
                          assign.status
                        )}
                      `}>

                        {assign.status}

                      </span>

                    </div>

{/* PERSONNEL */}
<div className="
  mt-5
">

  <p className="
    text-sm
    text-gray-500
    mb-4
  ">

    Assigned Personnel

  </p>

  <div className="
    flex
    flex-wrap
    gap-4
  ">

    {Array.isArray(
  assign.employees
)

  ? assign.employees.map(
      (
        employee: any,
        index: number
      ) => (

      <div
        key={index}
        className="
          flex
          items-center
          gap-3

          bg-white

          border

          rounded-2xl

          px-4 py-3

          shadow-sm
        "
      >

        {/* PHOTO */}
        {employee
          ?.photo_url ? (

          <img
            src={
              employee
                .photo_url
            }
            alt={
              employee
                .name
            }
            className="
              w-12 h-12
              rounded-full
              object-cover
              border
            "
          />

        ) : (

          <div className="
            w-12 h-12
            rounded-full

            bg-blue-100
            text-blue-700

            flex
            items-center
            justify-center

            font-bold
          ">

            {
              employee
                ?.name
                ?.charAt(0)
            }

          </div>

        )}

        {/* INFO */}
        <div>

          <p className="
            font-bold
            text-blue-900
          ">

            {employee?.name}

          </p>

          <p className="
            text-xs
            text-gray-500
          ">

            Assigned Personnel

          </p>

        </div>

      </div>

        ))

  : null}

                    </div>

                </div>

              </div>

            </div>

            ))}

            </div>

          </div>

        </div>

      ))}

    </div>
  )
}