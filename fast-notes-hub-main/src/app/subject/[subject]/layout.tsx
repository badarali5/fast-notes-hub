import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>
}): Promise<Metadata> {
  const { subject } = await params
  return {
    title: `${subject.toUpperCase()} | FAST Notes Hub`,
    description: `Past papers and notes for ${subject} at FAST University.`,
  }
}

export default function SubjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
