import { db, hasFirebaseConfig } from "@/lib/firebase"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore"
import type { UserProfile, CounselingSession } from "@/types/user"

// User Profile Operations
export async function createUserProfile(profile: UserProfile): Promise<void> {
  if (!hasFirebaseConfig || !db) {
    // Store in localStorage for demo mode
    localStorage.setItem("coupleconnect_user_profile", JSON.stringify(profile))
    return
  }

  try {
    await setDoc(doc(db, "users", profile.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw new Error("Failed to create user profile")
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!hasFirebaseConfig || !db) {
    // Get from localStorage for demo mode
    const stored = localStorage.getItem("coupleconnect_user_profile")
    return stored ? JSON.parse(stored) : null
  }

  try {
    const docRef = doc(db, "users", uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  if (!hasFirebaseConfig || !db) {
    // Update localStorage for demo mode
    const stored = localStorage.getItem("coupleconnect_user_profile")
    if (stored) {
      const profile = JSON.parse(stored)
      const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() }
      localStorage.setItem("coupleconnect_user_profile", JSON.stringify(updated))
    }
    return
  }

  try {
    const docRef = doc(db, "users", uid)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update user profile")
  }
}

// Session Operations
export async function createSession(session: Omit<CounselingSession, "id">): Promise<string> {
  console.log("Creating session for user:", session.userId)

  if (!hasFirebaseConfig || !db) {
    // Store in localStorage for demo mode
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullSession = { ...session, id: sessionId }

    try {
      const stored = localStorage.getItem("coupleconnect_sessions")
      const sessions = stored ? JSON.parse(stored) : []
      sessions.push(fullSession)
      localStorage.setItem("coupleconnect_sessions", JSON.stringify(sessions))

      console.log("Session saved to localStorage:", sessionId)
      return sessionId
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      throw new Error("Failed to save session locally")
    }
  }

  try {
    const docRef = await addDoc(collection(db, "sessions"), {
      ...session,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log("Session saved to Firestore:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating session in Firestore:", error)
    throw new Error("Failed to create session in database")
  }
}

export async function getSession(sessionId: string): Promise<CounselingSession | null> {
  if (!hasFirebaseConfig || !db) {
    // Get from localStorage for demo mode
    const stored = localStorage.getItem("coupleconnect_sessions")
    if (stored) {
      const sessions = JSON.parse(stored)
      return sessions.find((s: CounselingSession) => s.id === sessionId) || null
    }
    return null
  }

  try {
    const docRef = doc(db, "sessions", sessionId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        sessionDate: data.sessionDate?.toDate?.() || new Date(data.sessionDate),
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        messages:
          data.messages?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
          })) || [],
      } as CounselingSession
    }
    return null
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function updateSession(sessionId: string, updates: Partial<CounselingSession>): Promise<void> {
  console.log("Updating session:", sessionId)

  if (!hasFirebaseConfig || !db) {
    // Update localStorage for demo mode
    try {
      const stored = localStorage.getItem("coupleconnect_sessions")
      if (stored) {
        const sessions = JSON.parse(stored)
        const index = sessions.findIndex((s: CounselingSession) => s.id === sessionId)
        if (index !== -1) {
          sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date() }
          localStorage.setItem("coupleconnect_sessions", JSON.stringify(sessions))
          console.log("Session updated in localStorage")
        } else {
          console.warn("Session not found in localStorage:", sessionId)
        }
      }
    } catch (error) {
      console.error("Error updating localStorage:", error)
      throw new Error("Failed to update session locally")
    }
    return
  }

  try {
    const docRef = doc(db, "sessions", sessionId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })

    console.log("Session updated in Firestore")
  } catch (error) {
    console.error("Error updating session in Firestore:", error)
    throw new Error("Failed to update session in database")
  }
}

export async function getUserSessions(userId: string, limitCount = 10): Promise<CounselingSession[]> {
  console.log("Loading sessions for user:", userId)

  if (!hasFirebaseConfig || !db) {
    // Get from localStorage for demo mode
    try {
      const stored = localStorage.getItem("coupleconnect_sessions")
      if (stored) {
        const sessions = JSON.parse(stored)
        const userSessions = sessions
          .filter((s: CounselingSession) => s.userId === userId)
          .sort(
            (a: CounselingSession, b: CounselingSession) =>
              new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
          )
          .slice(0, limitCount)

        console.log("Loaded sessions from localStorage:", userSessions.length)
        return userSessions
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
    return []
  }

  try {
    // Use a simpler query to avoid composite index requirement
    const q = query(collection(db, "sessions"), where("userId", "==", userId), limit(limitCount))

    const querySnapshot = await getDocs(q)
    const sessions: CounselingSession[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      sessions.push({
        id: doc.id,
        ...data,
        sessionDate: data.sessionDate?.toDate?.() || new Date(data.sessionDate),
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
        messages:
          data.messages?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
          })) || [],
      } as CounselingSession)
    })

    // Sort in JavaScript instead of Firestore to avoid index requirement
    const sortedSessions = sessions.sort(
      (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
    )

    console.log("Loaded sessions from Firestore:", sortedSessions.length)
    return sortedSessions
  } catch (error) {
    console.error("Error getting user sessions from Firestore:", error)
    return []
  }
}

// Analytics Operations
export async function getUserStats(userId: string) {
  const sessions = await getUserSessions(userId, 100) // Get more for stats

  const totalSessions = sessions.length
  const totalHours = sessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
  const totalInsights = sessions.reduce((acc, session) => acc + (session.insights || 0), 0)

  // Calculate streak
  let currentStreak = 0;
  if (sessions.length > 0) {
    const sessionDates = new Set<string>();
    sessions.forEach(session => {
      // Normalize to YYYY-MM-DD format to count unique days and handle timezones
      const d = new Date(session.sessionDate);
      d.setHours(d.getHours() - d.getTimezoneOffset() / 60);
      sessionDates.add(d.toISOString().split('T')[0]);
    });

    let streak = 0;
    const checkDate = new Date();

    const toDateString = (date: Date) => date.toISOString().split('T')[0];

    // A streak is valid if it includes today or yesterday.
    // Start by checking today.
    if (sessionDates.has(toDateString(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If no session today, check if the streak ended yesterday.
      checkDate.setDate(checkDate.getDate() - 1);
      if (sessionDates.has(toDateString(checkDate))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    while (streak > 0 && sessionDates.has(toDateString(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    currentStreak = streak;
  }

  return {
    totalSessions,
    totalHours: Math.round(totalHours * 10) / 10,
    totalInsights,
    currentStreak,
    progress: Math.min(Math.round((totalSessions / 15) * 100), 100), // Progress towards 15 sessions goal
  }
}
