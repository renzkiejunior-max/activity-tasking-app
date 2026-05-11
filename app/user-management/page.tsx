'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../lib/supabase'

import ProtectedRoute
from '../../components/ProtectedRoute'

export default function Page() {

  const [users, setUsers] =
    useState<any[]>([])

  const [email, setEmail] =
    useState('')

  const [role, setRole] =
    useState('staff')

  const [division, setDivision] =
    useState('')

  // LOAD USERS
  const loadUsers = async () => {

    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    setUsers(data || [])
  }

  // CREATE USER RECORD
  const createUser = async () => {

    if (!email) {
      return alert(
        'Email required'
      )
    }

    const { error } = await supabase
      .from('users')
      .insert([
        {
          email,
          role,
          division,
        },
      ])

    if (error) {
      return alert(error.message)
    }

    setEmail('')
    setRole('staff')
    setDivision('')

    loadUsers()
  }

  // UPDATE ROLE
  const updateRole = async (
    id: string,
    role: string
  ) => {

    await supabase
      .from('users')
      .update({
        role,
      })
      .eq('id', id)

    loadUsers()
  }

  // DELETE USER
  const deleteUser = async (
    id: string
  ) => {

    const confirmDelete =
      confirm(
        'Delete user?'
      )

    if (!confirmDelete) return

    await supabase
      .from('users')
      .delete()
      .eq('id', id)

    loadUsers()
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (

    <ProtectedRoute
      allowedRoles={[
        'admin',
      ]}
    >

      <div className="space-y-6">

        {/* HEADER */}
        <div>

          <h1 className="
            text-3xl
            font-bold
            text-blue-900
          ">
            User Management
          </h1>

          <p className="text-gray-700">
            Organizational account administration
          </p>

        </div>

        {/* CREATE USER */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <h2 className="
            text-xl
            font-bold
            text-blue-900
            mb-5
          ">
            Create User Record
          </h2>

          <div className="
            grid md:grid-cols-3
            gap-4
          ">

            {/* EMAIL */}
            <input
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="
                border rounded-xl
                p-3 text-black
              "
            />

            {/* ROLE */}
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="
                border rounded-xl
                p-3 text-black
              "
            >

              <option value="staff">
                Staff
              </option>

              <option value="chief">
                Division Chief
              </option>

              <option value="office_chief">
                Office Chief
              </option>

              <option value="admin">
                Admin
              </option>

            </select>

            {/* DIVISION */}
            <select
              value={division}
              onChange={(e) =>
                setDivision(e.target.value)
              }
              className="
                border rounded-xl
                p-3 text-black
              "
            >

              <option value="">
                Select Division
              </option>

              <option value="Admin and Training Division">
                Admin and Training Division
              </option>

              <option value="Operations and Warning Division">
                Operations and Warning Division
              </option>

              <option value="Planning and Research Division">
                Planning and Research Division
              </option>

              <option value="Executive Office">
                Executive Office
              </option>

            </select>

          </div>

          <button
            onClick={createUser}
            className="
              mt-5
              bg-orange-500
              hover:bg-orange-600
              text-white
              px-5 py-3
              rounded-xl
              shadow-lg
            "
          >
            Create User Record
          </button>

        </div>

        {/* USER TABLE */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          overflow-hidden
          border
        ">

          <div className="
            p-5
            border-b
          ">

            <h2 className="
              text-xl
              font-bold
              text-blue-900
            ">
              Users
            </h2>

          </div>

          <div className="
            overflow-x-auto
          ">

            <table className="w-full">

              <thead className="
                bg-blue-50
                text-blue-900
              ">

                <tr>

                  <th className="
                    text-left
                    p-4
                  ">
                    Email
                  </th>

                  <th className="
                    text-left
                    p-4
                  ">
                    Role
                  </th>

                  <th className="
                    text-left
                    p-4
                  ">
                    Division
                  </th>

                  <th className="
                    text-left
                    p-4
                  ">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="
                text-black
              ">

                {users.map(
                  (user: any) => (

                  <tr
                    key={user.id}
                    className="
                      border-t
                      hover:bg-gray-50
                    "
                  >

                    <td className="p-4">
                      {user.email}
                    </td>

                    <td className="
                      p-4
                      font-medium
                    ">
                      {user.role}
                    </td>

                    <td className="p-4">
                      {user.division}
                    </td>

                    <td className="
                      p-4
                      flex gap-3
                    ">

                      <button
                        onClick={() =>
                          updateRole(
                            user.id,
                            'staff'
                          )
                        }
                        className="
                          bg-blue-500
                          hover:bg-blue-600
                          text-white
                          px-3 py-1
                          rounded-lg
                        "
                      >
                        Staff
                      </button>

                      <button
                        onClick={() =>
                          updateRole(
                            user.id,
                            'chief'
                          )
                        }
                        className="
                          bg-orange-500
                          hover:bg-orange-600
                          text-white
                          px-3 py-1
                          rounded-lg
                        "
                      >
                        Chief
                      </button>

                      <button
                        onClick={() =>
                          updateRole(
                            user.id,
                            'office_chief'
                          )
                        }
                        className="
                          bg-purple-500
                          hover:bg-purple-600
                          text-white
                          px-3 py-1
                          rounded-lg
                        "
                      >
                        Office Chief
                      </button>

                      <button
                        onClick={() =>
                          deleteUser(user.id)
                        }
                        className="
                          bg-red-500
                          hover:bg-red-600
                          text-white
                          px-3 py-1
                          rounded-lg
                        "
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </ProtectedRoute>
  )
}