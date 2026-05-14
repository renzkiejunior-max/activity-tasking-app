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

  // EMPLOYEES
  const [employees,
    setEmployees] =
    useState<any[]>([])

  // SHOW FORM
  const [showAddForm,
    setShowAddForm] =
    useState(false)

  // ADD FORM
  const [name, setName] =
    useState('')

  const [designation,
    setDesignation] =
    useState('')

  const [division,
    setDivision] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [status, setStatus] =
    useState('active')

  const [photo, setPhoto] =
    useState<any>(null)

  // FOCAL PERSON
  const [focalTitle,
    setFocalTitle] =
    useState('')

  const [focalDescription,
    setFocalDescription] =
    useState('')

  // EDIT STATES
  const [editingEmployee,
    setEditingEmployee] =
    useState<any>(null)

  const [editName,
    setEditName] =
    useState('')

  const [editDesignation,
    setEditDesignation] =
    useState('')

  const [editDivision,
    setEditDivision] =
    useState('')

  const [editEmail,
    setEditEmail] =
    useState('')

  const [editStatus,
    setEditStatus] =
    useState('active')

  const [editPhoto,
    setEditPhoto] =
    useState<any>(null)

  // FETCH EMPLOYEES
  const fetchEmployees =
    async () => {

      const { data } =
        await supabase

          .from('employees')

          .select(`
            *,
            focal_persons(
              id,
              title,
              description
            )
          `)

          .order(
            'created_at',
            {
              ascending: false,
            }
          )

      setEmployees(
        data || []
      )
    }

  // ADD EMPLOYEE
  const addEmployee =
    async () => {

      if (!name) {

        return alert(
          'Name required'
        )
      }

      let photo_url = ''

      // PHOTO UPLOAD
      if (photo) {

        const fileName =
          `${Date.now()}-${photo.name}`

        const {
          error: uploadError,
        } = await supabase.storage

          .from(
            'employee-photos'
          )

          .upload(
            fileName,
            photo
          )

        if (uploadError) {

          return alert(
            uploadError.message
          )
        }

        const {
          data: publicUrlData,
        } = supabase.storage

          .from(
            'employee-photos'
          )

          .getPublicUrl(
            fileName
          )

        photo_url =
          publicUrlData.publicUrl
      }

      // INSERT
      const {
        error,
      } = await supabase

        .from('employees')

        .insert([

          {
            name,
            designation,
            division,
            email,
            status,
            photo_url,
          },

        ])

      if (error) {

        return alert(
          error.message
        )
      }

      // GET EMPLOYEE
      const {
        data: latestEmployee,
      } = await supabase

        .from('employees')

        .select('*')

        .eq(
          'email',
          email
        )

        .single()

      // INSERT FOCAL
      if (
        latestEmployee &&
        focalTitle
      ) {

        await supabase

          .from(
            'focal_persons'
          )

          .insert([

            {
              employee_id:
                latestEmployee.id,

              title:
                focalTitle,

              description:
                focalDescription,
            },

          ])
      }

      // RESET
      setName('')
      setDesignation('')
      setDivision('')
      setEmail('')
      setStatus('active')
      setPhoto(null)

      setFocalTitle('')
      setFocalDescription('')

      setShowAddForm(false)

      fetchEmployees()
    }

  // UPDATE
  const updateEmployee =
    async () => {

      if (!editingEmployee)
        return

      let photo_url =
        editingEmployee.photo_url || ''

      // NEW PHOTO
      if (editPhoto) {

        const fileName =
          `${Date.now()}-${editPhoto.name}`

        const {
          error: uploadError,
        } = await supabase.storage

          .from(
            'employee-photos'
          )

          .upload(
            fileName,
            editPhoto
          )

        if (uploadError) {

          return alert(
            uploadError.message
          )
        }

        const {
          data: publicUrlData,
        } = supabase.storage

          .from(
            'employee-photos'
          )

          .getPublicUrl(
            fileName
          )

        photo_url =
          publicUrlData.publicUrl
      }

      // UPDATE
      const {
        error,
      } = await supabase

        .from('employees')

        .update({

          name: editName,

          designation:
            editDesignation,

          division:
            editDivision,

          email:
            editEmail,

          status:
            editStatus,

          photo_url,

        })

        .eq(
          'id',
          editingEmployee.id
        )

      if (error) {

        return alert(
          error.message
        )
      }

      setEditingEmployee(null)

      fetchEmployees()
    }

  // DELETE
  const deleteEmployee =
    async (
      id: string
    ) => {

      const confirmDelete =
        confirm(
          'Delete employee?'
        )

      if (!confirmDelete)
        return

      const {
        error,
      } = await supabase

        .from('employees')

        .delete()

        .eq('id', id)

      if (error) {

        return alert(
          error.message
        )
      }

      fetchEmployees()
    }

  // LOAD
  useEffect(() => {

    fetchEmployees()

  }, [])

  return (

    <ProtectedRoute
      allowedRoles={[
        'admin',
        'office_chief',
      ]}
    >

      <div className="
        space-y-6
      ">

{/* HEADER CARD */}
<div className="
  bg-linear-to-r
  from-blue-800
  via-blue-600
  to-blue-400

  rounded-3xl

  shadow-2xl

  p-8

  flex
  flex-col
  lg:flex-row

  lg:items-center
  lg:justify-between

  gap-6
">

  {/* LEFT */}
  <div>

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

      backdrop-blur-sm
    ">

      👥 Personnel Management

    </div>

    <h1 className="
      text-4xl
      lg:text-5xl

      font-black

      text-white

      mt-4
    ">

      Employees

    </h1>

    <p className="
      text-orange-50

      text-lg

      mt-3

      max-w-2xl
    ">

      Manage employee records,
      focal assignments,
      divisions,
      operational roles,
      and personnel information.

    </p>

  </div>

  {/* RIGHT */}
  <div>

    <button

      onClick={() =>
        setShowAddForm(
          !showAddForm
        )
      }

      className="
        bg-white
        hover:bg-orange-100

        text-orange-600

        px-6 py-4

        rounded-2xl

        shadow-xl

        font-bold

        text-lg

        transition

        flex
        items-center
        gap-3
      "
    >

      <span className="
        text-2xl
        leading-none
      ">

        {showAddForm ? '×' : '+'}

      </span>

      {
        showAddForm

          ? 'Close Employee Form'

          : 'Add Employee'
      }

    </button>

  </div>

</div>

        {/* FORM */}
        {showAddForm && (

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

              Add Employee

            </h2>

            <div className="
              grid
              md:grid-cols-2
              gap-4
            ">

              <input
                placeholder="Name"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                "
              />

              <input
                placeholder="Designation"
                value={designation}
                onChange={(e) =>
                  setDesignation(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                "
              />

              <select
                value={division}
                onChange={(e) =>
                  setDivision(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
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

              </select>

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
                  rounded-xl
                  p-3
                "
              />

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                "
              >

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="suspended">
                  Suspended
                </option>

              </select>

              <input
                placeholder="Focal Person Title"
                value={focalTitle}
                onChange={(e) =>
                  setFocalTitle(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                "
              />

              <textarea
                placeholder="Focal Description"
                value={
                  focalDescription
                }
                onChange={(e) =>
                  setFocalDescription(
                    e.target.value
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                  md:col-span-2
                "
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setPhoto(
                    e.target.files?.[0]
                  )
                }
                className="
                  border
                  rounded-xl
                  p-3
                  md:col-span-2
                "
              />

            </div>

            <button
              onClick={addEmployee}
              className="
                mt-5

                bg-orange-500
                hover:bg-orange-600

                text-white

                px-5 py-3

                rounded-xl
              "
            >

              Add Employee

            </button>

          </div>

        )}

        {/* EDIT MODAL */}
        {editingEmployee && (

          <div className="
            fixed
            inset-0

            bg-black/50

            flex
            items-center
            justify-center

            z-50
            p-6
          ">

            <div className="
              bg-white
              rounded-3xl
              shadow-2xl

              w-full
              max-w-3xl

              p-6

              space-y-4
            ">

              <div className="
                flex
                justify-between
                items-center
              ">

                <h2 className="
                  text-2xl
                  font-bold
                  text-blue-900
                ">

                  Edit Employee

                </h2>

                <button

                  onClick={() =>
                    setEditingEmployee(
                      null
                    )
                  }

                  className="
                    text-red-500
                    text-xl
                    font-bold
                  "
                >

                  ✕

                </button>

              </div>

              <div className="
                grid
                md:grid-cols-2
                gap-4
              ">

                <input
                  placeholder="Name"
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                  className="
                    border
                    rounded-xl
                    p-3
                  "
                />

                <input
                  placeholder="Designation"
                  value={editDesignation}
                  onChange={(e) =>
                    setEditDesignation(
                      e.target.value
                    )
                  }
                  className="
                    border
                    rounded-xl
                    p-3
                  "
                />

                <input
                  placeholder="Division"
                  value={editDivision}
                  onChange={(e) =>
                    setEditDivision(
                      e.target.value
                    )
                  }
                  className="
                    border
                    rounded-xl
                    p-3
                  "
                />

                <input
                  placeholder="Email"
                  value={editEmail}
                  onChange={(e) =>
                    setEditEmail(
                      e.target.value
                    )
                  }
                  className="
                    border
                    rounded-xl
                    p-3
                  "
                />

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(
                      e.target.value
                    )
                  }
                  className="
                    border
                    rounded-xl
                    p-3
                  "
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="suspended">
                    Suspended
                  </option>

                </select>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditPhoto(
                      e.target.files?.[0]
                    )
                  }
                  className="
                    border
                    rounded-xl
                    p-3
                  "
                />

              </div>

              <div className="
                flex
                justify-end
                gap-3
              ">

                <button

                  onClick={() =>
                    setEditingEmployee(
                      null
                    )
                  }

                  className="
                    bg-gray-300
                    hover:bg-gray-400

                    px-5 py-3

                    rounded-xl
                  "
                >

                  Cancel

                </button>

                <button

                  onClick={
                    updateEmployee
                  }

                  className="
                    bg-blue-600
                    hover:bg-blue-700

                    text-white

                    px-5 py-3

                    rounded-xl
                  "
                >

                  Save Changes

                </button>

              </div>

            </div>

          </div>

        )}

        {/* TABLE */}
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

              Employee List

            </h2>

          </div>

          <div className="
            overflow-x-auto
          ">

            <table className="
              w-full
            ">

              <thead className="
                bg-blue-50
                text-blue-900
              ">

                <tr>

                  <th className="text-left p-4">
                    Photo
                  </th>

                  <th className="text-left p-4">
                    Name
                  </th>

                  <th className="text-left p-4">
                    Designation
                  </th>

                  <th className="text-left p-4">
                    Division
                  </th>

                  <th className="text-left p-4">
                    Email
                  </th>

                  <th className="text-left p-4">
                    Focal Assignment
                  </th>

                  <th className="text-left p-4">
                    Status
                  </th>

                  <th className="text-left p-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {employees.map(
                  (emp: any) => (

                  <tr
                    key={emp.id}
                    className="
                      border-t
                      hover:bg-gray-50
                    "
                  >

                    {/* PHOTO */}
                    <td className="
                      p-4
                    ">

                      {emp.photo_url ? (

                        <img
                          src={emp.photo_url}
                          alt={emp.name}
                          className="
                            w-14
                            h-14

                            rounded-full
                            object-cover
                          "
                        />

                      ) : (

                        <div className="
                          w-14
                          h-14

                          rounded-full

                          bg-blue-100
                          text-blue-700

                          flex
                          items-center
                          justify-center

                          font-bold
                        ">

                          {
                            emp.name?.charAt(0)
                          }

                        </div>

                      )}

                    </td>

                    <td className="
                      p-4
                      font-semibold
                    ">

                      {emp.name}

                    </td>

                    <td className="p-4">
                      {emp.designation}
                    </td>

                    <td className="p-4">
                      {emp.division}
                    </td>

                    <td className="p-4">
                      {emp.email}
                    </td>

                    {/* FOCAL */}
                    <td className="
                      p-4
                    ">

                      <div className="
                        space-y-2
                      ">

                        {emp.focal_persons
                          ?.length > 0 ? (

                          emp.focal_persons.map(
                            (
                              focal: any
                            ) => (

                            <div
                              key={focal.id}
                              className="
                                bg-orange-100
                                text-orange-700

                                px-3 py-2

                                rounded-xl

                                text-sm
                                font-medium
                              "
                            >

                              {focal.title}

                            </div>

                          ))

                        ) : (

                          <span className="
                            text-gray-400
                            text-sm
                          ">

                            No Assignment

                          </span>

                        )}

                      </div>

                    </td>

                    {/* STATUS */}
                    <td className="
                      p-4
                    ">

                      <span
                        className={`
                          px-3
                          py-1

                          rounded-full

                          text-sm
                          font-semibold

                          ${
                            emp.status ===
                            'active'

                              ? `
                                bg-green-100
                                text-green-700
                              `

                              : emp.status ===
                                'inactive'

                              ? `
                                bg-orange-100
                                text-orange-700
                              `

                              : `
                                bg-red-100
                                text-red-700
                              `
                          }
                        `}
                      >

                        {
                          emp.status ||
                          'active'
                        }

                      </span>

                    </td>

                    {/* ACTIONS */}
                    <td className="
                      p-4
                    ">

                      <div className="
                        flex
                        gap-2
                      ">

                        <button

                          onClick={() => {

                            setEditingEmployee(
                              emp
                            )

                            setEditName(
                              emp.name || ''
                            )

                            setEditDesignation(
                              emp.designation || ''
                            )

                            setEditDivision(
                              emp.division || ''
                            )

                            setEditEmail(
                              emp.email || ''
                            )

                            setEditStatus(
                              emp.status || 'active'
                            )
                          }}

                          className="
                            bg-blue-500
                            hover:bg-blue-600

                            text-white

                            px-4 py-2

                            rounded-xl
                          "
                        >

                          Edit

                        </button>

                        <button

                          onClick={() =>
                            deleteEmployee(
                              emp.id
                            )
                          }

                          className="
                            bg-red-500
                            hover:bg-red-600

                            text-white

                            px-4 py-2

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

          </div>

        </div>

      </div>

    </ProtectedRoute>
  )
}