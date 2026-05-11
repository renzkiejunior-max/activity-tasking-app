'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../lib/supabase'

const AuthContext =
  createContext<any>(null)

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const [userData, setUserData] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  // LOAD USER
  const loadUser =
    async () => {

      // AUTH USER
      const {
        data: { user },
      } = await supabase
        .auth
        .getUser()

      // NO LOGIN
      if (!user) {

        setUserData(null)

        setLoading(false)

        return
      }

      // USERS TABLE
      const {
        data: userRecord,
      } = await supabase

        .from('users')

        .select('*')

        .eq(
          'email',
          user.email
        )

        .single()

      // EMPLOYEE TABLE
      const {
        data: employee,
      } = await supabase

        .from('employees')

        .select('*')

        .eq(
          'email',
          user.email
        )

        .single()

      // FINAL USER DATA
      setUserData({

        // AUTH
        id: user.id,

        email:
          user.email,

        // ROLE
        role:
          userRecord?.role ||
          'staff',

        // EMPLOYEE INFO
        name:
          employee?.name ||
          'User',

        photo_url:
          employee?.photo_url ||
          null,

      })

      setLoading(false)
  }

  useEffect(() => {

    loadUser()

    // REALTIME AUTH
    const {
      data: listener,
    } = supabase.auth
      .onAuthStateChange(
        async () => {

        await loadUser()

      })

    return () => {

      listener.subscription
        .unsubscribe()

    }

  }, [])

  return (

    <AuthContext.Provider
      value={{
        userData,
        loading,
      }}
    >

      {children}

    </AuthContext.Provider>

  )
}

// CUSTOM HOOK
export const useAuth = () =>
  useContext(AuthContext)