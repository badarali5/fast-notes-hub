"use client"

import React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { BookOpen, Search, Code, Database, Cpu, File, Eye, Presentation, Bookmark, BookmarkCheck, LogOut, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Analytics } from "@vercel/analytics/react"
import Fuse from "fuse.js"
import { supabase } from "@/lib/supabase"

interface SearchResult {
  id: string
  title: string
  description: string
  subject: string
  semester: string
  type: "notes" | "papers" | "slides"
  file_name: string
  url: string
  created_at: string
}

// GitHub repository configuration
const GITHUB_REPO = "badarali5/fast-notes-hub"
const GITHUB_BRANCH = "main"
const FILES_PATH = "files"

const semesters = [
  {
    id: 1,
    title: "Semester 1",
    subjects: [
      { value: "CS1002", fullName: "Programming Fundamentals", icon: Code },
      { value: "NS1001", fullName: "Applied Physics", icon: Code },
      { value: "MT1003", fullName: "Calculus and Analytical Geometry", icon: Code },
      { value: "SS1012", fullName: "Functional English", icon: Code },
      { value: "SS1013", fullName: "Ideology and Constitution of Pakistan", icon: Code },
      { value: "CL1000", fullName: "Introduction to Information and Communication Technology", icon: Code },
    ],
  },
  {
    id: 2,
    title: "Semester 2",
    subjects: [
      { value: "CS1004", fullName: "Object Oriented Programming", icon: Code },
      { value: "MT1008", fullName: "Multivariable Calculus", icon: Code },
      { value: "EE1005", fullName: "Digital Logic Design", icon: Code },
      { value: "SS1014", fullName: "Expository Writing", icon: Code },
      { value: "SS1007", fullName: "Islamic Studies/Ethics", icon: Code },
      { value: "SS2043", fullName: "Civics and Community Engagement", icon: Code },
    ],
  },
  {
    id: 3,
    title: "Semester 3",
    subjects: [
      { value: "EE2003", fullName: "Computer Organization and Assembly Language", icon: Code },
      { value: "CS2001", fullName: "Data Structures and Algorithms", icon: Code },
      { value: "CS1005", fullName: "Discrete Structures", icon: Code },
      { value: "SE1001", fullName: "Introduction to Software Engineering", icon: Code },
      { value: "MT1004", fullName: "Linear Algebra", icon: Code },
      { value: "CS3005", fullName: "Theory Of Automata", icon: Code },
      { value: "SS2002", fullName: "Fundamentals of Economics", icon: Code },
      { value: "MG1001", fullName: "Fundamentals of Management", icon: Code },
      { value: "AF1001", fullName: "Fundamentals of Accounting", icon: Code },
    ],
  },
  {
    id: 4,
    title: "Semester 4",
    subjects: [
      { value: "CS2005", fullName: "Database Systems", icon: Database },
      { value: "CS2006", fullName: "Operating Systems", icon: Cpu },
      { value: "MT2005", fullName: "Probability and Statistics", icon: Code },
      { value: "SE2004", fullName: "Software Design and Architecture", icon: Code },
      { value: "SE2001", fullName: "Software Requirements Engineering", icon: Code },
    ],
  },
  {
    id: 5,
    title: "Semester 5",
    subjects: [
      { value: "AI2002", fullName: "Artificial Intelligence", icon: Code },
      { value: "CS2009", fullName: "Design and Analysis of Algorithms", icon: Code },
      { value: "SE3004", fullName: "Software Construction and Development", icon: Code },
      { value: "SE3002", fullName: "Software Quality Engineering", icon: Code },
      { value: "SS2007", fullName: "Technical and Business Writing", icon: Code },
    ],
  },
  {
    id: 6,
    title: "Semester 6",
    subjects: [
      { value: "CS3001", fullName: "Computer Networks", icon: Code },
      { value: "SE4002", fullName: "Fundamentals of Software Project Management", icon: Code },
      { value: "CS3006", fullName: "Parallel and Distributed Computing", icon: Code },
    ],
  },
  {
    id: 7,
    title: "Semester 7",
    subjects: [
      { value: "MG4011", fullName: "Entrepreneurship", icon: Code },
      { value: "SE4091", fullName: "Final Year Project – I", icon: Code },
    ],
  },
  {
    id: 8,
    title: "Semester 8",
    subjects: [
      { value: "SE4092", fullName: "Final Year Project – II", icon: Code },
      { value: "CS3002", fullName: "Information Security", icon: Code },
      { value: "CS4001", fullName: "Professional Practices in IT", icon: Code },
    ],
  },
]

export default function Dashboard() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchError, setSearchError] = useState("")

  // Auth & bookmark state
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null)

  // Subscribe to auth session changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Reload bookmarks whenever the logged-in user changes
  useEffect(() => {
    if (!user) { setBookmarks(new Set()); return }
    supabase
      .from("bookmarks")
      .select("file_url")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setBookmarks(new Set(data.map((b: any) => b.file_url as string)))
      })
  }, [user])

  const signInWithGoogle = async () => {
    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    })
    if (data?.url) {
      const popup = window.open(data.url, "google-signin", "width=500,height=640,left=200,top=100")
      const interval = setInterval(async () => {
        try {
          if (popup?.closed) {
            clearInterval(interval)
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              setUser(session.user)
              setShowLoginModal(false)
            }
          }
        } catch { clearInterval(interval) }
      }, 600)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setBookmarks(new Set())
  }

  const toggleBookmark = async (result: SearchResult) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    const key = result.url
    setBookmarkLoading(key)
    if (bookmarks.has(key)) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("file_url", key)
      setBookmarks(prev => { const n = new Set(prev); n.delete(key); return n })
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, file_url: key, file_name: result.file_name })
      setBookmarks(prev => new Set([...prev, key]))
    }
    setBookmarkLoading(null)
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      setSearchError("")
      return
    }

    setIsSearching(true)
    setShowResults(true)
    setSearchError("")

    try {
      // Fetch file list from GitHub (Contents API)
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILES_PATH}`)
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("GitHub API rate limit exceeded. Please try again later.")
        }
        throw new Error(`GitHub API error: ${res.status}`)
      }

      const files = await res.json()

      // Ensure files is an array (sometimes GitHub returns object for single files)
      const fileArray = Array.isArray(files) ? files : [files]

      // Fuzzy search with Fuse.js
      const fuse = new Fuse(fileArray, {
        keys: ["name"],
        threshold: 0.4,       // 0 = perfect match, 1 = match everything
        distance: 200,        // allow fuzzy match across longer filenames
        includeScore: true,
        ignoreLocation: true, // match anywhere in filename, not just prefix
        minMatchCharLength: 2,
      })

      const fuseResults = query.trim() ? fuse.search(query) : fileArray.map((f: any) => ({ item: f, score: 1 }))

      // Map to SearchResult[] with proper GitHub raw links
      const results: SearchResult[] = fuseResults.map(({ item: file }: any, idx: number) => ({
        id: file.sha || String(idx),
        title: file.name,
        description: "File from GitHub storage.",
        subject: "Unknown",   // no category info here
        semester: "Unknown",  // no category info here
        type: getFileType(file.name),
        file_name: file.name,
        url: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${FILES_PATH}/${file.name}`,
        created_at: ""
      }))

      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchError(error instanceof Error ? error.message : "An error occurred while searching")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Helper function to determine file type from filename
  const getFileType = (filename: string): "notes" | "papers" | "slides" => {
    const lower = filename.toLowerCase()
    if (lower.includes("slide") || lower.includes("presentation") || lower.includes("ppt")) {
      return "slides"
    }
    if (lower.includes("paper") || lower.includes("exam") || lower.includes("test")) {
      return "papers"
    }
    return "notes"
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Debounce search using useEffect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  // Helper: subject code to full name
  const subjectFullNames: Record<string, string> = {
    NS1001: "Applied Physics",
    MT1003: "Calculus and Analytical Geometry",
    SS1012: "Functional English",
    SS1013: "Ideology and Constitution of Pakistan",
    CL1000: "Introduction to Information and Communication Technology",
    CS1002: "Programming Fundamentals",
    CS1004: "Object Oriented Programming",
    MT1008: "Multivariable Calculus",
    EE1005: "Digital Logic Design",
    SS1014: "Expository Writing",
    SS1007: "Islamic Studies/Ethics",
    SS2043: "Civics and Community Engagement",
    EE2003: "Computer Organization and Assembly Language",
    CS2001: "Data Structures and Algorithms",
    CS1005: "Discrete Structures",
    SE1001: "Introduction to Software Engineering",
    MT1004: "Linear Algebra",
    CS3005: "Theory Of Automata",
    SS2002: "Fundamentals of Economics",
    MG1001: "Fundamentals of Management",
    AF1001: "Fundamentals of Accounting",
    CS2005: "Database Systems",
    CS2006: "Operating Systems",
    MT2005: "Probability and Statistics",
    SE2004: "Software Design and Architecture",
    SE2001: "Software Requirements Engineering",
    AI2002: "Artificial Intelligence",
    CS2009: "Design and Analysis of Algorithms",
    SE3004: "Software Construction and Development",
    SE3002: "Software Quality Engineering",
    SS2007: "Technical and Business Writing",
    CS3001: "Computer Networks",
    SE4002: "Fundamentals of Software Project Management",
    CS3006: "Parallel and Distributed Computing",
    MG4011: "Entrepreneurship",
    SE4091: "Final Year Project – I",
    SE4092: "Final Year Project – II",
    CS3002: "Information Security",
    CS4001: "Professional Practices in IT",
  }

  // Helper: highlight search query in text
  function highlight(text: string, query: string) {
    if (!query) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-blue-900 text-blue-300 rounded px-1 py-0.5">{part}</mark> : part
    )
  }

  // Helper: file type icon
  function getTypeIcon(type: string) {
    switch (type) {
      case "notes": return <File className="h-4 w-4 text-green-400 mr-1" />
      case "papers": return <BookOpen className="h-4 w-4 text-blue-400 mr-1" />
      case "slides": return <Presentation className="h-4 w-4 text-purple-400 mr-1" />
      default: return <File className="h-4 w-4 text-gray-400 mr-1" />
    }
  }

  // Reuse the same prefetch helper
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

  const SearchResultCard = ({ result }: { result: SearchResult }) => {
    const hasPrefetched = useRef(false)

    const buildViewUrl = () => {
      const isPdf = result.file_name?.toLowerCase().endsWith(".pdf")
      if (!isPdf) return result.url

      // Direct GitHub Pages URL so the browser handles PDF viewing natively
      const ghPagesUrl = result.url
        .replace("raw.githubusercontent.com/badarali5/fast-notes-hub/main/files", "badarali5.github.io/fast-notes-hub/files")
        .replace("github.com/badarali5/fast-notes-hub/blob/main/files", "badarali5.github.io/fast-notes-hub/files")
      return ghPagesUrl
    }

    const handlePrefetch = () => {
      if (!hasPrefetched.current) {
        const viewUrl = buildViewUrl()
        prefetchUrlOnce(viewUrl)
        hasPrefetched.current = true
      }
    }

    const handleViewClick = () => {
      const viewUrl = buildViewUrl()
      prefetchUrlOnce(viewUrl)
      window.open(viewUrl, "_blank")
    }

    return (
      <Card
        className="bg-gray-900 group border border-gray-800 hover:border-blue-500 hover:shadow-blue-900/40 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer relative overflow-hidden"
        onMouseEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
        onClick={handleViewClick}
      >
        {/* Animated blue glow on hover */}
        <span className="absolute inset-0 pointer-events-none group-hover:shadow-[0_0_40px_10px_rgba(59,130,246,0.15)] transition-all duration-300 rounded-xl" />
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center justify-center rounded-full bg-gray-800 border border-blue-700 w-10 h-10 group-hover:bg-blue-950/60 transition-all">
              {getTypeIcon(result.type)}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors line-clamp-2">
                {highlight(result.title, searchQuery)}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                  {subjectFullNames[result.subject] || result.subject}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-gray-800 text-blue-300 border border-blue-700">
                  Semester {result.semester}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-gray-800 text-purple-300 border border-purple-700">
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-end">
            <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-gray-700 group-hover:bg-blue-950/60 transition-colors flex items-center justify-between">
              <span className="text-xs text-blue-300 font-medium flex items-center gap-1">
                <Eye className="h-4 w-4 mr-1 inline-block" />
                Click to view file
              </span>
              <button
                onClick={e => { e.stopPropagation(); toggleBookmark(result) }}
                disabled={bookmarkLoading === result.url}
                title={bookmarks.has(result.url) ? "Remove bookmark" : "Save bookmark"}
                className="ml-2 p-1.5 rounded-lg hover:bg-blue-900/60 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {bookmarks.has(result.url)
                  ? <BookmarkCheck className="h-4 w-4 text-blue-400" />
                  : <Bookmark className="h-4 w-4 text-gray-400 group-hover:text-blue-300" />
                }
              </button>
            </div>
          </div>
        </CardContent>
        {/* Animated border on hover */}
        <span className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-xl pointer-events-none transition-all duration-300" />
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <header className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">FAST Notes Hub</h1>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 font-semibold text-sm shadow transition-all duration-200"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload Notes</span>
                </button>
              )}
              <a
                href="https://www.linkedin.com/in/badar-ali-07bb36282/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-gray-800 text-blue-400 border border-gray-800 rounded-lg px-3 py-2 font-semibold text-sm shadow transition-all duration-200 hidden sm:block"
              >
                About Developer
              </a>
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                    {user.user_metadata?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.user_metadata.avatar_url} alt="avatar" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                        {(user.user_metadata?.name || user.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-white hidden sm:inline max-w-[120px] truncate">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    title="Sign out"
                    className="p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-red-900/40 hover:border-red-700 text-gray-400 hover:text-red-400 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-blue-400 border border-gray-800 rounded-lg px-3 py-2 font-semibold text-sm shadow transition-all duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Global Search */}
        <section className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-4">
            Fast Access for FAST University Students 🚀
          </h2>
          <p className="text-gray-400 mb-6 text-lg">
            Past papers, notes, slides &ndash; all in one place. Search by keyword or browse by semester.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="🔍 Search notes, papers, slides, subjects..."
              className="pl-12 py-4 text-lg border-2 border-gray-800 focus:border-blue-500 rounded-xl shadow-lg bg-gray-900 text-white placeholder:text-gray-500"
            />
          </form>
        </section>

        {/* Search Results */}
        {showResults && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                <Search className="h-6 w-6 text-blue-400" />
                Search Results
                {isSearching && (
                  <span className="ml-2 text-blue-400 animate-pulse">(Searching...)</span>
                )}
              </h3>
              {searchResults.length > 0 && (
                <span className="text-gray-400">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Error Message */}
            {searchError && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{searchError}</p>
              </div>
            )}

            {isSearching ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : searchQuery.trim() && !searchError ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                <p className="text-gray-400">Try different keywords or browse by semester below.</p>
              </div>
            ) : null}
          </section>
        )}

        {/* Semester Cards */}
        <section className="mb-14">
          <h3 className="text-2xl font-semibold text-white mb-6">📚 Browse by Semester</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {semesters.map((semester) => (
              <Card
                key={semester.id}
                className="group hover:shadow-2xl transition-all duration-300 border border-gray-800 bg-gray-900 hover:bg-gray-910 hover:scale-[1.03]"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-blue-400">
                    📚 {semester.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {semester.subjects.map((subject) => {
                    const IconComponent = subject.icon
                    return (
                      <a
                        key={subject.value}
                        href={`/subject/${subject.value?.toLowerCase()}?semester=${semester.id}`}
                        className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group cursor-pointer bg-gray-900 hover:bg-blue-950/70 hover:scale-[1.04] hover:shadow-lg border border-transparent hover:border-blue-400"
                      >
                        <div className="flex items-center gap-4">
                          {IconComponent && (
                            <IconComponent className="h-5 w-5 flex-shrink-0 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-white group-hover:text-blue-300 transition-colors duration-200">
                              {subject.value}
                            </span>
                            <span className="text-sm text-gray-400 group-hover:text-blue-200 transition-colors duration-200">{subject.fullName}</span>
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Info & Contact */}
        <section className="bg-gray-900 rounded-xl p-6 shadow-lg mb-8">
          <h4 className="text-lg font-semibold text-blue-400 mb-2">Stay Updated</h4>
          <ul className="list-disc list-inside text-gray-300 space-y-1 mb-2">
            <li>More semesters will be added soon.</li>
            <li>Subjects may be misplaced by semester, but resources are available for all.</li>
          </ul>
          <p className="text-gray-300 mb-2">
            Want to contribute notes, past papers, or slides, or have any suggestions? Email us at{" "}
            <a
              href="#"
              className="text-blue-400 underline font-medium"
              onClick={e => {
                e.preventDefault()
                window.open('https://mail.google.com/mail/?view=cm&fs=1&to=fastnoteshub@gmail.com', '_blank')
              }}
            >
              fastnoteshub@gmail.com
            </a>
          </p>
        </section>

        {/* Feedback Form */}
        <section className="bg-gray-900 rounded-xl p-6 shadow-lg mb-8">
          <h4 className="text-lg font-semibold text-blue-400 mb-2">Feedback</h4>
          <p className="text-gray-300 mb-4">
            Have a minute? Share how you like the site and any improvements you’d love to see—features to add, confusing parts, or bugs you noticed.
          </p>
          <form 
            action="https://formspree.io/f/mvgbynpz" 
            method="POST"
            className="space-y-4"
          >
            <div>
              <input
                type="email"
                name="email"
                placeholder="Your email (optional)"
                className="w-full px-4 py-2 rounded-lg border border-gray-800 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition duration-200"
              />
            </div>
            <div>
              <select
                name="type"
                className="w-full px-4 py-2 rounded-lg border border-gray-800 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition duration-200"
                required
              >
                <option value="">Select feedback type</option>
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug Report</option>
                <option value="content">Content Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <textarea
                name="message"
                placeholder="What did you like? What can be improved? Any feature request?"
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-800 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition duration-200 resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
              Send Feedback
            </button>
          </form>
        </section>

        <a
          href="/apk/fast-notes-hub.apk"
          className="fixed bottom-6 right-6 z-50 bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 rounded-full shadow-lg w-16 h-16 flex items-center justify-center transition-all duration-200 group ring-0 hover:ring-2 hover:ring-blue-500"
          title="Download Android APK"
          aria-label="Download Android APK"
          style={{ transformOrigin: "center" }}
        >
          <span className="flex items-center justify-center w-full h-full transition-transform duration-300 group-hover:scale-110">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 transition-transform duration-500 group-hover:rotate-[360deg]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="11"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 16v-8m0 8l-4-4m4 4l4-4"
              />
            </svg>
          </span>
          <span className="absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap font-semibold border border-gray-800">
            Download Android APK
          </span>
        </a>
        {/* ── Login Modal ── */}
        {showLoginModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          >
            <div
              className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600/20 border border-blue-600 mx-auto mb-4">
                  <Bookmark className="h-7 w-7 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Sign in to save bookmarks</h2>
                <p className="text-gray-400 text-sm">
                  Sign in with Google to bookmark files and access them anytime.
                </p>
              </div>

              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg py-3 px-4 transition-all duration-200 shadow-lg"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                You can browse all content without signing in. Login is only needed to save bookmarks.
              </p>
            </div>
          </div>
        )}

        {/* ── Upload Notes Modal ── */}
        {showUploadModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-600/20 border border-green-600 mx-auto mb-4">
                  <Upload className="h-7 w-7 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Upload Notes</h2>
                <p className="text-gray-400 text-sm">
                  Share your notes, past papers, or slides with other FAST students. Submissions are reviewed before being published.
                </p>
              </div>

              <div className="space-y-1 text-sm bg-gray-800 rounded-xl p-4 mb-6">
                <p className="font-semibold text-white mb-2">What to include in the form:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Subject name &amp; semester number</li>
                  <li>Google Drive link (set sharing to &ldquo;Anyone with the link&rdquo;)</li>
                  <li>Your name (optional)</li>
                </ul>
              </div>

              <a
                href="https://forms.gle/YOUR_FORM_ID"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowUploadModal(false)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-3 px-4 transition-all duration-200 shadow-lg"
              >
                <Upload className="h-5 w-5" />
                Open Submission Form
              </a>

              <p className="text-center text-xs text-gray-500 mt-4">
                Opens Google Forms in a new tab. We manually review all submissions.
              </p>
            </div>
          </div>
        )}

        <Analytics />
      </main>
    </div>
    
  )
}
