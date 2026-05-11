'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Page() {

  const [email, setEmail] = useState('')
  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  // LOGIN
  const handleLogin = async () => {

    if (!email || !password) {
      return alert(
        'Enter email and password'
      )
    }

    setLoading(true)

    const { error } =
      await supabase.auth.signInWithPassword({

        email,
        password,

      })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    // WAIT SESSION SAVE
    setTimeout(() => {

  window.location.href =
    '/dashboard'

}, 1000)
  }

  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      bg-linear-to-br
      from-blue-100
      to-orange-100
      p-6
    ">

      <div className="
        bg-white
        rounded-3xl
        shadow-2xl
        p-8
        w-full
        max-w-md
        border border-gray-200
      ">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="
            w-20 h-20
            rounded-full
            bg-blue-900
            text-white
            flex items-center justify-center
            text-3xl
            font-bold
            mx-auto
          ">
            🔐
          </div>

          <h1 className="
            text-3xl
            font-bold
            text-blue-900
            mt-5
          ">
            Login
          </h1>

          <p className="text-gray-700 mt-2">
            Activity Tasking Management System
          </p>

        </div>

        {/* FORM */}
        <div className="space-y-4">

          <input
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

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
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

          <button
            onClick={handleLogin}
            disabled={loading}
            className="
              w-full
              bg-orange-500
              hover:bg-orange-600
              text-white
              font-semibold
              py-4
              rounded-xl
              shadow-lg
            "
          >

            {loading
              ? 'Logging in...'
              : 'Login'}

          </button>

        </div>

      </div>

    </div>
  )
}