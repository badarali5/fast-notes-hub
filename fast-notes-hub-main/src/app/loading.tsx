export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 animate-pulse">
      {/* Navbar */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-700" />
            <div className="h-6 w-44 rounded-lg bg-gray-700" />
          </div>
          <div className="h-9 w-24 rounded-lg bg-gray-800" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Hero / search section */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-80 rounded-lg bg-gray-700" />
          <div className="h-5 w-96 rounded-lg bg-gray-800" />
          <div className="h-14 w-full max-w-2xl rounded-xl bg-gray-800 mt-2" />
        </div>

        {/* Section heading */}
        <div className="h-7 w-52 rounded-lg bg-gray-700" />

        {/* Semester card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-900 border border-gray-800 p-5 space-y-4">
              {/* Card title */}
              <div className="h-5 w-32 rounded bg-gray-700" />
              {/* Subject rows */}
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800">
                  <div className="h-5 w-5 rounded bg-gray-700 flex-shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3.5 w-16 rounded bg-gray-700" />
                    <div className="h-3 w-full rounded bg-gray-700/60" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
