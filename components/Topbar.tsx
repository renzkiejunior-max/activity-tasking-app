'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link from 'next/link'

import { useAuth }
from '../contexts/AuthContext'

import { supabase }
from '../lib/supabase'

export default function Topbar() {

  const { userData } =
    useAuth()

  const [employee, setEmployee] =
    useState<any>(null)

  const [notificationCount,
    setNotificationCount] =
    useState(0)

  // FETCH EMPLOYEE
  const fetchEmployee =
    async () => {

      if (
        !userData?.email
      ) return

      const { data } =
        await supabase

          .from('employees')

          .select('*')

          .eq(
            'email',
            userData.email
          )

          .single()

      if (data) {

        setEmployee(data)

      }
  }

  // FETCH NOTIFICATIONS
  const fetchNotifications =
    async () => {

      const {
        data: assignments,
      } = await supabase

        .from('assignments')

        .select('*')

      const {
        data: activities,
      } = await supabase

        .from('activities')

        .select('*')

      const total =
        (assignments?.length || 0)
        +
        (activities?.length || 0)

      setNotificationCount(
        total
      )
  }

  useEffect(() => {

    fetchEmployee()

    fetchNotifications()

    // REALTIME
    const channel = supabase

      .channel(
        'topbar-realtime'
      )

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

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )

    }

  }, [userData])

  return (

    <header className="

      sticky
      top-0

      z-30

      bg-white/95
      backdrop-blur

      border-b
      border-gray-200

      shadow-sm

      px-4
      md:px-8

      py-4

      flex
      items-center
      justify-between

    ">

      {/* LEFT */}
      <div className="
        min-w-0
      ">

        <h1 className="
          text-lg
          md:text-2xl

          font-bold

          text-blue-900

          truncate
        ">

          Activity Tasking System

        </h1>

        <p className="
          hidden sm:block

          text-sm
          text-gray-500

          mt-1
        ">

          Office Management Portal

        </p>

      </div>

      {/* RIGHT */}
      <div className="
        flex
        items-center
        gap-4
      ">

        {/* NOTIFICATIONS */}
        <Link
          href="/notifications"
        >

          <button className="
            relative

            w-11 h-11

            rounded-2xl

            bg-orange-100
            hover:bg-orange-200

            transition

            flex
            items-center
            justify-center

            text-xl

            shadow-sm
          ">

            🔔

            {/* BADGE */}
            <span className="
              absolute

              -top-1
              -right-1

              bg-orange-500
              text-white

              text-[10px]
              font-bold

              min-w-5
              h-5

              px-1

              rounded-full

              flex
              items-center
              justify-center

              shadow
            ">

              {notificationCount}

            </span>

          </button>

        </Link>

        {/* USER */}
        <div className="
          flex
          items-center
          gap-3

          bg-gray-50
          border

          rounded-2xl

          px-3
          py-2

          shadow-sm
        ">

          {/* PHOTO */}
          {employee?.photo_url ? (

            <img
              src={
                employee.photo_url
              }
              alt="Profile"
              className="
                w-12 h-12

                rounded-full

                object-cover

                border-2
                border-blue-200

                shadow
              "
            />

          ) : (

            <div className="
              w-12 h-12

              rounded-full

              bg-linear-to-br
              from-blue-700
              to-blue-900

              text-white

              flex
              items-center
              justify-center

              font-bold
              text-lg
            ">

              {
                userData?.email
                  ?.charAt(0)
                  ?.toUpperCase()
              }

            </div>

          )}

          {/* USER INFO */}
          <div className="
            hidden sm:block

            max-w-52
          ">

            {/* NAME */}
            <p className="
              font-bold
              text-blue-900

              truncate
            ">

              {
                employee?.name ||
                'Loading...'
              }

            </p>

            {/* EMAIL */}
            <p className="
              text-xs
              text-gray-500

              truncate
            ">

              {
                userData?.email
              }

            </p>

            {/* ROLE */}
            <p className="
              text-xs
              text-orange-600

              capitalize
              font-medium
            ">

              {
                userData?.role
              }

            </p>

          </div>

        </div>

      </div>

    </header>
  )
}