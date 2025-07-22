export interface UserAnalysis {
  id: string
  userId: string
  sessionId: string
  analysisType: "communication" | "conflict" | "intimacy" | "trust" | "general"
  analysisData: {
    sentiment: "positive" | "neutral" | "negative"
    emotionalState: string[]
    keyTopics: string[]
    concernLevel: "low" | "moderate" | "high"
    progressIndicators: string[]
    recommendations: string[]
  }
  timestamp: Date
  timeOfDay: string // "morning", "afternoon", "evening", "night"
  deviceInfo: {
    userAgent: string
    platform: string
    deviceType: "mobile" | "tablet" | "desktop"
  }
  createdAt: Date
  updatedAt: Date
}

export interface AIResponse {
  id: string
  userId: string
  sessionId: string
  messageId: string
  prompt: string
  response: string
  responseMetadata: {
    model: string
    source: "gemini-ai" | "demo-mode" | "fallback"
    processingTime: number
    scenarioIds: string[]
    category: string
    confidence: number
  }
  analysisId?: string // Link to related analysis
  timestamp: Date
  createdAt: Date
}

export interface SessionSyncData {
  userId: string
  lastSyncTime: Date
  deviceId: string
  sessionIds: string[]
  analysisIds: string[]
  responseIds: string[]
}
