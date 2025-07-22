"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Heart } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Check admin credentials
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@coupleconnect.com"
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"

      if (email === adminEmail && password === adminPassword) {
        // Set admin session
        localStorage.setItem(
          "coupleconnect_admin_session",
          JSON.stringify({
            email,
            loginTime: new Date().toISOString(),
            role: "admin",
          }),
        )
        router.push("/admin/dashboard")
      } else {
        setError("Invalid admin credentials")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold text-pink-500">CoupleConnect</span>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 justify-center">
            <Shield className="h-6 w-6 text-slate-600" />
            Admin Login
          </CardTitle>
          <CardDescription>Access the administrative dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@coupleconnect.com"
                className="border-gray-200 focus:border-slate-500 focus:ring-slate-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="border-gray-200 focus:border-slate-500 focus:ring-slate-500"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In as Admin"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              <Link href="/" className="text-pink-500 hover:text-pink-600 font-medium">
                ← Back to Home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
