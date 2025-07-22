"use client"

import { useState, useEffect } from "react"

const STORAGE_KEYS = {
  USER_PROFILE: "coupleconnect_user_profile",
  SESSIONS: "coupleconnect_sessions",
  SYNC_STATUS: "coupleconnect_sync_status",
  CURRENT_USER: "coupleconnect_current_user",
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

export function useSessions() {
  const [sessions, setSessions] = useLocalStorage(STORAGE_KEYS.SESSIONS, [])

  const addSession = (session: any) => {
    setSessions((prev: any[]) => [...prev, session])
  }

  const updateSession = (sessionId: string, updates: any) => {
    setSessions((prev: any[]) =>
      prev.map((session) => (session.id === sessionId ? { ...session, ...updates } : session)),
    )
  }

  return { sessions, addSession, updateSession, setSessions }
}

export { STORAGE_KEYS }
