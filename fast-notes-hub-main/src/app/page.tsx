"use client"

import React from "react"

import { useState } from "react"
import { BookOpen, Upload, Search, Code, Database, Cpu, File, Eye, Presentation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

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
]

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

const handleSearch = async (query: string) => {
  if (!query.trim()) {
    setSearchResults([])
    setShowResults(false)
    return
  }

  setIsSearching(true)
  setShowResults(true)

  try {
    // Fetch repo tree (all files, recursive)
    const res = await fetch(
      "https://api.github.com/repos/badarali5/fast-notes-hub/git/trees/main?recursive=1"
    )
    const json = await res.json()

    // Only keep files (blobs)
    const files = json.tree?.filter((item: any) => item.type === "blob") || []

    // Filter by search keyword
    const filtered = files.filter((file: any) =>
      file.path.toLowerCase().includes(query.toLowerCase())
    )

    // Map results to SearchResult[]
    const results: SearchResult[] = filtered.map((file: any, idx: number) => ({
      id: file.sha || String(idx),
      title: file.path.split("/").pop() || file.path,
      description: "File from GitHub storage.",
      subject: "Unknown",
      semester: "Unknown",
      type: "notes",
      file_name: file.path.split("/").pop() || file.path,
      // Use GitHub blob URL for browser view
  url: `https://raw.githubusercontent.com/badarali5/fast-notes-hub/main/${file.path}`,
      created_at: ""
    }))

    setSearchResults(results)
  } catch (error) {
    console.error("Search error:", error)
    setSearchResults([])
  } finally {
    setIsSearching(false)
  }
}


      // Remove duplicate setSearchResults(results); and try-catch block

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
    
  };

  // Helper: highlight search query in text
  function highlight(text: string, query: string) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-blue-900 text-blue-300 rounded px-1 py-0.5">{part}</mark> : part
    );
  }

  // Helper: file type icon
  function getTypeIcon(type: string) {
    switch (type) {
      case "notes": return <File className="h-4 w-4 text-green-400 mr-1" />;
      case "papers": return <BookOpen className="h-4 w-4 text-blue-400 mr-1" />;
      case "slides": return <Presentation className="h-4 w-4 text-purple-400 mr-1" />;
      default: return <File className="h-4 w-4 text-gray-400 mr-1" />;
    }
  }

  const SearchResultCard = ({ result }: { result: SearchResult }) => {
    const subjectCode = result.subject?.toUpperCase();
    const subjectName = subjectFullNames[subjectCode] || result.subject;
    // Open PDF in Google Docs Viewer, images directly, others as raw
    const handleCardClick = () => {
    let url = result.url;

    // 🔄 Convert GitHub "blob" links → raw links
    if (url.includes("github.com") && url.includes("/blob/")) {
      url = url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
    }

    if (url.endsWith(".pdf")) {
      // ✅ Open PDFs in Google Docs Viewer
      window.open(
        `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    } else if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      // ✅ Open images directly
      window.open(url, "_blank");
    } else if (url.endsWith(".txt") || url.endsWith(".md")) {
      // ✅ Open text/markdown directly
      window.open(url, "_blank");
    } else {
      // ✅ Fallback: open in browser tab
      window.open(url, "_blank");
    }
  };
    return (
      <Card
        className="bg-gray-900 group border border-gray-800 hover:border-blue-500 hover:shadow-blue-900/40 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer relative overflow-hidden"
        onClick={handleCardClick}
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
                  {subjectName}
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
          {result.description && (
            <div className="mb-2 text-gray-400 text-xs line-clamp-2">
              {highlight(result.description, searchQuery)}
            </div>
          )}
          <div className="flex-1 flex flex-col justify-end">
            <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-gray-700 group-hover:bg-blue-950/60 transition-colors flex items-center justify-between">
              <span className="text-xs text-blue-300 font-medium flex items-center gap-1">
                <Eye className="h-4 w-4 mr-1 inline-block" />
                Click to view PDF
              </span>
              <span className="ml-2 text-xs text-gray-400 group-hover:text-blue-400 transition-colors">{result.file_name}</span>
            </div>
          </div>
        </CardContent>
        {/* Animated border on hover */}
        <span className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-xl pointer-events-none transition-all duration-300" />
      </Card>
    );
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
            <div className="flex items-center space-x-6">
              {/* Upload button/tooltip here if needed */}
              <a
                href="https://www.linkedin.com/in/badar-ali-07bb36282/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 hover:bg-gray-800 text-blue-400 border border-gray-800 rounded-lg px-3 py-2 sm:px-4 sm:py-2 font-semibold shadow transition-all duration-200 w-full sm:w-auto text-center"
                style={{ minWidth: "120px" }}
              >
                About Developer
              </a>
              
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Global Search */}
        <section className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-4">
            Fast Access for FAST Students 🚀
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
            ) : searchQuery.trim() ? (
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
                e.preventDefault();
                window.open('https://mail.google.com/mail/?view=cm&fs=1&to=fastnoteshub@gmail.com', '_blank');
              }}
            >
              fastnoteshub@gmail.com
            </a>
          </p>
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
      </main>
    </div>
  )
}