'use client'

import {
  useEffect,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  useAuth,
} from '../contexts/AuthContext'

export default function ProtectedRoute({

  children,
  allowedRoles,

}: {

  children: React.ReactNode
  allowedRoles: string[]

}) {

  const router =
    useRouter()

  const {
    userData,
    loading,
  } = useAuth()

  // ACCESS CHECK
  const hasAccess =

    allowedRoles.includes(
      userData?.role
    )

  useEffect(() => {

    // WAIT
    if (loading) return

    // NOT LOGGED IN
    if (!userData) {

      router.push('/login')

      return
    }

    // ROLE NOT ALLOWED
    if (!hasAccess) {

      router.push(
        '/unauthorized'
      )

    }

  }, [

    userData,
    loading,
    router,
    hasAccess,

  ])

  // LOADING
  if (loading) {

    return (

      <div className="
        flex
        items-center
        justify-center

        min-h-screen

        text-xl
        font-semibold
      ">

        Loading...

      </div>
    )
  }

  // BLOCK
  if (
    !userData ||
    !hasAccess
  ) {

    return null
  }

  return <>{children}</>
}
