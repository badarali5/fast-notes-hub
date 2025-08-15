"use client"

import type React from "react"

import { useState } from "react"
import { BookOpen, Upload, Search, Code, Database, Cpu, File, Eye } from "lucide-react"
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
      { value: "SSX21", fullName: "Social Science Elective - I", icon: Code },
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
      // Search in title, description, subject, and type
      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%,type.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } else {
        setSearchResults(data || [])
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  const SearchResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="hover:shadow-xl transition-all duration-200 cursor-pointer group border border-gray-800 bg-gray-900 hover:border-blue-500 hover:bg-gray-800">
      <CardContent className="p-4">
        <div
          className="cursor-pointer"
          onClick={() => {
            window.open(result.url, "_blank")
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <File className="h-4 w-4 text-blue-400" />
                <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">{result.title}</h4>
              </div>
              <p className="text-sm text-gray-300 mb-1">{result.description}</p>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs border-gray-700 bg-gray-800 text-gray-300">
                  {result.subject}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs border-gray-700 bg-gray-800 text-gray-300">
                  Semester {result.semester}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-gray-700 group-hover:bg-gray-700 transition-colors">
            <p className="text-xs text-blue-300 text-center font-medium">📱 Click to view PDF in new tab</p>
          </div>
        </div>
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:border-blue-500 hover:text-blue-400 transition-colors"
            onClick={() => {
              window.open(result.url, "_blank")
            }}
          >
            <Eye className="h-4 w-4 mr-1" /> View PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">FAST Notes Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/upload">
  <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
    <Upload className="h-4 w-4 mr-2" />
    Upload Files
  </Button>
</a> 

            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Search */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Welcome to Your Control Room</h2>
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
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">
                🔍 Search Results
                {isSearching && <span className="ml-2 text-blue-400">(Searching...)</span>}
              </h3>
              {searchResults.length > 0 && (
                <p className="text-gray-400">
                  Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {isSearching ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                <p className="text-gray-400">Try searching for different keywords or browse by semester below</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Semester Cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-white mb-6">📚 Your Semesters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {semesters.map((semester) => (
              <Card
                key={semester.id}
                className="hover:shadow-xl transition-all duration-200 border border-gray-800 bg-gray-900 hover:border-blue-500 hover:bg-gray-800"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-blue-400">📚 {semester.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {semester.subjects.map((subject) => {
                    const IconComponent = subject.icon
                    return (
                      <a
                        key={subject.value}
                        href={`/subject/${subject.value?.toLowerCase()}?semester=${semester.id}`}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-150 group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          {IconComponent && (
                            <IconComponent className="h-5 w-5 flex-shrink-0 text-blue-400 group-hover:text-blue-300" />
                          )}
                          <div className="flex flex-col">
                            <div className="font-medium text-white group-hover:text-blue-300">{subject.value}</div>
                            <div className="text-sm text-gray-400">{subject.fullName}</div>
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <p className="text-sm text-blue-400 mt-1">Remaining semesters will be added soon. Stay tuned!</p>
      </main>
    </div>
  )
}
