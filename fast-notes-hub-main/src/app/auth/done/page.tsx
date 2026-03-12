"use client"

import { useEffect } from "react"

export default function AuthDone() {
  useEffect(() => {
    // Close the OAuth popup — the main tab detects the session via onAuthStateChange
    window.close()
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white text-center">
        Signed in successfully! This window will close automatically.
      </p>
    </div>
  )
}
