import fs from "fs"
import path from "path"
import type { CounselingScenario } from "@/types/user"

const counselingData = {
  metadata: {
    version: "1.0",
    created: "2024-01-20",
    total_scenarios: 150,
    frameworks: ["gottman_method", "eft", "cbt", "solution_focused"],
    categories: [
      "communication",
      "conflict_resolution",
      "intimacy",
      "trust",
      "parenting",
      "finances",
      "in_laws",
      "life_transitions",
    ],
  },
  scenarios: [
    {
      id: "comm_001",
      category: "communication",
      situation: "Partner feels unheard during conversations",
      keywords: ["unheard", "listening", "ignored", "communication"],
      therapeutic_approach: "gottman_method",
      counselor_response:
        "I can hear the frustration in your voice about feeling unheard. This is one of the most common challenges couples face, and it's completely valid to feel this way. In healthy relationships, both partners need to feel seen and understood. Let's explore what 'feeling heard' means to you specifically. When you share something important with {partner_name}, what would you need to see or hear from them to feel truly listened to?",
      techniques: ["validation", "active_listening", "gottman_speaker_listener"],
      follow_up_questions: [
        "Can you give me a specific example of when you felt unheard recently?",
        "What does {partner_name} do that makes you feel most heard?",
        "How do you typically express when you need to be listened to?",
      ],
      therapeutic_goals: ["improve_communication", "increase_emotional_connection"],
      severity: "moderate",
    },
    {
      id: "comm_002",
      category: "communication",
      situation: "Couple argues frequently over small things",
      keywords: ["arguing", "fighting", "small things", "petty", "constant conflict"],
      therapeutic_approach: "gottman_method",
      counselor_response:
        "It sounds exhausting to feel like you're walking on eggshells or that small issues keep escalating into bigger arguments. What you're describing often happens when there are deeper, unaddressed needs or feelings beneath these surface-level disagreements. These small arguments might be symptoms of something larger - perhaps feeling disconnected, unappreciated, or misunderstood. Let's look at the pattern: what typically happens right before these arguments start?",
      techniques: ["pattern_recognition", "underlying_needs_exploration", "de_escalation"],
      follow_up_questions: [
        "What time of day or situations do these arguments typically happen?",
        "What do you think {partner_name} is really trying to communicate during these moments?",
        "When was the last time you had a conversation that felt really good and connected?",
      ],
      therapeutic_goals: ["reduce_conflict_frequency", "identify_underlying_issues"],
      severity: "moderate",
    },
    {
      id: "conflict_001",
      category: "conflict_resolution",
      situation: "Partner shuts down during arguments",
      keywords: ["shutdown", "stonewalling", "silent treatment", "withdrawal"],
      therapeutic_approach: "gottman_method",
      counselor_response:
        "When someone shuts down during conflict, it's often because they're feeling overwhelmed or flooded with emotions. This is actually a protective mechanism - their nervous system is trying to regulate itself. {first_name}, this must feel really frustrating and perhaps lonely when {partner_name} withdraws. And if you're the one who tends to shut down, it might feel like the only way to cope when things get intense. Let's talk about what flooding feels like and how we can create space for both of your needs during conflict.",
      techniques: ["flooding_education", "self_soothing", "time_outs"],
      follow_up_questions: [
        "What physical sensations do you notice when you start to feel overwhelmed?",
        "How long do you typically need to feel calm again after an argument?",
        "What would help you feel safe to re-engage after taking space?",
      ],
      therapeutic_goals: ["manage_emotional_flooding", "improve_conflict_engagement"],
      severity: "moderate",
    },
    {
      id: "intimacy_001",
      category: "intimacy",
      situation: "Couple feels disconnected physically and emotionally",
      keywords: ["disconnected", "distant", "no intimacy", "roommates", "lost spark"],
      therapeutic_approach: "eft",
      counselor_response:
        "Feeling like roommates rather than romantic partners is one of the most painful experiences in a relationship. It's brave of you to acknowledge this and seek help. Emotional and physical intimacy are deeply connected - when we feel emotionally safe and seen by our partner, physical closeness often follows naturally. Let's start by understanding what intimacy means to each of you and when you last felt truly connected. {first_name}, can you remember a time when you felt most emotionally close to {partner_name}?",
      techniques: ["emotional_accessibility", "intimacy_mapping", "attachment_exploration"],
      follow_up_questions: [
        "What does intimacy mean to you beyond physical connection?",
        "When do you feel most emotionally safe with {partner_name}?",
        "What small gesture from your partner makes you feel most loved?",
      ],
      therapeutic_goals: ["rebuild_emotional_connection", "increase_physical_intimacy"],
      severity: "high",
    },
    {
      id: "trust_001",
      category: "trust",
      situation: "Trust has been broken due to infidelity or betrayal",
      keywords: ["infidelity", "cheating", "betrayal", "broken trust", "affair"],
      therapeutic_approach: "gottman_method",
      counselor_response:
        "Betrayal trauma is one of the most devastating experiences a relationship can face, and I want to acknowledge the immense pain you're both feeling right now. {first_name}, your feelings of hurt, anger, and confusion are completely valid and normal. Rebuilding trust is possible, but it requires commitment from both partners and will take time. The healing process typically involves three phases: atonement, attunement, and attachment. We'll need to go slowly and ensure you feel safe throughout this process.",
      techniques: ["betrayal_trauma_education", "safety_planning", "accountability_measures"],
      follow_up_questions: [
        "What do you need to feel emotionally safe right now?",
        "What would accountability look like for you in rebuilding trust?",
        "Are there any immediate safety concerns we need to address?",
      ],
      therapeutic_goals: ["establish_safety", "process_trauma", "rebuild_trust"],
      severity: "high",
    },
    {
      id: "parenting_001",
      category: "parenting",
      situation: "Disagreements about parenting styles and discipline",
      keywords: ["parenting", "discipline", "children", "different styles", "undermining"],
      therapeutic_approach: "solution_focused",
      counselor_response:
        "Parenting disagreements can create significant stress in a relationship, especially when you feel like you're not on the same team. It's actually very common for partners to have different parenting styles based on their own childhood experiences. The key is finding ways to present a united front while respecting both of your perspectives. {first_name}, it sounds like you and {partner_name} have different approaches with your {children_ages} year old children. Let's explore what's working well in your parenting and where you'd like more alignment.",
      techniques: ["parenting_alignment", "childhood_exploration", "unified_approach"],
      follow_up_questions: [
        "What parenting moments make you feel most proud as a team?",
        "How were you disciplined as a child, and how does that influence your approach?",
        "What's one parenting goal you both share for your children?",
      ],
      therapeutic_goals: ["align_parenting_approaches", "reduce_parenting_conflict"],
      severity: "moderate",
    },
    {
      id: "finances_001",
      category: "finances",
      situation: "Frequent arguments about money and spending habits",
      keywords: ["money", "finances", "spending", "budget", "financial stress"],
      therapeutic_approach: "cbt",
      counselor_response:
        "Money conflicts are among the top predictors of relationship distress, so you're definitely not alone in struggling with this. Often, our relationship with money is deeply tied to our values, fears, and childhood experiences. When couples fight about money, they're usually fighting about deeper issues like security, control, or feeling valued. {first_name}, let's start by understanding what money represents to each of you and what your biggest financial concerns are right now.",
      techniques: ["values_clarification", "financial_history_exploration", "communication_skills"],
      follow_up_questions: [
        "What did you learn about money growing up in your family?",
        "What's your biggest fear when it comes to your financial future?",
        "When do you feel most aligned about money decisions?",
      ],
      therapeutic_goals: ["improve_financial_communication", "align_financial_values"],
      severity: "moderate",
    },
    {
      id: "inlaws_001",
      category: "in_laws",
      situation: "Tension with in-laws affecting the relationship",
      keywords: ["in-laws", "family", "boundaries", "interference", "loyalty"],
      therapeutic_approach: "eft",
      counselor_response:
        "In-law relationships can be incredibly complex and emotionally charged. It sounds like you're feeling caught between your family of origin and your chosen family with {partner_name}. This is one of the most common challenges couples face, especially in the early years of marriage. The key is learning to create healthy boundaries while maintaining important relationships. {first_name}, it must feel difficult when you feel like you have to choose sides or when family dynamics create tension in your relationship.",
      techniques: ["boundary_setting", "loyalty_conflicts", "family_systems"],
      follow_up_questions: [
        "What kind of relationship would you ideally like to have with {partner_name}'s family?",
        "How do you think your family background influences your expectations?",
        "What boundaries would help you feel more comfortable in family situations?",
      ],
      therapeutic_goals: ["establish_healthy_boundaries", "reduce_family_conflict"],
      severity: "moderate",
    },
    {
      id: "transitions_001",
      category: "life_transitions",
      situation: "Struggling to adapt to major life changes together",
      keywords: ["life changes", "transition", "stress", "adaptation", "new job", "moving"],
      therapeutic_approach: "solution_focused",
      counselor_response:
        "Major life transitions can really test a relationship's resilience. Whether it's a new job, moving, having children, or other significant changes, these periods often bring both excitement and stress. It's completely normal to feel off-balance during transitions - your usual routines and ways of connecting might not work the same way. {first_name}, change can be particularly challenging when you're navigating it as a couple. Let's talk about how you've successfully handled changes together in the past.",
      techniques: ["resilience_building", "adaptation_strategies", "strength_identification"],
      follow_up_questions: [
        "What transitions have you navigated well together in the past?",
        "What support do you each need during times of change?",
        "How can you maintain connection during this busy/stressful time?",
      ],
      therapeutic_goals: ["build_resilience", "maintain_connection_during_change"],
      severity: "low",
    },
    {
      id: "comm_003",
      category: "communication",
      situation: "Partner uses criticism or contempt during disagreements",
      keywords: ["criticism", "contempt", "name calling", "personal attacks", "defensive"],
      therapeutic_approach: "gottman_method",
      counselor_response:
        "What you're describing sounds like some of the communication patterns that Dr. Gottman calls the 'Four Horsemen' - criticism, contempt, defensiveness, and stonewalling. These patterns can be really damaging to relationships, but the good news is they can be changed with awareness and practice. When we feel hurt or frustrated, it's natural to want our partner to understand our pain, but criticism and contempt actually push them away rather than bringing them closer. Let's work on expressing your needs in a way that {partner_name} can actually hear and respond to.",
      techniques: ["four_horsemen_education", "complaint_vs_criticism", "soft_startup"],
      follow_up_questions: [
        "What are you really trying to communicate when you find yourself being critical?",
        "What would you need to feel heard without using harsh language?",
        "Can you think of a recent disagreement where you felt respected even though you disagreed?",
      ],
      therapeutic_goals: ["eliminate_destructive_communication", "increase_positive_interactions"],
      severity: "high",
    },
    {
      id: "intimacy_002",
      category: "intimacy",
      situation: "Mismatched sexual desires and frequency",
      keywords: ["sexual desire", "libido", "frequency", "mismatched", "rejection"],
      therapeutic_approach: "eft",
      counselor_response:
        "Differences in sexual desire are incredibly common and can create a painful cycle where one partner feels rejected and the other feels pressured. This often becomes less about sex and more about feeling wanted, attractive, and emotionally connected. {first_name}, it takes courage to talk about this sensitive topic. Let's approach this with curiosity rather than judgment and explore what intimacy and desire mean to each of you. Understanding each other's emotional needs around intimacy is often the key to bridging these differences.",
      techniques: ["desire_exploration", "emotional_needs_mapping", "pressure_reduction"],
      follow_up_questions: [
        "What helps you feel most emotionally connected to {partner_name}?",
        "When do you feel most attractive and desired in your relationship?",
        "What would need to change for both of you to feel satisfied with your intimate connection?",
      ],
      therapeutic_goals: ["improve_sexual_communication", "reduce_performance_pressure"],
      severity: "moderate",
    },
    {
      id: "conflict_002",
      category: "conflict_resolution",
      situation: "Arguments escalate quickly and become destructive",
      keywords: ["escalation", "explosive", "destructive", "out of control", "yelling"],
      therapeutic_approach: "cbt",
      counselor_response:
        "When arguments escalate quickly, it usually means that one or both of you are getting emotionally flooded - your nervous system goes into fight-or-flight mode, making it nearly impossible to think clearly or communicate effectively. This is a physiological response, not a character flaw. The key is learning to recognize the early warning signs and having tools to de-escalate before things get destructive. {first_name}, let's talk about what you notice in your body and thoughts right before arguments spiral out of control.",
      techniques: ["emotional_regulation", "de_escalation_techniques", "time_out_protocols"],
      follow_up_questions: [
        "What physical sensations do you notice when you start getting really angry?",
        "What thoughts go through your mind right before arguments get heated?",
        "What would help you pause and reset when you feel yourself getting flooded?",
      ],
      therapeutic_goals: ["prevent_escalation", "improve_emotional_regulation"],
      severity: "high",
    },
    {
      id: "trust_002",
      category: "trust",
      situation: "Partner has broken promises or commitments repeatedly",
      keywords: ["broken promises", "unreliable", "commitments", "follow through", "disappointment"],
      therapeutic_approach: "solution_focused",
      counselor_response:
        "Repeated broken promises can erode trust just as much as a single major betrayal. It sounds like you're feeling disappointed and perhaps questioning whether you can rely on {partner_name}. Trust is built through consistent, small actions over time - and it can be rebuilt the same way. {first_name}, let's explore what reliability and trustworthiness look like to you, and what small steps could help rebuild confidence in your relationship.",
      techniques: ["trust_building_exercises", "accountability_systems", "small_wins"],
      follow_up_questions: [
        "What promises or commitments are most important to you?",
        "When has {partner_name} followed through in a way that made you feel secure?",
        "What would be a small but meaningful way for {partner_name} to show reliability?",
      ],
      therapeutic_goals: ["rebuild_trust", "improve_reliability"],
      severity: "moderate",
    },
    {
      id: "parenting_002",
      category: "parenting",
      situation: "Feeling like co-parents but not romantic partners",
      keywords: ["co-parents", "roommates", "lost romance", "only about kids", "no couple time"],
      therapeutic_approach: "eft",
      counselor_response:
        "It's so common for couples with children to feel like they've lost themselves as romantic partners and become focused solely on co-parenting. While being good parents is wonderful, your relationship as a couple is actually the foundation that provides security for your children. When parents have a strong, loving relationship, children feel more secure. {first_name}, it sounds like you're missing the connection you used to have with {partner_name} before your focus became entirely about the children.",
      techniques: ["couple_identity_restoration", "scheduling_couple_time", "romance_rebuilding"],
      follow_up_questions: [
        "What did you love most about your relationship before you had children?",
        "When was the last time you had uninterrupted time together as a couple?",
        "What's one small way you could reconnect romantically this week?",
      ],
      therapeutic_goals: ["restore_couple_identity", "balance_parenting_and_romance"],
      severity: "moderate",
    },
    {
      id: "finances_002",
      category: "finances",
      situation: "One partner is secretive about money or spending",
      keywords: ["financial secrecy", "hiding money", "secret spending", "financial infidelity"],
      therapeutic_approach: "gottman_method",
      counselor_response:
        "Financial secrecy can feel like a betrayal of trust and partnership. When one partner hides money or spending, it often creates the same feelings as other forms of infidelity - hurt, anger, and questioning what else might be hidden. {first_name}, this must feel really unsettling and make you question the transparency in your relationship. Often, financial secrecy comes from shame, fear of judgment, or different values around money rather than malicious intent. Let's explore what's driving this behavior and how to rebuild financial transparency.",
      techniques: ["financial_transparency", "shame_exploration", "trust_rebuilding"],
      follow_up_questions: [
        "What fears do you have about being completely open about money?",
        "What would financial transparency look like in your ideal relationship?",
        "How did your families handle money and financial decisions when you were growing up?",
      ],
      therapeutic_goals: ["increase_financial_transparency", "rebuild_financial_trust"],
      severity: "high",
    },
  ],
  therapeutic_frameworks: {
    gottman_method: {
      description:
        "Evidence-based approach focusing on building love maps, nurturing fondness and admiration, and managing conflict",
      key_techniques: ["love_maps", "fondness_admiration", "turning_towards", "positive_sentiment_override"],
      best_for: ["communication_issues", "conflict_resolution", "building_friendship"],
    },
    eft: {
      description: "Emotionally Focused Therapy - focuses on attachment bonds and emotional accessibility",
      key_techniques: ["emotional_accessibility", "responsiveness", "engagement", "attachment_exploration"],
      best_for: ["intimacy_issues", "emotional_disconnection", "attachment_injuries"],
    },
    cbt: {
      description: "Cognitive Behavioral Therapy - focuses on changing negative thought patterns and behaviors",
      key_techniques: ["thought_challenging", "behavioral_experiments", "communication_skills", "problem_solving"],
      best_for: ["destructive_patterns", "emotional_regulation", "specific_behavioral_issues"],
    },
    solution_focused: {
      description: "Brief therapy focusing on solutions and strengths rather than problems",
      key_techniques: ["strength_identification", "goal_setting", "scaling_questions", "exception_finding"],
      best_for: ["motivation_building", "goal_achievement", "resilience_building"],
    },
  },
  response_guidelines: {
    tone: "empathetic, professional, non-judgmental",
    length: "200-300 words",
    structure: ["validation", "education/normalization", "exploration", "action/technique"],
    personalization: ["use_names", "reference_profile", "acknowledge_specific_situation"],
    safety: ["assess_for_abuse", "recommend_professional_help_when_needed", "maintain_boundaries"],
  },
}

// Cache for the counseling scenarios
let scenariosCache: CounselingScenario[] | null = null

// Function to get all counseling scenarios
export async function getCounselingScenarios(): Promise<CounselingScenario[]> {
  // Return from cache if available
  if (scenariosCache) {
    return scenariosCache
  }

  try {
    // In server components/API routes
    if (typeof window === "undefined") {
      const filePath = path.join(process.cwd(), "public/data/counseling-dataset.json")
      const fileData = fs.readFileSync(filePath, "utf8")
      const data = JSON.parse(fileData)
      scenariosCache = data.scenarios
      return data.scenarios
    } else {
      // In client components
      const response = await fetch("/data/counseling-dataset.json")
      const data = await response.json()
      scenariosCache = data.scenarios
      return data.scenarios
    }
  } catch (error) {
    console.error("Error loading counseling scenarios:", error)
    return []
  }
}

// Function to find relevant scenarios based on user message
export async function findRelevantScenarios(userMessage: string, limit = 3): Promise<CounselingScenario[]> {
  const scenarios = await getCounselingScenarios()
  const messageLower = userMessage.toLowerCase()

  const scoredScenarios = scenarios.map((scenario) => {
    let score = 0

    // Check keywords
    scenario.keywords.forEach((keyword) => {
      if (messageLower.includes(keyword.toLowerCase())) {
        score += 2
      }
    })

    // Check situation description
    const situationWords = scenario.situation.toLowerCase().split(" ")
    situationWords.forEach((word) => {
      if (messageLower.includes(word) && word.length > 3) {
        score += 1
      }
    })

    return { scenario, score }
  })

  return scoredScenarios
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.scenario)
}

// Function to add a new scenario
export async function addScenario(scenario: CounselingScenario): Promise<boolean> {
  try {
    // This is a demo implementation that works in the browser
    // In a real app, this would call an API endpoint to update the database

    // Get current scenarios
    const scenarios = await getCounselingScenarios()

    // Add new scenario
    scenarios.push(scenario)

    // Update cache
    scenariosCache = scenarios

    // In a real app, we would save to database here
    console.log("Added new scenario:", scenario.id)

    return true
  } catch (error) {
    console.error("Error adding scenario:", error)
    return false
  }
}
