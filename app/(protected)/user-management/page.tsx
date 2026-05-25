'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../../lib/supabase'

import ProtectedRoute
from '../../../components/ProtectedRoute'

export default function Page() {

  const [users, setUsers] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(false)

  const [search, setSearch] =
    useState('')

  const [showForm,
    setShowForm] =
    useState(false)

    const [showAnalytics,
  setShowAnalytics] =
  useState(false)

  const [editingUser,
    setEditingUser] =
    useState<any>(null)

  const [email, setEmail] =
    useState('')

  const [roles, setRole] =
    useState('staff')

  const [division, setDivision] =
    useState('')

  // LOAD USERS
  const loadUsers = async () => {

    setLoading(true)

    const { data } = await supabase

      .from('users')

      .select('*')

      .order('created_at', {
        ascending: false,
      })

    setUsers(data || [])

    setLoading(false)
  }

  // RESET FORM
  const resetForm = () => {

    setEmail('')
    setRole('staff')
    setDivision('')
    setEditingUser(null)
  }

  // SAVE USER
  const saveUser = async () => {

    if (!email) {

      return alert(
        'Email required'
      )
    }

    // EDIT
    if (editingUser) {

      const { error } =
        await supabase

          .from('users')

          .update({

            email,
            roles,
            division,

          })

          .eq(
            'id',
            editingUser.id
          )

      if (error) {

        return alert(
          error.message
        )
      }

      alert(
        'User updated successfully'
      )

    } else {

      // CREATE USER USING API
try {

  setLoading(true)

  const response =
    await fetch(

      '/api/create-user',

      {

        method: 'POST',

        headers: {

          'Content-Type':
            'application/json',

        },

        body: JSON.stringify({

          email,

          role: roles,

          division,

        }),

      }
    )

  const result =
    await response.json()

  setLoading(false)

  if (!response.ok) {

    return alert(
      result.error
    )
  }

  alert(

    `User created successfully.

Temporary Password:
${result.temporaryPassword}`
  )

} catch (error: any) {

  setLoading(false)

  return alert(
    error.message
  )
}
    }

    resetForm()

    setShowForm(false)

    loadUsers()
  }

  // EDIT USER
  const editUser = (
    user: any
  ) => {

    setEditingUser(user)

    setEmail(
      user.email || ''
    )

    setRole(
      user.roles ||
      user.role ||
      'staff'
    )

    setDivision(
      user.division || ''
    )

    setShowForm(true)
  }

  // UPDATE ROLE
  const updateRole = async (
    id: string,
    role: string
  ) => {

    await supabase

      .from('users')

      .update({
        roles: role,
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

    if (!confirmDelete)
      return

    await supabase

      .from('users')

      .delete()

      .eq('id', id)

    loadUsers()
  }

  // FILTERED USERS
  const filteredUsers =
    users.filter(
      (user: any) =>

        user.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        user.division
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        (
          user.roles ||
          user.role
        )

          ?.toLowerCase()

          .includes(
            search.toLowerCase()
          )
    )

  useEffect(() => {

    loadUsers()

  }, [])

  return (

    <ProtectedRoute
      allowedRoles={[
        'admin',
      ]}
    >

      <div className="
  w-full

  max-w-7xl
  mx-auto

  min-w-0

  overflow-x-hidden

  space-y-4
  lg:space-y-6

  p-3
  lg:p-6
">

        {/* HEADER CARD */}
        <div className="
  w-full
  max-w-full
  min-w-0

  overflow-hidden

  bg-linear-to-r
  from-blue-900
  via-blue-700
  to-orange-500

  rounded-2xl
  lg:rounded-3xl

  shadow-2xl

  p-4
  lg:p-8

  flex
  flex-col

  lg:flex-row

  lg:items-center
  lg:justify-between

  gap-6
">

          {/* LEFT */}
          <div className="
  min-w-0
  w-full
">

            <div className="
              inline-flex
              items-center
              gap-2

              bg-white/20

              text-white

              px-4 py-2

              rounded-full

              text-sm
              font-semibold
            ">

              👥 User Administration

            </div>

            <h1 className="
              text-2xl
              lg:text-5xl

              font-black

              text-white

              mt-4
            ">

              User Management

            </h1>

            <p className="
              text-orange-50
              text-sm
lg:text-lg

mt-3

max-w-full
lg:max-w-2xl

wrap-break-word
leading-relaxed
            ">

              Manage organizational
              accounts,
              permissions,
              divisions,
              and system roles.

            </p>

          </div>

          {/* RIGHT */}
          <div className="
  w-full
  lg:w-auto
">

            <button

              onClick={() => {

                resetForm()

                setShowForm(
                  !showForm
                )

              }}

              className="
  bg-white
  hover:bg-orange-100

  text-orange-600

  px-6 py-4

  rounded-2xl

  shadow-xl

  font-bold
  text-sm
  lg:text-lg

  flex
  items-center
  gap-3
"
            >

              <span className="
                text-2xl
              ">

                {
                  showForm
                    ? '×'
                    : '+'
                }

              </span>

              {
                showForm

                  ? 'Close Form'

                  : 'Add User'
              }

            </button>

          </div>

        </div>

{/* ANALYTICS TOGGLE */}
<div className="
  flex
  justify-end
">

  <button

    onClick={() =>
      setShowAnalytics(
        !showAnalytics
      )
    }

    className="
      bg-blue-600
      hover:bg-blue-700

      text-white

      px-4
      py-3

      rounded-2xl

      font-semibold

      shadow-lg
    "
  >

    {
      showAnalytics

        ? 'Hide Analytics'

        : 'Show Analytics'
    }

  </button>

</div>

        {/* KPI */}
{showAnalytics && (

<div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        ">

          {/* TOTAL */}
          <div className="
            bg-white
            rounded-3xl
            shadow-lg
            border
            p-6
          ">

            <p className="
              text-gray-500
              text-sm
            ">
              Total Users
            </p>

            <h2 className="
              text-4xl
              font-black
              text-blue-900
              mt-2
            ">

              {users.length}

            </h2>

          </div>

                    {/* ADMINS */}
          <div className="
            bg-white
            rounded-3xl
            shadow-lg
            border
            p-6
          ">

            <p className="
              text-gray-500
              text-sm
            ">
              Admin Accounts
            </p>

            <h2 className="
              text-4xl
              font-black
              text-orange-500
              mt-2
            ">

              {
                users.filter(
                  (u: any) =>

                    (
                      u.roles ||
                      u.role
                    ) === 'admin'

                ).length
              }

            </h2>

          </div>
          

          {/* STAFF */}
          <div className="
            bg-white
            rounded-3xl
            shadow-lg
            border
            p-6
          ">

            <p className="
              text-gray-500
              text-sm
            ">
              Staff Accounts
            </p>

            <h2 className="
              text-4xl
              font-black
              text-green-600
              mt-2
            ">

              {
                users.filter(
                  (u: any) =>

                    (
                      u.roles ||
                      u.role
                    ) === 'staff'

                ).length
              }

            </h2>

          </div>

        </div>

        )}

        {/* FORM */}
        {showForm && (

          <div className="
            bg-white
            rounded-3xl
            shadow-xl
            p-6
            border
          ">

            <h2 className="
              text-2xl
              font-bold
              text-blue-900
              mb-6
            ">

              {
                editingUser

                  ? 'Edit User'

                  : 'Create User'
              }

            </h2>

            <div className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
            ">

              {/* EMAIL */}
              <input
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-2xl
                  p-4
                "
              />

              {/* ROLE */}
              <select
                value={roles}
                onChange={(e) =>
                  setRole(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-2xl
                  p-4
                "
              >

                <option value="staff">
                  Staff
                </option>

                <option value="division_chief">
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
                  setDivision(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-2xl
                  p-4
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

            {/* ACTIONS */}
            <div className="
              flex
              gap-4
              mt-6
            ">

              <button

                onClick={saveUser}

                className="
                  bg-orange-500
                  hover:bg-orange-600

                  text-white

                  px-4 py-3
                  lg:px-6 lg:py-4

                  rounded-2xl

                  font-semibold
                "
              >

                {
                  editingUser

                    ? 'Save Changes'

                    : 'Create User'
                }

              </button>

              <button

                onClick={() => {

                  setShowForm(false)

                  resetForm()

                }}

                className="
                  bg-gray-300
                  hover:bg-gray-400

                  px-6 py-4

                  rounded-2xl
                "
              >

                Cancel

              </button>

            </div>

          </div>

        )}

        
          {/* TABLE CARD */}
<div className="
  bg-white

  rounded-2xl
  lg:rounded-3xl

  shadow-xl

  border

  overflow-hidden
">

  {/* TOP */}
  <div className="
    p-4
    lg:p-6

    border-b

    flex
    flex-col

    md:flex-row

    md:items-center
    md:justify-between

    gap-4
  ">

    <div>

      <h2 className="
        text-xl
        lg:text-2xl

        font-bold
        text-blue-900
      ">

        Users

      </h2>

      <p className="
        text-gray-500
        mt-1

        text-sm
        lg:text-base
      ">

        Organizational account records

      </p>

    </div>

    {/* SEARCH */}
    <input
      placeholder="Search users..."
      value={search}
      onChange={(e) =>
        setSearch(
          e.target.value
        )
      }
      className="
        border

        rounded-2xl

        px-4
        py-3

        w-full
        md:w-80

        min-w-0
      "
    />

  </div>

  {/* MOBILE USER CARDS */}
  <div className="
    lg:hidden

    space-y-4

    p-4
  ">

    {filteredUsers.map(
      (user: any) => (

      <div
        key={user.id}

        className="
          bg-white

          border

          rounded-2xl

          p-4

          shadow-sm
        "
      >

        {/* EMAIL */}
        <div>

          <h3 className="
            text-lg
            font-bold

            text-blue-900

            wrap-break-word
          ">

            {user.email}

          </h3>

        </div>

        {/* ROLE */}
        <div className="
          mt-4
        ">

          <span className={`
            inline-flex
            items-center

            px-3
            py-1.5

            rounded-full

            text-xs
            font-semibold

            ${
              (
                user.roles ||
                user.role
              ) === 'admin'

                ? `
                  bg-orange-100
                  text-orange-700
                `

                : (
                  user.roles ||
                  user.role
                ) ===
                  'division_chief'

                ? `
                  bg-blue-100
                  text-blue-700
                `

                : `
                  bg-green-100
                  text-green-700
                `
            }
          `}>

            {
              user.roles ||
              user.role
            }

          </span>

        </div>

        {/* DIVISION */}
        <div className="
          mt-4
        ">

          <p className="
            text-sm
            text-gray-500
          ">

            Division

          </p>

          <p className="
            text-sm
            font-medium

            text-gray-800

            wrap-break-word
          ">

            {
              user.division ||
              'N/A'
            }

          </p>

        </div>

        {/* ACTIONS */}
        <div className="
          mt-5

          flex
          gap-3
        ">

          <button

            onClick={() =>
              editUser(user)
            }

            className="
              flex-1

              bg-blue-600
              hover:bg-blue-700

              text-white

              py-3

              rounded-xl

              text-sm
              font-semibold
            "
          >

            Edit

          </button>

          <button

            onClick={() =>
              deleteUser(
                user.id
              )
            }

            className="
              flex-1

              bg-red-500
              hover:bg-red-600

              text-white

              py-3

              rounded-xl

              text-sm
              font-semibold
            "
          >

            Delete

          </button>

        </div>

      </div>

    ))}

    {/* EMPTY */}
    {!loading &&
      filteredUsers.length === 0 && (

      <div className="
        p-10

        text-center

        text-gray-500
      ">

        No users found.

      </div>

    )}

  </div>

  {/* DESKTOP TABLE */}
  <div className="
    hidden
    lg:block

    overflow-x-auto
  ">

    <table className="
      min-w-175

      w-full
    ">

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

      <tbody>

        {filteredUsers.map(
          (user: any) => (

          <tr
            key={user.id}

            className="
              border-t
              hover:bg-gray-50
            "
          >

            {/* EMAIL */}
            <td className="
              p-4

              font-medium

              text-black

              wrap-break-word
            ">

              {user.email}

            </td>

            {/* ROLE */}
            <td className="
              p-4
            ">

              <span className={`
                inline-flex
                items-center

                px-3
                py-1.5

                rounded-full

                text-sm
                font-semibold

                ${
                  (
                    user.roles ||
                    user.role
                  ) === 'admin'

                    ? `
                      bg-orange-100
                      text-orange-700
                    `

                    : (
                      user.roles ||
                      user.role
                    ) ===
                      'division_chief'

                    ? `
                      bg-blue-100
                      text-blue-700
                    `

                    : `
                      bg-green-100
                      text-green-700
                    `
                }

              `}>

                {
                  user.roles ||
                  user.role
                }

              </span>

            </td>

            {/* DIVISION */}
            <td className="
              p-4

              text-gray-700

              wrap-break-word
            ">

              {
                user.division ||
                'N/A'
              }

            </td>

            {/* ACTIONS */}
            <td className="
              p-4
            ">

              <div className="
                flex
                flex-col

                xl:flex-row

                gap-2
              ">

                <button

                  onClick={() =>
                    editUser(user)
                  }

                  className="
                    bg-blue-500
                    hover:bg-blue-600

                    text-white

                    px-4
                    py-2

                    rounded-xl
                  "
                >

                  Edit

                </button>

                <button

                  onClick={() =>
                    deleteUser(
                      user.id
                    )
                  }

                  className="
                    bg-red-500
                    hover:bg-red-600

                    text-white

                    px-4
                    py-2

                    rounded-xl
                  "
                >

                  Delete

                </button>

              </div>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

    {/* EMPTY */}
    {!loading &&
      filteredUsers.length === 0 && (

      <div className="
        p-10

        text-center

        text-gray-500
      ">

        No users found.

      </div>

    )}

  </div>

</div>

        </div>

    </ProtectedRoute>
  )
}