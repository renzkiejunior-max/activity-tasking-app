'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../../lib/supabase'

export default function Page() {

  const [employees, setEmployees] =
    useState<any[]>([])

  const [activities, setActivities] =
    useState<any[]>([])

  const [assignments, setAssignments] =
    useState<any[]>([])

  const [comments, setComments] =
    useState<any[]>([])

  const [newComments, setNewComments] =
    useState<any>({})

  const [checklists, setChecklists] =
    useState<any[]>([])

  // FORM
  const [employeeId, setEmployeeId] =
    useState('')

  const [activityId, setActivityId] =
    useState('')

  const [task, setTask] =
    useState('')

  const [deadline, setDeadline] =
    useState('')

  const [progress, setProgress] =
    useState(0)

  const [priority, setPriority] =
    useState('medium')

  const [remarks, setRemarks] =
    useState('')

    // SHOW FORM
const [showForm,
  setShowForm] =
  useState(false)

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {

    const { data } =
      await supabase
        .from('employees')
        .select('*')

    setEmployees(data || [])
  }

  // FETCH ACTIVITIES
  const fetchActivities = async () => {

    const { data } =
      await supabase
        .from('activities')
        .select('*')

    setActivities(data || [])
  }

  // FETCH CHECKLISTS
  const fetchChecklists =
    async () => {

      const { data } =
        await supabase

          .from(
            'activity_checklists'
          )

          .select('*')

      setChecklists(
        data || []
      )
  }

  // FETCH ASSIGNMENTS
  const fetchAssignments = async () => {

    const { data } =
      await supabase
        .from('assignments')
        .select(`
          *,
          employees(
            name,
            photo_url,
            email
          ),
          activities(
            title,
            activity_date,
            activity_time,
            focal_person,
            program_name,
            location_name,
            venue_details
          )
        `)
        .order('created_at', {
          ascending: false,
        })

    setAssignments(data || [])
  }

  // FETCH COMMENTS
  const fetchComments = async () => {

    const { data } =
      await supabase
        .from(
          'assignment_comments'
        )
        .select('*')
        .order('created_at', {
          ascending: true,
        })

    setComments(data || [])
  }



// CREATE ASSIGNMENT
const assignEmployee = async () => {

  if (
    !employeeId ||
    !activityId ||
    !task
  ) {

    return alert(
      'Complete all required fields'
    )
  }

  // INSERT ASSIGNMENT
  const {
    data: assignmentData,
    error,
  } = await supabase

    .from('assignments')

    .insert([
      {
        employee_id:
          employeeId,

        activity_id:
          activityId,

        task,

        deadline,

        progress,

        priority,

        remarks,

        status:
          progress === 100
            ? 'completed'
            : 'pending',

        completed_at:
          progress === 100
            ? new Date()
                .toISOString()
            : null,
      },
    ])

    .select()

    .single()

  // ERROR
  if (error) {

    return alert(
      error.message
    )
  }

  // GET EMPLOYEE INFO
  const employee =
    employees.find(
      (emp: any) =>
        emp.id === employeeId
    )

  // GET ACTIVITY INFO
  const activity =
    activities.find(
      (act: any) =>
        act.id === activityId
    )

  // GET USER ID
  const {
    data: employeeUser,
  } = await supabase

    .from('employees')

    .select('user_id')

    .eq(
      'id',
      employeeId
    )

    .single()

  // CREATE NOTIFICATION
  if (
    employeeUser?.user_id
  ) {

    await supabase

      .from('notifications')

      .insert({

        user_id:
          employeeUser.user_id,

        employee_id:
          employeeId,

        title:
          'New Assignment',

        message:
          `${task} assigned for ${activity?.title || 'Activity'}`,

        type:
          'assignment',

        is_read:
          false,

      })
  }

  // RESET FORM
  setEmployeeId('')
  setActivityId('')
  setTask('')
  setDeadline('')
  setProgress(0)
  setPriority('medium')
  setRemarks('')

  // REFRESH
  fetchAssignments()

  // SEND EMAIL
  if (employee?.email) {

    try {

      await fetch(
        '/api/send-email',
        {

          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({

            to:
              employee.email,

            subject:
              'New Task Assignment',

            html: `

              <div style="
                font-family:
                Arial,
                sans-serif;

                padding:
                20px;
              ">

                <h2 style="
                  color:
                  #1e3a8a;
                ">

                  New Task Assignment

                </h2>

                <p>
                  Good day
                  <b>
                    ${employee.name}
                  </b>,
                </p>

                <p>
                  You have been assigned
                  a new operational task.
                </p>

                <hr />

                <p>
                  <b>Activity:</b>
                  ${
                    activity?.title ||
                    'N/A'
                  }
                </p>

                <p>
                  <b>Task:</b>
                  ${task}
                </p>

                <p>
                  <b>Deadline:</b>
                  ${
                    deadline || 'N/A'
                  }
                </p>

                <p>
                  <b>Priority:</b>
                  ${priority}
                </p>

                <p>
                  <b>Focal Person:</b>
                  ${
                    activity?.focal_person ||
                    'N/A'
                  }
                </p>

                <p>
                  <b>Location:</b>
                  ${
                    activity?.location_name ||
                    'N/A'
                  }
                </p>

                <hr />

                <p>
                  Please login to the
                  Activity Tasking
                  System for further
                  details.
                </p>

              </div>

            `,
          }),
        }
      )

    } catch (emailError) {

      console.log(
        'EMAIL ERROR:',
        emailError
      )

    }
  }
}


    // ADD COMMENT
  const addComment =
    async (
      assignmentId: string,
      employeeName: string
    ) => {

      const text =
        newComments[
          assignmentId
        ]

      if (!text) return

      const { error } =
        await supabase
          .from(
            'assignment_comments'
          )
          .insert([
            {
              assignment_id:
                assignmentId,

              employee_name:
                employeeName,

              comment: text,
            },
          ])

      if (error) {
        return alert(error.message)
      }

      setNewComments({
        ...newComments,

        [assignmentId]: '',
      })

      fetchComments()
  }

  // DELETE
  const deleteAssignment =
    async (
      id: string
    ) => {

      const confirmDelete =
        confirm(
          'Delete assignment?'
        )

      if (!confirmDelete)
        return

      const { error } =
        await supabase
          .from('assignments')
          .delete()
          .eq('id', id)

      if (error) {
        return alert(error.message)
      }

      fetchAssignments()
  }

  // PRIORITY COLOR
  const getPriorityColor =
    (
      priority: string
    ) => {

      if (
        priority === 'urgent'
      ) {

        return `
          bg-red-100
          text-red-700
        `
      }

      if (
        priority === 'high'
      ) {

        return `
          bg-orange-100
          text-orange-700
        `
      }

      if (
        priority === 'medium'
      ) {

        return `
          bg-blue-100
          text-blue-700
        `
      }

      return `
        bg-gray-100
        text-gray-700
      `
  }

  // CHECKLIST %
  const getChecklistProgress =
    (
      activityId: string
    ) => {

      const items =
        checklists.filter(
          (c: any) =>
            c.activity_id ===
            activityId
        )

      if (items.length === 0)
        return 0

      const completed =
        items.filter(
          (c: any) =>
            c.completed
        ).length

      return Math.round(
        (
          completed /
          items.length
        ) * 100
      )
  }

  // REALTIME
  useEffect(() => {

    fetchEmployees()
    fetchActivities()
    fetchAssignments()
    fetchComments()
    fetchChecklists()

    const channel = supabase

      .channel(
        'assignments-realtime'
      )

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table: 'assignments',
        },

        () => {

          fetchAssignments()

        }
      )

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table:
            'assignment_comments',
        },

        () => {

          fetchComments()

        }
      )

      .on(
        'postgres_changes',

        {
          event: '*',
          schema: 'public',
          table:
            'activity_checklists',
        },

        () => {

          fetchChecklists()

        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )

    }

  }, [])

const groupedAssignments =
  Object.values(

    assignments.reduce(
      (
        acc: any,
        assign: any
      ) => {

        const key = `
          ${assign.activity_id}
          -
          ${assign.task}
        `

        if (!acc[key]) {

          acc[key] = {

            ...assign,

            employeesList: [],
          }
        }

        acc[key]
          .employeesList
          .push(assign)

        return acc

      },

      {}

    )

  )

  return (

    <div className="
      w-full
      min-w-0
      space-y-6
    ">

      {/* HEADER CARD */}
<div className="
  bg-linear-to-r
  from-green-800
  via-green-600
  to-green-500

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
    ">

      📌 Operational Tasking

    </div>

    <h1 className="
      text-4xl
      lg:text-5xl

      font-black

      text-white

      mt-4
    ">

      Assignments

    </h1>

    <p className="
      text-orange-50
      text-lg
      mt-3
      max-w-2xl
    ">

      Manage personnel assignments,
      operational tasking,
      workflow monitoring,
      task progress,
      and coordination activities.

    </p>

  </div>

  {/* RIGHT */}
  <div>

    <button

      onClick={() =>
        setShowForm(
          !showForm
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

        flex
        items-center
        gap-3
      "
    >

      <span className="
        text-2xl
      ">

        {showForm ? '×' : '+'}

      </span>

      {
        showForm

          ? 'Close Assignment Form'

          : 'Assign Task'
      }

    </button>

  </div>

</div>

{/* KPI CARDS */}
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-5
  gap-4
">

  {/* TOTAL */}
  <div className="
    bg-white
    rounded-3xl
    shadow-lg
    border
    p-5
  ">

    <p className="
      text-gray-500
      text-sm
    ">
      Total Tasks
    </p>

    <h2 className="
      text-4xl
      font-black
      text-blue-900
      mt-2
    ">
      {assignments.length}
    </h2>

  </div>

  {/* PENDING */}
  <div className="
    bg-white
    rounded-3xl
    shadow-lg
    border
    p-5
  ">

    <p className="
      text-gray-500
      text-sm
    ">
      Pending
    </p>

    <h2 className="
      text-4xl
      font-black
      text-orange-500
      mt-2
    ">

      {
        assignments.filter(
          (a: any) =>
            a.status ===
            'pending'
        ).length
      }

    </h2>

  </div>

  {/* ONGOING */}
  <div className="
    bg-white
    rounded-3xl
    shadow-lg
    border
    p-5
  ">

    <p className="
      text-gray-500
      text-sm
    ">
      Ongoing
    </p>

    <h2 className="
      text-4xl
      font-black
      text-blue-600
      mt-2
    ">

      {
        assignments.filter(
          (a: any) =>
            a.status ===
            'ongoing'
        ).length
      }

    </h2>

  </div>

  {/* COMPLETED */}
  <div className="
    bg-white
    rounded-3xl
    shadow-lg
    border
    p-5
  ">

    <p className="
      text-gray-500
      text-sm
    ">
      Completed
    </p>

    <h2 className="
      text-4xl
      font-black
      text-green-600
      mt-2
    ">

      {
        assignments.filter(
          (a: any) =>
            a.status ===
            'completed'
        ).length
      }

    </h2>

  </div>

  {/* URGENT */}
  <div className="
    bg-white
    rounded-3xl
    shadow-lg
    border
    p-5
  ">

    <p className="
      text-gray-500
      text-sm
    ">
      Urgent
    </p>

    <h2 className="
      text-4xl
      font-black
      text-red-600
      mt-2
    ">

      {
        assignments.filter(
          (a: any) =>
            a.priority ===
            'urgent'
        ).length
      }

    </h2>

  </div>

</div>

{/* ASSIGNMENT MODAL */}
{showForm && (

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
      relative

      bg-white

      w-full
      max-w-5xl

      rounded-3xl

      shadow-2xl

      overflow-hidden
    ">

      {/* HEADER */}
      <div className="
        bg-linear-to-r
        from-green-800
        via-green-600
        to-green-500

        p-8

        text-white
      ">

        <div className="
          flex
          justify-between
          items-start
          gap-4
        ">

          <div>

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

              📌 Operational Tasking

            </div>

            <h2 className="
              text-4xl
              font-black

              mt-4
            ">

              Assign Personnel Task

            </h2>

            <p className="
              text-green-50
              mt-3
            ">

              Create operational assignments,
              taskings,
              deployment instructions,
              and workflow monitoring.

            </p>

          </div>

          {/* CLOSE */}
          <button

            onClick={() =>
              setShowForm(false)
            }

            className="
              w-12
              h-12

              rounded-2xl

              bg-white/20
              hover:bg-red-500

              text-white

              text-2xl
              font-bold

              transition
            "
          >

            ×

          </button>

        </div>

      </div>

      {/* BODY */}
      <div className="
        p-8

        max-h-[80vh]
        overflow-y-auto
      ">

        {/* SECTION */}
        <div className="
          mb-8
        ">

          <h3 className="
            text-2xl
            font-bold
            text-blue-900
          ">

            Assignment Information

          </h3>

          <p className="
            text-gray-500
            mt-2
          ">

            Fill out personnel tasking details below.

          </p>

        </div>

        {/* GRID */}
        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-5
        ">

          {/* EMPLOYEE */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Employee

            </label>

            <select
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(
                  e.target.value
                )
              }
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-4
                py-4
              "
            >

              <option value="">
                Select Employee
              </option>

              {employees.map(
                (emp: any) => (

                <option
                  key={emp.id}
                  value={emp.id}
                >

                  {emp.name}

                </option>

              ))}

            </select>

          </div>

          {/* ACTIVITY */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Activity

            </label>

            <select
              value={activityId}
              onChange={(e) =>
                setActivityId(
                  e.target.value
                )
              }
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-4
                py-4
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

          </div>

          {/* TASK */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Task Description

            </label>

            <input
              placeholder="Enter assigned task"
              value={task}
              onChange={(e) =>
                setTask(
                  e.target.value
                )
              }
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-4
                py-4
              "
            />

          </div>

          {/* DEADLINE */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Deadline

            </label>

            <input
              type="date"
              value={deadline}
              onChange={(e) =>
                setDeadline(
                  e.target.value
                )
              }
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-4
                py-4
              "
            />

          </div>

          {/* PRIORITY */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Priority Level

            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(
                  e.target.value
                )
              }
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-4
                py-4
              "
            >

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>

              <option value="urgent">
                Urgent
              </option>

            </select>

          </div>

          {/* PROGRESS */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Initial Progress

            </label>

            <div className="
              border
              border-gray-200

              rounded-2xl

              px-5
              py-4
            ">

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) =>
                  setProgress(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="
                  w-full
                "
              />

              <div className="
                mt-3

                text-center

                font-bold
                text-green-700
              ">

                {progress}%

              </div>

            </div>

          </div>

          {/* REMARKS */}
          <div className="
            md:col-span-2
          ">

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Remarks

            </label>

            <textarea
              placeholder="Additional instructions or remarks"
              value={remarks}
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
              className="
                w-full

                border
                border-gray-200

                rounded-2xl

                px-4
                py-4

                min-h-30
              "
            />

          </div>

        </div>

        {/* FOOTER */}
        <div className="
          flex
          justify-end
          gap-4

          mt-10
        ">

          <button

            onClick={() =>
              setShowForm(false)
            }

            className="
              px-6
              py-4

              rounded-2xl

              bg-gray-200
              hover:bg-gray-300

              font-semibold
            "
          >

            Cancel

          </button>

          <button

            onClick={assignEmployee}

            className="
              px-8
              py-4

              rounded-2xl

              bg-green-600
              hover:bg-green-700

              text-white

              font-bold

              shadow-lg
            "
          >

            Assign Task

          </button>

        </div>

      </div>

    </div>

  </div>

)}
      {/* ASSIGNMENTS */}
      <div className="
        space-y-6
      ">

        {groupedAssignments.map(
  (assign: any) => {

          const currentProgress =
            assign.progress || 0

          const today =
            new Date()

          const deadlineDate =
            assign.deadline
              ? new Date(
                  assign.deadline
                )
              : null

          const overdue =
            deadlineDate &&
            deadlineDate < today &&
            assign.progress < 100

          const checklistProgress =
            getChecklistProgress(
              assign.activity_id
            )



          return (

            <div
              key={assign.id}
              className="
                bg-white
                rounded-3xl
                shadow-xl
                border
                p-6
              "
            >

              {/* TOP */}
              <div className="
                flex
                flex-col
                md:flex-row
                md:justify-between
                gap-5
              ">

                {/* LEFT */}
<div className="
  flex-1
">

  {/* ACTIVITY */}
  <h2 className="
    text-3xl
    font-black
    text-blue-900
  ">

    {
      assign.activities
        ?.title
    }

  </h2>

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
      mb-2
    ">

      Assigned Task

    </p>

    <p className="
      text-lg
      font-semibold
      text-black
    ">

      {assign.task}

    </p>

  </div>

  {/* DETAILS */}
  <div className="
    mt-5
    grid
    md:grid-cols-2
    gap-3
    text-sm
  ">

    <div className="
      bg-blue-50
      border
      border-blue-100
      rounded-2xl
      p-4
    ">

      👤
      {' '}

      <span className="
        font-semibold
      ">

        {
          assign.activities
            ?.focal_person ||
            'N/A'
        }

      </span>

    </div>

    <div className="
      bg-orange-50
      border
      border-orange-100
      rounded-2xl
      p-4
    ">

      🏢
      {' '}

      <span className="
        font-semibold
      ">

        {
          assign.activities
            ?.program_name ||
            'N/A'
        }

      </span>

    </div>

    <div className="
      bg-gray-50
      border
      rounded-2xl
      p-4
    ">

      📍
      {' '}

      {
        assign.activities
          ?.location_name ||
          'No location'
      }

    </div>

    {/* VENUE */}
    <div className="
      bg-purple-50
      border
      border-purple-100
      rounded-2xl
      p-4
    ">

      🏛️
      {' '}

      <span className="
        font-semibold
      ">

        {
          assign.activities
            ?.venue_details ||
            'No venue specified'
        }

      </span>

    </div>

  </div>

  {/* ASSIGNED EMPLOYEES */}
  <div className="
    mt-6
  ">

    <p className="
      text-sm
      font-semibold
      text-gray-500
      mb-4
    ">

      Assigned Personnel

    </p>

    <div className="
      flex
      flex-wrap
      gap-3
    ">

      {assign.employeesList.map(
        (empAssign: any) => (

        <div
          key={empAssign.id}
          className="
            flex
            items-center
            gap-3

            bg-white

            border

            rounded-2xl

            px-4
            py-3

            shadow-sm
          "
        >

          {empAssign.employees
            ?.photo_url ? (

            <img
              src={
                empAssign
                  .employees
                  ?.photo_url
              }
              alt="Employee"
              className="
                w-12
                h-12

                rounded-full
                object-cover
              "
            />

          ) : (

            <div className="
              w-12
              h-12

              rounded-full

              bg-blue-100
              text-blue-700

              flex
              items-center
              justify-center

              font-bold
            ">

              {
                empAssign
                  .employees
                  ?.name
                  ?.charAt(0)
              }

            </div>

          )}

          <div>

            <p className="
              font-semibold
              text-blue-900
            ">

              {
                empAssign
                  .employees
                  ?.name
              }

            </p>

          </div>

        </div>

      ))}

    </div>

  </div>

</div>

            

{/* RIGHT */}
<div className="
  flex
  items-start
  gap-3
  shrink-0
">

  {/* PRIORITY */}
  <span className={`
    inline-flex
    items-center
    justify-center

    h-10
    min-w-22.5

    px-4

    rounded-full

    text-sm
    font-semibold

    whitespace-nowrap

    ${getPriorityColor(
      assign.priority
    )}
  `}>

    {assign.priority}

  </span>

  {/* STATUS */}
<div className={`
  h-10

  px-4

  rounded-xl

  flex
  items-center

  text-sm
  font-semibold

  ${
    assign.status ===
    'completed'

      ? 'bg-green-100 text-green-700'

      : assign.status ===
        'ongoing'

      ? 'bg-blue-100 text-blue-700'

      : 'bg-orange-100 text-orange-700'
  }
`}>

  {assign.status}

</div>

</div>

              </div>



              {/* ACTIONS */}
              <div className="
                mt-6
                flex
                gap-3
              ">

                <button
                  onClick={() =>
                    deleteAssignment(
                      assign.id
                    )
                  }
                  className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-5 py-3
                    rounded-2xl
                  "
                >

                  Delete

                </button>

              </div>

            </div>

          )
        })}

      </div>

    </div>

  )
}
