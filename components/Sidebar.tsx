
'use client'

import { useState } from 'react'

import Link from 'next/link'

import {   usePathname, } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'

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
    name: 'Office Dashboard',
    href: '/office-chief-dashboard',
  },

  {
    name: 'Activity Review',
    href: '/activities',
  },

  {
    name: 'Office Assignments',
    href: '/office-assignments',
  },

  {
  name: 'Calendar',
  href: '/calendar',
},

  {
    name: 'Personnel Monitoring',
    href: '/office-personnel',
  },

  {
    name: 'Divisions',
    href: '/office-divisions',
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
    name: 'Reports & Analytics',
    href: '/office-analytics',
  },

  {
    name: 'Timeline',
    href: '/timeline',
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
    name: 'My Calendar',
    href: '/calendar',
  },

  {
    name: 'My Tasks',
    href: '/my-task',
  },

  {
    name: 'Activities',
    href: '/activities',
  },

  {
    name: 'Notifications',
    href: '/notifications',
  },

  {
    name: 'Timeline',
    href: '/timeline',
  },

  {
    name: 'Operations Map',
    href: '/operations-map',
  },

]

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
//SIDEBAR TYPE
  const simpleSidebar =

  userRoles.includes(
    'staff'
  )

  ||

  userRoles.includes(
    'division_chief'
  )


// GROUPED MENUS
const groupedLinks =

userRoles.includes('admin')

? {

  OPERATIONS:

    uniqueLinks.filter(
      (item: any) => [

        'Activities',
        'Calendar',
        'Timeline',
        'Kanban Board',

      ].includes(item.name)
    ),

  PERSONNEL:

    uniqueLinks.filter(
      (item: any) => [

        'My Task',
        'Employees',
        'Assignments',

      ].includes(item.name)
    ),

  MONITORING:

    uniqueLinks.filter(
      (item: any) => [

        'Notifications',
        'Reports',
        'Operations Map',

      ].includes(item.name)
    ),

  ADMIN:

    uniqueLinks.filter(
      (item: any) => [

        'User Management',

      ].includes(item.name)
    ),

}

: {

  // OFFICE CHIEF ONLY

  OPERATIONS:

    uniqueLinks.filter(
      (item: any) => [

        'Activity Review',
        'Timeline',
        'Operations Map',

      ].includes(item.name)
    ),

  CALENDAR:

    uniqueLinks.filter(
      (item: any) => [

        'Calendar',

      ].includes(item.name)
    ),

  PERSONNEL:

    uniqueLinks.filter(
      (item: any) => [

        'Office Assignments',
        'Personnel Monitoring',
        'Divisions',

      ].includes(item.name)
    ),

  MONITORING:

    uniqueLinks.filter(
      (item: any) => [

        'Notifications',
        'Reports & Analytics',

      ].includes(item.name)
    ),

}

const icons: any = {

  Dashboard: '🏠',

  Calendar: '📅',

  Employees: '👥',

  Assignments: '📌',

  Notifications: '🔔',

  Activities: '🗂️',

  'Operations Map': '🗺️',

  Reports: '📄',

  'Kanban Board': '📋',

  Timeline: '⏱️',

  'My Task': '💼',

  'User Management': '⚙️',

  'Activity Requests': '📨',

  'My Calendar': '📅',

  'My Tasks': '📌',


  'Office Dashboard': '🏢',

  'Activity Review': '📅',

  'Office Assignments': '📌',

  'Personnel Monitoring': '👥',

  'Divisions': '🏢',

  'Reports & Analytics': '📈',

}


  const [open, setOpen] =
    useState(false)

  const detectGroup = () => {

  if (

    [
      '/office-assignments',
      '/office-personnel',
      '/office-divisions',

    ].includes(pathname)

  ) {

    return 'PERSONNEL'
  }

  if (

    [
      '/notifications',
      '/office-analytics',

    ].includes(pathname)

  ) {

    return 'MONITORING'
  }

  if (

    [
      '/calendar',

    ].includes(pathname)

  ) {

    return 'CALENDAR'
  }

  return 'OPERATIONS'
}

const [openGroups,
  setOpenGroups] =
  useState<string[]>([
    detectGroup()
  ])

  return (

    <>

      {/* MOBILE MENU BUTTON */}
<div className="
  md:hidden

  fixed
  top-3
  right-3

  z-50
">

  <button

  data-mobile-sidebar

  onClick={() =>
    setOpen(!open)
  }

    className="
      w-12
      h-12

      rounded-2xl

      bg-blue-900/90
        backdrop-blur
      hover:bg-blue-800/80

      text-white

      shadow-2xl

      flex
      items-center
      justify-center

      text-2xl

      border
      border-white/10

      transition-all
      duration-300
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
        w-[85vw]
        max-w-[320px]

        md:w-64
        md:max-w-none

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

          px-4
          py-3

          border-b
          border-blue-800
        ">

        </div>

{/* APP HEADER */}
<div className="
  px-4
  py-2

  bg-blue-950/50

  border-b
  border-blue-800
">

  <p className="
    text-[15px]
    font-bold

    uppercase

    tracking-[0.25em]

    text-white

    text-center
  ">

    TASK MANAGEMENT SYSTEM

  </p>

</div>


        {/* NAVIGATION */}
<nav className="
  flex-1

  overflow-y-auto

  p-3

  space-y-2
">

{/* MAIN DASHBOARD */}
{uniqueLinks
  .filter(
    (item: any) =>
      
      [
  'Dashboard',
  'Office Dashboard',
  'Division Dashboard',
].includes(
  item.name
)


  )
  .map((link: any) => {

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

          group

          flex
          items-center
          gap-3

          px-4
          py-3

          rounded-2xl

          transition-all
          duration-300

          font-bold

          border

          shadow-lg

          mb-2

          ${
            active

              ? `
                bg-linear-to-r
                from-orange-400
                to-orange-300

                text-blue-950

                border-orange-200

                ring-2
                ring-orange-200/40
              `

              : `
                bg-orange-400
                hover:bg-orange-300

                text-blue-950

                border-orange-300

                hover:scale-[1.02]

                hover:shadow-orange-200/40
              `
          }
        `}
      >

        {/* ICON */}
        <span className="
          text-lg

          transition-transform
          duration-200

          group-hover:scale-125
        ">

          🏠

        </span>

        {/* TITLE */}
        <span>

          Dashboard

        </span>

      </Link>

    )
  })}
  

  {/* STAFF SIMPLE SIDEBAR */}
{simpleSidebar ? (
  <div className="
    space-y-2
  ">

    {uniqueLinks

  .filter(
    (link: any) =>

      ![
        'Dashboard',
        'Division Dashboard',
        'Office Dashboard',
      ].includes(link.name)
  )

  .map(
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

              group

              flex
              items-center

              gap-3

              px-4
              py-3

              rounded-2xl

              transition-all
              duration-300

              border

              shadow-md

              font-medium

              ${
                active

                  ? `
                    bg-linear-to-r
                    from-orange-400
                    to-orange-300

                    text-white

                    border-orange-300

                    shadow-lg
                    shadow-orange-500/20
                  `

                  : `
                    bg-blue-900/80

                    hover:bg-orange-300
                    hover:text-blue-950

                    border-blue-800

                    text-blue-100

                    hover:scale-[1.02]
                  `
              }
            `}
          >

            {/* ICON */}
            <span className="
              text-lg

              transition-transform
              duration-200

              group-hover:scale-125
            ">

              {
                icons[
                  link.name
                ] || '•'
              }

            </span>

            {/* TITLE */}
            <span>

              {link.name}

            </span>

          </Link>
        )
      }
    )}

  </div>

) : (

  Object.entries(
    groupedLinks
  ).map(

    ([group, items]: any) => (

      <div
        key={group}
        className="
          bg-blue-950/40

          rounded-2xl

          overflow-hidden
        "
      >

        {/* GROUP BUTTON */}
        <button

          onClick={() => {

  if (
    openGroups.includes(
      group
    )
  ) {

    setOpenGroups(

      openGroups.filter(
        (g) =>
          g !== group
      )
    )

  } else {

    setOpenGroups([
      ...openGroups,
      group,
    ])
  }
}}

          className={`

            w-full

            flex
            items-center
            justify-between

            px-4
            py-3

            rounded-2xl

            transition-all
            duration-300

            border

            shadow-md

            transform

            ${
              openGroups.includes(
              group
            )

                ? `

                  bg-linear-to-r
                  from-orange-400
                  to-orange-300

                  border-orange-300

                  text-white

                  shadow-orange-500/20

                `

                : `

                  bg-blue-900/90
                  backdrop-blur

                  hover:bg-orange-300
                  hover:text-blue-950

                  border-blue-800

                  text-blue-100
                `
            }
          `}
        >

          {/* LEFT */}
          <div className="
            flex
            items-center

            gap-3
          ">

            <div className="
              text-lg
            ">

              {
                    group === 'OPERATIONS'

                      ? '📊'

                    : group === 'CALENDAR'

                      ? '📅'

                    : group === 'PERSONNEL'

                      ? '👥'

                    : group === 'MONITORING'

                      ? '📡'

                    : group === 'ADMIN'

                      ? '⚙️'

                    : '•'
                  }

            </div>

            <span className="
              text-md

              font-bold

              tracking-widest

              uppercase
            ">

              {group}

            </span>

          </div>

          {/* ARROW */}
          <div className={`
            text-sm

            transition-transform
            duration-300

            ${
            openGroups.includes(
              group
            )

                ? 'rotate-180'

                : ''
            }
          `}>

            ▼

          </div>

        </button>

        {/* LINKS */}
        {openGroups.includes(group) && (

          <div className="
            p-2

            space-y-1
          ">

            {items.map(
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

                      flex
                      items-center

                      gap-3

                      px-3
                      py-2.5

                      rounded-2xl

                      transition-all

                      text-sm
                      font-medium

                      ${
                        active

                          ? `
                            bg-linear-to-r
                            from-orange-400
                            to-orange-300

                            text-white
                          `

                          : `
                            hover:bg-orange-300
                            hover:text-blue-950

                            text-blue-100
                          `
                      }
                    `}
                  >

                    <span>

                      {
                        icons[
                          link.name
                        ] || '•'
                      }

                    </span>

                    <span>

                      {link.name}

                    </span>

                  </Link>
                )
              }
            )}

          </div>

        )}

      </div>
    )
  )

)}

</nav>

{/* FOOTER */}
<div className="
  px-4
  py-3

  border-t
  border-blue-800

  bg-blue-950
">

  <div className="
    flex
    items-center
    justify-center

    gap-2
  ">

    {/* LOGO */}
    <img
      src="/PDRRMO.png"
      alt="PDRRMO"

      className="
        w-8
        h-8

        object-contain

        shrink-0

        opacity-90
      "
    />

    {/* TEXT */}
    <p className="
      text-[11px]

      leading-tight

      text-blue-100

      text-left
    ">

      Provincial Disaster Risk
      Reduction and Management Office

    </p>

  </div>

</div>

      </aside>

    </>
  )
}
