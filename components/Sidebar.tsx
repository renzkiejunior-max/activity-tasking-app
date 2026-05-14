
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
import { icon } from 'leaflet'

const roleLinks: any = {

  // ======================
  // ADMIN
  // ======================

  admin: [

    {
      name: 'Dashboard',
      href: '/admin-dashboard',
    },

    {
      name: 'My Task',
      href: '/my-task',
      icon: 'briefcase',
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

  // ======================
  // OFFICE CHIEF
  // ======================

  office_chief: [

    {
      name: 'Dashboard',
      href: '/admin-dashboard',
    },

        {
      name: 'My Task',
      href: '/my-task',
      icon: 'briefcase',
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

  // ======================
  // DIVISION CHIEF
  // ======================

  division_chief: [

    {
      name: 'Division Dashboard',
      href: '/division-chief-dashboard',
    },

    {
      name: 'My Task',
      href: '/my-task',
      icon: 'briefcase',
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

  // ======================
  // STAFF
  // ======================

  staff: [

    {
      name: 'My Dashboard',
      href: '/staff-dashboard',
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

 

// SAFE ROLES
const userRoles =

  Array.isArray(
    userData?.roles
  )

    ? userData.roles

    : userData?.roles

      ? [userData.roles]

      : userData?.role

        ? [userData.role]

        : []

// MERGE LINKS
const links =

  userRoles.flatMap(
    (
      role: string
    ) =>

      roleLinks[role] || []
  )

// REMOVE DUPLICATES
const uniqueLinks =

  Array.from(

    new Map(

      links.map(
        (
          item: any
        ) => [

          item.href,
          item,
        ]
      )

    ).values()

  )


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

        px-4
        py-3

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
              w-16
              h-16
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

            px-3
            py-2

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
          hidden
          md:flex

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
              w-24
              h-24
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

        {/* NAVIGATION */}
        <nav className="
          flex-1

          overflow-y-auto

          p-5

          space-y-3
        ">

          {uniqueLinks.map(
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

                    px-5
                    py-4

                    rounded-2xl

                    transition-all
                    duration-200

                    font-medium

                    ${
  link.name === 'My Task'

    ? active

      ? `
        bg-purple-600
        text-white
        shadow-lg
      `

      : `
        bg-purple-500
        hover:bg-purple-600
        text-white
      `

    : active

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
            }
          )}

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
