"use client"

import Link from "next/link"
import { BookOpen, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex flex-col">
      {/* Minimal nav */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-blue-500" />
          <span className="text-xl font-extrabold text-white tracking-tight">FAST Notes Hub</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Big 404 number */}
          <div className="relative mb-8">
            <span className="text-[10rem] font-black text-gray-800 leading-none select-none">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 text-blue-500/60" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
          <p className="text-gray-400 text-lg mb-8">
            The page you&apos;re looking for doesn&apos;t exist or the resource has moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-900/40"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
            <Link
              href="/"
              onClick={() => {
                // Focus the search input when navigating back
                setTimeout(() => {
                  const el = document.querySelector<HTMLInputElement>("input[type='text']")
                  el?.focus()
                }, 300)
              }}
              className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl border border-gray-700 transition-all duration-200"
            >
              <Search className="h-5 w-5" />
              Search Notes
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-600 text-sm border-t border-gray-800">
        FAST Notes Hub &mdash; resources for FAST University students
      </footer>
    </div>
  )
}
