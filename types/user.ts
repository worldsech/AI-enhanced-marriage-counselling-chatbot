export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  updatedAt: string

  // Personal Information
  dateOfBirth?: string
  occupation?: string
  education?: string
  annualIncomeRange?: string

  // Partner Information
  partnerName?: string
  partnerAge?: string
  partnerOccupation?: string
  partnerEducation?: string
  partnerIncomeRange?: string
  howDidYouMeet?: string

  // Relationship Details
  relationshipStatus?: string
  relationshipStartDate?: string
  marriageCommitmentDate?: string
  livingSituation?: string
  previousMarriagesRelationships?: string
  relationshipSatisfaction?: string

  // Children & Family Planning
  hasChildren?: string
  numberOfChildren?: string
  childrenAges?: string
  childrenFromPreviousRelationships?: string
  custodyArrangements?: string
  futureFamilyPlans?: string

  // Extended Family & In-Laws
  relationshipWithInLaws?: string
  partnerRelationshipWithFamily?: string
  familyInvolvementLevel?: string
  familySupportForRelationship?: string
  geographicDistanceFromFamilies?: string
  frequencyOfFamilyContact?: string

  // Cultural & Religious Background
  culturalBackground?: string
  partnerCulturalBackground?: string
  religiousBeliefs?: string
  partnerReligiousBeliefs?: string
  religiousPracticeLevel?: string
  culturalDifferencesImpact?: string
  importantFamilyTraditions?: string

  // Financial Situation & Management
  combinedHouseholdIncome?: string
  financialManagementStyle?: string
  majorFinancialStressors?: string
  financialGoalsAlignment?: string

  // Relationship Challenges & Goals
  mainChallenges?: string[]
  challengesDescription?: string
  relationshipGoals?: string
  previousCounselingExperience?: string
  communicationStyle?: string

  // Additional Information
  currentMajorLifeStressors?: string
  supportSystemsAvailable?: string
  healthIssuesAffectingRelationship?: string
  anythingElseImportant?: string
}

export interface CounselingMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  scenarioIds?: string[]
}

export interface CounselingSession {
  id: string
  userId: string
  title: string
  sessionDate: Date
  duration?: number
  mood?: "positive" | "neutral" | "negative"
  insights: number
  messages: CounselingMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface CounselingScenario {
  id: string
  category: "communication" | "conflict_resolution" | "intimacy" | "trust" | "parenting" | "finances"
  situation: string
  keywords: string[]
  therapeutic_approach: string
  counselor_response: string
  techniques: string[]
  follow_up_questions: string[]
  therapeutic_goals: string[]
  severity: "low" | "moderate" | "high"
}
