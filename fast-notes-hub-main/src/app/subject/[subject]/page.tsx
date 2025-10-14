"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useSearchParams, useParams, useRouter } from "next/navigation"
import { ArrowLeft, Eye, FileText, Presentation, BookOpen, File} from "lucide-react"
import { Analytics } from "@vercel/analytics/react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Import and initialize Supabase client
import { createClient } from "@supabase/supabase-js"
import { subjectFullNames, TABLES, GITHUB } from "@/lib/constants"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "<YOUR_SUPABASE_URL>"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "<YOUR_SUPABASE_ANON_KEY>"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// GitHub repository configuration
const GITHUB_REPO = GITHUB.REPO
const GITHUB_BRANCH = GITHUB.BRANCH
const FILES_PATH = GITHUB.FILES_PATH

const tabTypes = ["notes", "papers", "slides"] as const;
type TabType = (typeof tabTypes)[number];

// Define the Resource type
type Resource = {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  type: "notes" | "papers" | "slides";
  file_name: string;
  url: string;
  created_at: string;
};

type ResourcesMap = Record<"notes" | "papers" | "slides", Resource[]>;

function isMobile() {
  if (typeof window === "undefined") return false
  return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent)
}

// Helper function to determine file type from filename
const getFileType = (filename: string): "notes" | "papers" | "slides" => {
  const lower = filename.toLowerCase()
  if (lower.includes("slide") || lower.includes("presentation") || lower.includes("ppt")) return "slides"
  if (lower.includes("paper") || lower.includes("exam") || lower.includes("test") || lower.includes("final") || lower.includes("mid") || lower.includes("quiz")) return "papers"
  return "notes"
}

// Add a tiny helper to prefetch a URL once
function prefetchUrlOnce(url: string) {
  try {
    if (!url || typeof document === "undefined") return
    const id = "pf-" + btoa(unescape(encodeURIComponent(url))).slice(0, 16)
    if (document.getElementById(id)) return
    const link = document.createElement("link")
    link.id = id
    link.rel = "prefetch"
    link.href = url
    link.as = url.endsWith(".pdf") || url.includes("docs.google.com/viewer") ? "document" : "fetch"
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)
  } catch {}
}

function ResourceCard({ resource }: { resource: Resource }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const hasPrefetched = useRef(false);

  // Compute a direct PDF URL (GitHub Pages) and an internal viewer URL (iframe)
  const { viewUrl, pdfUrl } = useMemo(() => {
    const isPdf = resource.file_name?.toLowerCase().endsWith(".pdf");
    let url = resource.url;

    if (isPdf) {
      const ghPagesUrl = url.replace(
        "raw.githubusercontent.com/badarali5/fast-notes-hub/main/files",
        "badarali5.github.io/fast-notes-hub/files"
      );
      return {
        viewUrl: `/viewer?file=${encodeURIComponent(ghPagesUrl)}&name=${encodeURIComponent(resource.file_name)}`,
        pdfUrl: ghPagesUrl,
      };
    }
    return { viewUrl: url, pdfUrl: "" };
  }, [resource.url, resource.file_name]);

  const ensurePrefetch = () => {
    if (!hasPrefetched.current) {
      prefetchUrlOnce(pdfUrl || viewUrl); // prefetch the actual PDF if available
      hasPrefetched.current = true;
    }
  };

  const handleClick = () => {
    ensurePrefetch();
    if (isMobile()) {
      if (isHovered) {
        setIsOpening(true);
        window.open(viewUrl, "_blank");
        setTimeout(() => {
          setIsOpening(false);
          setIsHovered(false);
        }, 1200);
      } else {
        setIsHovered(true);
      }
    } else {
      setIsOpening(true);
      window.open(viewUrl, "_blank");
      setTimeout(() => setIsOpening(false), 1200);
    }
  };

  // Reset hover state when touching outside
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as Element | null;
      if (target && !target.closest('.resource-card')) {
        setIsHovered(false);
      }
    };
    document.addEventListener('touchstart', handleTouchStart);
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, []);

  return (
    <Card
      className={`resource-card group border border-gray-800/50 bg-gradient-to-br from-gray-900 to-gray-800 
        ${isHovered ? 'border-blue-500/50 shadow-blue-900/20 shadow-xl scale-105' : ''}
        transition-all duration-300 cursor-pointer relative overflow-hidden rounded-lg min-h-0`}
      onMouseEnter={() => { setIsHovered(true); ensurePrefetch(); }}
      onMouseLeave={() => { setIsHovered(false); }} // added: stop hover when cursor leaves
      onTouchStart={() => { setIsHovered(true); ensurePrefetch(); }}
      onClick={handleClick}
      style={{ minHeight: 0, padding: 0 }}
    >
      <CardContent className="p-2 flex flex-col h-full min-h-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
            <h4 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors line-clamp-2 text-center mb-2">
              {resource.title}
            </h4>
            <div className="flex flex-row gap-2 mb-1 justify-center">
              <Badge variant="secondary" className="text-xs bg-gray-800/80 text-blue-200 border border-blue-900/50 px-2 py-1 shadow-sm">
                Semester {resource.semester}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gray-800/80 text-blue-200 border border-blue-900/50 px-2 py-1 shadow-sm">
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      
        <div className="flex-1 flex flex-col justify-end">
          <div className={`mt-1 p-1 rounded border transition-all duration-300 flex items-center justify-center
            ${isHovered ? 'bg-blue-900/20 border-blue-500/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
            <span className="text-xs text-blue-300 font-medium flex items-center gap-1">
              <Eye className="h-3 w-3 mr-1 inline-block" />
              {isOpening ? 'Opening PDF...' : 'Click to open'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubjectPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter() // Add router

  const subject = (params?.subject as string)?.trim() || ""
  const semester = searchParams?.get("semester")?.trim() || ""

  // Get the full name from the mapping, fallback to code if not found
  const subjectFullName = subjectFullNames[subject.toUpperCase()] || subject

  const [resources, setResources] = useState<ResourcesMap>({ notes: [], papers: [], slides: [] })
  const [activeTab, setActiveTab] = useState<TabType>("papers")
  const [papersSubTab, setPapersSubTab] = useState<"final" | "mid" | "finalLab" | "midLab">("final")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Cache keys for GitHub contents
  const CACHE_KEY = `gh-files:${GITHUB_REPO}/${FILES_PATH}`
  const CACHE_TIME_KEY = `${CACHE_KEY}:time`
  const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

  // Abortable fetcher
  const fetchResources = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true)
    setErrorMsg(null)

    if (!subject || !semester) {
      setErrorMsg("Missing subject or semester in URL.")
      setIsLoading(false)
      return
    }

    try {
      // 1) Supabase categorization (case-insensitive subject)
      const { data: supabaseData, error: supabaseError } = await supabase
        .from(TABLES.UPLOADS)
        .select("*")
        .ilike("subject", subject) // case-insensitive
        .eq("semester", semester)

      if (supabaseError) throw new Error(`Database error: ${supabaseError.message}`)
      const safeSupabaseData = Array.isArray(supabaseData) ? supabaseData : []

      // 2) GitHub files with localStorage cache
      let fileArray: any[] | null = null
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(CACHE_KEY)
          const time = localStorage.getItem(CACHE_TIME_KEY)
          if (cached && time && Date.now() - Number(time) < CACHE_TTL_MS) {
            fileArray = JSON.parse(cached)
          }
        } catch {}
      }

      if (!fileArray) {
        const githubRes = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILES_PATH}`,
          { signal }
        )
        if (!githubRes.ok) {
          if (githubRes.status === 403) throw new Error("GitHub API rate limit exceeded. Please try again later.")
          throw new Error(`GitHub API error: ${githubRes.status}`)
        }
        if (signal?.aborted) return
        const githubFiles = await githubRes.json()
        fileArray = Array.isArray(githubFiles) ? githubFiles : [githubFiles]

        // Save fresh cache
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(fileArray))
            localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
          } catch {}
        }
      }

      // 3) Build map and group resources based on Supabase categorization only
      const githubFileMap = new Map(fileArray.map((file: any) => [file.name, file]))
      const grouped: ResourcesMap = { notes: [], papers: [], slides: [] }

      for (const dbEntry of safeSupabaseData) {
        const githubFile = githubFileMap.get(dbEntry.file_name)
        if (!githubFile) continue

        const resource: Resource = {
          id: githubFile.sha || dbEntry.id,
          title: dbEntry.title || githubFile.name.replace(/\.[^/.]+$/, ""),
          description: dbEntry.description || "File from GitHub storage.",
          subject: dbEntry.subject,
          semester: dbEntry.semester,
          type: dbEntry.type,
          file_name: dbEntry.file_name,
          url: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${FILES_PATH}/${dbEntry.file_name}`,
          created_at: dbEntry.created_at || "",
        }
        grouped[dbEntry.type as keyof ResourcesMap].push(resource)
      }

      setResources(grouped)
      setIsLoading(false)
    } catch (err) {
      if ((err as any)?.name === "AbortError") return
      console.error("Fetch error:", err)
      setErrorMsg(err instanceof Error ? err.message : "An error occurred while loading resources.")
      setIsLoading(false)
    }
  }, [subject, semester])

  // Run with AbortController and cancel on tab/param change
  useEffect(() => {
    const controller = new AbortController()
    fetchResources(controller.signal)
    return () => controller.abort()
  }, [fetchResources])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <header className="bg-gray-900 shadow-lg border-b border-gray-800 w-full">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center w-full mb-6">
            <button
              onClick={() => router.back()} // Changed from window.history.back()
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home Page</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              🧠 {subjectFullName} – Semester {semester}
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              Access all your study materials for {subjectFullName}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
        {/* Error Display */}
        {errorMsg && (
          <div className="bg-red-900/20 border border-red-500/60 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm mb-3">{errorMsg}</p>
            <button
              onClick={() => fetchResources()}
              className="text-sm px-3 py-1 rounded bg-red-700/30 hover:bg-red-700/40 text-red-100 border border-red-600/40 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full">
          <TabsList
            className="w-full mb-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 flex flex-wrap justify-center gap-2 rounded-xl px-2 py-2 [&>*]:mb-2 sm:[&>*]:mb-0 shadow-lg"
          >
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-800 data-[state=active]:text-blue-100 data-[state=active]:shadow-lg text-gray-400 text-sm font-semibold flex items-center justify-center rounded-full bg-gray-800/50 px-3 py-1 transition-all duration-200 cursor-pointer whitespace-nowrap mb-2 sm:mb-0 hover:bg-gray-800"
            >
              <FileText className="h-5 w-5 mr-1" /> Notes ({resources.notes.length})
            </TabsTrigger>
            <TabsTrigger
              value="papers"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-800 data-[state=active]:text-blue-100 data-[state=active]:shadow-lg text-gray-400 text-sm font-semibold flex items-center justify-center rounded-full bg-gray-800/50 px-3 py-1 transition-all duration-200 cursor-pointer whitespace-nowrap mb-2 sm:mb-0 hover:bg-gray-800"
            >
              <BookOpen className="h-5 w-5 mr-1" /> Past Papers ({resources.papers.length})
            </TabsTrigger>
            <TabsTrigger
              value="slides"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900 data-[state=active]:to-blue-800 data-[state=active]:text-blue-100 data-[state=active]:shadow-lg text-gray-400 text-sm font-semibold flex items-center justify-center rounded-full bg-gray-800/50 px-3 py-1 transition-all duration-200 cursor-pointer whitespace-nowrap mb-2 sm:mb-0 hover:bg-gray-800"
            >
              <Presentation className="h-5 w-5 mr-1" /> Slides ({resources.slides.length})
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab Content */}
          <TabsContent value="notes" className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-300 text-gray-400 text-sm font-semibold flex items-center justify-center rounded-full bg-gray-800 px-3 py-1 transition cursor-pointer whitespace-nowrap mb-2 sm:mb-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading notes...</p>
              </div>
            ) : resources.notes.length > 0 ? (
              (() => {
                // Sort notes by number ascending (smallest first)
                const extractNumber = (str: string) => {
                  const match = str.match(/\d+/g);
                  return match ? Math.min(...match.map(Number)) : Number.MAX_SAFE_INTEGER;
                };
                const sorted = resources.notes.slice().sort((a, b) => extractNumber(a.title + ' ' + a.file_name) - extractNumber(b.title + ' ' + b.file_name));
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sorted.map((res) => (
                      <div
                        key={res.id}
                        className="w-full sm:w-[390px] lg:w-[440px] max-w-full flex-shrink-0"
                      >
                        <ResourceCard resource={res} />
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No notes are yet available for {subjectFullName}
                </h3>
              </div>
            )}
          </TabsContent>

          <TabsContent value="papers" className="space-y-4">
            <div className="w-full mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-2 rounded-xl align-center justify-center">
              <button
                className={`data-[state=active]:bg-gray-800 data-[state=active]:text-blue-300 text-gray-400 text-xs font-medium flex items-center justify-center rounded-lg px-2 py-2 transition cursor-pointer whitespace-nowrap ${papersSubTab === 'final' ? 'bg-gray-800 text-blue-300' : ''}`}
                onClick={() => setPapersSubTab('final')}
              >
                <BookOpen className="h-4 w-4 mr-1" /> Final Theory
              </button>
              <button
                className={`data-[state=active]:bg-gray-800 data-[state=active]:text-blue-300 text-gray-400 text-xs font-medium flex items-center justify-center rounded-lg px-2 py-2 transition cursor-pointer whitespace-nowrap ${papersSubTab === 'mid' ? 'bg-gray-800 text-blue-300' : ''}`}
                onClick={() => setPapersSubTab('mid')}
              >
                <BookOpen className="h-4 w-4 mr-1" /> Mid Theory
              </button>
              <button
                className={`data-[state=active]:bg-gray-800 data-[state=active]:text-blue-300 text-gray-400 text-xs font-medium flex items-center justify-center rounded-lg px-2 py-2 transition cursor-pointer whitespace-nowrap ${papersSubTab === 'finalLab' ? 'bg-gray-800 text-blue-300' : ''}`}
                onClick={() => setPapersSubTab('finalLab')}
              >
                <BookOpen className="h-4 w-4 mr-1" /> Final Lab
              </button>
              <button
                className={`data-[state=active]:bg-gray-800 data-[state=active]:text-blue-300 text-gray-400 text-xs font-medium flex items-center justify-center rounded-lg px-2 py-2 transition cursor-pointer whitespace-nowrap ${papersSubTab === 'midLab' ? 'bg-gray-800 text-blue-300' : ''}`}
                onClick={() => setPapersSubTab('midLab')}
              >
                <BookOpen className="h-4 w-4 mr-1" /> Mid Lab
              </button>
            </div>

            {/* Papers Sub-tabs Content */}
            {papersSubTab === 'final' ? (
              isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading final papers...</p>
                </div>
              ) : (() => {
                // Filter and sort by number descending
                const filtered = resources.papers.filter(res => {
                  const isFinal = /final/i.test(res.title) || /final/i.test(res.file_name);
                  const isLab = /lab/i.test(res.title) || /lab/i.test(res.file_name);
                  return isFinal && !isLab;
                });
                const extractNumber = (str: string) => {
                  const match = str.match(/\d+/g);
                  return match ? Math.max(...match.map(Number)) : -1;
                };
                const sorted = filtered.slice().sort((a, b) => extractNumber(b.title + ' ' + b.file_name) - extractNumber(a.title + ' ' + a.file_name));
                return sorted.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sorted.map((res) => (
                      <div
                        key={res.id}
                        className="w-full sm:w-[390px] lg:w-[440px] max-w-full flex-shrink-0"
                      >
                        <ResourceCard resource={res} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No final papers are yet available for {subjectFullName}
                    </h3>
                  </div>
                );
              })()
            ) : papersSubTab === 'mid' ? (
              isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading mid papers...</p>
                </div>
              ) : (() => {
                // Filter and sort by number descending
                const filtered = resources.papers.filter(res => {
                  const isMid = /mid/i.test(res.title) || /mid/i.test(res.file_name);
                  const isLab = /lab/i.test(res.title) || /lab/i.test(res.file_name);
                  return isMid && !isLab;
                });
                const extractNumber = (str: string) => {
                  const match = str.match(/\d+/g);
                  return match ? Math.max(...match.map(Number)) : -1;
                };
                const sorted = filtered.slice().sort((a, b) => extractNumber(b.title + ' ' + b.file_name) - extractNumber(a.title + ' ' + a.file_name));
                return sorted.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sorted.map((res) => (
                      <div
                        key={res.id}
                        className="w-full sm:w-[390px] lg:w-[440px] max-w-full flex-shrink-0"
                      >
                        <ResourceCard resource={res} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No mid papers are yet available for {subjectFullName}
                    </h3>
                  </div>
                );
              })()
            ) : papersSubTab === 'finalLab' ? (
              isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading final lab papers...</p>
                </div>
              ) : (() => {
                // Filter and sort by number descending
                const filtered = resources.papers.filter(res => {
                  const isFinal = /final/i.test(res.title) || /final/i.test(res.file_name);
                  const isLab = /lab/i.test(res.title) || /lab/i.test(res.file_name);
                  return isFinal && isLab;
                });
                const extractNumber = (str: string) => {
                  const match = str.match(/\d+/g);
                  return match ? Math.max(...match.map(Number)) : -1;
                };
                const sorted = filtered.slice().sort((a, b) => extractNumber(b.title + ' ' + b.file_name) - extractNumber(a.title + ' ' + a.file_name));
                return sorted.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sorted.map((res) => (
                      <div
                        key={res.id}
                        className="w-full sm:w-[390px] lg:w-[440px] max-w-full flex-shrink-0"
                      >
                        <ResourceCard resource={res} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No final lab papers are yet available for {subjectFullName}
                    </h3>
                  </div>
                );
              })()
            ) : papersSubTab === 'midLab' ? (
              isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading mid lab papers...</p>
                </div>
              ) : (() => {
                // Filter and sort by number descending
                const filtered = resources.papers.filter(res => {
                  const isMid = /mid/i.test(res.title) || /mid/i.test(res.file_name);
                  const isLab = /lab/i.test(res.title) || /lab/i.test(res.file_name);
                  return isMid && isLab;
                });
                const extractNumber = (str: string) => {
                  const match = str.match(/\d+/g);
                  return match ? Math.max(...match.map(Number)) : -1;
                };
                const sorted = filtered.slice().sort((a, b) => extractNumber(b.title + ' ' + b.file_name) - extractNumber(a.title + ' ' + a.file_name));
                return sorted.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sorted.map((res) => (
                      <div
                        key={res.id}
                        className="w-full sm:w-[340px] lg:w-[370px] max-w-full flex-shrink-0"
                      >
                        <ResourceCard resource={res} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No mid lab papers are yet available for {subjectFullName}
                    </h3>
                  </div>
                );
              })()
            ) : null}
          </TabsContent>

          {/* Slides Tab Content */}
          <TabsContent value="slides" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading slides...</p>
              </div>
            ) : resources.slides.length > 0 ? (
              (() => {
                // Sort slides by number ascending (smallest first)
                const extractNumber = (str: string) => {
                  const match = str.match(/\d+/g);
                  return match ? Math.min(...match.map(Number)) : Number.MAX_SAFE_INTEGER;
                };
                const sorted = resources.slides.slice().sort((a, b) => extractNumber(a.title + ' ' + a.file_name) - extractNumber(b.title + ' ' + b.file_name));
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sorted.map((res) => (
                      <div
                        key={res.id}
                        className="w-full sm:w-[340px] lg:w-[370px] max-w-full flex-shrink-0"
                      >
                        <ResourceCard resource={res} />
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No slides are yet available for {subjectFullName}
                </h3>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Analytics />
      </main>
    </div>
  )
}