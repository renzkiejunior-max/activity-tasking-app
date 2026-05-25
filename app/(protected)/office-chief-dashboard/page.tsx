'use client'

export default function Page() {

  return (

    <div className="
      p-6
      space-y-6
    ">

      {/* HEADER */}
      <div className="
        bg-linear-to-r
        from-blue-900
        via-blue-700
        to-blue-500

        rounded-3xl

        p-8

        text-white
      ">

        <p className="
          inline-flex
          items-center
          gap-2

          bg-white/20

          px-4
          py-2

          rounded-full

          text-sm
        ">

          🏢 Office Command Center

        </p>

        <h1 className="
          text-4xl
          font-black

          mt-5
        ">

          Office Chief Dashboard

        </h1>

        <p className="
          text-blue-100
          mt-3

          max-w-2xl
        ">

          Monitor office-wide
          activities, personnel,
          operational assignments,
          division performance,
          and emergency coordination.

        </p>

      </div>

      {/* QUICK ACCESS */}
      <div className="
        grid
        md:grid-cols-3
        gap-5
      ">

        <div className="
          bg-white

          border

          rounded-3xl

          p-6

          shadow-lg
        ">

          <div className="
            text-5xl
          ">

            📅

          </div>

          <h2 className="
            text-2xl
            font-bold
            text-blue-900

            mt-4
          ">

            Activity Review

          </h2>

          <p className="
            text-gray-600
            mt-2
          ">

            Review and approve
            operational activities.

          </p>

        </div>

        <div className="
          bg-white

          border

          rounded-3xl

          p-6

          shadow-lg
        ">

          <div className="
            text-5xl
          ">

            📌

          </div>

          <h2 className="
            text-2xl
            font-bold
            text-blue-900

            mt-4
          ">

            Office Assignments

          </h2>

          <p className="
            text-gray-600
            mt-2
          ">

            Monitor office-wide
            task deployments.

          </p>

        </div>

        <div className="
          bg-white

          border

          rounded-3xl

          p-6

          shadow-lg
        ">

          <div className="
            text-5xl
          ">

            👥

          </div>

          <h2 className="
            text-2xl
            font-bold
            text-blue-900

            mt-4
          ">

            Personnel Monitoring

          </h2>

          <p className="
            text-gray-600
            mt-2
          ">

            Monitor divisions,
            personnel workload,
            and operational status.

          </p>

        </div>

      </div>

    </div>
  )
}