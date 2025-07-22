"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { syncUserData, subscribeToUserDataChanges, getUserAnalyses, getAIResponses } from "@/lib/analysis-storage"
import { getUserSessions } from "@/lib/database"
import type { UserAnalysis, AIResponse, SessionSyncData } from "@/types/analysis"
import type { CounselingSession } from "@/types/user"

export function useDataSync() {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle")
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncData, setSyncData] = useState<SessionSyncData | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Sync user data
  const performSync = useCallback(async () => {
    if (!user?.uid || !isOnline) return

    setSyncStatus("syncing")
    try {
      console.log("Starting data sync for user:", user.uid)
      const result = await syncUserData(user.uid)

      if (result) {
        setSyncData(result)
        setLastSyncTime(result.lastSyncTime)
        setSyncStatus("synced")
        console.log("Sync completed successfully")
      } else {
        setSyncStatus("error")
        console.error("Sync failed - no result returned")
      }
    } catch (error) {
      console.error("Sync error:", error)
      setSyncStatus("error")
    }
  }, [user?.uid, isOnline])

  // Auto-sync on user change and when coming online
  useEffect(() => {
    if (user?.uid && isOnline) {
      performSync()
    }
  }, [user?.uid, isOnline, performSync])

  // Set up real-time sync
  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = subscribeToUserDataChanges(user.uid, (data) => {
      console.log("Real-time data update received:", {
        sessions: data.sessions.length,
        analyses: data.analyses.length,
        responses: data.responses.length,
      })
      // Trigger a sync to update local state
      performSync()
    })

    return unsubscribe
  }, [user?.uid, performSync])

  // Periodic sync every 5 minutes when online
  useEffect(() => {
    if (!isOnline || !user?.uid) return

    const interval = setInterval(
      () => {
        console.log("Performing periodic sync")
        performSync()
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [isOnline, user?.uid, performSync])

  return {
    syncStatus,
    lastSyncTime,
    syncData,
    isOnline,
    performSync,
    canSync: isOnline && !!user?.uid,
  }
}

export function useUserAnalytics(userId?: string) {
  const [analyses, setAnalyses] = useState<UserAnalysis[]>([])
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [sessions, setSessions] = useState<CounselingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalAnalyses: 0,
    averageSentiment: "neutral" as "positive" | "neutral" | "negative",
    mostActiveTimeOfDay: "evening" as string,
    topConcerns: [] as string[],
    progressTrend: "stable" as "improving" | "stable" | "declining",
    deviceUsage: {} as Record<string, number>,
  })

  const loadUserData = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    try {
      const [userAnalyses, userResponses, userSessions] = await Promise.all([
        getUserAnalyses(userId),
        getAIResponses(userId),
        getUserSessions(userId),
      ])

      setAnalyses(userAnalyses)
      setResponses(userResponses)
      setSessions(userSessions)

      // Calculate analytics
      const totalAnalyses = userAnalyses.length

      // Calculate average sentiment
      const sentimentCounts = userAnalyses.reduce(
        (acc, analysis) => {
          acc[analysis.analysisData.sentiment] = (acc[analysis.analysisData.sentiment] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const averageSentiment =
        (Object.entries(sentimentCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as
          | "positive"
          | "neutral"
          | "negative") || "neutral"

      // Most active time of day
      const timeOfDayCounts = userAnalyses.reduce(
        (acc, analysis) => {
          acc[analysis.timeOfDay] = (acc[analysis.timeOfDay] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const mostActiveTimeOfDay = Object.entries(timeOfDayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "evening"

      // Top concerns
      const allTopics = userAnalyses.flatMap((a) => a.analysisData.keyTopics)
      const topicCounts = allTopics.reduce(
        (acc, topic) => {
          acc[topic] = (acc[topic] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const topConcerns = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic)

      // Device usage
      const deviceUsage = userAnalyses.reduce(
        (acc, analysis) => {
          const device = analysis.deviceInfo.deviceType
          acc[device] = (acc[device] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      // Progress trend (simplified)
      const recentAnalyses = userAnalyses.slice(0, 10)
      const positiveCount = recentAnalyses.filter((a) => a.analysisData.sentiment === "positive").length
      const progressTrend =
        positiveCount > recentAnalyses.length / 2
          ? "improving"
          : positiveCount < recentAnalyses.length / 3
            ? "declining"
            : "stable"

      setAnalytics({
        totalAnalyses,
        averageSentiment,
        mostActiveTimeOfDay,
        topConcerns,
        progressTrend,
        deviceUsage,
      })
    } catch (error) {
      console.error("Error loading user analytics:", error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId, loadUserData])

  return {
    analyses,
    responses,
    sessions,
    analytics,
    loading,
    refreshData: loadUserData,
  }
}
