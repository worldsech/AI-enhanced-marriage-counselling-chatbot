import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Update the hasFirebaseConfig check to be more specific
const hasFirebaseConfig =
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "demo-api-key" && firebaseConfig.apiKey !== undefined

let app
let auth
let db

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    console.log("Firebase initialized successfully with provided credentials")
  } catch (error) {
    console.error("Firebase initialization failed:", error)
    auth = null as any
    db = null as any
  }
} else {
  console.warn("Firebase configuration missing or invalid. Running in demo mode.")
  auth = null as any
  db = null as any
}

export { auth, db, hasFirebaseConfig }
