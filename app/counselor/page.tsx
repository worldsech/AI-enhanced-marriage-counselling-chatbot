"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useSessions } from "@/hooks/useSessions"
import { useDataSync } from "@/hooks/useDataSync"
import { CounselingMessage } from "@/types/user"
import { Heart, Send, ArrowLeft, Wifi, WifiOff, FolderSyncIcon as Sync, Clock } from "lucide-react"
import Link from "next/link"

export default function CounselorPage() {
  const { userProfile } = useAuth()
  const { addSession, updateSession, getSession } = useSessions()
  const { syncStatus, isOnline, performSync } = useDataSync()
  const [messages, setMessages] = useState<CounselingMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [displayDuration, setDisplayDuration] = useState("00:00")
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams.get("session")

    if (!userProfile) return

    if (sessionId && sessionId !== currentSessionId) {
      loadExistingSession(sessionId)
    } else if (!sessionId && !currentSessionId) {
      createNewSession()
    }
  }, [searchParams, userProfile])

  useEffect(() => {
    if (userProfile && messages.length === 0 && !searchParams.get("session")) {
      const initialMessage: CounselingMessage = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: `Hello ${userProfile.firstName || "there"}! I'm your AI relationship counselor. I'm here to provide a safe, supportive space where you can explore your relationship challenges and work toward stronger connections. 

${!isOnline ? "I notice you're currently offline, but don't worry - our conversation will be saved and synced when you're back online." : ""}

What would you like to talk about today?`,
        timestamp: new Date(),
      }
      setMessages([initialMessage])
    }
  }, [userProfile, isOnline])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const formatLiveDuration = (totalSeconds: number): string => {
      if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00"

      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const paddedMinutes = String(minutes).padStart(2, "0")
      const paddedSeconds = String(seconds).padStart(2, "0")

      if (hours > 0) {
        const paddedHours = String(hours).padStart(2, "0")
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
      }

      return `${paddedMinutes}:${paddedSeconds}`
    }

    const timer = setInterval(() => {
      const seconds = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)
      setDisplayDuration(formatLiveDuration(seconds))
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionStartTime])

  const loadExistingSession = async (sessionId: string) => {
    try {
      const session = await getSession(sessionId)
      if (session) {
        setCurrentSessionId(sessionId)
        setMessages(session.messages)
        setSessionStartTime(session.sessionDate)
      } else {
        setCurrentSessionId("")
        createNewSession()
      }
    } catch (error) {
      console.error("Error loading session:", error)
      setCurrentSessionId("")
      createNewSession()
    }
  }

  const createNewSession = () => {
    const sessionId = `session_${Date.now()}`
    setCurrentSessionId(sessionId)
    setSessionStartTime(new Date())
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: CounselingMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      console.log("Sending message to AI API...")

      const response = await fetch("/api/counselor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userProfile,
          conversationHistory: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          sessionId: currentSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`)
      }

      const data = await response.json()
      console.log("AI API response received:", {
        hasMessage: !!data.message,
        source: data.source,
        messageLength: data.message?.length || 0,
        processingTime: data.processingTime,
        analysis: data.analysis,
      })

      const aiMessage: CounselingMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        scenarioIds: data.scenarioIds,
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)

      // Save session with better error handling
      await saveSession(finalMessages)

      // Trigger sync if online
      if (isOnline) {
        performSync()
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)

      const errorMessage: CounselingMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: !isOnline
          ? "I notice you're currently offline. Your message has been saved locally and I'll respond once you're back online. In the meantime, know that your feelings and concerns are valid."
          : "I apologize, but I'm having trouble connecting right now. This might be a temporary network issue. Please try again in a moment. If this continues, remember that your feelings and concerns are valid, and seeking help from a professional counselor is always a good option.",
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)

      // Still try to save the session even with the error
      try {
        await saveSession(finalMessages)
      } catch (saveError) {
        console.error("Failed to save session after error:", saveError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const saveSession = async (finalMessages: CounselingMessage[]) => {
    if (!userProfile?.uid) {
      console.warn("No user ID available for session saving")
      return
    }

    try {
      const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)

      const sessionData = {
        userId: userProfile.uid,
        title: finalMessages.find((m) => m.role === "user")?.content.slice(0, 50) + "..." || "New Session",
        sessionDate: sessionStartTime,
        duration,
        messages: finalMessages,
        insights: finalMessages.filter((m) => m.role === "assistant").length,
        mood: "neutral" as const,
        createdAt: sessionStartTime,
        updatedAt: new Date(),
      }

      console.log("Saving session:", {
        sessionId: currentSessionId,
        messageCount: finalMessages.length,
        isNewSession: currentSessionId.startsWith("session_"),
        isOnline,
      })

      if (currentSessionId.startsWith("session_")) {
        console.log("Creating new session...")
        const newSessionId = await addSession(sessionData)
        if (newSessionId) {
          setCurrentSessionId(newSessionId)
          const newUrl = `/counselor?session=${newSessionId}`
          window.history.replaceState({}, "", newUrl)
          console.log("New session created with ID:", newSessionId)
        } else {
          console.error("Failed to create new session")
        }
      } else {
        console.log("Updating existing session:", currentSessionId)
        await updateSession(currentSessionId, sessionData)
        console.log("Session updated successfully")
      }
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case "synced":
        return "bg-green-500"
      case "syncing":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
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
            <span className="text-xl font-bold text-pink-500">AI Counselor</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <span className="text-sm text-gray-600">{isOnline ? "Online" : "Offline"}</span>
          </div>

          {/* Sync Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getSyncStatusColor()}`}></div>
            <span className="text-sm text-gray-600 capitalize">{syncStatus}</span>
            {syncStatus === "error" && (
              <Button variant="ghost" size="sm" onClick={performSync}>
                <Sync className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Offline Notice */}
        {!isOnline && (
          <div className="mb-4">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline Mode - Your conversations are saved locally and will sync when you're back online
            </Badge>
          </div>
        )}

        <Card className="flex-1 flex flex-col border-0 shadow-lg overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">AI</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">AI Relationship Counselor</p>
                  <p className="text-sm text-gray-600 font-normal">
                    Always here to help strengthen your relationship
                    {!isOnline && " (Offline Mode)"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{displayDuration}</span>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 relative">
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            <ScrollArea className="flex-1 p-4 scroll-pt-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.role === "user" ? "text-pink-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {userProfile?.firstName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>

            <div className="border-t p-4 bg-white relative">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isOnline
                      ? "Share what's on your mind about your relationship..."
                      : "Your message will be saved and processed when you're back online..."
                  }
                  className="flex-1 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This AI counselor provides supportive guidance but is not a replacement for professional therapy.
                {!isOnline && " Your conversations are saved locally and will sync when you're back online."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
