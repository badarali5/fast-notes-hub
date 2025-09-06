"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { ArrowLeft, Eye, FileText, Presentation, BookOpen, File} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// GitHub repository configuration
const GITHUB_REPO = "badarali5/fast-notes-hub"
const GITHUB_BRANCH = "main"
const FILES_PATH = "files"

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
}

interface Resource {
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

const tabTypes = ["notes", "papers", "slides"] as const;
type TabType = (typeof tabTypes)[number];
type ResourcesMap = Record<"notes" | "papers" | "slides", Resource[]>;

function isMobile() {
  if (typeof window === "undefined") return false
  return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent)
}

// Helper function to determine file type from filename
const getFileType = (filename: string): "notes" | "papers" | "slides" => {
  const lower = filename.toLowerCase()
  if (lower.includes("slide") || lower.includes("presentation") || lower.includes("ppt")) {
    return "slides"
  }
  if (lower.includes("paper") || lower.includes("exam") || lower.includes("test") || 
      lower.includes("final") || lower.includes("mid") || lower.includes("quiz")) {
    return "papers"
  }
  return "notes"
}

// Helper function to check if file matches subject
const matchesSubject = (filename: string, subject: string): boolean => {
  const lower = filename.toLowerCase();
  const subjectLower = subject.toLowerCase();
  // Only match subject code as a whole word (not substring)
  const codeRegex = new RegExp(`\\b${subjectLower}\\b`, "i");
  if (codeRegex.test(lower)) return true;
  // Fallback: match full name only if code not found
  const fullName = subjectFullNames[subject.toUpperCase()];
  if (fullName) {
    // Only match full name as a whole word
    const fullNameRegex = new RegExp(`\\b${fullName.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/ +/g, "|\\b")}`, "i");
    return fullNameRegex.test(lower);
  }
  return false;
}

function ResourceCard({ resource }: { resource: Resource }) {
  const openView = () => {
    let url = resource.url;
    const isPdf = resource.file_name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      // Use GitHub Pages URL for Google Docs Viewer
      url = `https://github.com/badarali5/fast-notes-hub/blob/main/files/${encodeURIComponent(resource.file_name)}`;
      url = url.replace(
        "github.com/badarali5/fast-notes-hub/blob/main/files",
        "badarali5.github.io/fast-notes-hub/files"
      );
      url = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    window.open(url, "_blank");
  };

  return (
    <Card
      className="group border border-gray-800 bg-gray-900 hover:border-blue-500 hover:shadow-blue-900/30 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer relative overflow-hidden rounded-lg min-h-0"
      onClick={openView}
      style={{ minHeight: 0, padding: 0 }}
    >
      <CardContent className="p-2 flex flex-col h-full min-h-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
            <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors line-clamp-2 text-center mb-2">
              {resource.title}
            </h4>
            <div className="flex flex-row gap-2 mb-1 justify-center">
              <Badge variant="secondary" className="text-xs bg-gray-800 text-blue-300 border border-blue-700 px-2 py-1">
                Semester {resource.semester}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gray-800 text-purple-300 border border-purple-700 px-2 py-1">
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      
        <div className="flex-1 flex flex-col justify-end">
          <div className="mt-1 p-1 bg-gray-800 rounded border border-gray-700 group-hover:bg-blue-950/60 transition-colors flex items-center justify-center">
            <span className="text-xs text-blue-300 font-medium flex items-center gap-1">
              <Eye className="h-3 w-3 mr-1 inline-block" />
              Click to view file
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

  const subject = (params?.subject as string)?.trim() || ""
  const semester = searchParams?.get("semester")?.trim() || ""

  // Get the full name from the mapping, fallback to code if not found
  const subjectFullName = subjectFullNames[subject.toUpperCase()] || subject

  const [resources, setResources] = useState<ResourcesMap>({
    notes: [],
    papers: [],
    slides: [],
  });
  const [activeTab, setActiveTab] = useState<TabType>("papers");
  const [papersSubTab, setPapersSubTab] = useState<"final" | "mid" | "finalLab" | "midLab">("final");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      setIsLoading(true)
      setErrorMsg(null)

      if (!subject || !semester) {
        setErrorMsg("Missing subject or semester in URL.")
        setIsLoading(false)
        return
      }

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

        // Ensure files is an array
        const fileArray = Array.isArray(files) ? files : [files]

        // Filter files by subject
        const subjectFiles = fileArray.filter((file: any) => 
          file.name && matchesSubject(file.name, subject)
        )

        // Convert to Resource objects and group by type
        const grouped: ResourcesMap = { notes: [], papers: [], slides: [] }

        for (const file of subjectFiles) {
          const fileType = getFileType(file.name)
          const resource: Resource = {
            id: file.sha || Math.random().toString(),
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            description: "File from GitHub storage.",
            subject: subject.toUpperCase(),
            semester: semester,
            type: fileType,
            file_name: file.name,
            url: `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${FILES_PATH}/${file.name}`,
            created_at: ""
          }
          
          grouped[fileType].push(resource)
        }

        setResources(grouped)
        setIsLoading(false)
      } catch (error) {
        console.error("Fetch error:", error)
        setErrorMsg(error instanceof Error ? error.message : "An error occurred while loading resources.")
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [subject, semester])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <header className="bg-gray-900 shadow-lg border-b border-gray-800 w-full">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center w-full mb-6">
            <button
              onClick={() => window.history.back()}
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
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full">
          <TabsList
            className="w-full mb-6 bg-gray-900 border border-gray-800 flex flex-wrap justify-center gap-2 rounded-xl px-2 py-2 [&>*]:mb-2 sm:[&>*]:mb-0"
          >
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-300 text-gray-400 text-sm font-semibold flex items-center justify-center rounded-full bg-muted px-3 py-1 transition cursor-pointer whitespace-nowrap mb-2 sm:mb-0"
            >
              <FileText className="h-5 w-5 mr-1" /> Notes ({resources.notes.length})
            </TabsTrigger>
            <TabsTrigger
              value="papers"
              className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-300 text-gray-400 text-sm font-semibold flex items-center justify-center rounded-full bg-muted px-3 py-1 transition cursor-pointer whitespace-nowrap mb-2 sm:mb-0"
            >
              <BookOpen className="h-5 w-5 mr-1" /> Past Papers ({resources.papers.length})
            </TabsTrigger>
            <TabsTrigger
              value="slides"
              className="data-[state=active]:bg-blue-900 data-[state=active]:text-blue-300 text-gray-400 text-sm font-semibold flex items-center justify-center rounded-full bg-muted px-3 py-1 transition cursor-pointer whitespace-nowrap mb-2 sm:mb-0"
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
      </main>
    </div>
  )
}