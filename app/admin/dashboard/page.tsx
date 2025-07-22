"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  Database,
  Users,
  MessageCircle,
  BarChart3,
  LogOut,
  Heart,
} from "lucide-react"
import { getCounselingScenarios, addScenario } from "@/lib/counseling-data"
import type { CounselingScenario } from "@/types/user"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [scenarios, setScenarios] = useState<CounselingScenario[]>([])
  const [filteredScenarios, setFilteredScenarios] = useState<CounselingScenario[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // New scenario form state
  const [newScenario, setNewScenario] = useState({
    id: "",
    category: "",
    situation: "",
    keywords: "",
    therapeutic_approach: "",
    counselor_response: "",
    techniques: "",
    follow_up_questions: "",
    therapeutic_goals: "",
    severity: "moderate",
  })

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem("coupleconnect_admin_session")
    if (!adminSession) {
      router.push("/admin/login")
      return
    }

    loadScenarios()
  }, [router])

  useEffect(() => {
    // Filter scenarios based on search and category
    let filtered = scenarios

    if (searchTerm) {
      filtered = filtered.filter(
        (scenario) =>
          scenario.situation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scenario.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((scenario) => scenario.category === selectedCategory)
    }

    setFilteredScenarios(filtered)
  }, [scenarios, searchTerm, selectedCategory])

  const loadScenarios = async () => {
    try {
      const data = await getCounselingScenarios()
      setScenarios(data)
      setFilteredScenarios(data)
    } catch (error) {
      console.error("Failed to load scenarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddScenario = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const scenario: CounselingScenario = {
        id: newScenario.id || `custom_${Date.now()}`,
        category: newScenario.category as any,
        situation: newScenario.situation,
        keywords: newScenario.keywords.split(",").map((k) => k.trim()),
        therapeutic_approach: newScenario.therapeutic_approach,
        counselor_response: newScenario.counselor_response,
        techniques: newScenario.techniques.split(",").map((t) => t.trim()),
        follow_up_questions: newScenario.follow_up_questions.split("\n").filter((q) => q.trim()),
        therapeutic_goals: newScenario.therapeutic_goals.split(",").map((g) => g.trim()),
        severity: newScenario.severity as any,
      }

      await addScenario(scenario)
      await loadScenarios()
      setIsAddModalOpen(false)

      // Reset form
      setNewScenario({
        id: "",
        category: "",
        situation: "",
        keywords: "",
        therapeutic_approach: "",
        counselor_response: "",
        techniques: "",
        follow_up_questions: "",
        therapeutic_goals: "",
        severity: "moderate",
      })

      alert("Scenario added successfully!")
    } catch (error) {
      console.error("Failed to add scenario:", error)
      alert("Failed to add scenario")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("coupleconnect_admin_session")
    router.push("/admin/login")
  }

  const categories = [
    "communication",
    "conflict_resolution",
    "intimacy",
    "trust",
    "parenting",
    "finances",
    "in_laws",
    "life_transitions",
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Heart className="h-6 w-6 text-pink-500 mr-2" />
            <span className="text-xl font-bold text-pink-500">CoupleConnect</span>
          </div>
          <Badge variant="secondary" className="bg-slate-100">
            <Shield className="h-3 w-3 mr-1" />
            Admin Dashboard
          </Badge>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-slate-600 bg-transparent">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Total Scenarios</p>
                  <p className="text-3xl font-bold text-slate-800">{scenarios.length}</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Categories</p>
                  <p className="text-3xl font-bold text-slate-800">{categories.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-slate-800">1,247</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Sessions Today</p>
                  <p className="text-3xl font-bold text-slate-800">89</p>
                </div>
                <MessageCircle className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios">Manage Scenarios</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Counseling Scenarios</CardTitle>
                  <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Scenario
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>Add New Counseling Scenario</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[calc(90vh-120px)] pr-4">
                        <form onSubmit={handleAddScenario} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="id">Scenario ID</Label>
                              <Input
                                id="id"
                                value={newScenario.id}
                                onChange={(e) => setNewScenario({ ...newScenario, id: e.target.value })}
                                placeholder="e.g., comm_004"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="category">Category</Label>
                              <Select
                                value={newScenario.category}
                                onValueChange={(value) => setNewScenario({ ...newScenario, category: value })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat.replace("_", " ").toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="situation">Situation Description</Label>
                            <Textarea
                              id="situation"
                              value={newScenario.situation}
                              onChange={(e) => setNewScenario({ ...newScenario, situation: e.target.value })}
                              placeholder="Describe the relationship situation..."
                              className="mt-1"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                            <Input
                              id="keywords"
                              value={newScenario.keywords}
                              onChange={(e) => setNewScenario({ ...newScenario, keywords: e.target.value })}
                              placeholder="keyword1, keyword2, keyword3"
                              className="mt-1"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="therapeutic_approach">Therapeutic Approach</Label>
                            <Select
                              value={newScenario.therapeutic_approach}
                              onValueChange={(value) => setNewScenario({ ...newScenario, therapeutic_approach: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select approach" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gottman_method">Gottman Method</SelectItem>
                                <SelectItem value="eft">Emotionally Focused Therapy</SelectItem>
                                <SelectItem value="cbt">Cognitive Behavioral Therapy</SelectItem>
                                <SelectItem value="solution_focused">Solution-Focused Therapy</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="counselor_response">Counselor Response</Label>
                            <Textarea
                              id="counselor_response"
                              value={newScenario.counselor_response}
                              onChange={(e) => setNewScenario({ ...newScenario, counselor_response: e.target.value })}
                              placeholder="Write the counselor's response template..."
                              className="mt-1 min-h-[120px]"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="techniques">Techniques (comma-separated)</Label>
                              <Input
                                id="techniques"
                                value={newScenario.techniques}
                                onChange={(e) => setNewScenario({ ...newScenario, techniques: e.target.value })}
                                placeholder="technique1, technique2"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="severity">Severity Level</Label>
                              <Select
                                value={newScenario.severity}
                                onValueChange={(value) => setNewScenario({ ...newScenario, severity: value })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="follow_up_questions">Follow-up Questions (one per line)</Label>
                            <Textarea
                              id="follow_up_questions"
                              value={newScenario.follow_up_questions}
                              onChange={(e) => setNewScenario({ ...newScenario, follow_up_questions: e.target.value })}
                              placeholder="Question 1&#10;Question 2&#10;Question 3"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="therapeutic_goals">Therapeutic Goals (comma-separated)</Label>
                            <Input
                              id="therapeutic_goals"
                              value={newScenario.therapeutic_goals}
                              onChange={(e) => setNewScenario({ ...newScenario, therapeutic_goals: e.target.value })}
                              placeholder="goal1, goal2, goal3"
                              className="mt-1"
                            />
                          </div>

                          <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-slate-600 to-slate-700">
                              Add Scenario
                            </Button>
                          </div>
                        </form>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search scenarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scenarios List */}
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredScenarios.map((scenario) => (
                      <Card key={scenario.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {scenario.category.replace("_", " ").toUpperCase()}
                                </Badge>
                                <Badge
                                  variant={
                                    scenario.severity === "high"
                                      ? "destructive"
                                      : scenario.severity === "moderate"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {scenario.severity.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-500">ID: {scenario.id}</span>
                              </div>
                              <h4 className="font-semibold text-sm mb-2">{scenario.situation}</h4>
                              <p className="text-xs text-gray-600 mb-2">
                                <strong>Keywords:</strong> {scenario.keywords.join(", ")}
                              </p>
                              <p className="text-xs text-gray-600">
                                <strong>Approach:</strong> {scenario.therapeutic_approach.replace("_", " ")}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Settings panel coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
