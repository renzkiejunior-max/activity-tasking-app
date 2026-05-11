'use client'

import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

import ProtectedRoute
from '../../components/ProtectedRoute'

export default function Page() {

  const [employees, setEmployees] =
    useState<any[]>([])

  const [name, setName] =
    useState('')

  const [designation, setDesignation] =
    useState('')

  const [division, setDivision] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [status, setStatus] =
    useState('active')

  const [photo, setPhoto] =
    useState<any>(null)

  // EDIT STATES
  const [editingEmployee, setEditingEmployee] =
    useState<any>(null)

  const [editName, setEditName] =
    useState('')

  const [editDesignation, setEditDesignation] =
    useState('')

  const [editDivision, setEditDivision] =
    useState('')

  const [editEmail, setEditEmail] =
    useState('')

  const [editStatus, setEditStatus] =
    useState('active')

  const [editPhoto, setEditPhoto] =
    useState<any>(null)

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {

    const { data } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    setEmployees(data || [])
  }

  // ADD EMPLOYEE
  const addEmployee = async () => {

    if (!name) {
      return alert('Name required')
    }

    let photo_url = ''

    // UPLOAD PHOTO
    if (photo) {

      const fileName =
        `${Date.now()}-${photo.name}`

      const {
        error: uploadError,
      } = await supabase.storage

        .from('employee-photos')

        .upload(
          fileName,
          photo
        )

      if (uploadError) {
        return alert(
          uploadError.message
        )
      }

      // GET PUBLIC URL
      const {
        data: publicUrlData,
      } = supabase.storage

        .from('employee-photos')

        .getPublicUrl(fileName)

      photo_url =
        publicUrlData.publicUrl
    }

    // INSERT
    const { error } = await supabase
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
      return alert(error.message)
    }

    // RESET
    setName('')
    setDesignation('')
    setDivision('')
    setEmail('')
    setStatus('active')
    setPhoto(null)

    fetchEmployees()
  }

  // UPDATE EMPLOYEE
  const updateEmployee = async () => {

    if (!editingEmployee) return

    let photo_url =
      editingEmployee.photo_url || ''

    // UPLOAD NEW PHOTO
    if (editPhoto) {

      const fileName =
        `${Date.now()}-${editPhoto.name}`

      const {
        error: uploadError,
      } = await supabase.storage

        .from('employee-photos')

        .upload(
          fileName,
          editPhoto
        )

      if (uploadError) {
        return alert(
          uploadError.message
        )
      }

      // GET URL
      const {
        data: publicUrlData,
      } = supabase.storage

        .from('employee-photos')

        .getPublicUrl(fileName)

      photo_url =
        publicUrlData.publicUrl
    }

    // UPDATE
    const { error } = await supabase
      .from('employees')
      .update({
        name: editName,
        designation: editDesignation,
        division: editDivision,
        email: editEmail,
        status: editStatus,
        photo_url,
      })
      .eq('id', editingEmployee.id)

    if (error) {
      return alert(error.message)
    }

    // RESET
    setEditingEmployee(null)

    setEditName('')
    setEditDesignation('')
    setEditDivision('')
    setEditEmail('')
    setEditStatus('active')
    setEditPhoto(null)

    fetchEmployees()
  }

  // DELETE EMPLOYEE
  const deleteEmployee = async (
    id: string
  ) => {

    const confirmDelete =
      confirm(
        'Delete employee?'
      )

    if (!confirmDelete) return

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      return alert(error.message)
    }

    fetchEmployees()
  }

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

      <div className="space-y-6">

        {/* HEADER */}
        <div>

          <h1 className="
            text-3xl
            font-bold
            text-blue-900
          ">
            Employees
          </h1>

          <p className="
            text-gray-700
          ">
            Personnel management system
          </p>

        </div>

        {/* FORM */}
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

            {/* NAME */}
            <input
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="
                border rounded-xl
                p-3 text-black
              "
            />

            {/* DESIGNATION */}
            <input
              placeholder="Designation"
              value={designation}
              onChange={(e) =>
                setDesignation(
                  e.target.value
                )
              }
              className="
                border rounded-xl
                p-3 text-black
              "
            />

            {/* DIVISION */}
            <select
              value={division}
              onChange={(e) =>
                setDivision(
                  e.target.value
                )
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

            </select>

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
                border rounded-xl
                p-3 text-black
              "
            />

            {/* STATUS */}
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="
                border rounded-xl
                p-3 text-black
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

            {/* PHOTO */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPhoto(
                  e.target.files?.[0]
                )
              }
              className="
                border rounded-xl
                p-3 text-black
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
              shadow-lg
              font-medium
            "
          >
            Add Employee
          </button>

        </div>

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

            <table className="w-full">

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
                    Status
                  </th>

                  <th className="text-left p-4">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="text-black">

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
                    <td className="p-4">

                      {emp.photo_url ? (

                        <img
                          src={emp.photo_url}
                          alt={emp.name}
                          className="
                            w-14 h-14
                            rounded-full
                            object-cover
                            border
                            shadow
                          "
                        />

                      ) : (

                        <div className="
                          w-14 h-14
                          rounded-full
                          bg-blue-100
                          text-blue-700
                          flex
                          items-center
                          justify-center
                          font-bold
                        ">

                          {emp.name?.charAt(0)}

                        </div>

                      )}

                    </td>

                    {/* NAME */}
                    <td className="
                      p-4
                      font-semibold
                    ">
                      {emp.name}
                    </td>

                    {/* DESIGNATION */}
                    <td className="p-4">
                      {emp.designation}
                    </td>

                    {/* DIVISION */}
                    <td className="p-4">
                      {emp.division}
                    </td>

                    {/* EMAIL */}
                    <td className="p-4">
                      {emp.email}
                    </td>

                    {/* STATUS */}
                    <td className="p-4">

                      <span
                        className={`
                          px-3 py-1
                          rounded-full
                          text-sm
                          font-semibold

                          ${
                            emp.status === 'active'
                              ? `
                                bg-green-100
                                text-green-700
                              `
                              : emp.status === 'inactive'
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

                        {emp.status || 'active'}

                      </span>

                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">

                      <div className="
                        flex gap-2
                      ">

                        <button
                          onClick={() => {

                            setEditingEmployee(emp)

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
                            shadow
                          "
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteEmployee(emp.id)
                          }
                          className="
                            bg-red-500
                            hover:bg-red-600
                            text-white
                            px-4 py-2
                            rounded-xl
                            shadow
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

      {/* EDIT MODAL */}
      {editingEmployee && (

        <div className="
          fixed inset-0
          bg-black/50
          flex items-center
          justify-center
          z-50
        ">

          <div className="
            bg-white
            rounded-3xl
            shadow-2xl
            p-8
            w-full
            max-w-2xl
            space-y-5
          ">

            <h2 className="
              text-2xl
              font-bold
              text-blue-900
              text-center
            ">
              Edit Employee
            </h2>

            {/* CURRENT PHOTO */}
            <div className="
              flex justify-center
            ">

              {editingEmployee.photo_url ? (

                <img
                  src={
                    editingEmployee.photo_url
                  }
                  alt={
                    editingEmployee.name
                  }
                  className="
                    w-28 h-28
                    rounded-full
                    object-cover
                    border-4
                    border-blue-200
                    shadow-lg
                  "
                />

              ) : (

                <div className="
                  w-28 h-28
                  rounded-full
                  bg-blue-100
                  text-blue-700
                  flex
                  items-center
                  justify-center
                  text-4xl
                  font-bold
                ">

                  {
                    editingEmployee.name?.charAt(0)
                  }

                </div>

              )}

            </div>

            <input
              value={editName}
              onChange={(e) =>
                setEditName(
                  e.target.value
                )
              }
              placeholder="Name"
              className="
                w-full
                border rounded-xl
                p-3 text-black
              "
            />

            <input
              value={editDesignation}
              onChange={(e) =>
                setEditDesignation(
                  e.target.value
                )
              }
              placeholder="Designation"
              className="
                w-full
                border rounded-xl
                p-3 text-black
              "
            />

            <select
              value={editDivision}
              onChange={(e) =>
                setEditDivision(
                  e.target.value
                )
              }
              className="
                w-full
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

            </select>

            <input
              value={editEmail}
              onChange={(e) =>
                setEditEmail(
                  e.target.value
                )
              }
              placeholder="Email"
              className="
                w-full
                border rounded-xl
                p-3 text-black
              "
            />

            {/* EDIT STATUS */}
            <select
              value={editStatus}
              onChange={(e) =>
                setEditStatus(
                  e.target.value
                )
              }
              className="
                w-full
                border rounded-xl
                p-3 text-black
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

            {/* CHANGE PHOTO */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditPhoto(
                  e.target.files?.[0]
                )
              }
              className="
                w-full
                border rounded-xl
                p-3 text-black
              "
            />

            {/* BUTTONS */}
            <div className="
              flex gap-4
              justify-end
            ">

              <button
                onClick={() =>
                  setEditingEmployee(null)
                }
                className="
                  bg-gray-300
                  hover:bg-gray-400
                  text-black
                  px-5 py-3
                  rounded-xl
                "
              >
                Cancel
              </button>

              <button
                onClick={updateEmployee}
                className="
                  bg-orange-500
                  hover:bg-orange-600
                  text-white
                  px-5 py-3
                  rounded-xl
                  shadow-lg
                "
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

    </ProtectedRoute>
  )
}