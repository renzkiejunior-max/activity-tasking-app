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
  //const [showMobileBar,
    //setShowMobileBar] =
    //useState(true)

const homeRoute =

  userData?.roles
    ?.includes('staff')

    ? '/calendar'

  : userData?.roles
      ?.includes(
        'division_chief'
      )

      ? '/division-chief-dashboard'

  : userData?.roles
      ?.includes('admin')

      ? '/admin-dashboard'

  : '/dashboard'


    // SECURITY MODAL
const [showSecurityModal,
  setShowSecurityModal] =
  useState(false)

const [currentPassword,
  setCurrentPassword] =
  useState('')

const [newPassword,
  setNewPassword] =
  useState('')

const [confirmPassword,
  setConfirmPassword] =
  useState('')

const [changingPassword,
  setChangingPassword] =
  useState(false)

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

  
  return (

    <>


{/* MOBILE TOPBAR */}
<header className="

  md:hidden

  fixed
  top-0
  left-0
  right-0

  z-50

  h-16

  bg-linear-to-r
  from-orange-700
  via-orange-600
  to-orange-700

  border-b
  border-orange-400/30

  shadow-xl

  px-4

  flex
  items-center
  justify-between
">

  {/* LEFT */}
  <div className="
    flex
    items-center
    gap-3
  ">

    {/* HAMBURGER */}
    <button

      onClick={() => {

        const button =
          document.querySelector(
            '[data-mobile-sidebar]'
          ) as HTMLButtonElement

        button?.click()
      }}

      className="
        w-10
        h-10

        rounded-xl

        bg-blue-900/80

        text-white

        flex
        items-center
        justify-center

        text-xl
      "
    >

      ☰

    </button>

    {/* LOGO */}
    <img
      src="/PDRRMO.png"
      alt="Logo"

      className="
        w-9
        h-9

        object-contain
      "
    />

  </div>

  {/* TITLE */}
<div className="
  flex
  flex-col

  leading-tight
">

  <h1 className="
    text-[11px]
    font-black

    text-white
  ">

    PDRRMO

  </h1>

  <p className="
    text-[9px]
    text-orange-100
  ">

    Operations Portal

  </p>

</div>

{/* RIGHT */}
<div className="
  flex
  items-center
  gap-2
">

  {/* HOME */}
  <Link href={homeRoute}>

    <button className="
      w-10
      h-10

      rounded-xl

      bg-blue-900/80

      text-white

      flex
      items-center
      justify-center

      text-lg
    ">

      🏠

    </button>

  </Link>

  {/* NOTIFICATIONS */}
  <Link href="/notifications">

    <button

      onClick={
        clearNotifications
      }

      className="
        relative

        w-10
        h-10

        rounded-xl

        bg-blue-900/80

        text-white

        flex
        items-center
        justify-center
      "
    >

      🔔

      {notificationCount > 0 && (

        <span className="
          absolute

          -top-1
          -right-1

          bg-red-500
          text-white

          text-[10px]

          min-w-5
          h-5

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

  {/* USER PHOTO */}
  {employee?.photo_url ? (

    <img
      src={employee.photo_url}
      alt="User"

      className="
        w-10
        h-10

        rounded-full

        object-cover

        border-2
        border-white
      "
    />

  ) : (

    <div className="
      w-10
      h-10

      rounded-full

      bg-blue-900

      text-white

      flex
      items-center
      justify-center

      font-bold
    ">

      {
        userData?.email
          ?.charAt(0)
          ?.toUpperCase()
      }

    </div>

  )}

  {/* LOGOUT */}
  <button

    onClick={
      handleLogout
    }

    className="
      w-10
      h-10

      rounded-xl

      bg-red-500

      text-white

      flex
      items-center
      justify-center

      text-lg
    "
  >

    🚪

  </button>

</div>

    

</header>


      {/* DESKTOP TOPBAR */}
      <header className="

  hidden
  md:flex

  sticky
  top-0

  z-30

  w-full

  bg-linear-to-r
  from-orange-700
  via-orange-600
  to-orange-700

  backdrop-blur

  border-b
  border-orange-400/30

  shadow-md

  px-8
  py-2

  items-center
  justify-between

">

        {/* LEFT */}
        <div>

          <h1 className="
            text-2xl
            font-bold
            text-white
          ">

            PDRRMO Operations Portal

          </h1>

          <p className="
            text-sm
            text-orange-100
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

                bg-blue-900
                hover:bg-white/50

                transition

                flex
                items-center
                justify-center

                text-xl
              text-white

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

            bg-blue-900
            border
          border-white/10

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
                text-white

                truncate
              ">

                {
                  employee?.name ||
                  'Loading...'
                }

              </p>

              <p className="
                text-xs
                text-orange-100

                truncate
              ">

                {
                  userData?.email
                }

              </p>

              <p className="
                text-xs
                text-yellow-200

                capitalize
                font-medium
              ">

                {
               

userData?.role ||
userData?.roles



                }

              </p>

            </div>


            {/* SECURITY */}
<button

  onClick={() =>
    setShowSecurityModal(
      true
    )
  }

  className="
    ml-2

    bg-orange-400
    hover:bg-orange-500

    text-white

    px-4
    py-2

    rounded-xl

    text-sm
    font-medium

    transition
  "
>

  Security

</button>
            
            
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

{/* SECURITY MODAL */}
{showSecurityModal && (

  <div className="
  fixed
  inset-0
  z-9999

  bg-black/50
  backdrop-blur-sm

  overflow-y-auto

  flex
  items-center
  justify-center

  pb-10

  px-4
">

    <div className="
  bg-white

  w-full
  max-w-md

  rounded-3xl

  shadow-2xl

  my-auto
">

      {/* HEADER */}
      <div className="
        bg-linear-to-r
        from-blue-900
        to-orange-500

        p-5

        text-white
      ">

        <div className="
          flex
          items-center
          justify-between
        ">

          <div>

            <h2 className="
              text-2xl
              font-black
            ">

              Account Security

            </h2>

            <p className="
              text-sm
              text-white/80

              mt-1
            ">

              Password can only
              be changed once

            </p>

          </div>

          {/* CLOSE */}
          <button

            onClick={() =>
              setShowSecurityModal(
                false
              )
            }

            className="
              text-2xl
            "
          >

            ×

          </button>

        </div>

      </div>

      {/* BODY */}
      <div className="
        p-6

        space-y-5
      ">

        {/* LOCKED */}
        {userData
          ?.password_change_count >= 1 ? (

          <div className="
            bg-red-50

            border
            border-red-200

            rounded-2xl

            p-5
          ">

            <h3 className="
              font-bold
              text-red-700
            ">

              Password Changes Locked

            </h3>

            <p className="
              text-sm
              text-red-600

              mt-2
            ">

              Please contact the
              administrator for
              password recovery.

            </p>

          </div>

        ) : (

          <>

            {/* CURRENT */}
            <input

              type="password"

              placeholder="Current Password"

              value={currentPassword}

              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }

              className="
                w-full

                border

                rounded-2xl

                px-4
                py-3
              "
            />

            {/* NEW */}
            <input

              type="password"

              placeholder="New Password"

              value={newPassword}

              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }

              className="
                w-full

                border

                rounded-2xl

                px-4
                py-3
              "
            />

            {/* CONFIRM */}
            <input

              type="password"

              placeholder="Confirm Password"

              value={confirmPassword}

              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }

              className="
                w-full

                border

                rounded-2xl

                px-4
                py-3
              "
            />

            {/* SAVE */}
            <button

              disabled={
                changingPassword
              }

              className="
                w-full

                bg-orange-500
                hover:bg-orange-600

                text-white

                font-bold

                rounded-2xl

                py-3

                transition
              "
            >

              {
                changingPassword

                  ? 'Updating...'

                  : 'Update Password'
              }

            </button>

          </>

        )}

      </div>

    </div>

  </div>

)}


          </>
  )
}