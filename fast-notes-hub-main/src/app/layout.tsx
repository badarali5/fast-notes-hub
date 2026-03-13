import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/toaster";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "FAST Notes Hub",
  title: "FAST Notes Hub - Past Papers & Notes",
  description: "One place for FAST students to find past papers, notes & slides by semester.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  keywords: 'FAST University, past papers, notes, NUCES',
  openGraph: {
    title: 'FAST Notes Hub',
    description: 'Past papers, notes and slides for FAST University students.',
    url: 'https://fast-notes-hub.vercel.app',
    images: [{ url: '/favicon.ico', width: 1200, height: 630 }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FAST Notes Hub",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V62L1WS0JE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V62L1WS0JE');
          `}
        </Script>
    
      <body className={`${geistSans.className} bg-black text-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
