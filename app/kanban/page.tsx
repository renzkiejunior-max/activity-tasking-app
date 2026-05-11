'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd'

import { supabase }
from '../../lib/supabase'

const columns = [
  'pending',
  'ongoing',
  'completed',
  'cancelled',
]

export default function Page() {

  const [assignments, setAssignments] =
    useState<any[]>([])

  // FETCH
  const fetchAssignments =
    async () => {

    const { data } =
      await supabase
        .from('assignments')
        .select(`
          *,
          employees(
            name,
            photo_url
          ),
          activities(
            title
          )
        `)

    setAssignments(data || [])
  }

  // UPDATE STATUS
  const updateAssignmentStatus =
    async (
      id: string,
      status: string
    ) => {

    const payload: any = {
      status,
    }

    // AUTO COMPLETE
    if (status === 'completed') {

      payload.progress = 100

      payload.completed_at =
        new Date()
          .toISOString()
    }

    const { error } =
      await supabase
        .from('assignments')
        .update(payload)
        .eq('id', id)

    if (error) {
      return alert(error.message)
    }

    fetchAssignments()
  }

  // DRAG END
  const onDragEnd =
    async (result: any) => {

    if (!result.destination)
      return

    const assignmentId =
      result.draggableId

    const newStatus =
      result.destination
        .droppableId

    await updateAssignmentStatus(
      assignmentId,
      newStatus
    )
  }

  // PRIORITY COLORS
  const getPriorityColor =
    (priority: string) => {

    if (priority === 'urgent') {

      return `
        bg-red-100
        text-red-700
      `
    }

    if (priority === 'high') {

      return `
        bg-orange-100
        text-orange-700
      `
    }

    if (priority === 'medium') {

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

  useEffect(() => {
    fetchAssignments()
  }, [])

  return (

    <div className="
      w-full
      min-w-0
      space-y-6
    ">

      {/* HEADER */}
      <div>

        <h1 className="
          text-4xl
          font-bold
          text-blue-900
        ">
          Kanban Board
        </h1>

        <p className="
          text-gray-600
          mt-2
        ">
          Operational workflow
          management board
        </p>

      </div>

      {/* BOARD */}
      <DragDropContext
        onDragEnd={onDragEnd}
      >

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-4
          gap-6
        ">

          {columns.map(
            (column) => {

            const filtered =
              assignments.filter(
                (a: any) =>
                  (
                    a.status ||
                    'pending'
                  ) === column
              )

            return (

              <div
                key={column}
                className="
                  bg-gray-100
                  rounded-3xl
                  p-5
                  min-h-175
                "
              >

                {/* COLUMN HEADER */}
                <div className="
                  flex
                  items-center
                  justify-between
                  mb-5
                ">

                  <h2 className="
                    text-xl
                    font-bold
                    capitalize
                    text-blue-900
                  ">
                    {column}
                  </h2>

                  <span className="
                    bg-white
                    px-3 py-1
                    rounded-full
                    text-sm
                    font-semibold
                  ">

                    {filtered.length}

                  </span>

                </div>

                {/* DROP AREA */}
                <Droppable
                  droppableId={column}
                >

                  {(provided) => (

                    <div

                      ref={
                        provided.innerRef
                      }

                      {
                        ...provided.droppableProps
                      }

                      className="
                        space-y-4
                      "
                    >

                      {filtered.map(
                        (
                          assign: any,
                          index: number
                        ) => (

                        <Draggable

                          key={assign.id}

                          draggableId={
                            assign.id
                          }

                          index={index}
                        >

                          {(provided) => (

                            <div

                              ref={
                                provided.innerRef
                              }

                              {
                                ...provided.draggableProps
                              }

                              {
                                ...provided.dragHandleProps
                              }

                              className="
                                bg-white
                                rounded-3xl
                                shadow-lg
                                border
                                p-5

                                space-y-4
                              "
                            >

                              {/* TOP */}
                              <div className="
                                flex
                                items-center
                                gap-3
                              ">

                                {/* PHOTO */}
                                {assign.employees
                                  ?.photo_url ? (

                                  <img
                                    src={
                                      assign
                                        .employees
                                        .photo_url
                                    }
                                    alt={
                                      assign
                                        .employees
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
                                      assign
                                        .employees
                                        ?.name
                                        ?.charAt(0)
                                    }

                                  </div>

                                )}

                                {/* INFO */}
                                <div>

                                  <h3 className="
                                    font-bold
                                    text-blue-900
                                  ">
                                    {
                                      assign
                                        .employees
                                        ?.name
                                    }
                                  </h3>

                                  <p className="
                                    text-sm
                                    text-gray-500
                                  ">
                                    {
                                      assign
                                        .activities
                                        ?.title
                                    }
                                  </p>

                                </div>

                              </div>

                              {/* TASK */}
                              <div>

                                <p className="
                                  text-black
                                  font-medium
                                ">
                                  {
                                    assign.task
                                  }
                                </p>

                              </div>

                              {/* PRIORITY */}
                              <div>

                                <span className={`
                                  px-3 py-1
                                  rounded-full
                                  text-sm
                                  font-semibold

                                  ${getPriorityColor(
                                    assign.priority
                                  )}
                                `}>

                                  {
                                    assign.priority
                                  }

                                </span>

                              </div>

                              {/* PROGRESS */}
                              <div>

                                <div className="
                                  flex
                                  justify-between
                                  text-sm
                                  mb-2
                                ">

                                  <span>
                                    Progress
                                  </span>

                                  <span>
                                    {
                                      assign.progress || 0
                                    }
                                    %
                                  </span>

                                </div>

                                <div className="
                                  w-full
                                  h-3
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
                                      width: `${
                                        assign.progress || 0
                                      }%`,
                                    }}
                                  />

                                </div>

                              </div>

                              {/* DEADLINE */}
                              <div className="
                                text-sm
                                text-red-600
                                font-medium
                              ">

                                Deadline:
                                {' '}
                                {
                                  assign.deadline ||
                                  'N/A'
                                }

                              </div>

                            </div>

                          )}

                        </Draggable>

                      ))}

                      {
                        provided.placeholder
                      }

                    </div>

                  )}

                </Droppable>

              </div>

            )
          })}

        </div>

      </DragDropContext>

    </div>
  )
}