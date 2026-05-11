export default function Page() {

  return (

    <div className="
      space-y-6
    ">

      {/* HEADER */}
      <div>

        <h1 className="
          text-4xl
          font-bold
          text-blue-900
        ">
          Dashboard
        </h1>

        <p className="
          text-gray-600
        ">
          Provincial Operations
          Management System
        </p>

      </div>

      {/* CARDS */}
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        {/* ACTIVITIES */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <div className="
            text-5xl
            mb-4
          ">
            📅
          </div>

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
          ">
            Activities
          </h2>

          <p className="
            text-gray-600
            mt-2
          ">
            Monitor scheduled
            operational activities
          </p>

        </div>

        {/* TASKS */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <div className="
            text-5xl
            mb-4
          ">
            ✅
          </div>

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
          ">
            Assignments
          </h2>

          <p className="
            text-gray-600
            mt-2
          ">
            Personnel task
            management workflow
          </p>

        </div>

        {/* MAP */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <div className="
            text-5xl
            mb-4
          ">
            🗺️
          </div>

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
          ">
            Operations Map
          </h2>

          <p className="
            text-gray-600
            mt-2
          ">
            Geolocation and
            operations monitoring
          </p>

        </div>

        {/* NOTIFICATIONS */}
        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-6
          border
        ">

          <div className="
            text-5xl
            mb-4
          ">
            🔔
          </div>

          <h2 className="
            text-2xl
            font-bold
            text-blue-900
          ">
            Notifications
          </h2>

          <p className="
            text-gray-600
            mt-2
          ">
            Realtime operational
            updates and alerts
          </p>

        </div>

      </div>

    </div>
  )
}