// Simple in-app PDF viewer using an iframe (no Google Docs)
export default function ViewerPage({
  searchParams,
}: {
  searchParams: { file?: string; name?: string };
}) {
  const src = searchParams?.file ? decodeURIComponent(searchParams.file) : "";
  const name = searchParams?.name ? decodeURIComponent(searchParams.name) : "Document";

  if (!src) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-300">
        <p>Missing file URL.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="w-full bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-base text-gray-200 truncate">{name}</h1>
          <a
            href={src}
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
          title={name}
          src={src}
          className="w-full h-full"
          loading="eager"
        />
      </main>
    </div>
  );
}