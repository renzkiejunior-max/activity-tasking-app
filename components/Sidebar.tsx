'use client'

import { useState }
from 'react'

import Link
from 'next/link'

import {
  usePathname,
} from 'next/navigation'

import { useAuth }
from '@/contexts/AuthContext'

const roleLinks: any = {

  admin: [

    {
      name: 'Dashboard',
      href: '/dashboard',
    },

    {
      name: 'Employees',
      href: '/employees',
    },

    {
      name: 'Activities',
      href: '/activities',
    },

    {
      name: 'Assignments',
      href: '/assignments',
    },

    {
      name: 'Calendar',
      href: '/calendar',
    },

    {
      name: 'Timeline',
      href: '/timeline',
    },

    {
      name: 'Kanban Board',
      href: '/kanban',
    },

    {
      name: 'Notifications',
      href: '/notifications',
    },

    {
      name: 'Reports',
      href: '/reports',
    },

    {
      name: 'Operations Map',
      href: '/operations-map',
    },

    {
      name: 'User Management',
      href: '/user-management',
    },

  ],

  office_chief: [

    {
      name: 'Dashboard',
      href: '/dashboard',
    },

    {
      name: 'Activities',
      href: '/activities',
    },

    {
      name: 'Assignments',
      href: '/assignments',
    },

    {
      name: 'Calendar',
      href: '/calendar',
    },

    {
      name: 'Kanban Board',
      href: '/kanban',
    },

    {
      name: 'Notifications',
      href: '/notifications',
    },

    {
      name: 'Operations Map',
      href: '/operations-map',
    },

    {
      name: 'Activity Requests',
      href: '/activity-requests',
    },

  ],

  chief: [

    {
      name: 'Division Dashboard',
      href: '/division-chief',
    },

    {
      name: 'Employees',
      href: '/employees',
    },

    {
      name: 'Assignments',
      href: '/assignments',
    },

    {
      name: 'Kanban Board',
      href: '/kanban',
    },

    {
      name: 'Calendar',
      href: '/calendar',
    },

    {
      name: 'Notifications',
      href: '/notifications',
    },

    {
      name: 'Operations Map',
      href: '/operations-map',
    },

  ],

  staff: [

    {
      name: 'My Tasks',
      href: '/staff',
    },

    {
      name: 'Calendar',
      href: '/calendar',
    },

    {
      name: 'Notifications',
      href: '/notifications',
    },

  ],

}

export default function Sidebar() {

  const pathname =
    usePathname()

  const { userData } =
    useAuth()

  const links =
    roleLinks[
      userData?.role
    ] || []

  const [open, setOpen] =
    useState(false)

  return (

    <>

      {/* MOBILE HEADER */}
      <div className="
        md:hidden

        fixed
        top-0
        left-0
        right-0

        z-50

        bg-blue-900

        px-4 py-3

        flex
        items-center
        justify-between

        shadow-lg
      ">

        {/* LEFT */}
        <div className="
          flex
          items-center
          gap-3
        ">

          {/* LOGO */}
          <img
            src="/PDRRMO.png"
            alt="PDRRMO"
            className="
              w-16 h-16


            "
          />

          {/* TITLE */}
          <div>

            <h1 className="
              text-lg
              font-bold
              text-orange-400
              leading-tight
            ">
              TMS
            </h1>

            <p className="
              text-xs
              text-blue-100
            ">
              Task Management System
            </p>

          </div>

        </div>

        {/* BUTTON */}
        <button

          onClick={() =>
            setOpen(!open)
          }

          className="
            bg-blue-800
            hover:bg-blue-700

            px-3 py-2

            rounded-xl

            text-white
            text-xl
          "
        >

          {open ? '✕' : '☰'}

        </button>

      </div>

      {/* OVERLAY */}
      {open && (

        <div

          onClick={() =>
            setOpen(false)
          }

          className="
            fixed
            inset-0

            bg-black/50

            z-10

            md:hidden
          "
        />

      )}

      {/* SIDEBAR */}
      <aside className={`

        fixed
        top-0
        left-0

        h-screen
        w-72

        bg-blue-900
        text-white

        shadow-2xl

        transform
        transition-transform
        duration-300

        flex
        flex-col

        z-20

        ${
          open
            ? 'translate-x-0'
            : '-translate-x-full'
        }

        md:translate-x-0
      `}>

        {/* DESKTOP HEADER */}
        <div className="
          hidden md:flex

          items-center
          gap-4

          p-6

          border-b
          border-blue-800
        ">

          {/* LOGO */}
          <img
            src="/PDRRMO.png"
            alt="PDRRMO"
            className="
              w-24 h-24


            "
          />

          {/* TITLE */}
          <div>

            <h1 className="
              text-3xl
              font-bold
              text-orange-400
              leading-tight
            ">
              TMS
            </h1>

            <p className="
              text-sm
              text-blue-100
              mt-1
            ">
              Task Management System
            </p>

          </div>

        </div>

        {/* MOBILE SPACING */}
        <div className="
          h-20
          md:hidden
        " />

        {/* USER */}
        <div className="
          px-6
          py-5

          border-b
          border-blue-800
        ">

          <div className="
            flex
            items-center
            gap-4
          ">

            {/* PHOTO */}
            {userData?.photo_url ? (

              <img
                src={
                  userData.photo_url
                }
                alt="Profile"
                className="
                  w-14 h-14

                  rounded-full

                  object-cover

                  border-2
                  border-orange-400

                  shadow-lg
                "
              />

            ) : (

              <div className="
                w-14 h-14

                rounded-full

                bg-orange-500

                flex
                items-center
                justify-center

                text-xl
                font-bold

                shadow-lg
              ">

                {
                  userData?.name
                    ?.charAt(0)
                    ?.toUpperCase()
                }

              </div>

            )}

            {/* INFO */}
            <div className="
              min-w-0
            ">

              <h2 className="
                font-bold
                text-lg

                truncate
              ">

                {
                  userData?.name ||
                  'User'
                }

              </h2>

              <p className="
                text-xs
                text-blue-200

                truncate
              ">

                {
                  userData?.email
                }

              </p>

              <p className="
                text-sm
                text-orange-300

                capitalize
              ">

                {
                  userData?.role
                }

              </p>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="
          flex-1

          overflow-y-auto

          p-5

          space-y-3
        ">

          {links.map(
            (link: any) => {

            const active =
              pathname ===
              link.href

            return (

              <Link

                key={link.href}

                href={link.href}

                onClick={() =>
                  setOpen(false)
                }

                className={`

                  block

                  px-5 py-4

                  rounded-2xl

                  transition-all
                  duration-200

                  font-medium

                  ${
                    active

                      ? `
                        bg-orange-500
                        text-white
                        shadow-lg
                      `

                      : `
                        bg-blue-800
                        hover:bg-blue-700
                      `
                  }
                `}
              >

                {link.name}

              </Link>

            )
          })}

        </nav>

        {/* FOOTER */}
        <div className="
          p-5

          border-t
          border-blue-800

          text-center
          text-sm

          text-blue-200
        ">

          Provincial Disaster Risk
          Reduction and Management Office

        </div>

      </aside>

    </>
  )
}