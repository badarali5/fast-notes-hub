"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Eye,
  FileText,
  Presentation,
  BookOpen,
  Upload,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  SSX21: "Social Science Elective - I",
  CS2005: "Database Systems",
  CS2006: "Operating Systems",
  MT2005: "Probability and Statistics",
  SE2004: "Software Design and Architecture",
  SE2001: "Software Requirements Engineering",
  // Add more as needed
};

interface Resource {
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

const tabTypes = ["notes", "papers", "slides"] as const;
type TabType = typeof tabTypes[number];
type ResourcesMap = Record<TabType, Resource[]>;

function isMobile() {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
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
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group border-2 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900">
      <CardContent className="p-4">
        <div
          className="cursor-pointer"
          onClick={openPdf}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <File className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {resource.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{resource.description}</p>
              <Badge variant="outline" className="text-xs dark:bg-gray-800 dark:text-gray-200">
                {resource.file_name.split(".").pop()?.toUpperCase()} &bull; Uploaded for{" "}
                {resource.subject}
              </Badge>
            </div>
          </div>
          <div className="mt-2 p-2 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-gray-700 transition-colors">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center font-medium">
              📱 Click anywhere on this card to view PDF
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 dark:group-hover:bg-gray-800 dark:group-hover:border-blue-400 transition-colors"
            onClick={openPdf}
          >
            <Eye className="h-4 w-4 mr-1" /> View PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const subject = (params?.subject as string)?.trim() || "";
  const semester = searchParams?.get("semester")?.trim() || "";

  // Get the full name from the mapping, fallback to code if not found
  const subjectFullName = subjectFullNames[subject.toUpperCase()] || subject;

  const [resources, setResources] = useState<ResourcesMap>({
    notes: [],
    papers: [],
    slides: [],
  });
  const [activeTab, setActiveTab] = useState<TabType>("notes");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      setIsLoading(true);
      setErrorMsg(null);

      if (!subject || !semester) {
        setErrorMsg("Missing subject or semester in URL.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .ilike("subject", subject) // case-insensitive
        .eq("semester", semester);

      if (error) {
        console.error("Error fetching resources:", error);
        setErrorMsg("Unable to load resources. Please try again later.");
        setIsLoading(false);
        return;
      }

      const grouped: ResourcesMap = { notes: [], papers: [], slides: [] };

      for (const r of data || []) {
        if (tabTypes.includes(r.type)) {
          grouped[r.type as TabType].push(r as Resource);
        }
      }

      setResources(grouped);
      setIsLoading(false);
    }

    fetchResources();
  }, [subject, semester]);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home Page</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🧠 {subjectFullName} &ndash; Semester {semester}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Access all your study materials for {subjectFullName}
          </p>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium text-blue-900 dark:text-blue-200">
                📖 PDF Viewing Instructions
              </h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Click on any resource card or the &quot;View PDF&quot; button
              to open files in a new tab.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as TabType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white dark:bg-gray-900 border dark:border-gray-700">
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-1" /> Notes (
              {resources.notes.length})
            </TabsTrigger>
            <TabsTrigger value="papers">
              <BookOpen className="h-4 w-4 mr-1" /> Past Papers (
              {resources.papers.length})
            </TabsTrigger>
            <TabsTrigger value="slides">
              <Presentation className="h-4 w-4 mr-1" /> Slides (
              {resources.slides.length})
            </TabsTrigger>
          </TabsList>

          {tabTypes.map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading {tab}...</p>
                </div>
              ) : errorMsg ? (
                <div className="text-center py-12 text-red-500 dark:text-red-400">{errorMsg}</div>
              ) : resources[tab].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources[tab].map((res) => (
                    <ResourceCard key={res.id} resource={res} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No {tab} are yet available for {subjectFullName}
                  </h3>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
