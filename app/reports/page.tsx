'use client'

import { useEffect, useState }
from 'react'

import { supabase }
from '../../lib/supabase'

import html2pdf
from 'html2pdf.js'

export default function Page() {

  const [activities, setActivities] =
    useState<any[]>([])

  const [selectedActivity, setSelectedActivity] =
    useState<any>(null)

  const [assignments, setAssignments] =
    useState<any[]>([])

  // LOAD ACTIVITIES
  const loadActivities = async () => {

    const { data } =
      await supabase
        .from('activities')
        .select('*')
        .order('activity_date', {
          ascending: false,
        })

    setActivities(data || [])
  }

  // LOAD ASSIGNMENTS
  const loadAssignments = async (
    activityId: string
  ) => {

    const { data } =
      await supabase
        .from('assignments')
        .select(`
          *,
          employees(
            name,
            designation,
            division,
            photo_url
          )
        `)
        .eq(
          'activity_id',
          activityId
        )

    setAssignments(data || [])
  }

  useEffect(() => {
    loadActivities()
  }, [])

  // SELECT ACTIVITY
  const handleSelectActivity =
    async (id: string) => {

      const activity =
        activities.find(
          (a: any) => a.id === id
        )

      setSelectedActivity(activity)

      loadAssignments(id)
    }

  // PRINT
  const printReport = () => {
    window.print()
  }

  // DOWNLOAD PDF
const downloadPDF = async () => {

  // DYNAMIC IMPORT
  const html2pdf =
    (await import(
      'html2pdf.js'
    )).default

  const element =
    document.getElementById(
      'print-area'
    )

  if (!element) return

  const options = {

    margin: 0.5,

    filename:
      `${
        selectedActivity?.title ||
        'report'
      }.pdf`,

    image: {
      type: 'jpeg' as const,
      quality: 1,
    },

    html2canvas: {
      scale: 2,
    },

    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation:
        'portrait' as const,
    },

  }

  html2pdf()
    .set(options)
    .from(element)
    .save()
}

  // STATUS COLOR
  const getStatusColor = (
    status: string
  ) => {

    if (status === 'completed') {
      return `
        bg-green-100
        text-green-700
      `
    }

    if (status === 'ongoing') {
      return `
        bg-blue-100
        text-blue-700
      `
    }

    if (status === 'cancelled') {
      return `
        bg-red-100
        text-red-700
      `
    }

    return `
      bg-orange-100
      text-orange-700
    `
  }

  return (

    <div className="
      space-y-6
      print:p-0
    ">

      {/* HEADER */}
      <div className="
        print:hidden
      ">

        <h1 className="
          text-4xl
          font-bold
          text-blue-900
        ">
          Printable Reports
        </h1>

        <p className="
          text-gray-600
          mt-2
        ">
          Generate operational
          assignment reports
        </p>

      </div>

      {/* CONTROLS */}
      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        border
        p-6

        print:hidden
      ">

        <div className="
          flex
          flex-col
          md:flex-row
          gap-4
        ">

          {/* SELECT */}
          <select

            onChange={(e) =>
              handleSelectActivity(
                e.target.value
              )
            }

            className="
              flex-1
              border
              rounded-xl
              p-4
              text-black
            "
          >

            <option value="">
              Select Activity
            </option>

            {activities.map(
              (activity: any) => (

              <option
                key={activity.id}
                value={activity.id}
              >

                {activity.title}

              </option>

            ))}

          </select>

          {/* BUTTONS */}
          <div className="
            flex gap-4
          ">

            {/* PRINT */}
            <button

              onClick={printReport}

              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-6 py-4
                rounded-xl
                shadow-lg
                font-semibold
              "
            >

              🖨️ Print Report

            </button>

            {/* PDF */}
            <button

              onClick={downloadPDF}

              className="
                bg-orange-500
                hover:bg-orange-600
                text-white
                px-6 py-4
                rounded-xl
                shadow-lg
                font-semibold
              "
            >

              📄 Download PDF

            </button>

          </div>

        </div>

      </div>

      {/* REPORT */}
      {selectedActivity && (

        <div
          id="print-area"
          className="
            bg-white
            rounded-3xl
            shadow-xl
            border
            p-10

            print:shadow-none
            print:border-none
          "
        >

          {/* GOVERNMENT HEADER */}
          <div className="
            text-center
            border-b-2
            border-black
            pb-6
          ">

            <h2 className="
              text-xl
              font-bold
            ">
              REPUBLIC OF THE PHILIPPINES
            </h2>

            <p className="
              mt-2
            ">
              Province of Iloilo
            </p>

            <p>
              Provincial Disaster Risk
              Reduction and Management Office
            </p>

            <h1 className="
              text-3xl
              font-bold
              mt-6
            ">
              ACTIVITY ASSIGNMENT REPORT
            </h1>

          </div>

          {/* ACTIVITY INFO */}
          <div className="
            mt-8
            space-y-3
          ">

            <p>

              <span className="
                font-bold
              ">
                Activity:
              </span>

              {' '}
              {selectedActivity.title}

            </p>

            <p>

              <span className="
                font-bold
              ">
                Date:
              </span>

              {' '}
              {
                selectedActivity
                  .activity_date
              }

            </p>

            <p>

              <span className="
                font-bold
              ">
                Time:
              </span>

              {' '}
              {
                selectedActivity
                  .activity_time
              }

            </p>

            <p>

              <span className="
                font-bold
              ">
                Description:
              </span>

              {' '}
              {
                selectedActivity
                  .description
              }

            </p>

          </div>

          {/* TABLE */}
          <div className="
            mt-10
            overflow-x-auto
          ">

            <table className="
              w-full
              border-collapse
            ">

              <thead>

                <tr className="
                  bg-gray-200
                ">

                  <th className="
                    border
                    p-3
                    text-left
                  ">
                    Personnel
                  </th>

                  <th className="
                    border
                    p-3
                    text-left
                  ">
                    Designation
                  </th>

                  <th className="
                    border
                    p-3
                    text-left
                  ">
                    Task
                  </th>

                  <th className="
                    border
                    p-3
                    text-left
                  ">
                    Deadline
                  </th>

                  <th className="
                    border
                    p-3
                    text-left
                  ">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {assignments.map(
                  (assign: any) => (

                  <tr key={assign.id}>

                    {/* PERSONNEL */}
                    <td className="
                      border
                      p-4
                    ">

                      <div className="
                        flex items-center
                        gap-3
                      ">

                        {assign.employees
                          ?.photo_url ? (

                          <img
                            src={
                              assign.employees
                                .photo_url
                            }
                            alt={
                              assign.employees
                                .name
                            }
                            className="
                              w-12 h-12
                              rounded-full
                              object-cover
                            "
                          />

                        ) : (

                          <div className="
                            w-12 h-12
                            rounded-full
                            bg-blue-100
                            text-blue-700

                            flex
                            items-center
                            justify-center

                            font-bold
                          ">

                            {
                              assign.employees
                                ?.name
                                ?.charAt(0)
                            }

                          </div>

                        )}

                        <div>

                          <p className="
                            font-bold
                          ">
                            {
                              assign.employees
                                ?.name
                            }
                          </p>

                          <p className="
                            text-sm
                            text-gray-600
                          ">
                            {
                              assign.employees
                                ?.division
                            }
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* DESIGNATION */}
                    <td className="
                      border
                      p-4
                    ">
                      {
                        assign.employees
                          ?.designation
                      }
                    </td>

                    {/* TASK */}
                    <td className="
                      border
                      p-4
                    ">
                      {assign.task}
                    </td>

                    {/* DEADLINE */}
                    <td className="
                      border
                      p-4
                    ">
                      {assign.deadline}
                    </td>

                    {/* STATUS */}
                    <td className="
                      border
                      p-4
                    ">

                      <span className={`
                        px-3 py-1
                        rounded-full
                        text-sm
                        font-semibold

                        ${getStatusColor(
                          assign.status
                        )}
                      `}>

                        {assign.status}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* SIGNATURE */}
          <div className="
            mt-20
            flex
            justify-end
          ">

            <div className="
              text-center
              w-72
            ">

              <div className="
                border-b
                border-black
                pb-10
              " />

              <p className="
                mt-3
                font-bold
              ">
                Office Chief
              </p>

              <p className="
                text-sm
              ">
                PDRRMO
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}