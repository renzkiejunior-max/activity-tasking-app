'use client'

import Sidebar
from '@/components/Sidebar'

import Topbar
from '@/components/Topbar'

import { useAuth }
from '@/contexts/AuthContext'

import {
  useRouter,
} from 'next/navigation'

import {
  useEffect,
} from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const {
    userData,
    loading,
  } = useAuth()

  const router =
    useRouter()

  // REDIRECT
  useEffect(() => {

    if (
      !loading &&
      !userData
    ) {

      router.push('/login')

    }

  }, [
    userData,
    loading,
  ])

  // LOADING
  if (loading) {

    return (

      <div className="
        min-h-screen

        flex
        items-center
        justify-center

        bg-gray-100
      ">

        <div className="
          text-2xl
          font-bold
          text-blue-900
        ">

          Loading...

        </div>

      </div>
    )
  }

  // NOT LOGGED IN
  if (!userData) {

    return null
  }

  return (

    <div className="
      flex
      min-h-screen
    ">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="
        flex-1
        flex
        flex-col

        lg:ml-72
      ">

        {/* TOPBAR */}
        <Topbar />

        {/* CONTENT */}
        <main className="
          flex-1

          p-4
          md:p-8

          pt-24
          md:pt-8

          overflow-x-hidden
        ">

          {children}

        </main>

      </div>

    </div>
  )
}