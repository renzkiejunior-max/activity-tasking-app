'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import Sidebar
from '@/components/Sidebar'

import Topbar
from '@/components/Topbar'

import { supabase }
from '@/lib/supabase'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const router =
    useRouter()

  const [authorized, setAuthorized] =
    useState(false)

  useEffect(() => {

    const checkAuth =
      async () => {

      const {
        data,
        error,
      } = await supabase.auth.getUser()

      // NO USER
      if (
        error ||
        !data?.user
      ) {

        router.push('/login')
        return
      }

      // AUTHORIZED
      setAuthorized(true)
    }

    checkAuth()

  }, [])

  // LOADING
  if (!authorized) {

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
          Logging in...
        </div>

      </div>
    )
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