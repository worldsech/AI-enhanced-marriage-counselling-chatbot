"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserSessions, createSession, updateSession, getSession, getUserStats, deleteSession } from "@/lib/database"
import type { CounselingSession } from "@/types/user"

export function useSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<CounselingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHours: 0,
    totalInsights: 0,
    currentStreak: 0,
    progress: 0,
  })

  const loadSessions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userSessions = await getUserSessions(user.uid)
      setSessions(userSessions)

      const userStats = await getUserStats(user.uid)
      setStats(userStats)
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.uid) {
      loadSessions()
    }
  }, [user?.uid]) // Only depend on user ID, not the entire user object

  const addSession = async (sessionData: Omit<CounselingSession, "id">) => {
    if (!user) return null

    try {
      const sessionId = await createSession(sessionData)
      await loadSessions() // Refresh sessions
      return sessionId
    } catch (error) {
      console.error("Error adding session:", error)
      return null
    }
  }

  const updateSessionData = async (sessionId: string, updates: Partial<CounselingSession>) => {
    try {
      await updateSession(sessionId, updates)
      await loadSessions() // Refresh sessions
    } catch (error) {
      console.error("Error updating session:", error)
    }
  }

  const deleteSessionData = async (sessionId: string) => {
    try {
      await deleteSession(sessionId)
      await loadSessions() // Refresh sessions and stats
    } catch (error) {
      console.error("Error deleting session:", error)
      throw error // Re-throw the error so the UI can catch it
    }
  }

  const getSessionById = async (sessionId: string) => {
    try {
      return await getSession(sessionId)
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  }

  return {
    sessions,
    loading,
    stats,
    addSession,
    updateSession: updateSessionData,
    getSession: getSessionById,
    deleteSession: deleteSessionData,
    refreshSessions: loadSessions,
  }
}
