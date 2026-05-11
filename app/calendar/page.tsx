'use client'

import { useEffect, useState } from 'react'

import Calendar from 'react-calendar'

import 'react-calendar/dist/Calendar.css'

import { supabase }
from '../../lib/supabase'

export default function Page() {

  const [date, setDate] =
    useState(new Date())

  const [activities, setActivities] =
    useState<any[]>([])

  const [assignments, setAssignments] =
    useState<any[]>([])

  // FETCH DATA
  const fetchData = async () => {

    // ACTIVITIES
    const { data: activityData } =
      await supabase
        .from('activities')
        .select('*')

    setActivities(
      activityData || []
    )

    // ASSIGNMENTS
    const { data: assignmentData } =
      await supabase
        .from('assignments')
        .select(`
          *,
          employees(
            name,
            photo_url
          ),
          activities(
            title
          )
        `)

    setAssignments(
      assignmentData || []
    )
  }

  useEffect(() => {
    fetchData()
  }, [])

  // MATCH ACTIVITIES
  const selectedDateActivities =
    activities.filter((activity) => {

      const activityDate =
        new Date(
          activity.activity_date
        )

      return (
        activityDate.toDateString() ===
        date.toDateString()
      )
    })

  // MATCH ASSIGNMENTS
  const selectedAssignments =
    assignments.filter((assign) => {

      if (!assign.deadline) return false

      const deadlineDate =
        new Date(assign.deadline)

      return (
        deadlineDate.toDateString() ===
        date.toDateString()
      )
    })

  // CALENDAR DOTS
  const tileContent = ({
    date,
    view,
  }: any) => {

    if (view !== 'month') return null

    const hasActivity =
      activities.some((activity) => {

        const activityDate =
          new Date(
            activity.activity_date
          )

        return (
          activityDate.toDateString() ===
          date.toDateString()
        )
      })

    const hasAssignment =
      assignments.some((assign) => {

        if (!assign.deadline) return false

        const deadlineDate =
          new Date(assign.deadline)

        return (
          deadlineDate.toDateString() ===
          date.toDateString()
        )
      })

    return (

      <div className="
        flex
        justify-center
        gap-1
        mt-1
      ">

        {hasActivity && (

          <div className="
            w-2 h-2
            rounded-full
            bg-blue-500
          " />

        )}

        {hasAssignment && (

          <div className="
            w-2 h-2
            rounded-full
            bg-orange-500
          " />

        )}

      </div>

    )
  }

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
          Operations Calendar
        </h1>

        <p className="
          text-gray-600
          mt-2
        ">
          Activities, task deadlines,
          and operational scheduling
        </p>

      </div>

      {/* CALENDAR */}
      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        p-6
        border
      ">

        <Calendar

          onChange={(value: any) =>
            setDate(value)
          }

          value={date}

          tileContent={tileContent}

          className="
            w-full
            border-none
            text-black
          "
        />

        {/* LEGEND */}
        <div className="
          flex gap-6
          mt-6
          border-t
          pt-4
        ">

          <div className="
            flex items-center
            gap-2
          ">

            <div className="
              w-3 h-3
              rounded-full
              bg-blue-500
            " />

            <span className="
              text-sm
              text-gray-700
            ">
              Activities
            </span>

          </div>

          <div className="
            flex items-center
            gap-2
          ">

            <div className="
              w-3 h-3
              rounded-full
              bg-orange-500
            " />

            <span className="
              text-sm
              text-gray-700
            ">
              Task Deadlines
            </span>

          </div>

        </div>

      </div>

      {/* CONTENT GRID */}
      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

        {/* ACTIVITIES */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">

            Activities on

            <span className="
              text-orange-500
              ml-2
            ">
              {date.toDateString()}
            </span>

          </h2>

          {selectedDateActivities.length === 0 ? (

            <div className="
              bg-gray-50
              border
              rounded-2xl
              p-5
            ">

              <p className="
                text-gray-700
              ">
                No scheduled activities.
              </p>

            </div>

          ) : (

            <div className="
              space-y-4
            ">

              {selectedDateActivities.map(
                (activity: any) => (

                <div
                  key={activity.id}
                  className="
                    border-l-4
                    border-blue-500
                    bg-blue-50
                    rounded-2xl
                    p-5
                  "
                >

                  <h3 className="
                    font-bold
                    text-blue-900
                    text-lg
                  ">
                    {activity.title}
                  </h3>

                  <p className="
                    text-gray-700
                    mt-2
                  ">
                    {activity.description}
                  </p>

                  <div className="
                    mt-4
                  ">

                    <span className="
                      bg-white
                      border
                      px-3 py-1
                      rounded-full
                      text-sm
                      font-medium
                    ">
                      🕒
                      {' '}
                      {activity.activity_time}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* ASSIGNMENTS */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
            mb-5
          ">

            Task Deadlines on

            <span className="
              text-orange-500
              ml-2
            ">
              {date.toDateString()}
            </span>

          </h2>

          {selectedAssignments.length === 0 ? (

            <div className="
              bg-gray-50
              border
              rounded-2xl
              p-5
            ">

              <p className="
                text-gray-700
              ">
                No task deadlines.
              </p>

            </div>

          ) : (

            <div className="
              space-y-4
            ">

              {selectedAssignments.map(
                (assign: any) => (

                <div
                  key={assign.id}
                  className="
                    border-l-4
                    border-orange-500
                    bg-orange-50
                    rounded-2xl
                    p-5
                  "
                >

                  <div className="
                    flex items-center
                    gap-4
                  ">

                    {/* PHOTO */}
                    {assign.employees?.photo_url ? (

                      <img
                        src={
                          assign.employees
                            .photo_url
                        }
                        alt={
                          assign.employees
                            .name
                        }
                        className="
                          w-14 h-14
                          rounded-full
                          object-cover
                          border
                          shadow
                        "
                      />

                    ) : (

                      <div className="
                        w-14 h-14
                        rounded-full
                        bg-blue-100
                        text-blue-700
                        flex
                        items-center
                        justify-center
                        font-bold
                      ">

                        {
                          assign.employees
                            ?.name
                            ?.charAt(0)
                        }

                      </div>

                    )}

                    {/* INFO */}
                    <div>

                      <h3 className="
                        font-bold
                        text-blue-900
                      ">
                        {
                          assign.employees
                            ?.name
                        }
                      </h3>

                      <p className="
                        text-gray-700
                        mt-1
                      ">
                        {assign.task}
                      </p>

                      <p className="
                        text-sm
                        text-orange-700
                        mt-1
                      ">
                        {
                          assign.activities
                            ?.title
                        }
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  )
}