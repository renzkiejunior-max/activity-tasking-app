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

          <div className="
            flex
            min-h-screen
          ">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN AREA */}
            <div className="
              flex-1
              flex
              flex-col

              lg:ml-72
            ">

              {/* TOPBAR */}
              <Topbar />

              {/* CONTENT */}
              <main className="

                flex-1

                p-4
                md:p-8

                pt-24
                md:pt-8

                overflow-x-hidden

              ">

                {children}

              </main>

            </div>

          </div>

        </AuthProvider>

      </body>

    </html>
  )
}