"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSessions } from "@/hooks/useSessions"
import { useAuth } from "@/contexts/AuthContext"
import { Heart, ArrowLeft, MessageCircle, Clock, Calendar, Plus, Search, Filter, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function SessionsPage() {
  const { userProfile } = useAuth()
  const { sessions, loading, deleteSession } = useSessions()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSessions = sessions.filter((session) => session.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDelete = async (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      try {
        await deleteSession(sessionId)
        // You could show a success notification here
      } catch (error) {
        console.error("Error deleting session:", error)
        // You could show an error notification here
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center">
            <Heart className="h-6 w-6 text-pink-500 mr-2" />
            <span className="text-xl font-bold text-pink-500">Session History</span>
          </div>
        </div>
        <Link href="/counselor">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" className="bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {session.sessionDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={
                          session.mood === "positive"
                            ? "default"
                            : session.mood === "negative"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {session.mood || "neutral"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-purple-500" />
                      <span>{session.messages.length} messages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{session.duration ? `${Math.round(session.duration / 60)}m` : "N/A"}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">{session.insights} insights gained</p>
                    {session.messages.length > 0 && (
                      <p className="line-clamp-2">
                        {session.messages[session.messages.length - 1].content.substring(0, 100)}...
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/counselor?session=${session.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600">Continue Session</Button>
                    </Link>
                    {/* <Button variant="outline" size="sm" className="bg-transparent">
                      View Details
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No sessions found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Start your first counseling session to see it here"}
            </p>
            <Link href="/counselor">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Start New Session
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
