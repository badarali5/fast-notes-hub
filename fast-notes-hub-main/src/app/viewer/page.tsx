// Server component (no "use client" needed unless you use hooks)

interface ViewerSearchParams {
  file?: string
  name?: string
}

export default function ViewerPage({ searchParams }: { searchParams: ViewerSearchParams }) {
  const rawFileParam = searchParams?.file || ""
  const decodedFileUrl = rawFileParam ? decodeURIComponent(rawFileParam) : ""
  const displayName = searchParams?.name ? decodeURIComponent(searchParams.name) : "Document"

  if (!decodedFileUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        <p>Missing file URL.</p>
      </div>
    )
  }

  // If the param is a relative API path (/api/pdf-proxy?url=...), keep it as-is.
  // If it is an absolute URL, pass directly to iframe.
  const iframeSrc =
    decodedFileUrl.startsWith("/") || decodedFileUrl.startsWith("http")
      ? decodedFileUrl
      : decodedFileUrl // (kept simple; you can normalize further if needed)

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="w-full bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base text-gray-200 truncate" title={displayName}>
            {displayName}
          </h1>
          <a
            href={iframeSrc}
            target="_blank"
            rel="noreferrer"
            className="text-xs sm:text-sm text-blue-300 hover:text-blue-200"
          >
            Open original
          </a>
        </div>
      </header>
      <main className="w-full h-[calc(100vh-56px)]">
        <iframe
          title={displayName}
          // Allow pdf rendering; sandbox removed for GitHub raw / proxy
          src={iframeSrc}
          className="w-full h-full"
          loading="eager"
        />
      </main>
    </div>
  )
}