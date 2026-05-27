'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts'

import { supabase }
from '@/lib/supabase'

export default function Page() {

  const [
    divisions,
    setDivisions,
  ] = useState<any[]>([])

  const [
    selectedDivision,
    setSelectedDivision,
  ] = useState<any>(null)

  const [
    showAnalytics,
    setShowAnalytics,
  ] = useState(false)

  const COLORS = [

    '#2563eb',
    '#22c55e',
    '#f97316',
    '#ef4444',
    '#9333ea',

  ]

  // LOAD DATA
  const loadData =
    async () => {

      // EMPLOYEES
      const {
        data: employees,
      } = await supabase

        .from('employees')

        .select(`
          *,
          assignments(
            id,
            status,
            progress,
            task,
            activities(
              title,
              activity_date
            )
          ),
          focal_persons(
            id,
            title
          )
        `)

      if (!employees)
        return

      // GROUP DIVISIONS
      const grouped =

        employees.reduce(
          (
            acc: any,
            emp: any
          ) => {

            const division =
              emp.division ||
              'Unassigned'

            if (
              !acc[division]
            ) {

              acc[division] = {

                division,

                personnel: [],

                chief: null,

                activeAssignments: 0,

                available: 0,

                deployed: 0,

                activity: 0,

                inactive: 0,

                focals: [],

                operations: [],
              }
            }

            acc[division]
              .personnel
              .push(emp)

            // DIVISION CHIEF
            if (

              emp.designation
                ?.toLowerCase()
                .includes(
                  'division chief'
                )

            ) {

              acc[division]
                .chief = emp
            }

            // STATUS COUNTS
            const officeStatus =

              (
                emp.office_status ||
                'available'
              )
              .toLowerCase()

            if (
              officeStatus ===
              'available'
            ) {

              acc[division]
                .available++
            }

            if (
              officeStatus ===
              'deployed'
            ) {

              acc[division]
                .deployed++
            }

            if (
              officeStatus ===
              'activity'
            ) {

              acc[division]
                .activity++
            }

            if (
              emp.status ===
              'inactive'
            ) {

              acc[division]
                .inactive++
            }

            // ASSIGNMENTS
            const activeAssignments =

              emp.assignments
                ?.filter(
                  (a: any) =>

                    a.status !==
                    'completed'
                ) || []

            acc[division]
              .activeAssignments +=
              activeAssignments.length

            // OPERATIONS
            activeAssignments.forEach(
              (assign: any) => {

                if (
                  assign.activities
                    ?.title
                ) {

                  acc[division]
                    .operations
                    .push(
                      assign.activities
                        .title
                    )
                }
              }
            )

            // FOCALS
            emp.focal_persons
              ?.forEach(
                (focal: any) => {

                  acc[division]
                    .focals
                    .push(
                      focal.title
                    )
                }
              )

            return acc

          },

          {}
        )

      // REMOVE DUPLICATES
      const finalData =

        Object.values(
          grouped
        ).map(
          (division: any) => ({

            ...division,

            operations:
              [
                ...new Set(
                  division.operations
                ),
              ],

            focals:
              [
                ...new Set(
                  division.focals
                ),
              ],
          })
        )

      setDivisions(finalData)
    }

  // LOAD
  useEffect(() => {

    loadData()

  }, [])

  // ANALYTICS
  const totalDivisions =
    divisions.length

  const totalPersonnel =

    divisions.reduce(
      (
        acc: number,
        div: any
      ) =>

        acc +
        div.personnel.length,

      0
    )

  const totalAssignments =

    divisions.reduce(
      (
        acc: number,
        div: any
      ) =>

        acc +
        div.activeAssignments,

      0
    )

  const totalChiefs =

    divisions.filter(
      (div: any) =>
        div.chief
    ).length

  // CHART DATA
  const chartData =

    divisions.map(
      (div: any) => ({

        name:
          div.division,

        personnel:
          div.personnel.length,

        assignments:
          div.activeAssignments,
      })
    )

  return (

    <div className="
      p-4
      lg:p-6

      space-y-6
    ">

      {/* HEADER */}
      <div className="
        bg-linear-to-r
        from-blue-900
        via-blue-700
               to-blue-500

        rounded-3xl

        p-6
        lg:p-8

        text-white

        shadow-2xl
      ">

        <div className="
          inline-flex
          items-center
          gap-2

          bg-white/20

          px-4
          py-2

          rounded-full

          text-sm
          font-semibold
        ">

          🏢 Division Operations Command

        </div>

        <h1 className="
          text-4xl
          lg:text-5xl

          font-black

          mt-5
        ">

          Divisions Monitoring

        </h1>

        <p className="
          text-blue-100
          mt-3

          max-w-3xl
        ">

          Monitor division readiness,
          operational assignments,
          manpower deployment,
          focal responsibilities,
          and office-wide coordination.

        </p>

      </div>

      {/* MOBILE ANALYTICS */}
      <div className="
        md:hidden
      ">

        <button

          onClick={() =>
            setShowAnalytics(
              !showAnalytics
            )
          }

          className="
            w-full

            bg-blue-900
            text-white

            rounded-2xl

            px-5
            py-4

            font-bold

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

      {/* ANALYTICS */}
      <div
        className={`

          ${
            showAnalytics
              ? 'block'
              : 'hidden'
          }

          md:block
        `}
      >

        <div className="
          grid
          grid-cols-2
          xl:grid-cols-4

          gap-4
        ">

          <Card
            title="Total Divisions"
            value={totalDivisions}
            color="
              bg-linear-to-br
              from-blue-500
              to-blue-700
            "
          />

          <Card
            title="Personnel"
            value={totalPersonnel}
            color="
              bg-linear-to-br
              from-green-500
              to-green-700
            "
          />

          <Card
            title="Assignments"
            value={totalAssignments}
            color="
              bg-linear-to-br
              from-orange-500
              to-orange-700
            "
          />

          <Card
            title="Division Chiefs"
            value={totalChiefs}
            color="
              bg-linear-to-br
              from-purple-500
              to-purple-700
            "
          />

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="
        grid
        grid-cols-1
        xl:grid-cols-[380px_1fr]

        gap-6
      ">

        {/* LEFT PANEL */}
        <div className="
          space-y-6
        ">

          {/* CHART */}
          <div className="
            bg-white

            rounded-3xl

            shadow-xl

            border

            p-6
          ">

            <h2 className="
              text-2xl
              font-black
              text-blue-900

              mb-6
            ">

              Division Workload

            </h2>

            <div className="
              h-90
            ">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={chartData}
                >

                  <XAxis
                    dataKey="name"
                    hide
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="personnel"
                    fill="#2563eb"
                  />

                  <Bar
                    dataKey="assignments"
                    fill="#f97316"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* DIVISION CHIEFS */}
          <div className="
            bg-linear-to-b
            from-orange-500
            to-red-700

            rounded-3xl

            shadow-2xl

            p-6

            text-white
          ">

            <div className="
              flex
              items-center
              justify-between

              mb-6
            ">

              <div>

                <h2 className="
                  text-3xl
                  font-black
                ">

                  Division Chiefs

                </h2>

                <p className="
                  text-orange-100
                  mt-2
                ">

                  Operational Supervisors

                </p>

              </div>

              <div className="
                text-5xl
              ">

                👨‍💼

              </div>

            </div>

            <div className="
              space-y-4
            ">

              {divisions
                .filter(
                  (div: any) =>
                    div.chief
                )
                .map(
                  (div: any) => (

                  <div
                    key={div.division}

                    className="
                      bg-white/10

                      border
                      border-white/10

                      rounded-3xl

                      p-5
                    "
                  >

                    <div className="
                      flex
                      items-center
                      gap-4
                    ">

                      {div.chief
                        ?.photo_url ? (

                        <img
                          src={
                            div.chief
                              .photo_url
                          }

                          className="
                            w-18
                            h-18

                            rounded-full

                            object-cover

                            border-4
                            border-white/20
                          "
                        />

                      ) : (

                        <div className="
                          w-18
                          h-18

                          rounded-full

                          bg-white/20

                          flex
                          items-center
                          justify-center

                          text-3xl
                          font-black
                        ">

                          {
                            div.chief
                              ?.name
                              ?.charAt(0)
                          }

                        </div>

                      )}

                      <div>

                        <h3 className="
                          text-xl
                          font-black
                        ">

                          {
                            div.chief
                              ?.name
                          }

                        </h3>

                        <p className="
                          text-orange-100
                          mt-1
                        ">

                          {
                            div.chief
                              ?.designation
                          }

                        </p>

                        <p className="
                          text-orange-200
                          font-semibold
                          mt-2
                        ">

                          {
                            div.division
                          }

                        </p>

                      </div>

                    </div>

                  </div>

              ))}

            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="
          space-y-6
        ">

          {divisions.map(
            (division: any) => (

            <button
              key={division.division}

              onClick={() =>
                setSelectedDivision(
                  division
                )
              }

              className="
                w-full

                bg-white

                rounded-3xl

                shadow-xl

                border

                p-6

                text-left

                hover:shadow-2xl

                transition
              "
            >

              {/* HEADER */}
              <div className="
                flex
                items-center
                justify-between

                mb-6
              ">

                <div>

                  <h2 className="
                    text-3xl
                    font-black
                    text-blue-900
                  ">

                    {
                      division.division
                    }

                  </h2>

                  <p className="
                    text-gray-500
                    mt-2
                  ">

                    {
                      division.personnel
                        .length
                    }
                    {' '}
                    Personnel Active

                  </p>

                </div>

                <div className="
                  text-5xl
                ">

                  🏢

                </div>

              </div>

              {/* GRID */}
              <div className="
                grid
                md:grid-cols-2
                xl:grid-cols-4

                gap-4
              ">

                {/* PERSONNEL */}
                <div className="
                  bg-blue-50

                  rounded-2xl

                  p-5
                ">

                  <p className="
                    text-sm
                    text-gray-500
                  ">

                    Personnel

                  </p>

                  <h3 className="
                    text-4xl
                    font-black
                    text-blue-700

                    mt-2
                  ">

                    {
                      division.personnel
                        .length
                    }

                  </h3>

                </div>

                {/* ASSIGNMENTS */}
                <div className="
                  bg-orange-50

                  rounded-2xl

                  p-5
                ">

                  <p className="
                    text-sm
                    text-gray-500
                  ">

                    Assignments

                  </p>

                  <h3 className="
                    text-4xl
                    font-black
                    text-orange-700

                    mt-2
                  ">

                    {
                      division.activeAssignments
                    }

                  </h3>

                </div>

                {/* AVAILABLE */}
                <div className="
                  bg-green-50

                  rounded-2xl

                  p-5
                ">

                  <p className="
                    text-sm
                    text-gray-500
                  ">

                    Available

                  </p>

                  <h3 className="
                    text-4xl
                    font-black
                    text-green-700

                    mt-2
                  ">

                    {
                      division.available
                    }

                  </h3>

                </div>

                {/* DEPLOYED */}
                <div className="
                  bg-purple-50

                  rounded-2xl

                  p-5
                ">

                  <p className="
                    text-sm
                    text-gray-500
                  ">

                    Deployed

                  </p>

                  <h3 className="
                    text-4xl
                    font-black
                    text-purple-700

                    mt-2
                  ">

                    {
                      division.deployed
                    }

                  </h3>

                </div>

              </div>

              {/* OPERATIONS */}
              {division.operations
                ?.length > 0 && (

                <div className="
                  mt-6

                  bg-gray-50

                  border

                  rounded-3xl

                  p-5
                ">

                  <h3 className="
                    text-xl
                    font-black
                    text-blue-900

                    mb-4
                  ">

                    Active Operations

                  </h3>

                  <div className="
                    flex
                    flex-wrap
                    gap-3
                  ">

                    {division.operations.map(
                      (
                        operation: any,
                        index: number
                      ) => (

                      <div
                        key={index}

                        className="
                          px-4
                          py-2

                          rounded-full

                          bg-blue-100
                          text-blue-700

                          text-sm
                          font-semibold
                        "
                      >

                        {operation}

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </button>

          ))}

        </div>

      </div>

      {/* MODAL */}
      {selectedDivision && (

        <div className="
          fixed
          inset-0
          z-50

          bg-black/50

          backdrop-blur-sm

          flex
          items-center
          justify-center

          p-4
        ">

          <div className="
            bg-white

            w-full
            max-w-6xl

            rounded-3xl

            shadow-2xl

            overflow-hidden

            max-h-[90vh]

            flex
            flex-col
          ">

            {/* HEADER */}
            <div className="
              bg-linear-to-r
              from-blue-900
              to-orange-500

              p-6

              text-white
            ">

              <div className="
                flex
                justify-between
                items-center
              ">

                <div>

                  <h2 className="
                    text-4xl
                    font-black
                  ">

                    {
                      selectedDivision
                        .division
                    }

                  </h2>

                  <p className="
                    text-blue-100
                    mt-2
                  ">

                    Division Operations Overview

                  </p>

                </div>

                <button

                  onClick={() =>
                    setSelectedDivision(
                      null
                    )
                  }

                  className="
                    w-12
                    h-12

                    rounded-2xl

                    bg-white/20

                    text-2xl
                    font-bold
                  "
                >

                  ×

                </button>

              </div>

            </div>

            {/* BODY */}
            <div className="
              p-6

              overflow-y-auto

              space-y-6
            ">

              {/* PERSONNEL */}
              <div>

                <h3 className="
                  text-2xl
                  font-black
                  text-blue-900

                  mb-5
                ">

                  Personnel

                </h3>

                <div className="
                  grid
                  md:grid-cols-2
                  xl:grid-cols-3

                  gap-5
                ">

                  {selectedDivision
                    .personnel
                    .map(
                      (emp: any) => (

                      <div
                        key={emp.id}

                        className="
                          border

                          rounded-3xl

                          p-5
                        "
                      >

                        <div className="
                          flex
                          items-center
                          gap-4
                        ">

                          {emp.photo_url ? (

                            <img
                              src={
                                emp.photo_url
                              }

                              className="
                                w-18
                                h-18

                                rounded-full

                                object-cover
                              "
                            />

                          ) : (

                            <div className="
                              w-18
                              h-18

                              rounded-full

                              bg-blue-100
                              text-blue-700

                              flex
                              items-center
                              justify-center

                              text-2xl
                              font-black
                            ">

                              {
                                emp.name
                                  ?.charAt(0)
                              }

                            </div>

                          )}

                          <div>

                            <h4 className="
                              text-xl
                              font-black
                              text-blue-900
                            ">

                              {emp.name}

                            </h4>

                            <p className="
                              text-gray-500
                              mt-1
                            ">

                              {
                                emp.designation
                              }

                            </p>

                          </div>

                        </div>

                      </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

// CARD
function Card({
  title,
  value,
  color,
}: {
  title: string
  value: number
  color: string
}) {

  return (

    <div
      className={`
        rounded-3xl

        p-6

        text-white

        shadow-2xl

        transition

        hover:scale-[1.02]

        ${color}
      `}
    >

      <h3 className="
        text-sm
        uppercase
        tracking-wide
      ">

        {title}

      </h3>

      <p className="
        text-6xl
        font-black

        mt-5
      ">

        {value}

      </p>

    </div>
  )
}