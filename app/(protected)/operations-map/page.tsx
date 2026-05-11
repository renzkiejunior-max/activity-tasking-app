'use client'

import {
  useEffect,
  useState,
} from 'react'

import dynamic
from 'next/dynamic'

import {
  useMap,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import { useMemo }
from 'react'

import { supabase }
from '../../../lib/supabase'

import ProtectedRoute
from '../../../components/ProtectedRoute'



// DYNAMIC LEAFLET
const MapContainer = dynamic(
  () =>
    import('react-leaflet').then(
      (mod) => mod.MapContainer
    ),
  {
    ssr: false,
  }
)

const TileLayer = dynamic(
  () =>
    import('react-leaflet').then(
      (mod) => mod.TileLayer
    ),
  {
    ssr: false,
  }
)

const Marker = dynamic(
  () =>
    import('react-leaflet').then(
      (mod) => mod.Marker
    ),
  {
    ssr: false,
  }
)

const Popup = dynamic(
  () =>
    import('react-leaflet').then(
      (mod) => mod.Popup
    ),
  {
    ssr: false,
  }
)

// FLY TO LOCATION
function FlyToLocation({
  lat,
  lng,
}: {
  lat: number
  lng: number
}) {

  const map = useMap()

  useEffect(() => {

    map.flyTo(
      [lat, lng],
      15,
      {
        duration: 1.5,
      }
    )

  }, [lat, lng, map])

  return null
}

export default function Page() {

  const [activities, setActivities] =
    useState<any[]>([])

  const [selectedActivity, setSelectedActivity] =
    useState<any>(null)

  const [customIcon, setCustomIcon] =
  useState<any>(null)

// CREATE CUSTOM ICON
useEffect(() => {

  const loadIcon =
    async () => {

      const L =
        (await import('leaflet'))
        .default

      const icon =
        new L.Icon({

          iconUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

          iconRetinaUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

          shadowUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

          iconSize:
            [25, 41],

          iconAnchor:
            [12, 41],

          popupAnchor:
            [1, -34],

          shadowSize:
            [41, 41],

        })

      setCustomIcon(icon)
    }

  loadIcon()

}, [])   

  // LOAD ACTIVITIES
  const loadActivities = async () => {

    const { data } =
      await supabase
        .from('activities')
        .select('*')
        .order('activity_date', {
          ascending: true,
        })

    setActivities(data || [])
  }

  useEffect(() => {
    loadActivities()
  }, [])

  // TODAY
  const today = new Date()

  // COUNTS
  const totalActivities =
    activities.length

  const upcomingActivities =
    activities.filter(
      (a: any) =>
        new Date(a.activity_date) >=
        today
    ).length

  return (

    <ProtectedRoute
      allowedRoles={[
        'admin',
        'office_chief',
        'chief',
      ]}
    >

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
            Operations Map
          </h1>

          <p className="
            text-gray-600
            mt-2
          ">
            Geographic activity
            monitoring and operational
            visualization
          </p>

        </div>

        {/* SUMMARY */}
        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
        ">

          {/* TOTAL */}
          <div className="
            bg-linear-to-br
            from-blue-600
            to-blue-800

            rounded-3xl
            shadow-xl

            p-6

            text-white
          ">

            <h2 className="
              text-sm
              uppercase
              tracking-wide
            ">
              Total Activities
            </h2>

            <p className="
              text-5xl
              font-bold
              mt-4
            ">
              {totalActivities}
            </p>

          </div>

          {/* UPCOMING */}
          <div className="
            bg-linear-to-br
            from-orange-500
            to-orange-700

            rounded-3xl
            shadow-xl

            p-6

            text-white
          ">

            <h2 className="
              text-sm
              uppercase
              tracking-wide
            ">
              Upcoming Activities
            </h2>

            <p className="
              text-5xl
              font-bold
              mt-4
            ">
              {upcomingActivities}
            </p>

          </div>

        </div>

        {/* MAIN GRID */}
        <div className="
          grid
          grid-cols-1
          xl:grid-cols-4
          gap-6
        ">

          {/* SIDEBAR */}
          <div className="
            xl:col-span-1

            bg-white
            rounded-3xl
            shadow-xl
            border

            p-5

            h-fit
          ">

            <h2 className="
              text-2xl
              font-bold
              text-blue-900
              mb-5
            ">
              Activities
            </h2>

            <div className="
              space-y-4

              max-h-175
              overflow-y-auto
            ">

              {activities.map(
                (activity: any) => (

                <button

                  key={activity.id}

                  onClick={() => {

                    setSelectedActivity(
                      activity
                    )

                  }}

                  className={`
                    w-full
                    text-left

                    rounded-2xl
                    border

                    p-4

                    transition

                    hover:shadow-lg

                    ${
                      selectedActivity?.id ===
                      activity.id

                        ? `
                          border-blue-500
                          bg-blue-50
                        `

                        : `
                          bg-white
                        `
                    }
                  `}
                >

                  <h3 className="
                    font-bold
                    text-blue-900
                  ">
                    {activity.title}
                  </h3>

                  <p className="
                    text-sm
                    text-gray-600
                    mt-2
                  ">
                    📅
                    {' '}
                    {
                      activity.activity_date
                    }
                  </p>

                  <p className="
                    text-sm
                    text-gray-600
                    mt-1
                  ">
                    📍
                    {' '}
                    {
                      activity.location_name
                    }
                  </p>

                </button>

              ))}

            </div>

          </div>

          {/* MAP */}
          <div className="
            xl:col-span-3

            bg-white
            rounded-3xl
            shadow-xl
            border

            overflow-hidden
          ">

            <div className="
              h-125
              md:h-175
              w-full
            ">

              <MapContainer

                center={[
                  10.7202,
                  122.5621,
                ]}

                zoom={10}

                style={{
                  width: '100%',
                  height: '100%',
                }}
              >

                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />

                {/* FOCUS LOCATION */}
                {selectedActivity &&
                  selectedActivity.latitude &&
                  selectedActivity.longitude && (

                  <FlyToLocation

                    lat={
                      selectedActivity.latitude
                    }

                    lng={
                      selectedActivity.longitude
                    }

                  />

                )}

                {/* MARKERS */}
                {activities.map(
                  (activity: any) => {

                  if (
                    !activity.latitude ||
                    !activity.longitude ||
                    !customIcon
                  ) {
                    return null
                  }

                  return (

                    <Marker

  icon={customIcon}


                      key={activity.id}

                      position={[
                        activity.latitude,
                        activity.longitude,
                      ]}
                    >

                      <Popup>

                        <div className="
                          space-y-3
                          min-w-55
                        ">

                          <h2 className="
                            text-xl
                            font-bold
                            text-blue-900
                          ">
                            {activity.title}
                          </h2>

                          <p className="
                            text-gray-700
                          ">
                            {
                              activity.description
                            }
                          </p>

                          <div className="
                            space-y-1
                            text-sm
                          ">

                            <p>
                              📍
                              {' '}
                              {
                                activity.location_name
                              }
                            </p>

                            <p>
                              📅
                              {' '}
                              {
                                activity.activity_date
                              }
                            </p>

                            <p>
                              🕒
                              {' '}
                              {
                                activity.activity_time
                              }
                            </p>

                          </div>

                        </div>

                      </Popup>

                    </Marker>

                  )
                })}

              </MapContainer>

            </div>

          </div>

        </div>

      </div>

    </ProtectedRoute>
  )
}