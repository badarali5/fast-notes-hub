"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Eye, FileText, Presentation, BookOpen, File} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

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

function ResourceCard({ resource }: { resource: Resource }) {
  const openPdf = () => {
    let url = resource.url;
    if (isMobile() && url.endsWith(".pdf")) {
      url = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
    }
    window.open(url, "_blank");
  };

  return (
    <Card
      className="group border border-gray-800 bg-gray-900 hover:border-blue-500 hover:shadow-blue-900/30 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer relative overflow-hidden rounded-lg min-h-0"
      onClick={openPdf}
      style={{ minHeight: 0, padding: 0 }}
    >
      <CardContent className="p-2 flex flex-col h-full min-h-0">
        <div className="flex items-center gap-2 mb-1">
          {/* <span className="flex items-center justify-center rounded bg-gray-800 border border-blue-700 w-7 h-7 group-hover:bg-blue-950/60 transition-all">
            <File className="h-4 w-4 text-blue-400" />
          </span> */}
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
        {resource.description && (
          <div className="mb-1 text-gray-400 text-[10px] truncate">
            {resource.description}
          </div>
        )}
        <div className="flex-1 flex flex-col justify-end">
          <div className="mt-1 p-1 bg-gray-800 rounded border border-gray-700 group-hover:bg-blue-950/60 transition-colors flex items-center justify-center">
            <span className="text-xs text-blue-300 font-medium flex items-center gap-1">
              <Eye className="h-3 w-3 mr-1 inline-block" />
              Open PDF
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
        // Use case-insensitive matching with proper Supabase syntax
        const { data, error } = await supabase
          .from("uploads")
          .select("*")
          .ilike("subject", subject) // case-insensitive like
          .eq("semester", semester)

        if (error) {
          console.error("Error fetching resources:", error)
          setErrorMsg("Unable to load resources. Please try again later.")
          setIsLoading(false)
          return
        }

        const grouped: ResourcesMap = { notes: [], papers: [], slides: [] }


        for (const r of data || []) {
          // Only group into notes, papers, slides
          if (["notes", "papers", "slides"].includes(r.type)) {
            grouped[r.type as keyof ResourcesMap].push(r as Resource);
          }
        }

        setResources(grouped)
        setIsLoading(false)
      } catch (error) {
        console.error("Fetch error:", error)
        setErrorMsg("An error occurred while loading resources.")
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
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full">
          <TabsList
            className="w-full mb-6 bg-gray-900 border border-gray-800 flex flex-col sm:flex-row flex-nowrap justify-center gap-2 rounded-xl"
          >
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-300 text-gray-400 text-sm font-semibold flex items-center justify-center rounded-lg px-4 py-2 transition cursor-pointer whitespace-nowrap min-w-[110px] mb-2 sm:mb-0"
            >
                            <FileText className="h-5 w-5 mr-1" /> Notes ({resources.notes.length})
            </TabsTrigger>
            <TabsTrigger
              value="papers"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-300 text-gray-400 text-sm font-semibold flex items-center justify-center rounded-lg px-4 py-2 transition cursor-pointer whitespace-nowrap min-w-[110px] mb-2 sm:mb-0"
            >
              <BookOpen className="h-5 w-5 mr-1" /> Past Papers ({resources.papers.length})
            </TabsTrigger>
            <TabsTrigger
              value="slides"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-blue-300 text-gray-400 text-sm font-semibold flex items-center justify-center rounded-lg px-4 py-2 transition cursor-pointer whitespace-nowrap min-w-[110px]"
            >
              <Presentation className="h-5 w-5 mr-1" /> Slides ({resources.slides.length})
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab Content */}
          <TabsContent value="notes" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading notes...</p>
              </div>
            ) : errorMsg ? (
              <div className="text-center py-12 text-red-400">{errorMsg}</div>
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
            {papersSubTab === 'final' ? (
              isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading final papers...</p>
                </div>
              ) : errorMsg ? (
                <div className="text-center py-12 text-red-400">{errorMsg}</div>
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
              ) : errorMsg ? (
                <div className="text-center py-12 text-red-400">{errorMsg}</div>
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
              ) : errorMsg ? (
                <div className="text-center py-12 text-red-400">{errorMsg}</div>
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
              ) : errorMsg ? (
                <div className="text-center py-12 text-red-400">{errorMsg}</div>
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
            ) : errorMsg ? (
              <div className="text-center py-12 text-red-400">{errorMsg}</div>
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
