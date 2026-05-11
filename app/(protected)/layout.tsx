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

  const [loading, setLoading] =
    useState(true)

  const [authenticated,
    setAuthenticated] =
    useState(false)

  useEffect(() => {

    // CHECK SESSION
    const checkAuth =
      async () => {

      const {
        data: { session },
      } =
        await supabase.auth.getSession()

      // LOGGED IN
      if (session) {

        setAuthenticated(true)

      } else {

        router.push('/login')
      }

      setLoading(false)
    }

    checkAuth()

    // AUTH LISTENER
    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session
        ) => {

          if (session) {

            setAuthenticated(true)

          } else {

            setAuthenticated(false)

            router.push('/login')
          }
        }
      )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  // LOADING SCREEN
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

  // NOT AUTHENTICATED
  if (!authenticated) {

    return (

      <div className="
        min-h-screen
      " />

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