import './globals.css'

import Sidebar
from '../components/Sidebar'

import Topbar
from '../components/Topbar'

import { AuthProvider }
from '../contexts/AuthContext'

export const metadata = {

  title:
    'Activity Tasking System',
}

export const viewport = {

  width:
    'device-width',

  initialScale:
    1,

  maximumScale:
    1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <html lang="en">

      <body className="
        bg-gray-100
        text-gray-800

        overflow-x-hidden
      ">

        <AuthProvider>

          <div className="
            w-full
            min-w-0
            overflow-x-hidden
          ">

            {children}

          </div>

        </AuthProvider>

      </body>

    </html>
  )
}