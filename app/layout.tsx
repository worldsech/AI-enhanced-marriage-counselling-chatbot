import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoupleConnect",
  description: "developed by Amadi Emmanuel",
  icons: {
    icon: "/favicon.svg",
  },
  keywords: [
    "CoupleConnect",
    "AI marriage counseling",
    "relationship advice",
    "couples therapy",
    "AI-powered counseling",
    "relationship support",
    "marriage guidance",
    "couple communication",
    "relationship improvement",
    "AI relationship coach"
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange> */}
            {children}
            <Toaster />
          {/* </ThemeProvider> */}
        </AuthProvider>
      </body>
    </html>
  )
}
