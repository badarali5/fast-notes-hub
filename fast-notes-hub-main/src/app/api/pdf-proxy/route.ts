import { NextRequest } from "next/server"

const ALLOWED_HOSTS = [
  "raw.githubusercontent.com",
  "badarali5.github.io"
]

export async function GET(req: NextRequest) {
  try {
    const urlObj = new URL(req.url)
    const target = urlObj.searchParams.get("url")
    if (!target) {
      return new Response("Missing url parameter", { status: 400 })
    }

    // Validate host
    let parsed: URL
    try {
      parsed = new URL(target)
    } catch {
      return new Response("Invalid target URL", { status: 400 })
    }
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return new Response("Host not allowed", { status: 403 })
    }
    if (!parsed.pathname.toLowerCase().endsWith(".pdf")) {
      return new Response("Only PDF files are allowed", { status: 400 })
    }

    // Fetch remote PDF
    const upstream = await fetch(parsed.toString(), {
      // Optional: add GitHub auth header here if private
      // headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    })

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status}`, { status: 502 })
    }

    const fileName = decodeURIComponent(parsed.pathname.split("/").pop() || "file.pdf")

    // Stream body through our domain
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
        "X-Proxy-Origin": parsed.hostname
      }
    })
  } catch (e: any) {
    return new Response("Proxy failure", { status: 500 })
  }
}