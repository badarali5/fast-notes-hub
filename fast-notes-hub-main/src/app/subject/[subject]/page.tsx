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

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group border-2 hover:border-blue-300">
      <CardContent className="p-4">
        <div
          className="cursor-pointer"
          onClick={() => window.open(resource.url, "_blank")}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <File className="h-4 w-4 text-red-500" />
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-1">{resource.description}</p>
              <Badge variant="outline" className="text-xs">
                {resource.file_name.split(".").pop()?.toUpperCase()} &bull; Uploaded for{" "}
                {resource.subject}
              </Badge>
            </div>
          </div>
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 group-hover:bg-blue-100 transition-colors">
            <p className="text-xs text-blue-700 text-center font-medium">
              📱 Click anywhere on this card to view PDF in new tab
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full group-hover:bg-blue-50 group-hover:border-blue-300 transition-colors"
            onClick={() => window.open(resource.url, "_blank")}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 {subject} &ndash; Semester {semester}
          </h1>
          <p className="text-gray-600">
            Access all your study materials for {subject}
          </p>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <File className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">
                📖 PDF Viewing Instructions
              </h3>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Click on any resource card or the &quot;View PDF&quot; button to open files
              in a new tab.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as TabType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
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
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading {tab}...</p>
                </div>
              ) : errorMsg ? (
                <div className="text-center py-12 text-red-500">{errorMsg}</div>
              ) : resources[tab].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources[tab].map((res) => (
                    <ResourceCard key={res.id} resource={res} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {tab} available for {subject}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Be the first to upload study materials!
                  </p>
                  <a
                    href="/upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {tab}
                  </a>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
