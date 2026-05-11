'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../../lib/supabase'

import {
  useAuth,
} from '../../../contexts/AuthContext'

import ProtectedRoute
from '../../../components/ProtectedRoute'

export default function Page() {

  const {
    userData,
  } = useAuth()

  const [assignments, setAssignments] =
    useState<any[]>([])

  // LOAD TASKS
  const loadTasks = async () => {

    if (!userData?.email) return

    // EMPLOYEE RECORD
    const { data: employee } =
      await supabase
        .from('employees')
        .select('*')
        .eq('email', userData.email)
        .single()

    if (!employee) return

    // ASSIGNMENTS
    const { data } = await supabase
      .from('assignments')
      .select(`
        *,
        activities(
          title,
          description,
          activity_date,
          activity_time
        )
      `)
      .eq('employee_id', employee.id)
      .order('created_at', {
        ascending: false,
      })

    setAssignments(data || [])
  }

  // UPDATE STATUS
  const updateStatus = async (
    id: string,
    status: string
  ) => {

    const { error } = await supabase
      .from('assignments')
      .update({
        status,
      })
      .eq('id', id)

    if (error) {
      return alert(error.message)
    }

    loadTasks()
  }

  useEffect(() => {
    loadTasks()
  }, [userData])

  // STATUS COLORS
  const getStatusStyle = (
    status: string
  ) => {

    if (status === 'completed') {
      return `
        bg-green-100
        text-green-700
        border-green-300
      `
    }

    if (status === 'ongoing') {
      return `
        bg-blue-100
        text-blue-700
        border-blue-300
      `
    }

    if (status === 'cancelled') {
      return `
        bg-red-100
        text-red-700
        border-red-300
      `
    }

    return `
      bg-orange-100
      text-orange-700
      border-orange-300
    `
  }

  return (

    <ProtectedRoute
      allowedRoles={[
        'staff',
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
            My Tasks
          </h1>

          <p className="text-gray-700">
            Personnel activity assignments
          </p>

        </div>

        {/* TASK LIST */}
        <div className="space-y-5">

          {assignments.length === 0 ? (

            <div className="
              bg-white
              rounded-2xl
              shadow
              p-8
              text-center
              text-gray-600
            ">
              No assignments found.
            </div>

          ) : (

            assignments.map((assign: any) => (

              <div
                key={assign.id}
                className="
                  bg-white
                  rounded-2xl
                  shadow-lg
                  p-6
                  border
                "
              >

                {/* TITLE */}
                <div className="
                  flex items-start
                  justify-between
                  gap-4
                ">

                  <div>

                    <h2 className="
                      text-2xl
                      font-bold
                      text-blue-900
                    ">
                      {assign.activities?.title}
                    </h2>

                    <p className="
                      text-gray-700
                      mt-2
                    ">
                      {assign.activities?.description}
                    </p>

                  </div>

                  {/* STATUS */}
                  <span
                    className={`
                      px-4 py-2
                      rounded-full
                      border
                      text-sm
                      font-medium
                      ${getStatusStyle(
                        assign.status
                      )}
                    `}
                  >
                    {assign.status || 'pending'}
                  </span>

                </div>

                {/* DETAILS */}
                <div className="
                  mt-5
                  grid md:grid-cols-2
                  gap-4
                  text-black
                ">

                  <div>

                    <p className="
                      text-sm
                      text-gray-500
                    ">
                      Activity Date
                    </p>

                    <p className="font-medium">
                      {assign.activities?.activity_date}
                    </p>

                  </div>

                  <div>

                    <p className="
                      text-sm
                      text-gray-500
                    ">
                      Activity Time
                    </p>

                    <p className="font-medium">
                      {assign.activities?.activity_time}
                    </p>

                  </div>

                </div>

                {/* ACTIONS */}
                <div className="
                  mt-6
                  flex flex-wrap
                  gap-3
                ">

                  <button
                    onClick={() =>
                      updateStatus(
                        assign.id,
                        'ongoing'
                      )
                    }
                    className="
                      bg-blue-500
                      hover:bg-blue-600
                      text-white
                      px-4 py-2
                      rounded-xl
                      shadow
                    "
                  >
                    Mark Ongoing
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        assign.id,
                        'completed'
                      )
                    }
                    className="
                      bg-green-500
                      hover:bg-green-600
                      text-white
                      px-4 py-2
                      rounded-xl
                      shadow
                    "
                  >
                    Mark Complete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </ProtectedRoute>
  )
}