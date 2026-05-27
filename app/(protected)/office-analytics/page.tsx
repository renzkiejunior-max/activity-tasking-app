'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

import jsPDF
from 'jspdf'

import autoTable
from 'jspdf-autotable'

import * as XLSX
from 'xlsx'

import { supabase }
from '@/lib/supabase'

export default function Page() {

  const [
    reportType,
    setReportType,
  ] = useState(
    'Operational Summary'
  )

  const [
    reportPeriod,
    setReportPeriod,
  ] = useState(
    'Monthly'
  )

  const [
  showPreview,
  setShowPreview,
] = useState(false)
  
  const [
    showAnalytics,
    setShowAnalytics,
  ] = useState(false)

  const [
    assignments,
    setAssignments,
  ] = useState<any[]>([])

  const [
    employees,
    setEmployees,
  ] = useState<any[]>([])

  const [
    activities,
    setActivities,
  ] = useState<any[]>([])

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

      // ASSIGNMENTS
      const {
        data: assignmentsData,
      } = await supabase

        .from('assignments')

        .select(`
          *,
          employees(
            name,
            division
          ),
          activities(
            title,
            activity_date
          )
        `)

      // EMPLOYEES
      const {
        data: employeesData,
      } = await supabase

        .from('employees')

        .select('*')

      // ACTIVITIES
      const {
        data: activitiesData,
      } = await supabase

        .from('activities')

        .select('*')

      setAssignments(
        assignmentsData || []
      )

      setEmployees(
        employeesData || []
      )

      setActivities(
        activitiesData || []
      )
    }

  // LOAD
  useEffect(() => {

    loadData()

  }, [])

  // ANALYTICS
  const totalAssignments =
    assignments.length

  const completedAssignments =

    assignments.filter(
      (a: any) =>

        a.status ===
        'completed'
    ).length

  const ongoingAssignments =

    assignments.filter(
      (a: any) =>

        a.status ===
        'ongoing'
    ).length

  const pendingAssignments =

    assignments.filter(
      (a: any) =>

        a.status ===
        'pending'
    ).length

  const totalPersonnel =
    employees.length

  const deployedPersonnel =

    employees.filter(
      (emp: any) =>

        (
          emp.office_status ||
          'available'
        )
        .toLowerCase() ===
        'deployed'
    ).length

  const availablePersonnel =

    employees.filter(
      (emp: any) =>

        (
          emp.office_status ||
          'available'
        )
        .toLowerCase() ===
        'available'
    ).length

  const totalActivities =
    activities.length

  // PIE CHART
  const assignmentStatusData = [

    {
      name: 'Completed',
      value: completedAssignments,
    },

    {
      name: 'Ongoing',
      value: ongoingAssignments,
    },

    {
      name: 'Pending',
      value: pendingAssignments,
    },

  ]

  // DIVISION ANALYTICS
  const divisionData =

    Object.values(

      assignments.reduce(
        (
          acc: any,
          assign: any
        ) => {

          const division =

            assign.employees
              ?.division ||

            'Unassigned'

          if (
            !acc[division]
          ) {

            acc[division] = {

              division,

              assignments: 0,
            }
          }

          acc[division]
            .assignments++

          return acc

        },

        {}
      )
    )

  // MONTHLY TREND
  const monthlyTrend =

    useMemo(() => {

      const months = [

        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',

      ]

      const grouped =
        Array(12)
          .fill(0)
          .map(
            (
              _: any,
              index: number
            ) => ({

              month:
                months[index],

              activities: 0,
            })
          )

      activities.forEach(
        (activity: any) => {

          if (
            activity.activity_date
          ) {

            const date =
              new Date(
                activity.activity_date
              )

            grouped[
              date.getMonth()
            ].activities++
          }
        }
      )

      return grouped

    }, [activities])

  // PDF EXPORT
  const exportPDF =
    () => {

      const doc =
        new jsPDF()

      doc.setFontSize(20)

      doc.text(

        `${reportPeriod} ${reportType}`,

        14,

        20
      )

      doc.setFontSize(11)

      doc.text(

        `Generated on: ${
          new Date()
            .toLocaleString()
        }`,

        14,

        30
      )

      autoTable(
        doc,

        {

          startY: 40,

          head: [[

            'Category',
            'Value',

          ]],

          body: [

            [
              'Total Assignments',
              totalAssignments,
            ],

            [
              'Completed',
              completedAssignments,
            ],

            [
              'Ongoing',
              ongoingAssignments,
            ],

            [
              'Pending',
              pendingAssignments,
            ],

            [
              'Total Personnel',
              totalPersonnel,
            ],

            [
              'Available Personnel',
              availablePersonnel,
            ],

            [
              'Deployed Personnel',
              deployedPersonnel,
            ],

            [
              'Activities',
              totalActivities,
            ],

          ],
        }
      )

      doc.save(
`${reportPeriod}-report.pdf`
      )
    }

  // EXCEL EXPORT
  const exportExcel =
    () => {

      const worksheet =
        XLSX.utils.json_to_sheet(

          assignments.map(
            (assign: any) => ({

              Task:
                assign.task,

              Status:
                assign.status,

              Employee:
                assign.employees
                  ?.name,

              Division:
                assign.employees
                  ?.division,

              Activity:
                assign.activities
                  ?.title,

            })
          )
        )

      const workbook =
        XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        'Assignments'
      )

      XLSX.writeFile(

        workbook,

`${reportPeriod}-analytics.xlsx`
      )
    }



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

          📊 Reports & Analytics

        </div>

        <h1 className="
          text-4xl
          lg:text-5xl

          font-black

          mt-5
        ">

          Executive Reports Center

        </h1>

        <p className="
          text-blue-100
          mt-3

          max-w-3xl
        ">

          Generate operational
          reports, monitor office
          performance, analyze
          deployments, and export
          executive analytics.

        </p>

      </div>

      {/* MOBILE TOGGLE */}
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

        {/* KPI */}
        <div className="
          grid
          grid-cols-2
          xl:grid-cols-4

          gap-4
        ">

          <Card
            title="Assignments"
            value={totalAssignments}
            color="
              bg-linear-to-br
              from-blue-500
              to-blue-700
            "
          />

          <Card
            title="Completed"
            value={completedAssignments}
            color="
              bg-linear-to-br
              from-green-500
              to-green-700
            "
          />

          <Card
            title="Personnel"
            value={totalPersonnel}
            color="
              bg-linear-to-br
              from-orange-500
              to-orange-700
            "
          />

          <Card
            title="Activities"
            value={totalActivities}
            color="
              bg-linear-to-br
              from-purple-500
              to-purple-700
            "
          />

        </div>

      </div>

      {/* REPORT CONTROLS */}
      <div className="
        bg-white

        rounded-3xl

        shadow-xl

        border

        p-6

        grid
        lg:grid-cols-4

        gap-4
      ">

        {/* TYPE */}
        <select

          value={reportType}

          onChange={(e) =>
            setReportType(
              e.target.value
            )
          }

          className="
            border

            rounded-2xl

            px-5
            py-4
          "
        >

          <option>
            Operational Summary
          </option>

          <option>
            Personnel Deployment
          </option>

          <option>
            Assignment Analytics
          </option>

          <option>
            Division Performance
          </option>

          <option>
            Activity Participation
          </option>

        </select>

        {/* PERIOD */}
        <select

          value={reportPeriod}

          onChange={(e) =>
            setReportPeriod(
              e.target.value
            )
          }

          className="
            border

            rounded-2xl

            px-5
            py-4
          "
        >

          <option>
            Daily
          </option>

          <option>
            Weekly
          </option>

          <option>
            Monthly
          </option>

        </select>

        {/* PDF */}
        <button

          onClick={exportPDF}

          className="
            bg-red-600
            hover:bg-red-700

            text-white

            rounded-2xl

            px-5
            py-4

            font-bold

            shadow-lg
          "
        >

          📄 Export PDF

        </button>

        {/* EXCEL */}
        <button

          onClick={exportExcel}

          className="
            bg-green-600
            hover:bg-green-700

            text-white

            rounded-2xl

            px-5
            py-4

            font-bold

            shadow-lg
          "
        >

          📊 Export Excel

        </button>

      </div>

      {/* VIEW REPORT */}
<button

  onClick={() =>
    setShowPreview(true)
  }

  className="
    w-full

    bg-blue-900
    hover:bg-blue-950

    text-white

    rounded-3xl

    px-5
    py-5

    font-black
    text-lg

    shadow-2xl
  "
>

  👁 View Report

</button>

      {/* CHARTS */}
      <div className="
        grid
        xl:grid-cols-2

        gap-6
      ">

        {/* PIE */}
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

            Assignment Status

          </h2>

          <div className="
            h-90
          ">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={
                    assignmentStatusData
                  }

                  dataKey="value"

                  nameKey="name"

                  outerRadius={120}

                  label
                >

                  {assignmentStatusData.map(
                    (
                      entry: any,
                      index: number
                    ) => (

                      <Cell
                        key={index}

                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />

                  ))}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* BAR */}
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
                data={divisionData}
              >

                <XAxis
                  dataKey="division"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="assignments"
                  fill="#2563eb"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* MONTHLY TREND */}
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

          Monthly Operations Trend

        </h2>

        <div className="
          h-100
        ">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={monthlyTrend}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
              />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="activities"
                stroke="#2563eb"
                strokeWidth={4}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* QUICK INSIGHTS */}
      <div className="
        bg-linear-to-r
        from-orange-500
        to-red-600

        rounded-3xl

        p-6

        text-white

        shadow-2xl
      ">

        <h2 className="
          text-3xl
          font-black

          mb-6
        ">

          Executive Insights

        </h2>

        <div className="
          grid
          md:grid-cols-2
          xl:grid-cols-4

          gap-4
        ">

          <InsightCard
            title="
              Most Active Division
            "

            value={
              (divisionData[0] as any)
                ?.division ||

              'N/A'
            }
          />

          <InsightCard
            title="
              Completion Rate
            "

            value={`
              ${
                totalAssignments
                  ? Math.round(

                    (
                      completedAssignments /
                      totalAssignments
                    ) * 100

                  )
                  : 0
              }%
            `}
          />

          <InsightCard
            title="
              Personnel Ready
            "

            value={`
              ${availablePersonnel}
              Available
            `}
          />

          <InsightCard
            title="
              Active Deployments
            "

            value={`
              ${deployedPersonnel}
              Deployed
            `}
          />

        </div>

      </div>

      {/* REPORT PREVIEW MODAL */}
{showPreview && (

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
          items-center
          justify-between
        ">

          <div>

            <h2 className="
              text-4xl
              font-black
            ">

              {reportPeriod}
              {' '}
              {reportType}

            </h2>

            <p className="
              text-blue-100
              mt-2
            ">

              Executive Operational Report Preview

            </p>

          </div>

          <button

            onClick={() =>
              setShowPreview(false)
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
        flex-1

        overflow-y-auto

        p-6

        space-y-6
      ">

        {/* SUMMARY */}
        <div className="
          grid
          md:grid-cols-2
          xl:grid-cols-4

          gap-4
        ">

          <PreviewCard
            title="Assignments"
            value={totalAssignments}
          />

          <PreviewCard
            title="Completed"
            value={completedAssignments}
          />

          <PreviewCard
            title="Personnel"
            value={totalPersonnel}
          />

          <PreviewCard
            title="Activities"
            value={totalActivities}
          />

        </div>

        {/* ASSIGNMENTS */}
        <div className="
          bg-gray-50

          border

          rounded-3xl

          p-6
        ">

          <h3 className="
            text-2xl
            font-black
            text-blue-900

            mb-5
          ">

            Operational Assignments

          </h3>

          <div className="
            space-y-4
          ">

            {assignments
              .slice(0, 10)
              .map(
                (
                  assign: any
                ) => (

                <div
                  key={assign.id}

                  className="
                    bg-white

                    border

                    rounded-2xl

                    p-5
                  "
                >

                  <div className="
                    flex
                    justify-between
                    items-start

                    gap-4
                  ">

                    <div>

                      <h4 className="
                        text-xl
                        font-bold
                        text-blue-900
                      ">

                        {assign.task}

                      </h4>

                      <p className="
                        text-gray-500
                        mt-2
                      ">

                        {
                          assign.employees
                            ?.name
                        }

                        {' • '}

                        {
                          assign.employees
                            ?.division
                        }

                      </p>

                    </div>

                    <div className="
                      px-4
                      py-2

                      rounded-full

                      bg-blue-100
                      text-blue-700

                      text-sm
                      font-bold
                    ">

                      {assign.status}

                    </div>

                  </div>

                </div>

            ))}

          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="
        border-t

        p-5

        flex
        flex-wrap
        gap-4

        justify-end
      ">

        <button

          onClick={exportPDF}

          className="
            bg-red-600
            hover:bg-red-700

            text-white

            rounded-2xl

            px-5
            py-3

            font-bold
          "
        >

          📄 Export PDF

        </button>

        <button

          onClick={exportExcel}

          className="
            bg-green-600
            hover:bg-green-700

            text-white

            rounded-2xl

            px-5
            py-3

            font-bold
          "
        >

          📊 Export Excel

        </button>

        <button

          onClick={() =>
            window.print()
          }

          className="
            bg-blue-900
            hover:bg-blue-950

            text-white

            rounded-2xl

            px-5
            py-3

            font-bold
          "
        >

          🖨 Print

        </button>

      </div>

    </div>

  </div>

)}

    </div>
  )
}

// KPI CARD
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

function PreviewCard({
  title,
  value,
}: {
  title: string
  value: number
}) {

  return (

    <div className="
      bg-white

      border

      rounded-3xl

      p-5

      shadow-sm
    ">

      <p className="
        text-gray-500
        text-sm
      ">

        {title}

      </p>

      <h3 className="
        text-5xl
        font-black
        text-blue-900

        mt-3
      ">

        {value}

      </h3>

    </div>
  )
}

// INSIGHT CARD
function InsightCard({
  title,
  value,
}: {
  title: string
  value: string
}) {

  return (

    <div className="
      bg-white/10

      border
      border-white/10

      rounded-3xl

      p-5
    ">

      <p className="
        text-orange-100
        text-sm
      ">

        {title}

      </p>

      <h3 className="
        text-2xl
        font-black

        mt-3
      ">

        {value}

      </h3>

      

    </div>
  )
}