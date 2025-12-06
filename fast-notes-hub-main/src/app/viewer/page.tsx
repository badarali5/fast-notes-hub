// Server component

type SearchParams = {
  file?: string | string[]
  name?: string | string[]
}

// If you want to use a shared PageProps type, define it here:
type PageProps = {
  searchParams?: SearchParams
}

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) || ""

// Change the function definition to use PageProps type instead of inline type
export default function ViewerPage({ searchParams }: PageProps) {
  const encodedFile = first(searchParams?.file)
  const encodedName = first(searchParams?.name)

  const fileUrl = encodedFile ? decodeURIComponent(encodedFile) : ""
  const fileName = encodedName ? decodeURIComponent(encodedName) : "Document"

  if (!fileUrl) {
    return <p>No file selected.</p>
  }

  // fileUrl can be a proxied path (/api/pdf-proxy?url=...) or an absolute URL
  const iframeSrc = fileUrl

  return (
    <iframe
      src={iframeSrc}
      title={fileName}
      width="100%"
      height="800"
      style={{ border: "none" }}
    />
  )
}
