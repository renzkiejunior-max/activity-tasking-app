export default function Page() {

  return (
    <div className="
      min-h-screen
      flex flex-col
      items-center
      justify-center
      bg-gray-100
      p-6
    ">

      <h1 className="
        text-5xl
        font-bold
        text-red-600
      ">
        Access Denied
      </h1>

      <p className="
        mt-4
        text-lg
        text-gray-700
      ">
        You are not authorized
        to access this page.
      </p>

    </div>
  )
}