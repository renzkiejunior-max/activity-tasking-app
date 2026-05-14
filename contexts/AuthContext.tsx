'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase }
from '@/lib/supabase'

const AuthContext =
  createContext<any>(null)

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const [userData,
    setUserData] =
    useState<any>(null)

  const [loading,
    setLoading] =
    useState(true)

  // LOAD USER
  const loadUser =
    async () => {

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser()

      // NOT LOGGED IN
      if (!user) {

        setUserData(null)

        setLoading(false)

        return
      }

      // GET USER TABLE
      const {
        data,
        error,
      } = await supabase

        .from('users')

        .select('*')

        .eq(
          'id',
          user.id
        )

        .single()

      if (error || !data) {

        console.error(error)

        setLoading(false)

        return
      }


// SAFE ROLE HANDLING
const roles =

  data.roles?.length

    ? data.roles

    : data.role

      ? [data.role]

      : ['staff']


      // FINAL USER DATA

setUserData({

  ...data,

  role:
    data.roles,

})



      setLoading(false)
    }

  useEffect(() => {

    loadUser()

    // AUTH LISTENER
    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        () => {

          loadUser()

        }
      )

    return () => {

      listener
        .subscription
        .unsubscribe()

    }

  }, [])

  return (

    <AuthContext.Provider

      value={{

        userData,

        loading,

        hasRole: (
          role: string
        ) =>

          userData?.roles
            ?.includes(role),

      }}
    >

      {children}

    </AuthContext.Provider>
  )
}

// CUSTOM HOOK
export const useAuth = () =>
  useContext(AuthContext)