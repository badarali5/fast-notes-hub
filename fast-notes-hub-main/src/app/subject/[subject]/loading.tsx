export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 animate-pulse">
      {/* Navbar skeleton */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-gray-700" />
          <div className="h-6 w-48 rounded-lg bg-gray-700" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back button skeleton */}
        <div className="h-9 w-28 rounded-lg bg-gray-800" />

        {/* Subject title + badge */}
        <div className="space-y-3">
          <div className="h-8 w-64 rounded-lg bg-gray-700" />
          <div className="h-5 w-40 rounded-full bg-gray-800" />
        </div>

        {/* Tab bar */}
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-24 rounded-lg bg-gray-800" />
          ))}
        </div>

        {/* File cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-800 border border-gray-700/50 p-4 space-y-3">
              <div className="h-5 w-3/4 rounded bg-gray-700 mx-auto" />
              <div className="flex gap-2 justify-center">
                <div className="h-4 w-16 rounded-full bg-gray-700" />
                <div className="h-4 w-14 rounded-full bg-gray-700" />
              </div>
              <div className="h-7 rounded bg-gray-700 mt-2" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
