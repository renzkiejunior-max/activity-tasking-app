'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../lib/supabase'

export default function Page() {

  const [notifications, setNotifications] =
    useState<any[]>([])

  // FETCH NOTIFICATIONS
  const fetchNotifications =
    async () => {

      const today =
        new Date()

      const generatedNotifications:
        any[] = []

      // =========================
      // DATABASE NOTIFICATIONS
      // =========================
      const {
        data: dbNotifications
      } = await supabase

        .from('notifications')

        .select('*')

        .order('created_at', {
          ascending: false,
        })

      dbNotifications?.forEach(
        (notif) => {

          generatedNotifications.push({

            id: notif.id,

            title:
              notif.title,

            message:
              notif.message,

            type:
              notif.type,

            created_at:
              notif.created_at,

            days_before: 0,

          })

        }
      )

      // =========================
      // UPCOMING ACTIVITIES
      // =========================
      const {
        data: activities
      } = await supabase

        .from('activities')
        .select('*')

      activities?.forEach(
        (activity) => {

          if (
            !activity.activity_date
          ) return

          const activityDate =
            new Date(
              activity.activity_date
            )

          const diffTime =
            activityDate.getTime() -
            today.getTime()

          const diffDays =
            Math.ceil(
              diffTime /
              (
                1000 *
                60 *
                60 *
                24
              )
            )

          if (diffDays >= 0) {

            generatedNotifications.push({

              id:
                'activity-' +
                activity.id,

              title:
                'Upcoming Activity',

              message:
`${activity.title}

Scheduled on:
${activity.activity_date}`,

              days_before:
                diffDays,

              type:
                'activity',

            })
          }

        }
      )

      // =========================
      // ASSIGNMENTS
      // =========================
      const {
        data: assignments
      } = await supabase

        .from('assignments')

        .select(`
          *,
          employees(
            name,
            photo_url
          ),
          activities(title)
        `)

      assignments?.forEach(
        (assign) => {

          // DEADLINE
          if (
            assign.deadline
          ) {

            const deadlineDate =
              new Date(
                assign.deadline
              )

            const diffTime =
              deadlineDate.getTime() -
              today.getTime()

            const diffDays =
              Math.ceil(
                diffTime /
                (
                  1000 *
                  60 *
                  60 *
                  24
                )
              )

            if (diffDays >= 0) {

              generatedNotifications.push({

                id:
                  'deadline-' +
                  assign.id,

                title:
                  'Task Deadline Reminder',

                photo:
                  assign.employees
                    ?.photo_url,

                employeeName:
                  assign.employees
                    ?.name,

                message:
`${assign.employees?.name}

Task:
${assign.task}

Activity:
${assign.activities?.title}

Deadline:
${assign.deadline}`,

                days_before:
                  diffDays,

                type:
                  'deadline',

              })
            }
          }

          // STATUS
          generatedNotifications.push({

            id:
              'status-' +
              assign.id,

            title:
              'Task Status Update',

            photo:
              assign.employees
                ?.photo_url,

            employeeName:
              assign.employees
                ?.name,

            message:
`${assign.employees?.name}

Task:
${assign.task}

Status:
${assign.status?.toUpperCase()}

Activity:
${assign.activities?.title}`,

            days_before: 0,

            type:
              assign.status ||
              'pending',

          })

        }
      )

      // SORT
      generatedNotifications.sort(
        (a, b) =>
          a.days_before -
          b.days_before
      )

      setNotifications(
        generatedNotifications
      )
  }

  // REALTIME
  useEffect(() => {

    fetchNotifications()

    const channel = supabase

      .channel(
        'notifications-live'
      )

      // ACTIVITIES
      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },

        () => {

          fetchNotifications()

        }
      )

      // ASSIGNMENTS
      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'assignments',
        },

        () => {

          fetchNotifications()

        }
      )

      // NOTIFICATIONS
      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },

        () => {

          fetchNotifications()

        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )

    }

  }, [])

  // COLORS
  const getNotificationStyle =
    (
      type: string
    ) => {

      if (
        type === 'completed'
      ) {

        return `
          border-green-500
          bg-green-50
        `
      }

      if (
        type === 'ongoing'
      ) {

        return `
          border-blue-500
          bg-blue-50
        `
      }

      if (
        type === 'cancelled'
      ) {

        return `
          border-red-500
          bg-red-50
        `
      }

      if (
        type === 'deadline'
      ) {

        return `
          border-orange-500
          bg-orange-50
        `
      }

      if (
        type === 'comment'
      ) {

        return `
          border-purple-500
          bg-purple-50
        `
      }

      return `
        border-gray-400
        bg-gray-50
      `
  }

  // ICONS
  const getIcon =
    (
      type: string
    ) => {

      if (
        type === 'completed'
      ) {

        return '✅'
      }

      if (
        type === 'ongoing'
      ) {

        return '🔄'
      }

      if (
        type === 'cancelled'
      ) {

        return '❌'
      }

      if (
        type === 'deadline'
      ) {

        return '📋'
      }

      if (
        type === 'comment'
      ) {

        return '💬'
      }

      if (
        type === 'assignment'
      ) {

        return '📌'
      }

      if (
        type === 'progress'
      ) {

        return '📊'
      }

      return '🔔'
  }

  return (

    <div className="
      w-full
      min-w-0
      space-y-6
    ">

      {/* HEADER */}
      <div>

        <h1 className="
          text-3xl
          font-bold
          text-blue-900
        ">
          Notifications Center
        </h1>

        <p className="
          text-gray-600
        ">
          Operational updates,
          realtime alerts,
          and workflow notifications
        </p>

      </div>

      {/* EMPTY */}
      {notifications.length === 0 ? (

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-10
          text-center
        ">

          <div className="
            text-6xl
            mb-4
          ">
            🔔
          </div>

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
          ">
            No Notifications
          </h2>

        </div>

      ) : (

        <div className="
          space-y-4
        ">

          {notifications.map(
            (notif: any) => (

            <div
              key={notif.id}
              className={`
                rounded-3xl
                shadow-lg
                p-6
                border-l-4
                transition
                hover:shadow-xl

                ${getNotificationStyle(
                  notif.type
                )}
              `}
            >

              <div className="
                flex
                flex-col
                md:flex-row
                md:items-start
                md:justify-between
                gap-5
              ">

                {/* LEFT */}
                <div className="
                  flex
                  gap-4
                ">

                  {/* PHOTO */}
                  {notif.photo ? (

                    <img
                      src={notif.photo}
                      alt="Employee"
                      className="
                        w-14 h-14
                        rounded-full
                        object-cover
                        border-2
                        border-white
                        shadow
                      "
                    />

                  ) : notif.employeeName ? (

                    <div className="
                      w-14 h-14
                      rounded-full
                      bg-blue-100
                      text-blue-700
                      flex
                      items-center
                      justify-center
                      text-lg
                      font-bold
                      shadow
                    ">

                      {
                        notif.employeeName
                          ?.charAt(0)
                      }

                    </div>

                  ) : (

                    <div className="
                      text-3xl
                    ">
                      {
                        getIcon(
                          notif.type
                        )
                      }
                    </div>

                  )}

                  {/* CONTENT */}
                  <div>

                    <h2 className="
                      text-xl
                      font-bold
                      text-blue-900
                    ">
                      {notif.title}
                    </h2>

                    <p className="
                      text-gray-700
                      whitespace-pre-line
                      mt-2
                    ">
                      {notif.message}
                    </p>

                  </div>

                </div>

                {/* DAYS */}
                <div>

                  <span className="
                    bg-white
                    border
                    px-4 py-2
                    rounded-full
                    text-sm
                    font-semibold
                    text-gray-700
                  ">

                    {
                      notif.days_before
                    }
                    {' '}
                    day(s)

                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}