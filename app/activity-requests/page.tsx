'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../lib/supabase'

import {
  useAuth,
} from '../../contexts/AuthContext'

import ProtectedRoute
from '../../components/ProtectedRoute'

export default function Page() {

  const {
    userData,
  } = useAuth()

  const [requests, setRequests] =
    useState<any[]>([])

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [date, setDate] =
    useState('')

  const [time, setTime] =
    useState('')

  // LOAD REQUESTS
  const loadRequests = async () => {

    const { data } = await supabase
      .from('activity_requests')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    setRequests(data || [])
  }

  // CREATE REQUEST
  const createRequest = async () => {

    if (!title) {
      return alert(
        'Activity title required'
      )
    }

    const { error } = await supabase
      .from('activity_requests')
      .insert([
        {
          request_type: 'create',
          activity_title: title,
          description,
          activity_date: date,
          activity_time: time,
          requested_by:
            userData?.email,
        },
      ])

    if (error) {
      return alert(error.message)
    }

    setTitle('')
    setDescription('')
    setDate('')
    setTime('')

    loadRequests()
  }

  // APPROVE REQUEST
  const approveRequest = async (
    request: any
  ) => {

    // CREATE ACTIVITY
    const { error } = await supabase
      .from('activities')
      .insert([
        {
          title:
            request.activity_title,

          description:
            request.description,

          activity_date:
            request.activity_date,

          activity_time:
            request.activity_time,
        },
      ])

    if (error) {
      return alert(error.message)
    }

    // UPDATE REQUEST
    await supabase
      .from('activity_requests')
      .update({
        status: 'approved',
      })
      .eq('id', request.id)

    loadRequests()
  }

  // REJECT
  const rejectRequest = async (
    id: string
  ) => {

    await supabase
      .from('activity_requests')
      .update({
        status: 'rejected',
      })
      .eq('id', id)

    loadRequests()
  }

  useEffect(() => {
    loadRequests()
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
            Activity Requests
          </h1>

          <p className="text-gray-700">
            Operational activity approvals
          </p>

        </div>

        {/* OFFICE CHIEF FORM */}
        {userData?.role ===
          'office_chief' && (

          <div className="
            bg-white
            rounded-2xl
            shadow
            p-6
          ">

            <h2 className="
              text-xl
              font-semibold
              text-blue-900
              mb-5
            ">
              Request New Activity
            </h2>

            <div className="
              grid md:grid-cols-2
              gap-4
            ">

              <input
                placeholder="Activity Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="
                  border rounded-xl
                  p-3 text-black
                "
              />

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="
                  border rounded-xl
                  p-3 text-black
                "
              />

              <input
                type="time"
                value={time}
                onChange={(e) =>
                  setTime(e.target.value)
                }
                className="
                  border rounded-xl
                  p-3 text-black
                "
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="
                  border rounded-xl
                  p-3 text-black
                "
              />

            </div>

            <button
              onClick={createRequest}
              className="
                mt-5
                bg-orange-500
                hover:bg-orange-600
                text-white
                px-5 py-3
                rounded-xl
                shadow
              "
            >
              Submit Request
            </button>

          </div>

        )}

        {/* REQUESTS */}
        <div className="space-y-4">

          {requests.map((req: any) => (

            <div
              key={req.id}
              className="
                bg-white
                rounded-2xl
                shadow
                p-6
              "
            >

              <div className="
                flex items-start
                justify-between
                gap-4
              ">

                <div>

                  <h2 className="
                    text-xl
                    font-bold
                    text-blue-900
                  ">
                    {req.activity_title}
                  </h2>

                  <p className="
                    text-gray-700
                    mt-2
                  ">
                    {req.description}
                  </p>

                  <p className="
                    text-sm
                    text-gray-500
                    mt-3
                  ">
                    Requested By:
                    {' '}
                    {req.requested_by}
                  </p>

                </div>

                <span className="
                  px-4 py-2
                  rounded-full
                  bg-orange-100
                  text-orange-700
                  text-sm
                  font-medium
                ">
                  {req.status}
                </span>

              </div>

              {/* ADMIN ACTIONS */}
              {userData?.role ===
                'admin' &&

                req.status ===
                'pending' && (

                <div className="
                  mt-5
                  flex gap-3
                ">

                  <button
                    onClick={() =>
                      approveRequest(req)
                    }
                    className="
                      bg-green-500
                      hover:bg-green-600
                      text-white
                      px-4 py-2
                      rounded-xl
                    "
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      rejectRequest(req.id)
                    }
                    className="
                      bg-red-500
                      hover:bg-red-600
                      text-white
                      px-4 py-2
                      rounded-xl
                    "
                  >
                    Reject
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </ProtectedRoute>
  )
}