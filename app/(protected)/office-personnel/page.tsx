'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import { supabase }
from '@/lib/supabase'

export default function Page() {

  const [
    employees,
    setEmployees,
  ] = useState<any[]>([])

  const [
    selectedDivision,
    setSelectedDivision,
  ] = useState('All Divisions')

  const [
    search,
    setSearch,
  ] = useState('')

  const [
  selectedPersonnel,
  setSelectedPersonnel,
] = useState<any>(null)

  const [
    statusData,
    setStatusData,
  ] = useState<any[]>([])

  const [
  showAnalytics,
  setShowAnalytics,
] = useState(false)

  const STATUS_COLORS = [

    '#22c55e',
    '#3b82f6',
    '#f97316',
    '#ef4444',

  ]

  // LOAD PERSONNEL
  const loadPersonnel =
    async () => {

      const {
        data,
      } = await supabase

        .from('employees')

        .select(`
          *,
          assignments(
            id,
            task,
            status,
            progress,
            deadline,
            activities(
              title,
              activity_date,
              location_name
            )
          ),
          focal_persons(
            id,
            title,
            description
          )
        `)

        .order(
          'name',
          {
            ascending: true,
          }
        )

      if (!data)
        return

      setEmployees(data)

      // STATUS COUNTS
      const available =

        data.filter(
          (emp: any) =>

            (
            emp.office_status ||
            'available'
            )
            .toLowerCase() ===
            'available'
        ).length

      const deployed =

        data.filter(
          (emp: any) =>

            (
            emp.office_status ||
            'deployed'
            )
            .toLowerCase() ===
            'deployed'
        ).length

      const activity =

        data.filter(
          (emp: any) =>

            (
            emp.office_status ||
            'activity'
            )
            .toLowerCase() ===
            'activity'
        ).length

      const inactive =

        data.filter(
          (emp: any) =>

            emp.status ===
            'inactive'
        ).length

      setStatusData([

        {
          name: 'Available',
          value: available,
        },

        {
          name: 'Deployed',
          value: deployed,
        },

        {
          name: 'On Activity',
          value: activity,
        },

        {
          name: 'Inactive',
          value: inactive,
        },

      ])
    }

  // LOAD
  useEffect(() => {

    loadPersonnel()

    const channel =
      supabase

        .channel(
          'office-personnel'
        )

        .on(
          'postgres_changes',

          {
            event: '*',
            schema: 'public',
            table: 'employees',
          },

          () => {

            loadPersonnel()

          }
        )

        .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )

    }

  }, [])

  // DIVISIONS
  const divisions = [

    'All Divisions',

    ...new Set(

      employees.map(
        (emp: any) =>
          emp.division
      )
    ),
  ]

  // FILTERED
  const filteredEmployees =

    employees.filter(
      (emp: any) => {

        const matchesDivision =

          selectedDivision ===
          'All Divisions'

          ||

          emp.division ===
          selectedDivision

        const searchText =
          search.toLowerCase()

        const matchesSearch =

          emp.name
            ?.toLowerCase()
            .includes(searchText)

          ||

          emp.designation
            ?.toLowerCase()
            .includes(searchText)

          ||

          emp.division
            ?.toLowerCase()
            .includes(searchText)

        return (
          matchesDivision &&
          matchesSearch
        )
      }
    )

const divisionChiefs =

  filteredEmployees.filter(
    (emp: any) =>

      emp.designation
        ?.toLowerCase()
        .includes(
          'division chief'
        )
  )

const divisionPersonnel =

  filteredEmployees.filter(
    (emp: any) =>

      !emp.designation
        ?.toLowerCase()
        .includes(
          'division chief'
        )
  )

    
  // GROUPED
  const groupedEmployees =

    divisionPersonnel.reduce(
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

          acc[division] = []
        }

        acc[division]
          .push(emp)

        return acc

      },

      {}
    )

  // ANALYTICS
  const totalPersonnel =
    employees.length

  const availablePersonnel =

    employees.filter(
      (emp: any) =>

        emp.office_status
  ?.toLowerCase() ===
        'available'
    ).length

  const deployedPersonnel =

    employees.filter(
      (emp: any) =>

        emp.office_status
  ?.toLowerCase() ===
        'deployed'
    ).length

  const inactivePersonnel =

    employees.filter(
      (emp: any) =>

        emp.status ===
        'inactive'
    ).length

  // STATUS COLOR
  
  const getStatusColor =
(
  officeStatus?: string
) => {

  const status =

    officeStatus
      ?.toLowerCase()

  if (
    status ===
    'available'
  ) {

    return `
      bg-green-100
      text-green-700
    `
  }

  if (
    status ===
    'deployed'
  ) {

    return `
      bg-blue-100
      text-blue-700
    `
  }

  if (
    status ===
    'activity'
  ) {

    return `
      bg-orange-100
      text-orange-700
    `
  }

  return `
    bg-gray-100
    text-gray-700
  `
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

          👥 Office Personnel Command Center

        </div>

        <h1 className="
          text-4xl
          lg:text-5xl

          font-black

          mt-5
        ">

          Office Personnel

        </h1>

        <p className="
          text-blue-100
          mt-3

          max-w-3xl
        ">

          Monitor personnel
          deployment,
          division readiness,
          operational status,
          assignment workload,
          and office-wide activity
          participation.

        </p>

      </div>


      {/* MOBILE ANALYTICS TOGGLE */}
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
          title="Total Personnel"
          value={totalPersonnel}
          color="
            bg-linear-to-br
            from-blue-500
            to-blue-700
          "
        />

        <Card
          title="Available"
          value={availablePersonnel}
          color="
            bg-linear-to-br
            from-green-500
            to-green-700
          "
        />

        <Card
          title="Deployed"
          value={deployedPersonnel}
          color="
            bg-linear-to-br
            from-orange-500
            to-orange-700
          "
        />

        <Card
          title="Inactive"
          value={inactivePersonnel}
          color="
            bg-linear-to-br
            from-red-500
            to-red-700
          "
        />

      </div>

      </div>

      {/* FILTERS */}
      <div className="
        bg-white

        rounded-3xl

        shadow-xl

        border

        p-5

        space-y-4
      ">

        {/* SEARCH */}
        <input

          placeholder="
            Search personnel,
            designation,
            division...
          "

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          className="
            w-full

            border
            border-gray-200

            rounded-2xl

            px-5
            py-4
          "
        />

        {/* DIVISION FILTER */}
        <div className="
          flex
          flex-wrap
          gap-3
        ">

          {divisions.map(
            (division) => (

            <button
              key={division}

              onClick={() =>
                setSelectedDivision(
                  division
                )
              }

              className={`
                px-5
                py-3

                rounded-2xl

                font-semibold

                transition

                ${
                  selectedDivision ===
                  division

                    ? `
                      bg-blue-700
                      text-white
                    `

                    : `
                      bg-gray-100
                      text-gray-700
                    `
                }
              `}
            >

              {division}

            </button>

          ))}

        </div>

      </div>


      {/* MAIN GRID */}
<div className="
  grid
  grid-cols-1
  xl:grid-cols-[420px_1fr]

  gap-6
">

  {/* LEFT PANEL */}
  <div className="
    space-y-6
  ">

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

    {divisionChiefs.map(
      (chief: any) => (

      <div
        key={chief.id}

        className="
          bg-white/10

          border
          border-white/10

          rounded-3xl

          p-5

          backdrop-blur-sm
        "
      >

        <div className="
          flex
          items-center
          gap-4
        ">

          {chief.photo_url ? (

            <img
              src={chief.photo_url}

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
                chief.name
                  ?.charAt(0)
              }

            </div>

          )}

          <div>

            <h3 className="
              text-xl
              font-black
            ">

              {chief.name}

            </h3>

            <p className="
              text-orange-100
              mt-1
            ">

              {
                chief.designation
              }

            </p>

            <p className="
              text-orange-200
              font-semibold
              mt-2
            ">

              {
                chief.division
              }

            </p>

          </div>

        </div>

        {/* STATUS */}
        <div className="
          mt-5
        ">

          <span className={`
            px-4
            py-2

            rounded-full

            text-sm
            font-bold

            ${
              getStatusColor(
                chief.office_status
              )
            }
          `}>

            {
              chief.office_status ||
              'available'
            }

          </span>

        </div>

      </div>

    ))}

  </div>

</div>

          </div>

  {/* RIGHT PANEL */}
  <div className="
    space-y-8
  ">

          {Object.entries(
            groupedEmployees
          ).map(
            (
              [division, divisionEmployees]: any
            ) => (

            <div
              key={division}

              className="
                bg-white

                rounded-3xl

                shadow-xl

                border

                p-6
              "
            >

              {/* DIVISION HEADER */}
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

                    {division}

                  </h2>

                  <p className="
                    text-gray-500
                    mt-2
                  ">

                    {
                      divisionEmployees.length
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

              {/* PERSONNEL GRID */}
              <div className="
                grid
                md:grid-cols-2
                2xl:grid-cols-3

                gap-5
              ">

                {divisionEmployees.map(
                  (employee: any) => {

                    const ongoingAssignments =

                      employee.assignments
                        ?.filter(
                          (a: any) =>

                            a.status !==
                            'completed'
                        ) || []

                    const currentAssignment =

                      ongoingAssignments[0]

                    return (

                      <button
                            key={employee.id}

                            onClick={() =>
                                setSelectedPersonnel(
                                employee
                                )
                            }

                            className="
                                text-left
                            "
                            >

                        <div className="
                          bg-linear-to-br
                          from-blue-800
                          to-blue-900

                          hover:scale-[1.02]

                          rounded-3xl

                          p-6

                          transition-all

                          text-white

                          shadow-lg

                          h-full
                        ">

                          {/* TOP */}
                          <div className="
                            flex
                            items-start
                            justify-between
                          ">

                            {/* PHOTO */}
                            {employee.photo_url ? (

                              <img
                                src={
                                  employee.photo_url
                                }

                                alt={employee.name}

                                className="
                                  w-24
                                  h-24

                                  rounded-full
                                  object-cover

                                  border-4
                                  border-white/20
                                "
                              />

                            ) : (

                              <div className="
                                w-24
                                h-24

                                rounded-full

                                bg-orange-500

                                flex
                                items-center
                                justify-center

                                text-3xl
                                font-bold
                              ">

                                {
                                  employee.name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                              </div>

                              

                            )}

                            {/* ONLINE */}
                            <div className="
                              flex
                              items-center
                              gap-2
                            ">

                              <div className={`
                                w-4
                                h-4

                                rounded-full

                                ${
                                  employee.online_status ===
                                  'online'

                                    ? 'bg-green-500'

                                    : 'bg-gray-400'
                                }
                              `} />

                              <span className="
                                text-sm
                                text-blue-100
                              ">

                                {
                                  employee.online_status ||
                                  'offline'
                                }

                              </span>

                            </div>

                          </div>
                          

                          {/* INFO */}
                          <div className="
                            mt-6
                          ">

                            <h3 className="
                              text-2xl
                              font-bold

                              leading-tight
                            ">

                              {employee.name}

                            </h3>

                            <p className="
                              text-blue-100

                              mt-3
                            ">

                              {
                                employee.designation
                              }

                            </p>

                            {/* STATUS */}
                            <div className="
                              mt-5
                            ">

                              <span className={`
                                px-4
                                py-2

                                rounded-full

                                text-sm
                                font-bold

                                ${
                                  getStatusColor(
                                    employee.office_status
                                  )
                                }
                              `}>

                                {
                                  employee.office_status ||
                                  'available'
                                }

                              </span>

                            </div>

                            {/* CURRENT DEPLOYMENT */}
                            {currentAssignment && (

                              <div className="
                                mt-5

                                bg-white/10

                                border
                                border-white/10

                                rounded-2xl

                                p-4
                              ">

                                <p className="
                                  text-xs
                                  uppercase

                                  text-orange-300
                                ">

                                  Current Deployment

                                </p>

                                <h4 className="
                                  text-lg
                                  font-bold

                                  mt-2
                                ">

                                  {
                                    currentAssignment
                                      .activities
                                      ?.title ||

                                    'Personal Task'
                                  }

                                </h4>

                                <p className="
                                  text-blue-100
                                  text-sm

                                  mt-2
                                ">

                                  {
                                    currentAssignment
                                      .task
                                  }

                                </p>

                              </div>

                            )}

                            {/* FOCAL */}
                            {employee
                              .focal_persons
                              ?.length > 0 && (

                              <div className="
                                mt-5

                                space-y-3
                              ">

                                {employee
                                  .focal_persons
                                  .map(
                                    (
                                      focal: any
                                    ) => (

                                    <div
                                      key={focal.id}

                                      className="
                                        bg-white/10

                                        border
                                        border-white/10

                                        rounded-2xl

                                        p-4
                                      "
                                    >

                                      <p className="
                                        text-xs
                                        uppercase

                                        text-orange-300
                                      ">

                                        Focal Person

                                      </p>

                                      <h4 className="
                                        text-lg
                                        font-bold

                                        mt-2
                                      ">

                                        {focal.title}

                                      </h4>

                                    </div>

                                ))}

                              </div>

                            )}

                            {/* TASKS */}
                            <div className="
                              mt-6

                              flex
                              items-center
                              justify-between
                            ">

                              <div>

                                <p className="
                                  text-sm
                                  text-blue-100
                                ">

                                  Active Assignments

                                </p>

                                <h2 className="
                                  text-4xl
                                  font-black

                                  mt-1
                                ">

                                  {
                                    ongoingAssignments
                                      .length
                                  }

                                </h2>

                              </div>

                              

                              <div className="
                                text-2xl
                              ">

                                📌

                              </div>

                            </div>

                          </div>

                        </div>
                        

                      </button>
                      

                    )
                  }
                )}

              </div>

            </div>


          ))}

        </div>

      </div>

{/* PERSONNEL MODAL */}
{selectedPersonnel && (

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
      max-w-4xl

      rounded-3xl

      shadow-2xl

      max-h-[90vh]

      overflow-y-auto
    ">

      {/* HEADER */}
      <div className="
        bg-linear-to-r
        from-blue-900
        to-orange-500

        text-white

        p-6
      ">

        <div className="
          flex
          items-center
          justify-between
        ">

          <div>

            <h2 className="
              text-3xl
              font-black
            ">

              {
                selectedPersonnel.name
              }

            </h2>

            <p className="
              text-blue-100
              mt-2
            ">

              {
                selectedPersonnel.designation
              }

            </p>

          </div>

          <button

            onClick={() =>
              setSelectedPersonnel(null)
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

        space-y-5
      ">

        {selectedPersonnel
          .assignments
          ?.map(
            (assign: any) => (

            <div
              key={assign.id}

              className="
                border

                rounded-3xl

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

                  <h3 className="
                    text-2xl
                    font-black
                    text-blue-900
                  ">

                    {
                      assign.activities
                        ?.title ||

                      'Personal Task'
                    }

                  </h3>

                  <p className="
                    text-gray-600
                    mt-2
                  ">

                    📍
                    {' '}

                    {
                      assign.activities
                        ?.location_name
                    }

                  </p>

                </div>

                <div className={`
                  px-4
                  py-2

                  rounded-full

                  text-sm
                  font-bold

                  ${
                    assign.status ===
                    'completed'

                      ? `
                        bg-green-100
                        text-green-700
                      `

                      : `
                        bg-orange-100
                        text-orange-700
                      `
                  }
                `}>

                  {assign.status}

                </div>

              </div>

              {/* TASK */}
              <div className="
                mt-5

                bg-gray-50

                border

                rounded-2xl

                p-5
              ">

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Assigned Task

                </p>

                <p className="
                  mt-2

                  text-lg
                  font-semibold
                ">

                  {assign.task}

                </p>

              </div>

              {/* PROGRESS */}
              <div className="
                mt-5
              ">

                <div className="
                  flex
                  justify-between

                  mb-2
                ">

                  <span className="
                    text-sm
                    font-semibold
                  ">

                    Progress

                  </span>

                  <span className="
                    text-sm
                    font-bold
                    text-blue-700
                  ">

                    {
                      assign.progress || 0
                    }%

                  </span>

                </div>

                <div className="
                  h-4

                  bg-gray-200

                  rounded-full

                  overflow-hidden
                ">

                  <div
                    
                    style={{
                    width: `${
                        assign.progress || 0
                    }%`
                    }}

                    className="
                      h-full

                      bg-linear-to-r
                      from-blue-600
                      to-orange-500
                    "
                  />

                </div>

              </div>

            </div>

        ))}

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
        font-bold

        mt-5
      ">

        {value}

      </p>

    </div>
  )
}