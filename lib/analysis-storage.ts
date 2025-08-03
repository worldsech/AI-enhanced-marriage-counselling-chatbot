import { db, hasFirebaseConfig } from "@/lib/firebase"
import {
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  onSnapshot,
} from "firebase/firestore"
import type { UserAnalysis, AIResponse, SessionSyncData } from "@/types/analysis"

// Generate device ID for tracking
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("coupleconnect_device_id")
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("coupleconnect_device_id", deviceId)
  }
  return deviceId
}

// Get device info
const getDeviceInfo = () => {
  if (typeof navigator === "undefined") {
    // Return a default object for server-side execution
    return { userAgent: "server", platform: "server", deviceType: "desktop" as const }
  }
  const userAgent = navigator.userAgent
  const platform = navigator.platform

  let deviceType: "mobile" | "tablet" | "desktop" = "desktop"
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceType = /iPad|Tablet/i.test(userAgent) ? "tablet" : "mobile"
  }

  return { userAgent, platform, deviceType }
}

// Get time of day
const getTimeOfDay = (date: Date = new Date()): string => {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  if (hour >= 17 && hour < 21) return "evening"
  return "night"
}

// User Analysis Storage
export async function saveUserAnalysis(
  analysis: Omit<UserAnalysis, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  console.log("Saving user analysis for session:", analysis.sessionId)

  const analysisData: Omit<UserAnalysis, "id"> = {
    ...analysis,
    timestamp: new Date(),
    timeOfDay: getTimeOfDay(),
    deviceInfo: getDeviceInfo(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  if (!hasFirebaseConfig || !db) {
    // Store in localStorage for demo mode
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullAnalysis = { ...analysisData, id: analysisId }

    try {
      const stored = localStorage.getItem("coupleconnect_analyses")
      const analyses = stored ? JSON.parse(stored) : []
      analyses.push(fullAnalysis)
      localStorage.setItem("coupleconnect_analyses", JSON.stringify(analyses))

      console.log("Analysis saved to localStorage:", analysisId)
      return analysisId
    } catch (error) {
      console.error("Error saving analysis to localStorage:", error)
      throw new Error("Failed to save analysis locally")
    }
  }

  try {
    const docRef = await addDoc(collection(db, "analyses"), {
      ...analysisData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log("Analysis saved to Firestore:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error saving analysis to Firestore:", error)
    throw new Error(`Failed to save analysis to database: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getUserAnalyses(userId: string, limitCount = 50): Promise<UserAnalysis[]> {
  console.log("Loading analyses for user:", userId)

  if (!hasFirebaseConfig || !db) {
    // Get from localStorage for demo mode
    try {
      const stored = localStorage.getItem("coupleconnect_analyses")
      if (stored) {
        const analyses = JSON.parse(stored)
        const userAnalyses = analyses
          .filter((a: UserAnalysis) => a.userId === userId)
          .sort((a: UserAnalysis, b: UserAnalysis) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limitCount)

        console.log("Loaded analyses from localStorage:", userAnalyses.length)
        return userAnalyses
      }
    } catch (error) {
      console.error("Error loading analyses from localStorage:", error)
    }
    return []
  }

  try {
    const q = query(
      collection(db, "analyses"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount),
    )

    const querySnapshot = await getDocs(q)
    const analyses: UserAnalysis[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      analyses.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
      } as UserAnalysis)
    })

    console.log("Loaded analyses from Firestore:", analyses.length)
    return analyses
  } catch (error) {
    console.error("Error loading analyses from Firestore:", error)
    return []
  }
}

// AI Response Storage
export async function saveAIResponse(response: Omit<AIResponse, "id" | "createdAt">): Promise<string> {
  console.log("Saving AI response for session:", response.sessionId)

  const responseData: Omit<AIResponse, "id"> = {
    ...response,
    timestamp: new Date(),
    createdAt: new Date(),
  }

  if (!hasFirebaseConfig || !db) {
    // Store in localStorage for demo mode
    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullResponse = { ...responseData, id: responseId }

    try {
      const stored = localStorage.getItem("coupleconnect_ai_responses")
      const responses = stored ? JSON.parse(stored) : []
      responses.push(fullResponse)
      localStorage.setItem("coupleconnect_ai_responses", JSON.stringify(responses))

      console.log("AI response saved to localStorage:", responseId)
      return responseId
    } catch (error) {
      console.error("Error saving AI response to localStorage:", error)
      throw new Error("Failed to save AI response locally")
    }
  }

  try {
    const docRef = await addDoc(collection(db, "ai_responses"), {
      ...responseData,
      createdAt: serverTimestamp(),
    })

    console.log("AI response saved to Firestore:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error saving AI response to Firestore:", error)
    throw new Error(`Failed to save AI response to database: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function getAIResponses(userId: string, sessionId?: string): Promise<AIResponse[]> {
  console.log("Loading AI responses for user:", userId, sessionId ? `session: ${sessionId}` : "")

  if (!hasFirebaseConfig || !db) {
    // Get from localStorage for demo mode
    try {
      const stored = localStorage.getItem("coupleconnect_ai_responses")
      if (stored) {
        const responses = JSON.parse(stored)
        let filteredResponses = responses.filter((r: AIResponse) => r.userId === userId)

        if (sessionId) {
          filteredResponses = filteredResponses.filter((r: AIResponse) => r.sessionId === sessionId)
        }

        const sortedResponses = filteredResponses.sort(
          (a: AIResponse, b: AIResponse) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        console.log("Loaded AI responses from localStorage:", sortedResponses.length)
        return sortedResponses
      }
    } catch (error) {
      console.error("Error loading AI responses from localStorage:", error)
    }
    return []
  }

  try {
    let q = query(collection(db, "ai_responses"), where("userId", "==", userId), orderBy("timestamp", "desc"))

    if (sessionId) {
      q = query(
        collection(db, "ai_responses"),
        where("userId", "==", userId),
        where("sessionId", "==", sessionId),
        orderBy("timestamp", "desc"),
      )
    }

    const querySnapshot = await getDocs(q)
    const responses: AIResponse[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      responses.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
      } as AIResponse)
    })

    console.log("Loaded AI responses from Firestore:", responses.length)
    return responses
  } catch (error) {
    console.error("Error loading AI responses from Firestore:", error)
    return []
  }
}

// Session Sync Operations
export async function syncUserData(userId: string): Promise<SessionSyncData | null> {
  console.log("Syncing user data for:", userId)

  const deviceId = getDeviceId()
  const syncData: Omit<SessionSyncData, "sessionIds" | "analysisIds" | "responseIds"> = {
    userId,
    lastSyncTime: new Date(),
    deviceId,
  }

  if (!hasFirebaseConfig || !db) {
    // Handle sync in localStorage for demo mode
    try {
      const sessions = JSON.parse(localStorage.getItem("coupleconnect_sessions") || "[]")
      const analyses = JSON.parse(localStorage.getItem("coupleconnect_analyses") || "[]")
      const responses = JSON.parse(localStorage.getItem("coupleconnect_ai_responses") || "[]")

      const userSessions = sessions.filter((s: any) => s.userId === userId)
      const userAnalyses = analyses.filter((a: any) => a.userId === userId)
      const userResponses = responses.filter((r: any) => r.userId === userId)

      const fullSyncData: SessionSyncData = {
        ...syncData,
        sessionIds: userSessions.map((s: any) => s.id),
        analysisIds: userAnalyses.map((a: any) => a.id),
        responseIds: userResponses.map((r: any) => r.id),
      }

      localStorage.setItem("coupleconnect_last_sync", JSON.stringify(fullSyncData))
      console.log("Data synced locally:", fullSyncData)
      return fullSyncData
    } catch (error) {
      console.error("Error syncing data locally:", error)
      return null
    }
  }

  try {
    // Get all user data for sync
    const [sessions, analyses, responses] = await Promise.all([
      getUserSessions(userId, 100),
      getUserAnalyses(userId, 100),
      getAIResponses(userId),
    ])

    const fullSyncData: SessionSyncData = {
      ...syncData,
      sessionIds: sessions.map((s) => s.id),
      analysisIds: analyses.map((a) => a.id),
      responseIds: responses.map((r) => r.id),
    }

    // Save sync data
    await setDoc(doc(db, "sync_data", userId), {
      ...fullSyncData,
      lastSyncTime: serverTimestamp(),
    })

    console.log("Data synced to Firestore:", fullSyncData)
    return fullSyncData
  } catch (error) {
    console.error("Error syncing data to Firestore:", error)
    return null
  }
}

// Real-time sync listener
export function subscribeToUserDataChanges(
  userId: string,
  onDataChange: (data: { sessions: any[]; analyses: UserAnalysis[]; responses: AIResponse[] }) => void,
) {
  if (!hasFirebaseConfig || !db) {
    console.log("Real-time sync not available in demo mode")
    return () => {} // Return empty unsubscribe function
  }

  console.log("Setting up real-time sync for user:", userId)

  const unsubscribes: (() => void)[] = []

  // Subscribe to sessions
  const sessionsQuery = query(collection(db, "sessions"), where("userId", "==", userId), orderBy("updatedAt", "desc"))

  unsubscribes.push(
    onSnapshot(sessionsQuery, (snapshot) => {
      console.log("Sessions updated via real-time sync")
      // Trigger data refresh
      Promise.all([getUserSessions(userId), getUserAnalyses(userId), getAIResponses(userId)]).then(
        ([sessions, analyses, responses]) => {
          onDataChange({ sessions, analyses, responses })
        },
      )
    }),
  )

  // Subscribe to analyses
  const analysesQuery = query(collection(db, "analyses"), where("userId", "==", userId), orderBy("timestamp", "desc"))

  unsubscribes.push(
    onSnapshot(analysesQuery, (snapshot) => {
      console.log("Analyses updated via real-time sync")
    }),
  )

  // Return combined unsubscribe function
  return () => {
    unsubscribes.forEach((unsub) => unsub())
    console.log("Real-time sync unsubscribed for user:", userId)
  }
}

// Batch operations for efficient syncing
export async function batchSaveSessionData(
  userId: string,
  sessionData: any,
  analysisData: Omit<UserAnalysis, "id" | "createdAt" | "updatedAt">[],
  responseData: Omit<AIResponse, "id" | "createdAt">[],
): Promise<{ sessionId: string; analysisIds: string[]; responseIds: string[] }> {
  console.log("Batch saving session data for user:", userId)

  if (!hasFirebaseConfig || !db) {
    // Handle batch save in localStorage
    const sessionId = await createSession(sessionData)
    const analysisIds = await Promise.all(analysisData.map(saveUserAnalysis))
    const responseIds = await Promise.all(responseData.map(saveAIResponse))

    return { sessionId, analysisIds, responseIds }
  }

  try {
    const batch = writeBatch(db)
    const results = { sessionId: "", analysisIds: [] as string[], responseIds: [] as string[] }

    // Add session
    const sessionRef = doc(collection(db, "sessions"))
    batch.set(sessionRef, {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    results.sessionId = sessionRef.id

    // Add analyses
    for (const analysis of analysisData) {
      const analysisRef = doc(collection(db, "analyses"))
      batch.set(analysisRef, {
        ...analysis,
        timestamp: new Date(),
        timeOfDay: getTimeOfDay(),
        deviceInfo: getDeviceInfo(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      results.analysisIds.push(analysisRef.id)
    }

    // Add responses
    for (const response of responseData) {
      const responseRef = doc(collection(db, "ai_responses"))
      batch.set(responseRef, {
        ...response,
        timestamp: new Date(),
        createdAt: serverTimestamp(),
      })
      results.responseIds.push(responseRef.id)
    }

    await batch.commit()
    console.log("Batch save completed:", results)
    return results
  } catch (error) {
    console.error("Error in batch save:", error)
    throw new Error("Failed to batch save session data")
  }
}

// Import getUserSessions and createSession from database.ts
import { getUserSessions, createSession } from "./database"
