'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({

  children,
  allowedRoles,

}: {

  children: React.ReactNode
  allowedRoles: string[]

}) {

  const router = useRouter()

  const {
    userData,
    loading,
  } = useAuth()

  useEffect(() => {

    // WAIT
    if (loading) return

    // NOT LOGGED IN
    if (!userData) {
      router.push('/login')
      return
    }

    // ROLE NOT ALLOWED
    if (
      !allowedRoles.includes(
        userData.role
      )
    ) {
      router.push('/unauthorized')
    }

  }, [
    userData,
    loading,
    router,
    allowedRoles,
  ])

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="
        flex items-center
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
    !allowedRoles.includes(userData.role)
  ) {
    return null
  }

  return <>{children}</>
}