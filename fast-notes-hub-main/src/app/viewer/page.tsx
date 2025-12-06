// Server component
type SearchParams = {
  file?: string | string[]
  name?: string | string[]
}
const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) || ""
export default async function ViewerPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : undefined
  const encodedFile = first(params?.file)
  const encodedName = first(params?.name)

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
