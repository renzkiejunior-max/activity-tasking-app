'use client'

import { useAuth }
from '@/contexts/AuthContext'

import imageCompression
from 'browser-image-compression'

import QRCode
from 'qrcode'

import {   useEffect,   useState, } from 'react'

import { supabase }
from '../../../lib/supabase'

import {   offlineDB, } from '../../../lib/offline-db'

import jsPDF
from 'jspdf'

import html2canvas
from 'html2canvas-pro'

import ActivityDetailsModal from '@/components/activities/ActivityDetailsModal'

console.log(
  'ActivityDetailsModal =',
  ActivityDetailsModal
)


export default function Page() {

  const {
  userData
} = useAuth()

const isStaff =

  userData?.roles
    ?.includes(
      'staff'
    )

    const isOfficeChief =

  userData?.roles
    ?.includes(
      'office_chief'
    )

const isAdmin =

  userData?.roles
    ?.includes(
      'admin'
    )

  const canManageActivities =

  isAdmin ||

  isOfficeChief

  const [activities, setActivities] =
    useState<any[]>([])

    const [
  assignments,
  setAssignments
] = useState<any[]>([])

    const [
  selectedActivity,
  setSelectedActivity
] = useState<any>(null)

const [
  showActivityModal,
  setShowActivityModal
] = useState(false)

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

  const [communicationFile,
  setCommunicationFile] =
  useState<any>(null)

const [communicationUrl,
  setCommunicationUrl] =
  useState('')

  const [
  previewImage,
  setPreviewImage,
] = useState('')

const [qrCode, setQrCode] =
useState('')

// DOCUMENT PREVIEW
const [
  documentPreview,
  setDocumentPreview
] = useState('')

// TRAVEL ORDER EDITOR
const [
  showTravelOrderModal,
  setShowTravelOrderModal
] = useState(false)


const [
  toNumber,
  setToNumber
] = useState('')

const [
  documentDate,
  setDocumentDate
] = useState('')

const [
  recipients,
  setRecipients
] = useState('')

const [
  purpose,
  setPurpose
] = useState('')

const [
  fundingStatement,
  setFundingStatement
] = useState(
`Payment of travel expenses and services rendered by JO/JOSS/COS personnel is hereby authorized, chargeable against the current PDRRMO budget, subject to the usual accounting and auditing rules and regulations.`
)

const [
  closingStatement,
  setClosingStatement
] = useState(
  'Please be guided accordingly.'
)

const [
  approvedBy,
  setApprovedBy
] = useState(
  'PCOL CORNELIO R. SALINAS (RET), MPA, PESE'
)

const [
  approvedPosition,
  setApprovedPosition
] = useState(
  'PGDH, PDRRMO ILOILO'
)

const [
  referenceNo,
  setReferenceNo
] = useState('')

const [
  isOIC,
  setIsOIC
] = useState(false)

const [
  showDocumentModal,
  setShowDocumentModal
] = useState(false)
  
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
    let query =

  supabase

    .from('activities')

    .select('*')

if (isStaff) {

  query = query.or(`
    approval_status.eq.approved,
    approval_status.is.null
  `)
}

const { data } =

  await query
    .order(
      'approval_status',
      {
        ascending: true,
      }
    )
    .order(
      'activity_date',
      {
        ascending: true,
      }
    )

const sortedActivities =

  (data || []).sort(
    (
      a: any,
      b: any
    ) => {

      // PENDING FIRST
      if (
        a.approval_status ===
        'pending' &&

        b.approval_status !==
        'pending'
      ) {

        return -1
      }

      if (
        a.approval_status !==
        'pending' &&

        b.approval_status ===
        'pending'
      ) {

        return 1
      }

      // THEN BY DATE
      return (
        new Date(
          a.activity_date
        ).getTime()

        -

        new Date(
          b.activity_date
        ).getTime()
      )
    }
  )

setActivities(
  sortedActivities
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


// FETCH ASSIGNMENTS
const fetchAssignments =
  async () => {

    const { data } =
      await supabase

        .from('assignments')

        .select('*')

        .order(
          'created_at',
          {
            ascending: false,
          }
        )

    setAssignments(
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

const openActivityModal = (
  activity: any
) => {

  setSelectedActivity(
    activity
  )

  setShowActivityModal(
    true
  )
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
    setVenueDetails('')
    setLatitude('')
    setLongitude('')
    setStatus('upcoming')
    setFocalPerson('')
    setProgramName('')

    setLocationSuggestions([])

    setShowSuggestions(false)

    setEditingId(null)

    setCommunicationFile(null)

    setCommunicationUrl('')
  }

  // SAVE
  const saveActivity = async () => {

    if (!title || !activityDate) {

      return alert(
        'Title and Date required'
      )
    }

// FILE URL
let uploadedFileUrl =
  communicationUrl || ''

// UPLOAD FILE
if (communicationFile) {

  let fileToUpload =
    communicationFile

  // IMAGE COMPRESSION
  if (
    communicationFile.type.startsWith(
      'image/'
    )
  ) {

    fileToUpload =
      await imageCompression(

        communicationFile,

        {

          maxSizeMB: 0.7,

          maxWidthOrHeight: 1920,

          useWebWorker: true,

        }
      )
  }

  const cleanFileName =

  fileToUpload.name

    .replace(/\s+/g, '-')

    .replace(/[^a-zA-Z0-9.-]/g, '')

const fileName =

`${Date.now()}-${cleanFileName}`

  const {
    error: uploadError,
  } = await supabase.storage

    .from(
      'activity-communications'
    )

    .upload(

  fileName,

  fileToUpload,

  {
    upsert: true,
  }
)

  if (uploadError) {

    return alert(
      uploadError.message
    )
  }

  const {
    data: publicUrlData,
  } = supabase.storage

    .from(
      'activity-communications'
    )

    .getPublicUrl(
      fileName
    )

  uploadedFileUrl =
    publicUrlData.publicUrl
}

    const payload = {

      communication_url:
  uploadedFileUrl,

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

      approval_status:

  editingId &&
  editingId !== 'new'

    ? undefined

    : 'pending',

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
        return console.log(error)

alert(
  JSON.stringify(
    error,
    null,
    2
  )
)
      }

      alert(
        'Updated successfully'
      )

      setCommunicationFile(null)

    } else {

      // INSERT
      const { error } =
        await supabase
          .from('activities')
          .insert([payload])

      if (error) {
        return console.log(error)
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

setVenueDetails( 
  activity.venue_details || ''
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

    setCommunicationUrl(
  activity.communication_url || ''
)

    setShowSuggestions(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

// APPROVE ACTIVITY
const approveActivity =
  async (
    activityId: string
  ) => {

    const {
      data: {
        user,
      },
    } = await supabase
      .auth.getUser()

    if (!user) return

    // GET EMPLOYEE
    const {
      data: employee,
    } = await supabase

      .from('employees')

      .select('*')

      .eq(
        'user_id',
        user.id
      )

      .single()

    const { error } =
      await supabase

        .from('activities')

        .update({

          approval_status:
            'approved',

          reviewed_by:
            employee?.name,

          approved_at:
            new Date()
              .toISOString(),
        })

        .eq(
          'id',
          activityId
        )

    if (error) {

      return alert(
        error.message
      )
    }

    alert(
      'Activity approved'
    )

    fetchActivities()
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
      return console.log(error)
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

// DETERMINE DOCUMENT TYPE
const getDocumentType = (
  location: string
) => {

  const lowerLocation =
    location.toLowerCase()

  // INSIDE ILOILO CITY
  if (

    lowerLocation.includes(
      'iloilo city'
    ) ||

    lowerLocation.includes(
      'lapaz'
    ) ||

    lowerLocation.includes(
      'jaro'
    ) ||

    lowerLocation.includes(
      'molo'
    ) ||

    lowerLocation.includes(
      'mandurriao'
    ) ||

    lowerLocation.includes(
      'arevalo'
    )

  ) {

    return 'OO'
  }

  // OUTSIDE CITY
  return 'TO'
}


    // FORMAT DATE
const formatDate = (
  date: string
) => {

  if (!date)
    return 'N/A'

  return new Date(date)
    .toLocaleDateString(

      'en-US',

      {

        year: 'numeric',

        month: 'long',

        day: 'numeric',
      }
    )
}

// FORMAT TIME
const formatTime = (
  time: string
) => {

  if (!time)
    return 'N/A'

  const [hours, minutes] =
    time.split(':')

  const date =
    new Date()

  date.setHours(
    Number(hours)
  )

  date.setMinutes(
    Number(minutes)
  )

  return date
    .toLocaleTimeString(

      'en-US',

      {

        hour: 'numeric',

        minute: '2-digit',

        hour12: true,
      }
    )
}

const saveTravelOrderPDF =
async () => {

  const input =
  document.getElementById(
    'travel-order-preview'
  )

if (!input) return


  const buttons =
    input.querySelector(
      '.no-print'
    ) as HTMLElement


  if (buttons)
    buttons.style.display =
      'none'

  const canvas =
  await html2canvas(
  input,
  {
    scale: 4,
    backgroundColor: '#ffffff',
    useCORS: true,
    removeContainer: true
  }
)

  if (buttons)
    buttons.style.display =
      'flex'

  const imgData =
    canvas.toDataURL(
      'image/png'
    )

  const pdf =
    new jsPDF(
      'p',
      'in',
      'letter'
    )

  const pdfWidth = 8.5

const pdfHeight =
  (canvas.height * pdfWidth)
  / canvas.width

pdf.addImage(
  imgData,
  'PNG',
  0,
  0,
  pdfWidth,
  pdfHeight
)

  pdf.save(
    `Travel-Order-${
      toNumber || 'Draft'
    }.pdf`
  )

}

useEffect(() => {

  const qrContent = `
TRAVEL ORDER

Activity:
${selectedActivity?.title || ''}

Location:
${selectedActivity?.location_name || ''}

Venue:
${selectedActivity?.venue_details || ''}

Date:
${documentDate}

Time:
${formatTime(selectedActivity?.activity_time)}

Travel Order No:
${toNumber || 'N/A'}

Attendees:
${recipients
  .split('\n')
  .filter(name => name.trim())
  .join('\n')}
`

  QRCode.toDataURL(
    qrContent,
    {
      width: 200,
      margin: 1
    }
  ).then(
    setQrCode
  )

}, [
  selectedActivity,
  documentDate,
  toNumber,
  recipients
])


const printTravelOrderAsImage =
async () => {

 const input =
  document.getElementById(
    'travel-order-preview'
  ) as HTMLElement

if (!input) return


  const canvas =
  await html2canvas(
    input,
    {
      scale: 4,
      useCORS: true,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        return element.classList?.contains('no-print')
      }
    }
  )

  const image =
    canvas.toDataURL(
      'image/png'
    )

  const printWindow =
    window.open(
      '',
      '_blank'
    )

  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>

        <title>
          Travel Order
        </title>

        <style>

          body{
            margin:0;
            padding:0;
            text-align:center;
            background:white;
          }

          img{
  width:8.5in;
  display:block;
  margin:auto;
}

          @page{
            size:letter;
            margin:0;
          }

        </style>

      </head>

      <body>

        <img src="${image}" />

      </body>

    </html>
  `)

  printWindow.document.close()

  setTimeout(() => {

    printWindow.print()

    printWindow.close()

  }, 500)

}


// GENERATE TO / OO
const generateDocument =
  async (
    activity: any
  ) => {

    const documentType =

      getDocumentType(
        activity.location_name || ''
      )

    // GET ATTENDEES
    const activityAttendees =

      attendees.filter(
        (a: any) =>

          a.activity_id ===
          activity.id
      )

    const attendeeNames =

      activityAttendees

        .map(
          (a: any) =>

            a.attendee_name
        )

        .join('\n')

    // QR CONTENT
    const qrContent = `

Activity:
${activity.title}

Location:
${activity.location_name}

Venue:
${activity.venue_details || 'N/A'}

Date:
${formatDate(
  activity.activity_date
)}

Time:
${formatTime(
  activity.activity_time
)}

Focal Person:
${activity.focal_person || 'N/A'}

Attendees:
${attendeeNames}
`

    // GENERATE QR
    const qrCodeDataUrl =
      await QRCode.toDataURL(
        qrContent
      )

    // OPEN WINDOW
    const documentHTML = `

<html>

  <head>

    <title>
      ${documentType}
    </title>

    <style>

      body {

        font-family:
          "Times New Roman",
          serif;

        padding:
          60px;

        line-height:
          1.5;
      }

      .center {

        text-align:
          center;
      }

      .title {

        font-size:
          22px;

        font-weight:
          bold;
      }

      .section {

        margin-top:
          35px;
      }

      .names {

        white-space:
          pre-line;

        font-weight:
          bold;

        margin-left:
          120px;
      }

    </style>

  </head>

  <body>

    <div class="center">

      <div>
        Republic of the Philippines
      </div>

      <div class="title">
        PROVINCIAL DISASTER RISK
        REDUCTION AND
        MANAGEMENT OFFICE
      </div>

      <div>
        Iloilo Provincial Government
      </div>

      <div>
        Iloilo City
      </div>

    </div>

    <div
      style="
        text-align:center;
        margin-top:20px;
      "
    >

      <img

        src="${qrCodeDataUrl}"

        width="120"

      />

      <div
        style="
          font-size:12px;
          margin-top:6px;
        "
      >

        Activity Verification QR

      </div>

    </div>

    <hr />

    <div class="section">

      ${formatDate(
        activity.activity_date
      )}

    </div>

    <div class="section">

      <b>

        ${
          documentType ===
          'TO'

            ? 'TRAVEL ORDER NO.'

            : 'OFFICE ORDER NO.'
        }

      </b>

      __________

    </div>

    <div class="section">

      <table>

        <tr>

          <td width="120">
            <b>TO</b>
          </td>

          <td class="names">

            ${attendeeNames}

          </td>

        </tr>

      </table>

    </div>

    <div class="section">

      ${
        documentType ===
        'TO'

          ? `
            In the interest of the service,
            you are hereby directed
            to travel on official time
          `

          : `     
            In the interest of the service,
            you are hereby directed
            to report on official duty
          `
      }

      to

      <b>
        ${activity.location_name}
      </b>

      on

      <b>
        ${formatDate(
          activity.activity_date
        )}
      </b>

      at

      <b>
        ${formatTime(
          activity.activity_time
        )}
      </b>

      to participate in:

      <b>
        ${activity.title}
      </b>.

    </div>

    <div class="section">

      Please be guided accordingly.

    </div>

    <div class="section">

      <b>
  ${approvedBy}
</b>

<br />

${approvedPosition}

${
  isOIC && referenceNo
    ? `<br />${referenceNo}`
    : ''
}

    </div>

  </body>

</html>
`

setDocumentPreview(
  documentHTML
)

setShowDocumentModal(
  true
)
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
  fetchAssignments()

}, [])

  return (



    

    <div className="
  w-full
  min-w-0
  overflow-x-hidden

  space-y-4
  lg:space-y-6
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

      mt-2
    ">

      Activities

    </h1>

    <p className="
      text-orange-50

      text-lg

      mt-2

      max-w-2xl
    ">

      Manage operational activities,
      coordination meetings,
      tasking schedules,
      attendee assignments,
      and preparedness workflows.

    </p>

  </div>

  </div>

  {/* RIGHT */}

{canManageActivities && (

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
      ">activity

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

)}

{/* ACTIVITY MODAL */}
{editingId && (

  <div className="
    fixed
    inset-0
    z-100000

    bg-black/50
    backdrop-blur-sm

    overflow-y-auto

    flex
    items-center
    justify-center

    pt-8
    pb-6

    px-3
    lg:p-6
  ">

    <div className="
      relative

      bg-white

      w-full
      max-w-6xl

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

        px-4
        py-3

        lg:px-6
        lg:py-4

        text-white
      ">

        <div className="
          flex
          justify-between
          items-start
          gap-3
        ">

          <div>

            <div className="
              inline-flex
              items-center
              gap-2

              bg-white/20

              px-3
              py-1

              rounded-full

              text-xs
              font-semibold
            ">

              📅 Operations Activity

            </div>

            <h2 className="
              text-2xl
              lg:text-3xl
              font-black

              mt-1
            ">

              {
                editingId !== 'new'

                  ? 'Edit Activity'

                  : 'Add Activity'
              }

            </h2>

            <p className="
              text-orange-50
              mt-2
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

          {/* COMMUNICATION FILE */}
<div className="
  md:col-span-2
">

  <label className="
    block
    mb-3

    text-sm
    font-semibold
    text-gray-700
  ">

    Official Communication / Reference File

  </label>

  <label className="
    relative

    flex
    items-center
    gap-5

    border-2
    border-dashed
    border-orange-300

    bg-orange-50

    hover:bg-orange-100

    rounded-3xl

    p-6

    cursor-pointer

    transition
  ">

    {/* ICON */}
    <div className="
      w-16
      h-16

      rounded-2xl

      bg-white

      flex
      items-center
      justify-center

      shadow-md

      text-4xl
    ">

      📋

    </div>

    {/* TEXT */}
    <div className="
      flex-1
      min-w-0
    ">

      <h3 className="
        text-lg
        font-bold
        text-orange-700
      ">

        Upload Communication File

      </h3>

      <p className="
        text-sm
        text-gray-600

        mt-1
      ">

        Upload memorandums,
        endorsements,
        advisories,
        office communications,
        PDFs,
        or images.

      </p>

      <p className="
        text-xs
        text-gray-500

        mt-2
      ">

        Images are automatically compressed
        before upload.

      </p>

      {/* FILE NAME */}
      {communicationFile && (

        <div className="
          mt-3

          inline-flex
          items-center
          gap-2

          bg-green-100
          text-green-700

          px-4
          py-2

          rounded-full

          text-sm
          font-semibold

          max-w-full
        ">

          📎

          <span className="
            truncate
          ">

            {
              communicationFile.name
            }

          </span>

        </div>

      )}

    </div>

    {/* HIDDEN INPUT */}
    <input

      type="file"

      accept="
        .pdf,
        .doc,
        .docx,
        image/*
      "

      onChange={(e) =>
        setCommunicationFile(
          e.target.files?.[0]
        )
      }

      className="
        hidden
      "
    />

  </label>

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

  {/* MOBILE RESPONSIVE */}
  <div className="
    flex
    flex-col

    gap-4
  ">

    {/* LOCATION INPUT */}
    <div>

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

          // CLEAR TIMER
          if (searchTimeout) {

            clearTimeout(
              searchTimeout
            )
          }

          // DELAY SEARCH
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

        Tip:
        Add barangay,
        municipality,
        or “Iloilo”
        for better search results.

      </p>

    </div>

    {/* VENUE */}
    <div>

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

        Specify exact room,
        building,
        floor,
        or meeting hall.

      </p>

    </div>

    {/* BUTTONS */}
    <div className="
      flex
      flex-col

      sm:flex-row

      gap-3
    ">

      {/* SEARCH */}
      <button

        type="button"

        onClick={() =>
          searchLocation(
            `${locationName} Iloilo`
          )
        }

        className="
          flex-1

          bg-orange-500
          hover:bg-orange-600

          text-white

          px-6
          py-4

          rounded-2xl

          font-semibold
        "
      >

        Search Location

      </button>

      {/* MAP */}
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
          flex-1

          bg-blue-600
          hover:bg-blue-700

          text-white

          px-6
          py-4

          rounded-2xl

          font-semibold
        "
      >

        Open Map

      </button>

    </div>

  </div>

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

            📍
            {' '}

            {place.name || 'Location'}

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
    Activity Registry
  </h2>

  <div className="overflow-x-auto">

    <table className="
      w-full
      text-sm
    ">

      <thead>

        <tr className="
          bg-blue-900
          text-white
        ">

          <th className="p-4 text-left">
            Title
          </th>

          <th className="p-4 text-left">
            Location
          </th>

          <th className="p-4 text-left">
            Date
          </th>

          <th className="p-4 text-left">
            Time
          </th>

          <th className="p-4 text-left">
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        {activities.map(
          (activity:any) => (

          <tr

  key={activity.id}

  onClick={() => {

  openActivityModal(activity)

}}

  className="
    border-b
    cursor-pointer
    hover:bg-blue-50
  "
>

            <td className="p-4 font-medium">
              {activity.title}
            </td>

            <td className="p-4">
              {activity.location_name}
            </td>

            <td className="p-4">
              {
                formatDate(
                  activity.activity_date
                )
              }
            </td>

            <td className="p-4">
              {
                formatTime(
                  activity.activity_time
                )
              }
            </td>

            <td className="p-4">
              {activity.approval_status}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>


      

{/* DOCUMENT PREVIEW MODAL */}
{
  showDocumentModal && (

    <div className="
      fixed
      inset-0

      z-9999

      bg-black/70

      flex
      items-center
      justify-center

      p-4
    ">

      <div className="
        bg-white

        w-full
        max-w-6xl

        h-[90vh]

        rounded-3xl

        overflow-hidden

        flex
        flex-col
      ">

        {/* HEADER */}
        <div className="
          bg-orange-500

          text-white

          px-6 py-4

          flex
          items-center
          justify-between
        ">

          <h2 className="
            text-2xl
            font-bold
          ">

            Document Preview

          </h2>

          <div className="
            flex
            gap-3
          ">

            {/* PRINT */}
            <button

  onClick={
  saveTravelOrderPDF
}

  className="
  bg-green-600
  text-white
  px-5
  py-2
  rounded-xl
  "
>

Print

</button>

            {/* SAVE PDF */}
            <button

              onClick={saveTravelOrderPDF}

              className="
                bg-blue-600
                text-white

                px-5 py-2

                rounded-xl

                font-bold
              "
            >

              Save PDF

            </button>

            <button

onClick={async () => {

  const input =
  document.getElementById(
    'travel-order-preview'
  )

if (!input) return

  const canvas =
    await html2canvas(
      input,
      {
        scale: 4
      }
    )

  const link =
    document.createElement('a')

  link.download =
    `Travel-Order-${
      toNumber || 'Draft'
    }.png`

  link.href =
    canvas.toDataURL(
      'image/png'
    )

  link.click()

}}

className="
bg-purple-600
text-white
px-5
py-2
rounded-xl
"
>

Save PNG

</button>

            {/* CLOSE */}
            <button

              onClick={() =>
                setShowDocumentModal(
                  false
                )
              }

              className="
                bg-red-500

                px-5 py-2

                rounded-xl

                font-bold
              "
            >

              Close

            </button>

          </div>

        </div>

        {/* DOCUMENT */}
        <iframe

          srcDoc={
            documentPreview
          }

          className="
            flex-1
            bg-white
          "
        />

      </div>

    </div>

  )
}


{/* TRAVEL ORDER EDITOR */}
{
showTravelOrderModal &&
selectedActivity && (

<div className="
fixed
inset-0
z-100000
bg-black/60
flex
items-center
justify-center
p-4
">

<div className="
bg-white
w-full
max-w-7xl
h-[95vh]
rounded-3xl
overflow-hidden
grid
grid-cols-12
">

{/* LEFT PANEL */}

<div className="
col-span-4
border-r
overflow-y-auto
p-6
">

<h2 className="
text-2xl
font-bold
mb-6
">
Travel Order Editor
</h2>

<label>
Travel Order No.
</label>

<input
value={toNumber}
onChange={(e)=>
setToNumber(
e.target.value
)}
className="
w-full
border
rounded
p-2
mb-4
"
/>

<label>
Date
</label>

<input
value={documentDate}
onChange={(e)=>
setDocumentDate(
e.target.value
)}
className="
w-full
border
rounded
p-2
mb-4
"
/>

<label>
Recipients
</label>

<textarea
rows={6}
value={recipients}
onChange={(e)=>
setRecipients(
e.target.value
)}
className="
w-full
border
rounded
p-2
mb-4
"
/>

<label>
Purpose
</label>

<textarea
rows={8}
value={purpose}
onChange={(e)=>
setPurpose(
e.target.value
)}
className="
w-full
border
rounded
p-2
mb-4
"
/>

<label>
Funding Statement
</label>

<textarea
rows={6}
value={fundingStatement}
onChange={(e)=>
setFundingStatement(
e.target.value
)}
className="
w-full
border
rounded
p-2
mb-4
"
/>

<label>
Approved By
</label>

<input
value={approvedBy}
onChange={(e)=>
setApprovedBy(
e.target.value
)}
className="
w-full
border
rounded
p-2
mb-4
"
/>

<label>
Position
</label>

<input
value={approvedPosition}
onChange={(e)=>
setApprovedPosition(
e.target.value
)}
className="
w-full
border
rounded
p-2
mb-4
"
/>

</div>

{/* PREVIEW */}

<div className="
col-span-8
bg-gray-100
overflow-auto
p-8
">

<div
  id="travel-order-preview"
  className="mx-auto"
  style={{
    backgroundColor: '#ffffff',
    color: '#000000',
    width: '8.5in',
    minHeight: '11in',
    fontFamily: 'Calibri',
    paddingTop: '0.005in'
  }}
>

<img
  src="/travel-order-header.png"
  alt="Travel Order Header"
  className="
  w-[88%]
  mx-auto
  block
  mt-5
  mb-8
"
/>

<div className="
px-22
pb-26
">

<h2 className="
text-center
font-bold
text-2xl
mb-8
">

TRAVEL ORDER

</h2>

<p>
{documentDate}
</p>

<br/>

<p>
<b>
TRAVEL ORDER NO.
</b>
{' '}
{toNumber}
</p>

<br/>

<div
  style={{
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '20px'
  }}
>

  <div
    style={{
      fontWeight: 'bold',
      width: '60px'
    }}
  >
    TO:
  </div>

  <div
    style={{
      flex: 1,
      whiteSpace: 'pre-line'
    }}
  >
    {(() => {

      const names =
        recipients
          .split('\n')
          .filter(
            name =>
              name.trim()
          )

      if (
        names.length <= 5
      ) {

        return names.join('\n')
      }

      const midpoint =
        Math.ceil(
          names.length / 2
        )

      const left =
        names.slice(
          0,
          midpoint
        )

      const right =
        names.slice(
          midpoint
        )

      const rows =
        Math.max(
          left.length,
          right.length
        )

      return (

        <table
          style={{
            width: '100%'
          }}
        >
          <tbody>

            {Array.from({
              length: rows
            }).map(
              (_, index) => (

              <tr key={index}>

                <td
                  style={{
                    width: '50%',
                    verticalAlign:
                      'top'
                  }}
                >
                  {
                    left[index] || ''
                  }
                </td>

                <td
                  style={{
                    width: '50%',
                    verticalAlign:
                      'top'
                  }}
                >
                  {
                    right[index] || ''
                  }
                </td>

              </tr>

            ))}

          </tbody>
        </table>

      )

    })()}
  </div>

</div>

<br/>

<p
className="
text-justify
"
>
{purpose}
</p>

<br/>

<p
className="
text-justify
"
>
{fundingStatement}
</p>

<br/><br/>

<p>
{closingStatement}
</p>

<br/><br/><br/>

<p>
APPROVED:
</p>

<br/><br/>

<p>
<b>
{approvedBy}
</b>
</p>

<p>
{approvedPosition}
</p>

<div
style={{
display:'flex',
justifyContent:'flex-end',
marginTop:'-30px',
marginRight:'15px'
}}
>

{qrCode && (

<img

src={qrCode}

alt="QR Code"

style={{
width:'80px',
height:'80px'
}}

/>

)}

</div>


{
referenceNo && (

<p>
{referenceNo}
</p>



)
}

</div>



</div>



</div>

<div className="
mt-10
flex
gap-3
no-print
">

<button

onClick={
  saveTravelOrderPDF
}

className="
bg-blue-600
text-white
px-5
py-2
rounded-xl
"
>

Save PDF

</button>

<button

onClick={
  printTravelOrderAsImage
}

className="
bg-green-600
text-white
px-5
py-2
rounded-xl
"
>

Print

</button>

<button
onClick={() =>
setShowTravelOrderModal(
false
)
}
className="
bg-red-600
text-white
px-5
py-2
rounded-xl
"
>
Close
</button>

</div>

</div>

</div>

)}


{/* IMAGE PREVIEW MODAL */}
{previewImage && (

  <div className="
    fixed
    inset-0

    z-9999

    bg-black/80

    flex
    items-center
    justify-center

    p-6
  ">

    {/* CLOSE */}
    <button

      onClick={() =>
        setPreviewImage('')
      }

      className="
        absolute
        top-5
        right-5

        w-12
        h-12

        rounded-full

        bg-white

        text-2xl
        font-bold
      "
    >

      ×

    </button>

    <img

      src={previewImage}

      alt="Preview"

      className="
        max-w-full
        max-h-full

        rounded-2xl

        shadow-2xl
      "
    />

  </div>

)}


<ActivityDetailsModal
  open={showActivityModal}
  onClose={() =>
    setShowActivityModal(false)
  }

  activity={selectedActivity}

  attendees={attendees}
  checklists={checklists}
  employees={employees}

  assignments={assignments}

refreshAssignments={
  fetchAssignments
}

  canManageActivities={
    canManageActivities
  }

addAttendee={addAttendee}

selectedEmployees={
  selectedEmployees
}

setSelectedEmployees={
  setSelectedEmployees
}

  isOfficeChief={
    isOfficeChief
  }

  isAdmin={
    isAdmin
  }

  editActivity={
    editActivity
  }

  deleteActivity={
    deleteActivity
  }

  approveActivity={
    approveActivity
  }

  setSelectedActivity={
    setSelectedActivity
  }

  setDocumentDate={
    setDocumentDate
  }

  setRecipients={
    setRecipients
  }

  setPurpose={
    setPurpose
  }

  setShowTravelOrderModal={
    setShowTravelOrderModal
  }

  formatDate={
    formatDate
  }

  formatTime={
    formatTime
  }

  getDocumentType={
    getDocumentType
  }
/>


</div>

)
}
