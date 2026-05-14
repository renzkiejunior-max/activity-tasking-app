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
            location_name
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

    Assign Personnel Task

  </h2>

  <div className="
    grid
    grid-cols-1
    md:grid-cols-2
    gap-4
  ">
            
  {/* EMPLOYEE */}
  <select
    value={employeeId}
    onChange={(e) =>
      setEmployeeId(
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

  {/* ACTIVITY */}
  <select
    value={activityId}
    onChange={(e) =>
      setActivityId(
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

  {/* TASK */}
  <input
    placeholder="Task"
    value={task}
    onChange={(e) =>
      setTask(
        e.target.value
      )
    }
    className="
      border
      rounded-2xl
      p-4
    "
  />

  {/* DEADLINE */}
  <input
    type="date"
    value={deadline}
    onChange={(e) =>
      setDeadline(
        e.target.value
      )
    }
    className="
      border
      rounded-2xl
      p-4
    "
  />

  {/* PRIORITY */}
  <select
    value={priority}
    onChange={(e) =>
      setPriority(
        e.target.value
      )
    }
    className="
      border
      rounded-2xl
      p-4
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

  {/* PROGRESS */}
  <div>

    <label className="
      text-sm
      text-gray-500
      block
      mb-2
    ">

      Initial Progress

    </label>

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

    <p className="
      text-sm
      mt-2
      font-semibold
      text-blue-700
    ">

      {progress}%

    </p>

  </div>

  {/* REMARKS */}
  <textarea
    placeholder="Remarks"
    value={remarks}
    onChange={(e) =>
      setRemarks(
        e.target.value
      )
    }
    className="
      border
      rounded-2xl
      p-4
      md:col-span-2
    "
  />

</div>

            <div className="
      flex
      gap-4
      mt-6
    ">

      <button

        onClick={assignEmployee}

        className="
          bg-orange-500
          hover:bg-orange-600

          text-white

          px-6 py-4

          rounded-2xl

          font-semibold
        "
      >

        Assign Task

      </button>

      <button

        onClick={() => {

          setShowForm(false)

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
      {/* ASSIGNMENTS */}
      <div className="
        space-y-6
      ">

        {assignments.map(
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
                  flex
                  items-center
                  gap-4
                ">

                  {assign.employees
                    ?.photo_url ? (

                    <img
                      src={
                        assign.employees
                          .photo_url
                      }
                      alt="Employee"
                      className="
                        w-16 h-16
                        rounded-full
                        object-cover
                        border-2
                        border-blue-200
                      "
                    />

                  ) : (

                    <div className="
                      w-16 h-16
                      rounded-full
                      bg-blue-100
                      text-blue-700
                      flex
                      items-center
                      justify-center
                      text-xl
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

                    <h2 className="
                      text-2xl
                      font-bold
                      text-blue-900
                    ">
                      {
                        assign.employees
                          ?.name
                      }
                    </h2>

                    {/* ACTIVITY INFO */}
                    <div className="
                      mt-2
                      space-y-1
                    ">

                      <p className="
                        text-gray-700
                        font-medium
                      ">
                        {
                          assign.activities
                            ?.title
                        }
                      </p>

                      <p className="
                        text-sm
                        text-blue-700
                      ">

                        👤 Focal:
                        {' '}

                        {
                          assign.activities
                            ?.focal_person ||
                            'N/A'
                        }

                      </p>

                      <p className="
                        text-sm
                        text-orange-700
                      ">

                        🏢 Program:
                        {' '}

                        {
                          assign.activities
                            ?.program_name ||
                            'N/A'
                        }

                      </p>

                      <p className="
                        text-sm
                        text-gray-500
                      ">

                        📍

                        {
                          assign.activities
                            ?.location_name ||
                            'No location'
                        }

                      </p>

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

              {/* TASK */}
              <div className="
                mt-6
              ">

                <p className="
                  text-sm
                  text-gray-500
                ">
                  Assigned Task
                </p>

                <div className="
                  mt-2
                  bg-gray-50
                  border
                  rounded-2xl
                  p-4
                ">

                  <p className="
                    text-black
                    font-medium
                  ">
                    {assign.task}
                  </p>

                </div>

              </div>

              

              {/* REMARKS */}
              {assign.remarks && (

                <div className="
                  mt-5
                ">

                  <p className="
                    text-sm
                    text-gray-500
                  ">
                    Remarks
                  </p>

                  <div className="
                    mt-2
                    bg-blue-50
                    border
                    border-blue-200
                    rounded-2xl
                    p-4
                  ">

                    <p>
                      {assign.remarks}
                    </p>

                  </div>

                </div>

              )}

              {/* PROGRESS */}
              <div className="
                mt-6
              ">

                <div className="
                  flex
                  justify-between
                  mb-2
                ">

                  <span>
                    Task Progress
                  </span>

                  <span>
                    {currentProgress}%
                  </span>

                </div>

                <div className="
                  w-full
                  h-4
                  bg-gray-200
                  rounded-full
                  overflow-hidden
                ">

                  <div
                    className="
                      h-full
                      bg-blue-600
                    "
                    style={{
                      width:
                        `${currentProgress}%`,
                    }}
                  />

                </div>

                <div className="
  mt-4
  bg-gray-100
  rounded-2xl
  p-4
  text-sm
  text-gray-600
">

  Progress can only be updated
  by the assigned personnel.

</div>

              </div>

              {/* OVERDUE */}
              {overdue && (

                <div className="
                  mt-5
                  bg-red-100
                  text-red-700
                  px-4 py-3
                  rounded-2xl
                  font-semibold
                ">

                  ⚠️ Overdue Task

                </div>

              )}

              {/* COMMENTS */}
              <div className="
                mt-6
              ">

                <h3 className="
                  text-lg
                  font-bold
                  text-blue-900
                  mb-4
                ">
                  Comments
                </h3>

                <div className="
                  space-y-3
                ">

                  {comments
                    .filter(
                      (comment: any) =>
                        comment.assignment_id ===
                        assign.id
                    )
                    .map((comment: any) => (

                    <div
                      key={comment.id}
                      className="
                        bg-gray-50
                        border
                        rounded-2xl
                        p-4
                      "
                    >

                      <div className="
                        flex
                        justify-between
                        mb-2
                      ">

                        <p className="
                          font-semibold
                          text-blue-900
                        ">
                          {
                            comment.employee_name
                          }
                        </p>

                        <p className="
                          text-xs
                          text-gray-500
                        ">
                          {new Date(
                            comment.created_at
                          ).toLocaleString()}
                        </p>

                      </div>

                      <p>
                        {comment.comment}
                      </p>

                    </div>

                  ))}

                </div>

                {/* ADD COMMENT */}
                <div className="
                  mt-4
                  flex
                  flex-col
                  md:flex-row
                  gap-3
                ">

                  <input
                    type="text"
                    placeholder="Add comment..."
                    value={
                      newComments[
                        assign.id
                      ] || ''
                    }
                    onChange={(e) =>
                      setNewComments({

                        ...newComments,

                        [assign.id]:
                          e.target.value,

                      })
                    }
                    className="
                      flex-1
                      border
                      rounded-2xl
                      px-4 py-3
                    "
                  />

                  <button
                    onClick={() =>
                      addComment(
                        assign.id,
                        assign.employees
                          ?.name || 'User'
                      )
                    }
                    className="
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      px-5 py-3
                      rounded-2xl
                    "
                  >

                    Send

                  </button>

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
