"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Upload,
  Search,
  Code,
  Database,
  Cpu,
  File,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  type: "notes" | "papers" | "slides";
  file_name: string;
  url: string;
  created_at: string;
}

const semesters = [
  {
    id: 1,
    title: "Semester 1",
    subjects: [
      { value: "NS1001", fullName: "Applied Physics", icon: Code },
      { value: "MT1003", fullName: "Calculus and Analytical Geometry", icon: Code },
      { value: "SS1012", fullName: "Functional English", icon: Code },
      { value: "SS1013", fullName: "Ideology and Constitution of Pakistan", icon: Code },
      { value: "CL1000", fullName: "Introduction to ICT", icon: Code },
      { value: "CS1002", fullName: "Programming Fundamentals", icon: Code },
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
      { value: "SS2043", fullName: "Civics and Community Engagement", icon: Code }
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
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%,type.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUploadClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== "badaralinaqvi512@gmail.com") {
      setMessage("❌ Only admin can upload files.");
      return;
    }

    setMessage("");
    router.push("/upload");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const SearchResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group border-2 hover:border-blue-300">
      <CardContent className="p-4">
        <div onClick={() => window.open(result.url, "_blank")}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <File className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {result.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-1">{result.description}</p>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">{result.subject}</Badge>
                <Badge variant="secondary" className="text-xs">{result.type.charAt(0).toUpperCase() + result.type.slice(1)}</Badge>
                <Badge variant="outline" className="text-xs">Semester {result.semester}</Badge>
              </div>
            </div>
          </div>
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 group-hover:bg-blue-100 transition-colors">
            <p className="text-xs text-blue-700 text-center font-medium">📱 Click to view PDF in new tab</p>
          </div>
        </div>
        <div className="mt-3">
          <Button size="sm" variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-300" onClick={() => window.open(result.url, "_blank")}>
            <Eye className="h-4 w-4 mr-1" /> View PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">FAST Notes Hub</h1>
          </div>
          <Button onClick={handleUploadClick} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="h-4 w-4 mr-2" /> Upload Files
          </Button>
        </div>
        {message && <p className="text-red-600 text-center mt-2">{message}</p>}
      </header>

      {/* Search + Semester Display stays same */}
      {/* ... Keep rest of your code same */}
    </div>
  );
}
