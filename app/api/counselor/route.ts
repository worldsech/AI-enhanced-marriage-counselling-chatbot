import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { findRelevantScenarios } from "@/lib/counseling-data"
import { systemPrompt } from "@/lib/system-prompt"
import { saveUserAnalysis, saveAIResponse } from "@/lib/analysis-storage"

// Analyze user message for insights
function analyzeUserMessage(message: string, userProfile: any) {
  const messageLower = message.toLowerCase()

  // Sentiment analysis (basic)
  const positiveWords = ["happy", "good", "better", "love", "great", "wonderful", "amazing", "grateful"]
  const negativeWords = ["sad", "angry", "frustrated", "hurt", "terrible", "awful", "hate", "upset"]

  const positiveCount = positiveWords.filter((word) => messageLower.includes(word)).length
  const negativeCount = negativeWords.filter((word) => messageLower.includes(word)).length

  let sentiment: "positive" | "neutral" | "negative" = "neutral"
  if (positiveCount > negativeCount) sentiment = "positive"
  else if (negativeCount > positiveCount) sentiment = "negative"

  // Extract key topics
  const topicKeywords = {
    communication: ["talk", "listen", "communicate", "conversation", "discuss"],
    conflict: ["fight", "argue", "conflict", "disagreement", "tension"],
    intimacy: ["intimate", "close", "connection", "physical", "emotional"],
    trust: ["trust", "honest", "lie", "secret", "faithful"],
    parenting: ["children", "kids", "parenting", "family", "child"],
  }

  const keyTopics = Object.entries(topicKeywords)
    .filter(([topic, keywords]) => keywords.some((keyword) => messageLower.includes(keyword)))
    .map(([topic]) => topic)

  // Determine concern level
  const concernIndicators = ["crisis", "emergency", "desperate", "can't take", "breaking up", "divorce"]
  const concernLevel = concernIndicators.some((indicator) => messageLower.includes(indicator))
    ? "high"
    : keyTopics.length > 2
      ? "moderate"
      : "low"

  // Emotional state indicators
  const emotionalStates = []
  if (messageLower.includes("stress") || messageLower.includes("overwhelm")) emotionalStates.push("stressed")
  if (messageLower.includes("confus") || messageLower.includes("unsure")) emotionalStates.push("confused")
  if (messageLower.includes("hope") || messageLower.includes("optimis")) emotionalStates.push("hopeful")
  if (messageLower.includes("fear") || messageLower.includes("afraid")) emotionalStates.push("fearful")

  return {
    sentiment,
    emotionalState: emotionalStates,
    keyTopics,
    concernLevel: concernLevel as "low" | "moderate" | "high",
    progressIndicators: sentiment === "positive" ? ["positive_communication"] : [],
    recommendations: keyTopics.map((topic) => `Focus on ${topic} improvement`),
  }
}

/**
 * Calls the Python prediction service to get a divorce probability score.
 * @param userProfile The user's profile, which must contain the predictive features.
 * @returns A probability score, or null if prediction is not possible.
 */
async function getDivorceProbability(userProfile: any): Promise<number | null> {
  // --- IMPORTANT ---
  // This function assumes you have collected the 32 features required by your model
  // and stored them in an object, for example, `userProfile.predictiveFeatures`.
  // You will need to build a form/questionnaire in your UI to gather this data.
  const modelInputs = userProfile?.predictiveFeatures

  if (!modelInputs) {
    console.log("Predictive features not available for user. Skipping prediction.")
    return null
  }

  try {
    // Use an environment variable for the prediction service URL for production flexibility.
    const predictionServiceUrl = process.env.PREDICTION_SERVICE_URL || "http://127.0.0.1:5001/predict"

    // This fetch call goes to your running Python service.
    const response = await fetch(predictionServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelInputs),
    })
    if (!response.ok) throw new Error(`Prediction service responded with status: ${response.status}`)
    const data = await response.json()
    return data.divorce_probability
  } catch (error) {
    console.error("Error calling prediction service:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { message, userProfile, conversationHistory, sessionId } = await request.json()

    console.log("Counselor API called with:", {
      messageLength: message?.length,
      hasProfile: !!userProfile,
      historyLength: conversationHistory?.length,
      sessionId,
    })

    // Analyze user message
    const analysisData = analyzeUserMessage(message, userProfile)
    console.log("Message analysis completed:", analysisData)

    // ** NEW: Get the predictive model score **
    const divorceProbability = await getDivorceProbability(userProfile)
    console.log(`Received divorce probability score: ${divorceProbability}`)

    // Find relevant counseling scenarios using RAG
    const relevantScenarios = await findRelevantScenarios(message, 3)
    console.log("Found relevant scenarios:", relevantScenarios.length)

    // Check if we have Gemini API key
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const hasGeminiKey = geminiApiKey && geminiApiKey.length > 10 && geminiApiKey !== "demo-key"

    let aiResponse = ""
    let responseMetadata = {
      model: "demo",
      source: "demo-mode" as const,
      processingTime: 0,
      scenarioIds: relevantScenarios.map((s) => s.id),
      category: relevantScenarios[0]?.category || "general",
      confidence: 0.8,
    }

    if (hasGeminiKey) {
      try {
        console.log("Attempting Gemini API call...")

        // Create enhanced system prompt with user context
        const enhancedSystemPrompt = `${systemPrompt}

User Context:
- Name: ${userProfile?.firstName || "User"}
- Partner: ${userProfile?.partnerName || "their partner"}
- Relationship Status: ${userProfile?.relationshipStatus || "not specified"}
- Main Challenges: ${userProfile?.mainChallenges?.join(", ") || "not specified"}

Current Analysis:
- Sentiment: ${analysisData.sentiment}
- Key Topics: ${analysisData.keyTopics.join(", ")}
- Concern Level: ${analysisData.concernLevel}
- Emotional State: ${analysisData.emotionalState.join(", ")}
${divorceProbability !== null ? `- Predicted Divorce Risk Score: ${divorceProbability.toFixed(2)}. A higher score indicates a higher probability of divorce based on the provided factors. Use this score to inform the level of concern and directness in your counseling.` : ""}

Relevant Scenarios: ${relevantScenarios.map((s) => s.situation).join("; ")}

Please provide a personalized, empathetic response that addresses their specific situation and emotional state.`

        // Generate AI response
        const result = await generateText({
          model: google("gemini-2.0-flash-exp"),
          system: enhancedSystemPrompt,
          messages: conversationHistory || [],
          temperature: 0.7,
          maxTokens: 500,
        })

        aiResponse = result.text
        // Add a check for an empty response from the AI
        if (!aiResponse.trim()) {
          throw new Error("Gemini API returned an empty response.")
        }

        responseMetadata = {
          model: "gemini-2.0-flash-exp",
          source: "gemini-ai",
          processingTime: Date.now() - startTime,
          scenarioIds: relevantScenarios.map((s) => s.id),
          category: relevantScenarios[0]?.category || "general",
          confidence: 0.9,
        }

        console.log("Gemini API response received:", {
          responseLength: result.text?.length || 0,
          processingTime: responseMetadata.processingTime,
        })
      } catch (aiError) {
        console.error("Gemini API error:", aiError)

        // Fall back to scenario-based response
        aiResponse =
          relevantScenarios.length > 0
            ? relevantScenarios[0].counselor_response
                .replace(/\{first_name\}/g, userProfile?.firstName || "")
                .replace(/\{partner_name\}/g, userProfile?.partnerName || "your partner")
            : `Hello ${userProfile?.firstName || "there"}! I understand you're reaching out about your relationship, and I want you to know that seeking support shows real strength and commitment to growth.

While I'm experiencing some technical difficulties with my AI services right now, I can still offer you some guidance. Many couples face challenges with communication, trust, intimacy, or conflict resolution - and these are all very normal parts of relationships.

Could you tell me more specifically about what's been on your mind lately regarding your relationship${userProfile?.partnerName ? ` with ${userProfile.partnerName}` : ""}? I'm here to listen and help however I can.`

        responseMetadata.source = "fallback"
        responseMetadata.confidence = 0.7
      }
    } else {
      console.log("Using demo mode response")

      // Enhanced demo response
      aiResponse =
        relevantScenarios.length > 0
          ? relevantScenarios[0].counselor_response
              .replace(/\{first_name\}/g, userProfile?.firstName || "")
              .replace(/\{partner_name\}/g, userProfile?.partnerName || "your partner")
          : `Hello ${userProfile?.firstName || "there"}! Thank you for sharing that with me. It takes courage to reach out about relationship challenges, and I'm here to support you.

Based on what you've shared, it sounds like you're dealing with some important aspects of your relationship${userProfile?.partnerName ? ` with ${userProfile.partnerName}` : ""}. These kinds of concerns are very common, and working through them together can actually strengthen your bond.

Communication, trust, and understanding are the foundation of healthy relationships, and it's completely normal to need guidance in these areas. Every couple faces challenges - what matters is how you choose to address them together.

What specific aspect of this situation would you like to explore further? I'm here to listen and provide personalized guidance based on your unique circumstances.`

      // Simulate realistic AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))
      responseMetadata.processingTime = Date.now() - startTime
    }

    // Save analysis and response to database
    try {
      if (userProfile?.uid && sessionId) {
        // Save user analysis
        const analysisId = await saveUserAnalysis({
          userId: userProfile.uid,
          sessionId,
                    analysisType: analysisData.keyTopics[0] || "general",
          analysisData,
        })

        // Save AI response
        const responseId = await saveAIResponse({
          userId: userProfile.uid,
          sessionId,
          messageId: `msg_${Date.now()}`,
          prompt: message,
          response: aiResponse,
          responseMetadata,
          analysisId,
          timestamp: new Date(),
        })

        console.log("Analysis and response saved:", { analysisId, responseId })
      }
    } catch (saveError) {
      console.error("Error saving analysis/response:", saveError)
      // Don't fail the request if saving fails
    }

    return NextResponse.json({
      message: aiResponse,
      scenarioIds: relevantScenarios.map((s) => s.id),
      timestamp: new Date().toISOString(),
      category: relevantScenarios[0]?.category || "general",
      source: responseMetadata.source,
      analysis: analysisData,
      predictionScore: divorceProbability,
      processingTime: responseMetadata.processingTime,
    })
  } catch (error) {
    console.error("Counselor API error:", error)

    return NextResponse.json(
      {
        message:
          "I apologize, but I'm experiencing some technical difficulties right now. This doesn't diminish the importance of what you're sharing with me. Please try sending your message again in a moment. If the issue persists, remember that seeking help from a professional counselor is always a valuable option. Your relationship and well-being matter.",
        error: "API processing error",
        timestamp: new Date().toISOString(),
        source: "error-fallback",
        processingTime: Date.now() - startTime,
      },
      { status: 200 },
    )
  }
}
