'use client'

import {
  useEffect,
  useState,
} from 'react'

import Link
from 'next/link'

import {
  useRouter,
} from 'next/navigation'

import { useAuth }
from '@/contexts/AuthContext'

import { supabase }
from '@/lib/supabase'

export default function Topbar() {

  const router =
    useRouter()

  const { userData } =
    useAuth()

  const [employee, setEmployee] =
    useState<any>(null)

  const [notificationCount,
    setNotificationCount] =
    useState(0)

  // MOBILE AUTO HIDE
  const [showMobileBar,
    setShowMobileBar] =
    useState(true)

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

    // CURRENT USER
    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser()

    if (!user) return

    // GET ONLY USER NOTIFICATIONS
    const {
      data: notifications,
      error,
    } = await supabase

      .from('notifications')

      .select('*')

      .eq(
        'user_id',
        user.id
      )

      .eq(
        'is_read',
        false
      )

      .order(
        'created_at',
        {
          ascending: false,
        }
      )

    if (error) {

      console.error(error)

      return
    }

    // COUNT
    setNotificationCount(
      notifications?.length || 0
    )
}


// CLEAR NOTIFICATIONS
const clearNotifications =
  async () => {

    // CURRENT USER
    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser()

    if (!user) return

    // MARK ALL AS READ
    await supabase

      .from('notifications')

      .update({
        is_read: true,
      })

      .eq(
        'user_id',
        user.id
      )

      .eq(
        'is_read',
        false
      )

    // RESET COUNTER
    setNotificationCount(0)
}


  // LOGOUT
  const handleLogout =
    async () => {

      await supabase.auth.signOut()

      router.push('/login')
    }

  // INITIAL LOAD
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

  // MOBILE AUTO HIDE
  useEffect(() => {

    let timeout: any

    const showBar = () => {

      setShowMobileBar(true)

      clearTimeout(timeout)

      timeout = setTimeout(() => {

        setShowMobileBar(false)

      }, 3000)
    }

    window.addEventListener(
      'touchstart',
      showBar
    )

    window.addEventListener(
      'mousemove',
      showBar
    )

    timeout = setTimeout(() => {

      setShowMobileBar(false)

    }, 3000)

    return () => {

      window.removeEventListener(
        'touchstart',
        showBar
      )

      window.removeEventListener(
        'mousemove',
        showBar
      )

      clearTimeout(timeout)
    }

  }, [])

  return (

    <>

      {/* DESKTOP TOPBAR */}
      <header className="

        hidden
        md:flex

        sticky
        top-0

        z-30

        bg-white/95
        backdrop-blur

        border-b
        border-gray-200

        shadow-sm

        px-8
        py-4

        items-center
        justify-between

      ">

        {/* LEFT */}
        <div>

          <h1 className="
            text-2xl
            font-bold
            text-blue-900
          ">

            PDRRMO Operations Portal

          </h1>

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">

            Calendar of Activities Tracker

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

            <button

              onClick={
                clearNotifications
              }

              className="
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
              "
            >

              🔔

              {/* BADGE */}
              {notificationCount > 0 && (

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

              )}

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

            {/* INFO */}
            <div className="
              max-w-52
            ">

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

              <p className="
                text-xs
                text-gray-500

                truncate
              ">

                {
                  userData?.email
                }

              </p>

              <p className="
                text-xs
                text-orange-600

                capitalize
                font-medium
              ">

                {
               

userData?.role ||
userData?.roles



                }

              </p>

            </div>

            {/* LOGOUT */}
            <button

              onClick={
                handleLogout
              }

              className="
                ml-2

                bg-red-500
                hover:bg-red-600

                text-white

                px-4
                py-2

                rounded-xl

                text-sm
                font-medium

                transition
              "
            >

              Logout

            </button>

          </div>

        </div>

      </header>

      {/* MOBILE FOOTER */}
      <div className={`

        md:hidden

        fixed
        bottom-0
        left-0
        right-0

        z-50

        bg-white/95
        backdrop-blur

        border-t
        border-gray-200

        shadow-2xl

        px-6
        py-3

        flex
        items-center
        justify-between

        transition-transform
        duration-500

        ${
          showMobileBar
            ? 'translate-y-0'
            : 'translate-y-full'
        }

      `}>

        {/* HOME */}
        <Link
          href="/dashboard"
        >

          <button className="
            flex
            flex-col
            items-center

            text-blue-900
          ">

            <span className="
              text-2xl
            ">
              🏠
            </span>

            <span className="
              text-xs
              font-medium
            ">
              Home
            </span>

          </button>

        </Link>

        {/* ALERTS */}
        <Link
          href="/notifications"
        >

          <button

            onClick={
              clearNotifications
            }

            className="
              relative

              flex
              flex-col
              items-center

              text-orange-600
            "
          >

            <span className="
              text-2xl
            ">
              🔔
            </span>

            <span className="
              text-xs
              font-medium
            ">
              Alerts
            </span>

            {notificationCount > 0 && (

              <span className="
                absolute

                top-0
                right-0

                bg-red-500
                text-white

                text-[10px]

                min-w-5
                h-5

                px-1

                rounded-full

                flex
                items-center
                justify-center
              ">

                {notificationCount}

              </span>

            )}

          </button>

        </Link>

        {/* LOGOUT */}
        <button

          onClick={
            handleLogout
          }

          className="
            flex
            flex-col
            items-center

            text-red-600
          "
        >

          <span className="
            text-2xl
          ">
            🚪
          </span>

          <span className="
            text-xs
            font-medium
          ">
            Logout
          </span>

        </button>

      </div>

    </>
  )
}