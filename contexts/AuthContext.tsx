"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { auth, hasFirebaseConfig } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { createUserProfile, getUserProfile, updateUserProfile } from "@/lib/database"
import type { UserProfile } from "@/types/user"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>
  logout: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo user for development
const createDemoUser = (email: string, firstName: string, lastName: string) => ({
  uid: `demo_${Date.now()}`,
  email,
  emailVerified: true,
  displayName: `${firstName} ${lastName}`,
})

const createDemoProfile = (uid: string, email: string, firstName: string, lastName: string): UserProfile => ({
  uid,
  email,
  firstName,
  lastName,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } catch (error) {
        console.error("Error refreshing profile:", error)
      }
    }
  }

  useEffect(() => {
    if (hasFirebaseConfig && auth) {
      // Use Firebase Auth
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser)

        if (firebaseUser) {
          try {
            // Get user profile from database
            const profile = await getUserProfile(firebaseUser.uid)

            if (profile) {
              setUserProfile(profile)
            } else {
              // Create basic profile if it doesn't exist
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                firstName: firebaseUser.displayName?.split(" ")[0] || "",
                lastName: firebaseUser.displayName?.split(" ")[1] || "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              await createUserProfile(newProfile)
              setUserProfile(newProfile)
            }
          } catch (error) {
            console.error("Error fetching user profile:", error)
          }
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      // Use local storage for demo mode
      const initializeDemoMode = () => {
        const cachedUser = localStorage.getItem("coupleconnect_current_user")
        const cachedProfile = localStorage.getItem("coupleconnect_user_profile")

        if (cachedUser && cachedProfile) {
          try {
            setUser(JSON.parse(cachedUser))
            setUserProfile(JSON.parse(cachedProfile))
          } catch (error) {
            console.error("Error parsing cached user data:", error)
            localStorage.removeItem("coupleconnect_current_user")
            localStorage.removeItem("coupleconnect_user_profile")
          }
        }
        setLoading(false)
      }

      initializeDemoMode()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      if (hasFirebaseConfig) {
        // Use Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return userCredential.user
      } else {
        // Demo mode
        const demoUser = createDemoUser(email, "Demo", "User")
        const demoProfile = createDemoProfile(demoUser.uid, email, "Demo", "User")

        setUser(demoUser)
        setUserProfile(demoProfile)

        // Cache the user data
        localStorage.setItem("coupleconnect_current_user", JSON.stringify(demoUser))
        localStorage.setItem("coupleconnect_user_profile", JSON.stringify(demoProfile))

        console.log("Demo sign in successful")
      }
    } catch (error) {
      console.error("Sign in error:", error)
      throw new Error("Failed to sign in. Please check your credentials.")
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      if (hasFirebaseConfig) {
        // Use Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user

        // Create user profile in database
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || email,
          firstName,
          lastName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        await createUserProfile(newProfile)
        setUserProfile(newProfile)

        return firebaseUser
      } else {
        // Demo mode
        const demoUser = createDemoUser(email, firstName, lastName)
        const demoProfile = createDemoProfile(demoUser.uid, email, firstName, lastName)

        setUser(demoUser)
        setUserProfile(demoProfile)

        // Cache the user data
        localStorage.setItem("coupleconnect_current_user", JSON.stringify(demoUser))
        localStorage.setItem("coupleconnect_user_profile", JSON.stringify(demoProfile))

        console.log("Demo sign up successful")
      }
    } catch (error) {
      console.error("Sign up error:", error)
      throw new Error("Failed to create account. Please try again.")
    }
  }

  const logout = async () => {
    try {
      if (hasFirebaseConfig) {
        // Use Firebase Auth
        await signOut(auth)
      }

      // Clear local state and storage regardless
      setUser(null)
      setUserProfile(null)
      localStorage.removeItem("coupleconnect_current_user")
      localStorage.removeItem("coupleconnect_user_profile")
      localStorage.removeItem("coupleconnect_sessions")

      console.log("Logout successful")
    } catch (error) {
      console.error("Logout error:", error)
      throw new Error("Failed to logout")
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user || !userProfile) {
        throw new Error("No user logged in")
      }

      const updatedProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await updateUserProfile(user.uid, updates)
      setUserProfile(updatedProfile)

      console.log("Profile updated successfully")
    } catch (error) {
      console.error("Profile update error:", error)
      throw new Error("Failed to update profile")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
