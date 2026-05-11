import './globals.css'

import Sidebar
from '../components/Sidebar'

import Topbar
from '../components/Topbar'

import { AuthProvider }
from '../contexts/AuthContext'

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
      ">

        <AuthProvider>

          {children}

        </AuthProvider>

      </body>

    </html>
  )
}