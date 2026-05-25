'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  supabase,
} from '@/lib/supabase'

export default function Page() {

  const router =
    useRouter()

  const [newPassword,
    setNewPassword] =
    useState('')

  const [confirmPassword,
    setConfirmPassword] =
    useState('')

  const [showPassword,
    setShowPassword] =
    useState(false)

  const [loading,
    setLoading] =
    useState(false)

  const [userData,
    setUserData] =
    useState<any>(null)

  // LOAD USER
  useEffect(() => {

    const loadUser =
      async () => {

        const {
          data: {
            user,
          },
        } = await supabase
          .auth.getUser()

        if (!user) {

          router.push('/login')

          return
        }

        const {
          data,
        } = await supabase

          .from('users')

          .select('*')

          .eq(
            'id',
            user.id
          )

          .single()

        if (!data) {

          router.push('/login')

          return
        }

        // ALREADY CHANGED
        if (
          data.password_change_count >= 1
        ) {

          // GET USER ROLE
const {
  data: updatedUser,
} = await supabase

  .from('users')

  .select('*')

  .eq(
    'id',
    user?.id
  )

  .single()

// SAFE ROLES
const roles =

  Array.isArray(
    updatedUser.roles
  )

    ? updatedUser.roles

    : updatedUser.roles

      ? [updatedUser.roles]

      : updatedUser.role

        ? [updatedUser.role]

        : []

// REDIRECT
if (
  roles.includes('admin')
) {

  router.push(
    '/admin-dashboard'
  )

  return
}

if (
  roles.includes(
    'division_chief'
  )
) {

  router.push(
    '/division-chief-dashboard'
  )

  return
}

if (
  roles.includes('staff')
) {

  router.push(
    '/staff-dashboard'
  )

  return
}

// DEFAULT
router.push('/dashboard')

          return
        }

        setUserData(data)
      }

    loadUser()

  }, [])

  // UPDATE PASSWORD
  const handleUpdatePassword =
    async () => {

      if (
        !newPassword ||
        !confirmPassword
      ) {

        return alert(
          'Please complete all fields.'
        )
      }

      if (
        newPassword.length < 8
      ) {

        return alert(
          'Password must be at least 8 characters.'
        )
      }

      if (
        newPassword !==
        confirmPassword
      ) {

        return alert(
          'Passwords do not match.'
        )
      }

      setLoading(true)

      // UPDATE AUTH PASSWORD
      const {
        error,
      } = await supabase.auth
        .updateUser({

          password:
            newPassword,

        })

      if (error) {

        setLoading(false)

        return alert(
          error.message
        )
      }

      // UPDATE USER TABLE
      const {
        data: {
          user,
        },
      } = await supabase
        .auth.getUser()

      await supabase

        .from('users')

        .update({

          password_changed:
            true,

          password_change_count:
            1,

        })

        .eq(
          'id',
          user?.id
        )

      setLoading(false)

      alert(
        'Password updated successfully.'
      )

      router.push('/dashboard')
    }

  return (

    <div className="
      min-h-screen

      flex
      items-center
      justify-center

      bg-linear-to-br
      from-blue-100
      via-white
      to-orange-100

      p-6
    ">

      <div className="
        bg-white

        w-full
        max-w-md

        rounded-3xl

        shadow-2xl

        border
        border-gray-200

        overflow-hidden
      ">

        {/* HEADER */}
        <div className="
          bg-linear-to-r
          from-blue-900
          via-blue-700
          to-orange-500

          p-8

          text-white
          text-center
        ">

          <div className="
            text-5xl
          ">

            🔐

          </div>

          <h1 className="
            text-3xl
            font-black

            mt-4
          ">

            Create New Password

          </h1>

          <p className="
            text-white/80

            mt-2
          ">

            Password can only
            be changed once.

          </p>

        </div>

        {/* BODY */}
        <div className="
          p-6

          space-y-5
        ">

          {/* NOTICE */}
          <div className="
            bg-orange-50

            border
            border-orange-200

            rounded-2xl

            p-4
          ">

            <p className="
              text-sm
              text-orange-700
              font-medium
            ">

              After changing your
              password, future
              password resets must
              be requested from
              the administrator.

            </p>

          </div>

          {/* PASSWORD */}
          <div className="
            relative
          ">

            <input

              type={
                showPassword
                  ? 'text'
                  : 'password'
              }

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
                py-4

                pr-16
              "
            />

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
              "
            >

              {
                showPassword
                  ? 'Hide'
                  : 'Show'
              }

            </button>

          </div>

          {/* CONFIRM */}
          <input

            type={
              showPassword
                ? 'text'
                : 'password'
            }

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
              py-4
            "
          />

          {/* SAVE */}
          <button

            onClick={
              handleUpdatePassword
            }

            disabled={loading}

            className="
              w-full

              bg-orange-500
              hover:bg-orange-600

              text-white

              font-bold

              rounded-2xl

              py-4

              transition
            "
          >

            {
              loading

                ? 'Updating Password...'

                : 'Update Password'
            }

          </button>

          {/* SECURITY NOTE */}
          <div className="
            text-center
          ">

            <p className="
              text-xs
              text-gray-500
            ">

              Authorized personnel only.
              Unauthorized access is prohibited.

            </p>

          </div>

        </div>

      </div>

    </div>
  )
}