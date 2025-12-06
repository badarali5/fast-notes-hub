type SearchParams = {
  file?: string | string[]
  name?: string | string[]
}

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) || ""

export default function ViewerPage({ searchParams }: any) {
  const encodedFile = first(searchParams?.file)
  const encodedName = first(searchParams?.name)

  const fileUrl = encodedFile ? decodeURIComponent(encodedFile) : ""
  const fileName = encodedName ? decodeURIComponent(encodedName) : "Document"

  if (!fileUrl) {
    return <p>No file selected.</p>
  }

  return (
    <iframe
      src={fileUrl}
      title={fileName}
      width="100%"
      height="800"
      style={{ border: "none" }}
    />
  )
}
