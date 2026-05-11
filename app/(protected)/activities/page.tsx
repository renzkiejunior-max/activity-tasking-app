'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../../lib/supabase'

export default function Page() {

  const [activities, setActivities] =
    useState<any[]>([])

  const [checklists, setChecklists] =
    useState<any[]>([])

  // FORM
  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [activityDate, setActivityDate] =
    useState('')

  const [activityTime, setActivityTime] =
    useState('')

  const [locationName, setLocationName] =
    useState('')

  const [focalPerson, setFocalPerson] =
    useState('')

  const [programName, setProgramName] =
    useState('')

  const [locationSuggestions, setLocationSuggestions] =
    useState<any[]>([])

  const [showSuggestions, setShowSuggestions] =
    useState(false)

  const [latitude, setLatitude] =
    useState('')

  const [longitude, setLongitude] =
    useState('')

  const [status, setStatus] =
    useState('upcoming')

  // CHECKLIST
  const [newChecklist, setNewChecklist] =
    useState<any>({})

  // EDIT
  const [editingId, setEditingId] =
    useState<string | null>(null)

  // FETCH ACTIVITIES
  const fetchActivities = async () => {

    const { data } =
      await supabase
        .from('activities')
        .select('*')
        .order('activity_date', {
          ascending: true,
        })

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

          .order('created_at', {
            ascending: true,
          })

      setChecklists(
        data || []
      )
  }

  // SEARCH LOCATION
  const searchLocation =
    async (query: string) => {

      if (!query.trim()) {

        setLocationSuggestions([])

        setShowSuggestions(false)

        return
      }

      try {

        const response =
          await fetch(

            `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ph&limit=5&q=${encodeURIComponent(query)}`

          )

        const data =
          await response.json()

        setLocationSuggestions(
          data
        )

        setShowSuggestions(true)

      } catch (error) {

        console.log(error)

      }
    }

  // RESET
  const resetForm = () => {

    setTitle('')
    setDescription('')
    setActivityDate('')
    setActivityTime('')
    setLocationName('')
    setLatitude('')
    setLongitude('')
    setStatus('upcoming')
    setFocalPerson('')
    setProgramName('')

    setLocationSuggestions([])

    setShowSuggestions(false)

    setEditingId(null)
  }

  // SAVE
  const saveActivity = async () => {

    if (!title || !activityDate) {

      return alert(
        'Title and Date required'
      )
    }

    const payload = {

      title,

      description,

      activity_date:
        activityDate,

      activity_time:
        activityTime,

      location_name:
        locationName,

      latitude:
        latitude
          ? Number(latitude)
          : null,

      longitude:
        longitude
          ? Number(longitude)
          : null,

      focal_person:
        focalPerson,

      program_name:
        programName,

      status,

    }

    // UPDATE
    if (editingId) {

      const { error } =
        await supabase
          .from('activities')
          .update(payload)
          .eq('id', editingId)

      if (error) {
        return alert(error.message)
      }

      alert(
        'Updated successfully'
      )

    } else {

      // INSERT
      const { error } =
        await supabase
          .from('activities')
          .insert([payload])

      if (error) {
        return alert(error.message)
      }

      alert(
        'Added successfully'
      )
    }

    resetForm()

    fetchActivities()
  }

  // EDIT
  const editActivity = (
    activity: any
  ) => {

    setEditingId(activity.id)

    setTitle(
      activity.title || ''
    )

    setDescription(
      activity.description || ''
    )

    setActivityDate(
      activity.activity_date || ''
    )

    setActivityTime(
      activity.activity_time || ''
    )

    setLocationName(
      activity.location_name || ''
    )

    setLatitude(
      activity.latitude
        ?.toString() || ''
    )

    setLongitude(
      activity.longitude
        ?.toString() || ''
    )

    setFocalPerson(
      activity.focal_person || ''
    )

    setProgramName(
      activity.program_name || ''
    )

    setStatus(
      activity.status ||
      'upcoming'
    )

    setShowSuggestions(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // DELETE
  const deleteActivity = async (
    id: string
  ) => {

    const confirmed =
      confirm(
        'Delete this activity?'
      )

    if (!confirmed) return

    const { error } =
      await supabase
        .from('activities')
        .delete()
        .eq('id', id)

    if (error) {
      return alert(error.message)
    }

    fetchActivities()
  }

  // ADD CHECKLIST
  const addChecklist =
    async (
      activityId: string
    ) => {

      const text =
        newChecklist[
          activityId
        ]

      if (!text) return

      const { error } =
        await supabase

          .from(
            'activity_checklists'
          )

          .insert([
            {
              activity_id:
                activityId,

              item: text,
            },
          ])

      if (error) {

        return alert(
          error.message
        )
      }

      setNewChecklist({

        ...newChecklist,

        [activityId]: '',

      })

      fetchChecklists()
  }

  // TOGGLE CHECKLIST
  const toggleChecklist =
    async (
      id: string,
      value: boolean
    ) => {

      const { error } =
        await supabase

          .from(
            'activity_checklists'
          )

          .update({
            completed: !value,
          })

          .eq('id', id)

      if (error) {

        return alert(
          error.message
        )
      }

      fetchChecklists()
  }

  // STATUS COLORS
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

  useEffect(() => {

    fetchActivities()
    fetchChecklists()

    const channel = supabase

      .channel(
        'activity-checklists-live'
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

      {/* HEADER */}
      <div>

        <h1 className="
          text-4xl
          font-bold
          text-blue-900
        ">
          Activities
        </h1>

        <p className="
          text-gray-600
          mt-2
        ">
          Operational planning and activity management
        </p>

      </div>

      {/* FORM */}
      <div className="
        bg-white
        rounded-3xl
        shadow-xl
        border
        p-6
      ">

        <h2 className="
          text-2xl
          font-bold
          text-blue-900
          mb-6
        ">

          {editingId
            ? 'Edit Activity'
            : 'Add Activity'}

        </h2>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        ">

          <input
            placeholder="Activity Title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            className="
              border
              rounded-2xl
              p-4
            "
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="
              border
              rounded-2xl
              p-4
            "
          />

          <input
            placeholder="Focal Person"
            value={focalPerson}
            onChange={(e) =>
              setFocalPerson(
                e.target.value
              )
            }
            className="
              border
              rounded-2xl
              p-4
            "
          />

          <input
            placeholder="Program / Task Force"
            value={programName}
            onChange={(e) =>
              setProgramName(
                e.target.value
              )
            }
            className="
              border
              rounded-2xl
              p-4
            "
          />

          <input
            type="date"
            value={activityDate}
            onChange={(e) =>
              setActivityDate(
                e.target.value
              )
            }
            className="
              border
              rounded-2xl
              p-4
            "
          />

          <input
            type="time"
            value={activityTime}
            onChange={(e) =>
              setActivityTime(
                e.target.value
              )
            }
            className="
              border
              rounded-2xl
              p-4
            "
          />

          {/* LOCATION */}
          <div className="
            relative
            md:col-span-2
          ">

            <input

              placeholder="Search Location"

              value={locationName}

              onChange={async (e) => {

                const value =
                  e.target.value

                setLocationName(
                  value
                )

                await searchLocation(
                  value
                )

              }}

              className="
                border
                rounded-2xl
                p-4
                w-full
              "
            />

            {/* SUGGESTIONS */}
            {showSuggestions &&
              locationSuggestions.length > 0 && (

              <div className="
                absolute
                z-30
                mt-2
                w-full
                bg-white
                border
                rounded-2xl
                shadow-2xl
                max-h-72
                overflow-y-auto
              ">

                {locationSuggestions.map(
                  (
                    place: any,
                    index: number
                  ) => (

                  <button

                    key={index}

                    type="button"

                    onClick={() => {

                      setLocationName(
                        place.display_name
                      )

                      setLatitude(
                        place.lat
                      )

                      setLongitude(
                        place.lon
                      )

                      setShowSuggestions(
                        false
                      )
                    }}

                    className="
                      w-full
                      text-left
                      p-4
                      hover:bg-blue-50
                      border-b
                      text-sm
                    "
                  >

                    {place.display_name}

                  </button>

                ))}

              </div>

            )}

          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
            className="
              border
              rounded-2xl
              p-4
            "
          >

            <option value="upcoming">
              Upcoming
            </option>

            <option value="ongoing">
              Ongoing
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

        </div>

        <div className="
          flex
          gap-4
          mt-6
        ">

          <button

            onClick={saveActivity}

            className="
              bg-orange-500
              hover:bg-orange-600
              text-white
              px-6 py-4
              rounded-2xl
              font-semibold
            "
          >

            {editingId
              ? 'Update Activity'
              : 'Add Activity'}

          </button>

          {editingId && (

            <button

              onClick={resetForm}

              className="
                bg-gray-300
                hover:bg-gray-400
                px-6 py-4
                rounded-2xl
              "
            >

              Cancel

            </button>

          )}

        </div>

      </div>

      {/* LIST */}
      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

        {activities.map(
          (activity: any) => (

          <div
            key={activity.id}
            className="
              bg-white
              rounded-3xl
              shadow-xl
              border
              p-6
              space-y-5
            "
          >

            {/* HEADER */}
            <div className="
              flex
              justify-between
              gap-4
            ">

              <div>

                <h2 className="
                  text-2xl
                  font-bold
                  text-blue-900
                ">
                  {activity.title}
                </h2>

                <p className="
                  text-gray-600
                  mt-2
                ">
                  {activity.description}
                </p>

              </div>

              <span className={`
                px-4 py-2
                rounded-full
                text-sm
                font-semibold
                ${getStatusColor(
                  activity.status
                )}
              `}>

                {activity.status}

              </span>

            </div>

            {/* DETAILS */}
            <div className="
              space-y-3
              text-sm
            ">

              <div>
                📅 {activity.activity_date}
              </div>

              <div>
                🕒 {activity.activity_time}
              </div>

              <div>
                📍 {activity.location_name}
              </div>

              <div>
                👤 Focal Person:
                {' '}
                <span className="font-semibold">
                  {activity.focal_person || 'N/A'}
                </span>
              </div>

              <div>
                🏢 Program:
                {' '}
                <span className="font-semibold">
                  {activity.program_name || 'N/A'}
                </span>
              </div>

            </div>

            {/* CHECKLIST */}
            <div className="
              mt-6
            ">

              <h3 className="
                text-lg
                font-bold
                text-blue-900
                mb-4
              ">
                Preparation Checklist
              </h3>

              <div className="
                space-y-3
              ">

                {checklists

                  .filter(
                    (c: any) =>

                      c.activity_id ===
                      activity.id
                  )

                  .map((item: any) => (

                  <div
                    key={item.id}
                    className="
                      flex
                      items-center
                      gap-3
                      bg-gray-50
                      border
                      rounded-2xl
                      p-3
                    "
                  >

                    <input

                      type="checkbox"

                      checked={
                        item.completed
                      }

                      onChange={() =>

                        toggleChecklist(

                          item.id,

                          item.completed

                        )

                      }

                      className="
                        w-5 h-5
                      "
                    />

                    <p className={`
                      flex-1

                      ${
                        item.completed
                          ? 'line-through text-gray-400'
                          : 'text-black'
                      }
                    `}>

                      {item.item}

                    </p>

                  </div>

                ))}

              </div>

              {/* ADD ITEM */}
              <div className="
                mt-4
                flex
                gap-3
              ">

                <input

                  type="text"

                  placeholder="
                  Add checklist item
                  "

                  value={
                    newChecklist[
                      activity.id
                    ] || ''
                  }

                  onChange={(e) =>

                    setNewChecklist({

                      ...newChecklist,

                      [activity.id]:
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

                    addChecklist(
                      activity.id
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

                  Add

                </button>

              </div>

            </div>

            {/* ACTIONS */}
            <div className="
              flex
              gap-3
              pt-4
            ">

              <button

                onClick={() =>
                  editActivity(
                    activity
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

                Edit

              </button>

              <button

                onClick={() =>
                  deleteActivity(
                    activity.id
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

        ))}

      </div>

    </div>
  )
}