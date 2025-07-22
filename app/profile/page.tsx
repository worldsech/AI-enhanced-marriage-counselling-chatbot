"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, ArrowLeft, Save, User, Users, Baby, Target, FileText, X } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { userProfile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    dateOfBirth: userProfile?.dateOfBirth || "",
    occupation: userProfile?.occupation || "",
    education: userProfile?.education || "",
    annualIncomeRange: userProfile?.annualIncomeRange || "",

    // Partner Information
    partnerName: userProfile?.partnerName || "",
    partnerAge: userProfile?.partnerAge || "",
    partnerOccupation: userProfile?.partnerOccupation || "",
    partnerEducation: userProfile?.partnerEducation || "",
    partnerIncomeRange: userProfile?.partnerIncomeRange || "",
    howDidYouMeet: userProfile?.howDidYouMeet || "",

    // Relationship Details
    relationshipStatus: userProfile?.relationshipStatus || "",
    relationshipStartDate: userProfile?.relationshipStartDate || "",
    marriageCommitmentDate: userProfile?.marriageCommitmentDate || "",
    livingSituation: userProfile?.livingSituation || "",
    previousMarriagesRelationships: userProfile?.previousMarriagesRelationships || "",
    relationshipSatisfaction: userProfile?.relationshipSatisfaction || "",

    // Children & Family Planning
    hasChildren: userProfile?.hasChildren || "",
    numberOfChildren: userProfile?.numberOfChildren || "",
    childrenAges: userProfile?.childrenAges || "",
    childrenFromPreviousRelationships: userProfile?.childrenFromPreviousRelationships || "",
    custodyArrangements: userProfile?.custodyArrangements || "",
    futureFamilyPlans: userProfile?.futureFamilyPlans || "",

    // Extended Family & In-Laws
    relationshipWithInLaws: userProfile?.relationshipWithInLaws || "",
    partnerRelationshipWithFamily: userProfile?.partnerRelationshipWithFamily || "",
    familyInvolvementLevel: userProfile?.familyInvolvementLevel || "",
    familySupportForRelationship: userProfile?.familySupportForRelationship || "",
    geographicDistanceFromFamilies: userProfile?.geographicDistanceFromFamilies || "",
    frequencyOfFamilyContact: userProfile?.frequencyOfFamilyContact || "",

    // Cultural & Religious Background
    culturalBackground: userProfile?.culturalBackground || "",
    partnerCulturalBackground: userProfile?.partnerCulturalBackground || "",
    religiousBeliefs: userProfile?.religiousBeliefs || "",
    partnerReligiousBeliefs: userProfile?.partnerReligiousBeliefs || "",
    religiousPracticeLevel: userProfile?.religiousPracticeLevel || "",
    culturalDifferencesImpact: userProfile?.culturalDifferencesImpact || "",
    importantFamilyTraditions: userProfile?.importantFamilyTraditions || "",

    // Financial Situation & Management
    combinedHouseholdIncome: userProfile?.combinedHouseholdIncome || "",
    financialManagementStyle: userProfile?.financialManagementStyle || "",
    majorFinancialStressors: userProfile?.majorFinancialStressors || "",
    financialGoalsAlignment: userProfile?.financialGoalsAlignment || "",

    // Relationship Challenges & Goals
    mainChallenges: userProfile?.mainChallenges || [],
    challengesDescription: userProfile?.challengesDescription || "",
    relationshipGoals: userProfile?.relationshipGoals || "",
    previousCounselingExperience: userProfile?.previousCounselingExperience || "",
    communicationStyle: userProfile?.communicationStyle || "",

    // Additional Information
    currentMajorLifeStressors: userProfile?.currentMajorLifeStressors || "",
    supportSystemsAvailable: userProfile?.supportSystemsAvailable || "",
    healthIssuesAffectingRelationship: userProfile?.healthIssuesAffectingRelationship || "",
    anythingElseImportant: userProfile?.anythingElseImportant || "",
  })

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleChallengeChange = (challenge: string, checked: boolean) => {
    const currentChallenges = Array.isArray(formData.mainChallenges) ? formData.mainChallenges : []
    if (checked) {
      handleChange("mainChallenges", [...currentChallenges, challenge])
    } else {
      handleChange(
        "mainChallenges",
        currentChallenges.filter((c) => c !== challenge),
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile(formData)
      setIsModalOpen(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center">
            <Heart className="h-6 w-6 text-pink-500 mr-2" />
            <span className="text-xl font-bold text-pink-500">Profile Settings</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Profile</span>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    Complete Your Family Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                      <span>Complete Your Family Profile</span>
                      <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogTitle>
                    <p className="text-sm text-gray-600">
                      Help us understand your family dynamics for personalized counseling guidance
                    </p>
                  </DialogHeader>

                  <ScrollArea className="h-[calc(90vh-120px)] pr-4">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Personal Information */}
                      <div className="bg-pink-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <User className="h-5 w-5 text-pink-500" />
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleChange("firstName", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleChange("lastName", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input
                              id="occupation"
                              value={formData.occupation}
                              onChange={(e) => handleChange("occupation", e.target.value)}
                              placeholder="Your profession"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="education">Education Level</Label>
                            <Select
                              value={formData.education}
                              onValueChange={(value) => handleChange("education", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select education level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high_school">High School</SelectItem>
                                <SelectItem value="some_college">Some College</SelectItem>
                                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                                <SelectItem value="masters">Master's Degree</SelectItem>
                                <SelectItem value="doctorate">Doctorate</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="annualIncomeRange">Annual Income Range</Label>
                            <Select
                              value={formData.annualIncomeRange}
                              onValueChange={(value) => handleChange("annualIncomeRange", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under_25k">Under $25,000</SelectItem>
                                <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                                <SelectItem value="50k_75k">$50,000 - $75,000</SelectItem>
                                <SelectItem value="75k_100k">$75,000 - $100,000</SelectItem>
                                <SelectItem value="100k_150k">$100,000 - $150,000</SelectItem>
                                <SelectItem value="over_150k">Over $150,000</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Partner Information */}
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Heart className="h-5 w-5 text-purple-500" />
                          Partner Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="partnerName">Partner's Full Name *</Label>
                            <Input
                              id="partnerName"
                              value={formData.partnerName}
                              onChange={(e) => handleChange("partnerName", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="partnerAge">Partner's Age</Label>
                            <Input
                              id="partnerAge"
                              value={formData.partnerAge}
                              onChange={(e) => handleChange("partnerAge", e.target.value)}
                              placeholder="Partner's age"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="partnerOccupation">Partner's Occupation</Label>
                            <Input
                              id="partnerOccupation"
                              value={formData.partnerOccupation}
                              onChange={(e) => handleChange("partnerOccupation", e.target.value)}
                              placeholder="Partner's profession"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="partnerEducation">Partner's Education</Label>
                            <Select
                              value={formData.partnerEducation}
                              onValueChange={(value) => handleChange("partnerEducation", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select education level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high_school">High School</SelectItem>
                                <SelectItem value="some_college">Some College</SelectItem>
                                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                                <SelectItem value="masters">Master's Degree</SelectItem>
                                <SelectItem value="doctorate">Doctorate</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="partnerIncomeRange">Partner's Income Range</Label>
                            <Select
                              value={formData.partnerIncomeRange}
                              onValueChange={(value) => handleChange("partnerIncomeRange", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="under_25k">Under $25,000</SelectItem>
                                <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                                <SelectItem value="50k_75k">$50,000 - $75,000</SelectItem>
                                <SelectItem value="75k_100k">$75,000 - $100,000</SelectItem>
                                <SelectItem value="100k_150k">$100,000 - $150,000</SelectItem>
                                <SelectItem value="over_150k">Over $150,000</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="howDidYouMeet">How did you meet?</Label>
                            <Input
                              id="howDidYouMeet"
                              value={formData.howDidYouMeet}
                              onChange={(e) => handleChange("howDidYouMeet", e.target.value)}
                              placeholder="e.g., college, work, online, friends"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Relationship Details */}
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          Relationship Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="relationshipStatus">Relationship Status *</Label>
                            <Select
                              value={formData.relationshipStatus}
                              onValueChange={(value) => handleChange("relationshipStatus", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dating">Dating</SelectItem>
                                <SelectItem value="engaged">Engaged</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="domestic_partnership">Domestic Partnership</SelectItem>
                                <SelectItem value="long_term_relationship">Long-term Relationship</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="relationshipStartDate">Relationship Start Date</Label>
                            <Input
                              id="relationshipStartDate"
                              type="date"
                              value={formData.relationshipStartDate}
                              onChange={(e) => handleChange("relationshipStartDate", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="marriageCommitmentDate">Marriage/Commitment Date</Label>
                            <Input
                              id="marriageCommitmentDate"
                              type="date"
                              value={formData.marriageCommitmentDate}
                              onChange={(e) => handleChange("marriageCommitmentDate", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="livingSituation">Living Situation</Label>
                            <Select
                              value={formData.livingSituation}
                              onValueChange={(value) => handleChange("livingSituation", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select situation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="living_together">Living Together</SelectItem>
                                <SelectItem value="separate_homes">Separate Homes</SelectItem>
                                <SelectItem value="long_distance">Long Distance</SelectItem>
                                <SelectItem value="recently_moved_in">Recently Moved In Together</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="previousMarriagesRelationships">Previous Marriages/Relationships</Label>
                            <Select
                              value={formData.previousMarriagesRelationships}
                              onValueChange={(value) => handleChange("previousMarriagesRelationships", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="one_previous">One Previous</SelectItem>
                                <SelectItem value="multiple_previous">Multiple Previous</SelectItem>
                                <SelectItem value="prefer_not_to_say">Prefer Not to Say</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="relationshipSatisfaction">Relationship Satisfaction (1-10)</Label>
                            <Select
                              value={formData.relationshipSatisfaction}
                              onValueChange={(value) => handleChange("relationshipSatisfaction", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Rate 1-10" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Children & Family Planning */}
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Baby className="h-5 w-5 text-green-500" />
                          Children & Family Planning
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="hasChildren">Do you have children together?</Label>
                            <Select
                              value={formData.hasChildren}
                              onValueChange={(value) => handleChange("hasChildren", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="expecting">Expecting</SelectItem>
                                <SelectItem value="trying">Trying to Conceive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="numberOfChildren">Number of Children Together</Label>
                            <Input
                              id="numberOfChildren"
                              value={formData.numberOfChildren}
                              onChange={(e) => handleChange("numberOfChildren", e.target.value)}
                              placeholder="Number of children"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="childrenAges">Children's Ages</Label>
                            <Input
                              id="childrenAges"
                              value={formData.childrenAges}
                              onChange={(e) => handleChange("childrenAges", e.target.value)}
                              placeholder="e.g., 3, 7, 12"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="childrenFromPreviousRelationships">
                              Children from Previous Relationships
                            </Label>
                            <Select
                              value={formData.childrenFromPreviousRelationships}
                              onValueChange={(value) => handleChange("childrenFromPreviousRelationships", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="you_have">You Have Children</SelectItem>
                                <SelectItem value="partner_has">Partner Has Children</SelectItem>
                                <SelectItem value="both_have">Both Have Children</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="custodyArrangements">Custody Arrangements</Label>
                            <Select
                              value={formData.custodyArrangements}
                              onValueChange={(value) => handleChange("custodyArrangements", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select arrangement" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_applicable">Not Applicable</SelectItem>
                                <SelectItem value="full_custody">Full Custody</SelectItem>
                                <SelectItem value="joint_custody">Joint Custody</SelectItem>
                                <SelectItem value="shared_custody">Shared Custody</SelectItem>
                                <SelectItem value="visitation_rights">Visitation Rights</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="futureFamilyPlans">Future Family Plans</Label>
                            <Select
                              value={formData.futureFamilyPlans}
                              onValueChange={(value) => handleChange("futureFamilyPlans", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="want_more_children">Want More Children</SelectItem>
                                <SelectItem value="done_having_children">Done Having Children</SelectItem>
                                <SelectItem value="undecided">Undecided</SelectItem>
                                <SelectItem value="unable_to_have_children">Unable to Have Children</SelectItem>
                                <SelectItem value="considering_adoption">Considering Adoption</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Relationship Challenges & Goals */}
                      <div className="bg-red-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Target className="h-5 w-5 text-red-500" />
                          Relationship Challenges & Goals
                        </h3>

                        <div className="mb-6">
                          <Label className="text-base font-medium">
                            Main Relationship Challenges (Select all that apply)
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            {[
                              "Communication issues",
                              "Conflict resolution",
                              "Intimacy/physical connection",
                              "Trust issues",
                              "Financial disagreements",
                              "Parenting differences",
                              "In-law problems",
                              "Work-life balance",
                              "Different life goals",
                              "Jealousy/insecurity",
                              "Addiction issues",
                              "Mental health challenges",
                            ].map((challenge) => (
                              <div key={challenge} className="flex items-center space-x-2">
                                <Checkbox
                                  id={challenge}
                                  checked={
                                    Array.isArray(formData.mainChallenges) &&
                                    formData.mainChallenges.includes(challenge)
                                  }
                                  onCheckedChange={(checked) => handleChallengeChange(challenge, checked as boolean)}
                                />
                                <Label htmlFor={challenge} className="text-sm">
                                  {challenge}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="challengesDescription">Describe Your Main Challenges in Detail</Label>
                            <Textarea
                              id="challengesDescription"
                              value={formData.challengesDescription}
                              onChange={(e) => handleChange("challengesDescription", e.target.value)}
                              placeholder="Describe the main challenges you're facing in your relationship"
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="relationshipGoals">What Are Your Relationship Goals?</Label>
                            <Textarea
                              id="relationshipGoals"
                              value={formData.relationshipGoals}
                              onChange={(e) => handleChange("relationshipGoals", e.target.value)}
                              placeholder="What do you hope to achieve in your relationship? What would success look like?"
                              className="mt-1 min-h-[100px]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="previousCounselingExperience">Previous Counseling Experience</Label>
                            <Select
                              value={formData.previousCounselingExperience}
                              onValueChange={(value) => handleChange("previousCounselingExperience", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Previous Experience</SelectItem>
                                <SelectItem value="individual">Individual Therapy Only</SelectItem>
                                <SelectItem value="couples">Couples Counseling Before</SelectItem>
                                <SelectItem value="both">Both Individual and Couples</SelectItem>
                                <SelectItem value="prefer_not_to_say">Prefer Not to Say</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="communicationStyle">Communication Style</Label>
                            <Select
                              value={formData.communicationStyle}
                              onValueChange={(value) => handleChange("communicationStyle", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="direct">Direct and Straightforward</SelectItem>
                                <SelectItem value="gentle">Gentle and Considerate</SelectItem>
                                <SelectItem value="analytical">Analytical and Detailed</SelectItem>
                                <SelectItem value="emotional">Emotional and Expressive</SelectItem>
                                <SelectItem value="conflict_avoidant">Prefer to Avoid Conflict</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-500" />
                          Additional Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="currentMajorLifeStressors">Current Major Life Stressors</Label>
                            <Textarea
                              id="currentMajorLifeStressors"
                              value={formData.currentMajorLifeStressors}
                              onChange={(e) => handleChange("currentMajorLifeStressors", e.target.value)}
                              placeholder="Work stress, health issues, family problems, financial concerns, etc."
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="supportSystemsAvailable">Support Systems Available</Label>
                            <Textarea
                              id="supportSystemsAvailable"
                              value={formData.supportSystemsAvailable}
                              onChange={(e) => handleChange("supportSystemsAvailable", e.target.value)}
                              placeholder="Friends, family, community, religious organizations, etc. who provide support"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="healthIssuesAffectingRelationship">
                              Health Issues Affecting Relationship
                            </Label>
                            <Textarea
                              id="healthIssuesAffectingRelationship"
                              value={formData.healthIssuesAffectingRelationship}
                              onChange={(e) => handleChange("healthIssuesAffectingRelationship", e.target.value)}
                              placeholder="Mental health, physical health, chronic conditions, etc. (optional)"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="anythingElseImportant">Anything Else Important for Us to Know</Label>
                            <Textarea
                              id="anythingElseImportant"
                              value={formData.anythingElseImportant}
                              onChange={(e) => handleChange("anythingElseImportant", e.target.value)}
                              placeholder="Any other information about your relationship, family situation, or circumstances that would help us provide better guidance"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? "Saving..." : "Save Family Profile"}
                        </Button>
                      </div>
                    </form>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {userProfile?.firstName} {userProfile?.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {userProfile?.email}
                    </p>
                    <p>
                      <span className="font-medium">Partner:</span> {userProfile?.partnerName || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Relationship Status:</span>{" "}
                      {userProfile?.relationshipStatus || "Not specified"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Profile Completion</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile Completeness</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Complete your family profile to get more personalized counseling guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
