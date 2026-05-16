'use client'

import {
  useEffect,
  useState,
} from 'react'

import { supabase }
from '../../../lib/supabase'

import {
  offlineDB,
} from '../../../lib/offline-db'

export default function Page() {

  const [activities, setActivities] =
    useState<any[]>([])

  const [checklists, setChecklists] =
    useState<any[]>([])

  const [attendees, setAttendees] =
    useState<any[]>([])

    const [employees, setEmployees] =
  useState<any[]>([])

const [selectedEmployees,
  setSelectedEmployees] =
  useState<any>({})

  const [showSelector,
  setShowSelector] =
  useState<any>({})

  const [newAttendee, setNewAttendee] =
    useState<any>({})

    const [searchTimeout,
  setSearchTimeout] =
  useState<any>(null)

  
  // FORM
  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [activityDate, setActivityDate] =
    useState('')

    const [endDate,
  setEndDate] =
  useState('')

  const [activityTime, setActivityTime] =
    useState('')

    const [endTime,
  setEndTime] =
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

    const [venueDetails,
  setVenueDetails] =
  useState('')

  // CHECKLIST
  const [newChecklist, setNewChecklist] =
    useState<any>({})

  // EDIT
  const [editingId, setEditingId] =
    useState<string | null>(null)

  // FETCH ACTIVITIES
  const fetchActivities = async () => {

    // OFFLINE MODE
    if (!navigator.onLine) {

      const cached =
        await offlineDB
          .cache
          .where('key')
          .equals('activities')
          .first()

      if (cached?.data) {

        setActivities(
          cached.data
        )
      }

      return
    }

    // ONLINE
    const { data } =
      await supabase

        .from('activities')

        .select('*')

        .order(
          'activity_date',
          {
            ascending: true,
          }
        )

    setActivities(
      data || []
    )

    // SAVE CACHE
    await offlineDB
      .cache
      .put({

        key:
          'activities',

        data:
          data || [],

        updated_at:
          new Date()
            .toISOString(),
      })
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

  // FETCH ATTENDEES
  const fetchAttendees =
    async () => {

      const { data } =
        await supabase

          .from(
            'activity_attendees'
          )

          .select('*')

          .order(
            'created_at',
            {
              ascending: true,
            }
          )

      setAttendees(
        data || []
      )
    }

// FETCH EMPLOYEES
const fetchEmployees =
  async () => {

    const { data } =
      await supabase

        .from('employees')

        .select(`
          id,
          name,
          designation,
          division
        `)

        .order('name', {
          ascending: true,
        })

    setEmployees(
      data || []
    )
  }


  // SEARCH LOCATION
  const searchLocation =
  async (query: string) => {

    const cleanQuery =
      query.trim()

    if (!cleanQuery) {

      setLocationSuggestions([])

      setShowSuggestions(false)

      return
    }

    try {

      // FORCE ILOILO SEARCH
      const finalQuery =

        cleanQuery.toLowerCase()
          .includes('iloilo')

          ? cleanQuery

          : `${cleanQuery}, Iloilo, Philippines`

      const response =
        await fetch(

          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encodeURIComponent(finalQuery)}`,

          {
            headers: {
              'Accept-Language': 'en',
            },
          }

        )

      const data =
        await response.json()

      console.log(
        'LOCATION RESULTS:',
        data
      )

      if (
        Array.isArray(data) &&
        data.length > 0
      ) {

        setLocationSuggestions(
          data
        )

        // FORCE OPEN
        setTimeout(() => {

          setShowSuggestions(
            true
          )

        }, 100)

      } else {

        setLocationSuggestions([])

        setShowSuggestions(false)


      }

    } catch (error) {

      console.log(
        'LOCATION ERROR:',
        error
      )

 setShowSuggestions(false)
    }
  }

  // RESET
  const resetForm = () => {

    setTitle('')
    setDescription('')
    setActivityDate('')
    setEndDate('')
    setActivityTime('')
    setEndTime('')
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

        end_date:
        endDate,

      activity_time:
        activityTime,

        end_time:
        endTime,

      location_name:
        locationName,

        venue_details:
  venueDetails,

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
    if (
  editingId &&
  editingId !== 'new'
) {

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

setEndDate(
  activity.end_date || ''
)

    setActivityTime(
      activity.activity_time || ''
    )

    setEndTime(
  activity.end_time || ''
)
    setLocationName(
      activity.location_name || ''
    )

setVenueDetails(activity.location_name || '')

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

  // ADD ATTENDEES
const addAttendee =
  async (
    activityId: string
  ) => {

    const selected =

      selectedEmployees[
        activityId
      ] || []

    if (
      selected.length === 0
    ) {

      return alert(
        'Select employee/s'
      )
    }

    // GET ACTIVITY
    const {
      data: activity,
    } = await supabase

      .from('activities')

      .select('*')

      .eq(
        'id',
        activityId
      )

      .single()

    if (!activity) {

      return alert(
        'Activity not found'
      )
    }

    // REMOVE OLD ATTENDEES
    await supabase

      .from(
        'activity_attendees'
      )

      .delete()

      .eq(
        'activity_id',
        activityId
      )

    // REMOVE OLD ASSIGNMENTS
    await supabase

      .from('assignments')

      .delete()

      .eq(
        'activity_id',
        activityId
      )

    // INSERT ATTENDEES
    const attendeePayload =

      selected.map(
        (
          emp: any
        ) => ({

          activity_id:
            activityId,

          employee_id:
            emp.id,

          attendee_name:
            emp.name,

          designation:
            emp.designation,

          division:
            emp.division,

          attendance_status:
            'Pending',

        })
      )

    const {
      error:
        attendeeError,
    } = await supabase

      .from(
        'activity_attendees'
      )

      .insert(
        attendeePayload
      )

    if (attendeeError) {

      return alert(
        attendeeError.message
      )
    }

    // CREATE ASSIGNMENTS
    const assignmentPayload =

      selected.map(
        (
          emp: any
        ) => ({

          activity_id:
            activityId,

          employee_id:
            emp.id,

          task:
`Attend activity:
${activity.title}`,

          status:
            'Pending',

          progress: 0,

        })
      )

    const {
      error:
        assignmentError,
    } = await supabase

      .from(
        'assignments'
      )

      .insert(
        assignmentPayload
      )

    if (assignmentError) {

      console.log(
        assignmentError
      )
    }

    // CREATE NOTIFICATIONS
    for (
      const emp of selected
    ) {

      // GET USER
      const {
        data: employeeData,
      } = await supabase

        .from('employees')

        .select('user_id')

        .eq(
          'id',
          emp.id
        )

        .single()

      if (
        employeeData?.user_id
      ) {

        await supabase

          .from(
            'notifications'
          )

          .insert({

            user_id:
              employeeData.user_id,

            employee_id:
              emp.id,

            activity_id:
              activityId,

            title:
              'Activity Assignment',

            message:
`You were selected as attendee for:

${activity.title}

Date:
${activity.activity_date}

Time:
${activity.activity_time}`,

            type:
              'assignment',

            is_read:
              false,

          })
      }
    }

    // HIDE SELECTOR
    setShowSelector({

      ...showSelector,

      [activityId]:
        false,

    })

    // CLEAR
    setSelectedEmployees({

      ...selectedEmployees,

      [activityId]: [],

    })

    // REFRESH
    fetchAttendees()

    alert(
      'Attendees assigned successfully'
    )
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
    fetchAttendees()
    fetchEmployees()

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
  from-orange-500
  via-orange-400
  to-amber-400

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

      backdrop-blur-sm
    ">

      📅 Operations Management

    </div>

    <h1 className="
      text-4xl
      lg:text-5xl

      font-black

      text-white

      mt-4
    ">

      Activities

    </h1>

    <p className="
      text-orange-50

      text-lg

      mt-3

      max-w-2xl
    ">

      Manage operational activities,
      coordination meetings,
      tasking schedules,
      attendee assignments,
      and preparedness workflows.

    </p>

  </div>

  {/* RIGHT */}
  <div>

    <button

      onClick={() =>

        setEditingId(
          editingId
            ? null
            : 'new'
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

        transition

        flex
        items-center
        gap-3
      "
    >

      <span className="
        text-2xl
        leading-none
      ">

        {
          editingId
            ? '×'
            : '+'
        }

      </span>

      {
        editingId

          ? 'Close Activity Form'

          : 'Add Activity'
      }

    </button>

  </div>

</div>

{/* ACTIVITY MODAL */}
{editingId && (

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
        from-orange-500
        via-orange-400
        to-amber-400

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

              📅 Operations Activity

            </div>

            <h2 className="
              text-4xl
              font-black

              mt-4
            ">

              {
                editingId !== 'new'

                  ? 'Edit Activity'

                  : 'Add Activity'
              }

            </h2>

            <p className="
              text-orange-50
              mt-3
            ">

              Create operational activities,
              meetings,
              simulations,
              deployments,
              and preparedness schedules.

            </p>

          </div>

          {/* CLOSE */}
          <button

            onClick={() => {

              resetForm()

              setEditingId(null)

            }}

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

            Activity Information

          </h3>

          <p className="
            text-gray-500
            mt-2
          ">

            Fill out operational activity details below.

          </p>

        </div>

        {/* FORM GRID */}
        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-5
        ">

          {/* TITLE */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Activity Title

            </label>

            <input
              placeholder="Enter activity title"
              value={title}
              onChange={(e) =>
                setTitle(
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

                focus:outline-none
                focus:ring-4
                focus:ring-orange-100
              "
            />

          </div>

          {/* DESCRIPTION */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Description

            </label>

            <input
              placeholder="Enter description"
              value={description}
              onChange={(e) =>
                setDescription(
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

          {/* FOCAL PERSON */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Focal Person

            </label>

            <input
              placeholder="Enter focal person"
              value={focalPerson}
              onChange={(e) =>
                setFocalPerson(
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

          {/* PROGRAM */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Program / Task Force

            </label>

            <input
              placeholder="Enter program"
              value={programName}
              onChange={(e) =>
                setProgramName(
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

          {/* START DATE */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Start Date

            </label>

            <input
              type="date"
              value={activityDate}
              onChange={(e) =>
                setActivityDate(
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

          {/* END DATE */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              End Date

            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
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

          {/* START TIME */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Start Time

            </label>

            <input
              type="time"
              value={activityTime}
              onChange={(e) =>
                setActivityTime(
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

          {/* END TIME */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              End Time

            </label>

            <input
              type="time"
              value={endTime}
              onChange={(e) =>
                setEndTime(
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

          {/* LOCATION */}
<div className="
  md:col-span-2
  relative
">

  <label className="
    block
    mb-2

    text-sm
    font-semibold
    text-gray-700
  ">

    Search Location

  </label>

  <div className="
    flex
    gap-3
  ">

    {/* INPUT */}
    <input

  placeholder="
  Example:
  Iloilo Provincial Capitol
  "

  value={locationName}

  onChange={(e) => {

  const value =
    e.target.value

  setLocationName(value)

  // CLEAR OLD TIMER
  if (searchTimeout) {

    clearTimeout(
      searchTimeout
    )
  }

  // WAIT BEFORE SEARCHING
  const timeout =
    setTimeout(() => {

      if (
        value.length >= 3
      ) {

        searchLocation(value)

      } else {

        setShowSuggestions(
          false
        )
      }

    }, 700)

  setSearchTimeout(
    timeout
  )

}}

  className="
    flex-1

    border
    border-gray-200

    rounded-2xl

    px-4
    py-4

    focus:outline-none
    focus:ring-4
    focus:ring-orange-100
  "
/>

{/* VENUE DETAILS */}
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

    Venue / Room Details

  </label>

  <input

    placeholder="
    Example:
    Building A,
    4th Floor,
    Conference Room A
    "

    value={venueDetails}

    onChange={(e) =>
      setVenueDetails(
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

      focus:outline-none
      focus:ring-4
      focus:ring-orange-100
    "
  />

  <p className="
    text-xs
    text-gray-500

    mt-2
  ">

    Specify the exact venue,
    room,
    floor,
    building,
    or meeting hall.

  </p>

</div>

    {/* SEARCH BUTTON */}
    <button

      type="button"

      onClick={() =>
        searchLocation(
          `${locationName} Iloilo`
        )
      }

      className="
        bg-orange-500
        hover:bg-orange-600

        text-white

        px-6
        py-4

        rounded-2xl

        font-semibold

        whitespace-nowrap
      "
    >

      Search

    </button>

    {/* MAP BUTTON */}
    <button

      type="button"

      onClick={() => {

        if (!locationName)
          return

        window.open(

          `https://www.google.com/maps/search/${encodeURIComponent(locationName)}`,

          '_blank'
        )

      }}

      className="
        bg-blue-600
        hover:bg-blue-700

        text-white

        px-6
        py-4

        rounded-2xl

        font-semibold

        whitespace-nowrap
      "
    >

      Map

    </button>

  </div>

  {/* HELPER */}
  <p className="
    text-xs
    text-gray-500

    mt-2
  ">

    Tip:
    Add barangay,
    municipality,
    or “Iloilo”
    for better search results.

  </p>

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

            hover:bg-orange-50

            border-b

            text-sm
          "
        >

          <div className="
            font-semibold
            text-blue-900
          ">

            📍 {place.name || 'Location'}

          </div>

          <div className="
            text-gray-600
            mt-1
          ">

            {place.display_name}

          </div>

        </button>

      ))}

    </div>

  )}

</div>

{/* DEBUG */}
<p className="
  text-xs
  text-gray-400
  mt-2
">

  Suggestions:
  {locationSuggestions.length}

</p>

          {/* STATUS */}
          <div>

            <label className="
              block
              mb-2

              text-sm
              font-semibold
              text-gray-700
            ">

              Status

            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
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

        </div>

        {/* FOOTER */}
        <div className="
          flex
          justify-end
          gap-4

          mt-10
        ">

          <button

            onClick={() => {

              resetForm()

              setEditingId(null)

            }}

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

            onClick={saveActivity}

            className="
              px-8
              py-4

              rounded-2xl

              bg-orange-500
              hover:bg-orange-600

              text-white

              font-bold

              shadow-lg
            "
          >

            {
              editingId !== 'new'

                ? 'Update Activity'

                : 'Add Activity'
            }

          </button>

        </div>

      </div>

    </div>

  </div>

)}

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
  inline-flex
  items-center
  justify-center

  min-w-30
  h-12

  px-6

  rounded-full

  text-sm
  font-bold
  uppercase

  whitespace-nowrap

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

                {activity.venue_details && (

  <div>

    🏢 Venue:
    {' '}

    <span className="
      font-semibold
      text-blue-800
    ">

      {activity.venue_details}

    </span>

  </div>

)}
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

            {/* ATTENDEES */}
            <div className="
              mt-6
            ">

              <h3 className="
                text-lg
                font-bold
                text-blue-900
                mb-4
              ">

                Attendees

              </h3>

              <div className="
                space-y-3
              ">

                {attendees

                  .filter(
                    (a: any) =>

                      a.activity_id ===
                      activity.id
                  )

                  .map(
                    (
                      attendee: any
                    ) => (

                    <div
                      key={attendee.id}
                      className="
                        bg-purple-50
                        border
                        border-purple-200
                        rounded-2xl
                        p-4
                      "
                    >

                      <p className="
                        font-bold
                        text-blue-900
                      ">

                        {
                          attendee.attendee_name
                        }

                      </p>

                      <p className="
                        text-sm
                        text-gray-600
                      ">

                        {attendee.designation}

                      </p>

                      <p className="
                        text-sm
                        text-gray-500
                      ">

                        {attendee.division}

                      </p>

                    </div>

                  ))}

              </div>

 {/* ATTENDEE ACTIONS */}
<div className="
  mt-5
">

  {/* SHOW BUTTON */}
  {!showSelector[
    activity.id
  ] && (

    <button

      type="button"

      onClick={() =>

        setShowSelector({

          ...showSelector,

          [activity.id]:
            true,

        })
      }

      className="
        bg-purple-600
        hover:bg-purple-700

        text-white

        px-5 py-3

        rounded-2xl

        font-semibold
      "
    >

      Manage Attendees

    </button>

  )}

  {/* SELECTOR */}
  {showSelector[
    activity.id
  ] && (

    <div className="
      mt-5
      space-y-4
    ">

      {/* CHECKLIST */}
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-3

        max-h-72
        overflow-y-auto

        border
        rounded-2xl

        p-4
      ">

        {employees.map(
          (
            emp: any
          ) => {

            const selected =

              selectedEmployees[
                activity.id
              ] || []

            const exists =

              selected.some(
                (
                  s: any
                ) =>

                  s.id === emp.id
              )

            return (

              <div
                key={emp.id}

                onClick={() => {

                  let updated = []

                  if (exists) {

                    updated =

                      selected.filter(
                        (
                          s: any
                        ) =>

                          s.id !== emp.id
                      )

                  } else {

                    updated = [
                      ...selected,
                      emp,
                    ]
                  }

                  setSelectedEmployees({

                    ...selectedEmployees,

                    [activity.id]:
                      updated,

                  })
                }}

                className={`
                  flex
                  items-center
                  gap-3

                  border
                  rounded-xl

                  px-4 py-3

                  cursor-pointer
                  transition

                  ${
                    exists

                      ? `
                        bg-blue-600
                        text-white
                        border-blue-600
                      `

                      : `
                        bg-white
                        hover:bg-gray-50
                      `
                  }
                `}
              >

                <input
                  type="checkbox"

                  checked={exists}

                  readOnly
                />

                <span className="
                  font-medium
                ">

                  {emp.name}

                </span>

              </div>

            )
          }
        )}

      </div>

      {/* BUTTONS */}
      <div className="
        flex
        flex-wrap
        gap-3
      ">

        <button

          type="button"

          onClick={() =>
            addAttendee(
              activity.id
            )
          }

          className="
            bg-green-600
            hover:bg-green-700

            text-white

            px-5 py-3

            rounded-2xl

            font-semibold
          "
        >

          Add Selected Employees

        </button>

        <button

          type="button"

          onClick={() =>

            setShowSelector({

              ...showSelector,

              [activity.id]:
                false,

            })
          }

          className="
            bg-gray-200
            hover:bg-gray-300

            px-5 py-3

            rounded-2xl
          "
        >

          Cancel

        </button>

      </div>

    </div>

  )}

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
