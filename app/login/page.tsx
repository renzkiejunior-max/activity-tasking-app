'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Page() {

  const [email, setEmail] = useState('')
  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

    const [showPassword,
  setShowPassword] =
  useState(false)

  // LOGIN
const handleLogin = async () => {

  if (!email || !password) {

    return alert(
      'Enter email and password'
    )
  }

  setLoading(true)

  // LOGIN
  const {
    error,
    data,
  } = await supabase.auth

    .signInWithPassword({

      email,
      password,

    })

  if (error) {

    setLoading(false)

    alert(error.message)

    return
  }

  // GET USER
  const userId =
    data.user.id

  // GET USER ROLE
  const {
    data: userData,
    error: roleError,
  } = await supabase

    .from('users')

    .select('*')

    .eq(
      'id',
      userId
    )

    .single()

  setLoading(false)

  if (
    roleError ||
    !userData
  ) {

    return alert(
      'User role not found'
    )
  }

// ACCOUNT DISABLED
if (
  userData.is_active === false
) {

  setLoading(false)

  return alert(
    'Your account has been disabled. Please contact the administrator.'
  )
}


// FORCE PASSWORD CHANGE
if (
  !userData.password_changed
) {

  window.location.href =
    '/change-password'

  return
}


  // SAFE ROLES
  const roles =

    Array.isArray(
      userData.roles
    )

      ? userData.roles

      : userData.roles

        ? [userData.roles]

        : userData.role

          ? [userData.role]

          : []

  /// REDIRECT
if (
  roles.includes('admin')
) {

  window.location.href =
    '/admin-dashboard'

  return
}

if (
  roles.includes(
    'division_chief'
  )
) {

  window.location.href =
    '/division-chief-dashboard'

  return
}


if (
  roles.includes(
    'office_chief'
  )
) {

  window.location.href =
    '/office-chief-dashboard'

  return
}

// STAFF REDIRECT - GO TO CALENDAR

if (
  roles.includes('staff')
) {

  window.location.href =
    '/calendar'

  return
}

// DEFAULT
window.location.href =
  '/calendar'

}

return (


    <div className="
  min-h-screen

  flex
  items-center
  justify-center

  bg-linear-to-br

  from-blue-500
  via-white
  to-orange-500

  p-6

  relative

  overflow-hidden
">

      <div className="
  relative

  z-10

  bg-white
        rounded-3xl
        shadow-2xl
        p-8
        w-full
        max-w-md
        border border-gray-200
      ">

        {/* BACKGROUND GLOW */}
<div className="
  absolute

  pointer-events-none

  top-0
  left-0

  w-96
  h-96

  bg-blue-300/30

  rounded-full

  blur-3xl
" />

<div className="
  absolute

  pointer-events-none

  bottom-0
  right-0

  w-96
  h-96

  bg-orange-300/30

  rounded-full

  blur-3xl
" />

        {/* HEADER */}
        <div className="text-center mb-8">

          <img

  src="/PDRRMO.png"

  alt="PDRRMO Logo"

  className="
    w-24
    h-24

    object-contain

    mx-auto
  "
/>

          <h1 className="
            text-3xl
            font-bold
            text-blue-900
            mt-5
          ">
            Task Management System
          </h1>

          <p className="text-gray-700 mt-2">
            PDRRMO Personnel Assignment Tracker
          </p>

        </div>


        {/* NOTICE */}
<div className="
  bg-orange-50

  border
  border-orange-200

  rounded-2xl

  p-4

  mb-6
">

  <p className="
    text-sm
    text-orange-700

    text-center

    font-medium
  ">

    First-time users will be
    required to update their
    password after login.

  </p>

</div>


{/* FORGOT PASSWORD */}
<div className="
  text-center

  mt-4
">

  <button

    className="
      text-sm

      text-blue-700
      hover:text-orange-600

      font-medium

      transition
    "
  >

    Forgot Password?
    Contact Administrator

  </button>

</div>

{/* SECURITY NOTICE */}
<div className="
  mt-6

  text-center
">

  <p className="
    text-xs

    text-gray-500

    leading-relaxed
  ">

    Authorized personnel only.
    Unauthorized access is prohibited.

  </p>

</div>

        {/* FORM */}
        <form

          onSubmit={(e) => {

            e.preventDefault()

            handleLogin()
          }}

          className="space-y-4"
        >

          <input

          name="email"
          autoCapitalize="none"

          autoCorrect="off"

          spellCheck={false}

          autoComplete="username"

          type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              border
              rounded-xl
              p-4
              text-black
              placeholder-gray-500
            "
          />

          <div className="
  relative
">

  <input

    name="password"

    autoComplete="current-password"

    type={
      showPassword
        ? 'text'
        : 'password'
    }

    placeholder="Password"

    value={password}

    onChange={(e) =>
      setPassword(
        e.target.value
      )
    }

    className="
      w-full

      border

      rounded-xl

      p-4

      pr-20

      text-black

      placeholder-gray-500
    "
  />

  {/* TOGGLE */}
  <button

    type="button"

    onClick={() =>
      setShowPassword(
        !showPassword
      )
    }

    className="
      absolute

      right-4
      top-1/2

      -translate-y-1/2

      text-sm
      font-bold

      text-blue-700

      hover:text-orange-500

      transition
    "
  >

    {
      showPassword
        ? 'Hide'
        : 'Show'
    }

  </button>

</div>

          <button

          type="submit"

  onClick={() =>
  handleLogin()
  }

  disabled={loading}

  className="

    w-full

    bg-orange-500
    hover:bg-orange-600

    disabled:bg-orange-300

    text-white

    font-semibold

    py-4

    rounded-xl

    shadow-lg

    transition

    flex
    items-center
    justify-center

    gap-3
  "
>

  {loading && (

    <div className="
      w-5
      h-5

      border-2
      border-white/40

      border-t-white

      rounded-full

      animate-spin
    " />

  )}

  <span>

    {
      loading
        ? 'Logging in...'
        : 'Login'
    }

  </span>

</button>

        </form>

      </div>

    </div>
  )
}