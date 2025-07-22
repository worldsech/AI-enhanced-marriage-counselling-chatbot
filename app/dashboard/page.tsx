"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSessions } from "@/hooks/useSessions"
import { useAuth } from "@/contexts/AuthContext"
import {
  Heart,
  Settings,
  MessageCircle,
  Clock,
  TrendingUp,
  Star,
  ChevronRight,
  User,
  History,
  Target,
  BarChart3,
  Plus,
  LogOut,
} from "lucide-react"

export default function DashboardPage() {
  const { userProfile, logout } = useAuth()
  const { sessions, loading, stats } = useSessions()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    if (!logout) return
    try {
      await logout()
      // Redirect to login page after successful logout
      router.push("/login")
    } catch (error) {
      console.error("Failed to log out:", error)
      // You could add a toast notification here to inform the user of the error
    }
  }

  const formatDurationFromSeconds = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds < 1) {
      return "0 mins"
    }

    // Round to nearest minute
    const totalMinutes = Math.round(totalSeconds / 60)

    if (totalMinutes < 1) {
      return "< 1 min"
    }

    if (totalMinutes < 60) {
      return `${totalMinutes} min${totalMinutes !== 1 ? "s" : ""}`
    }

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    const hourString = `${hours} hr${hours !== 1 ? "s" : ""}`
    const minuteString = minutes > 0 ? ` ${minutes} min${minutes !== 1 ? "s" : ""}` : ""

    return `${hourString}${minuteString}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white/80 backdrop-blur-sm">
        <Link className="flex items-center justify-center" href="/">
          <Heart className="h-6 w-6 text-pink-500 mr-2" />
          <span className="text-xl font-bold text-pink-500">CoupleConnect</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>
                {userProfile?.firstName?.[0]}
                {userProfile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">
                {userProfile?.firstName} {userProfile?.lastName}
              </p>
              <p className="text-gray-500">{userProfile?.relationshipStatus || "User"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.firstName || "there"}! 👋</h1>
          <p className="text-gray-600">
            Ready to continue strengthening your relationship
            {userProfile?.partnerName ? ` with ${userProfile.partnerName}` : ""}?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">Sessions Completed</p>
                  <p className="text-3xl font-bold">{stats.totalSessions}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Time</p>
                  <p className="text-3xl font-bold">{formatDurationFromSeconds(stats.totalHours)}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Current Streak</p>
                  <p className="text-3xl font-bold">{stats.currentStreak} {stats.currentStreak === 1 ? "day" : "days"}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Progress</p>
                  <p className="text-3xl font-bold">{stats.progress}%</p>
                </div>
                <Star className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Link href="/counselor" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Start AI Session</h3>
                      <p className="text-sm text-gray-600">Begin a new counseling session</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>

                <Link href="/sessions" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <History className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">View History</h3>
                      <p className="text-sm text-gray-600">Review past sessions and progress</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>

                <Link href="/profile" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Account Settings</h3>
                      <p className="text-sm text-gray-600">Manage your profile and preferences</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>

                {/* <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Relationship Goals</h3>
                    <p className="text-sm text-gray-600">Set and track your progress</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div> */}
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-purple-500" />
                    Recent Sessions
                  </CardTitle>
                  <Link href="/counselor">
                    <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600">
                      <Plus className="h-4 w-4 mr-2" />
                      New Session
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.length > 0 ? (
                  sessions.slice(0, 3).map((session) => (
                    <Link key={session.id} href={`/counselor?session=${session.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{session.title}</h3>
                          <p className="text-sm text-gray-600">
                            {session.sessionDate.toLocaleDateString()} • {session.messages.length} messages
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{session.insights} insights</p>
                          <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No sessions yet</p>
                    <Link href="/counselor">
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600">Start Your First Session</Button>
                    </Link>
                  </div>
                )}

                {sessions.length > 3 && (
                  <Link href="/sessions">
                    <Button variant="outline" className="w-full bg-transparent">
                      View All Sessions
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarFallback className="text-lg">
                    {userProfile?.firstName?.[0]}
                    {userProfile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{userProfile?.email}</p>
                <p className="text-sm text-gray-500 mb-4">{userProfile?.relationshipStatus || "User"}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Partner:</span>
                    <span className="font-medium">{userProfile?.partnerName || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joined:</span>
                    <span className="font-medium">
                      {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span>Next Goal:</span>
                    <span className="font-medium">Complete 15 sessions</span>
                  </div> */}
                </div>

                <Link href="/profile">
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Progress Card */}
            {/* <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Communication Skills</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Conflict Resolution</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Emotional Intimacy</span>
                    <span className="font-medium">90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Trust Building</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  View Detailed Report
                </Button>
              </CardContent>
            </Card> */}

            {/* AI Counselor */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Counselor</h3>
                    <p className="text-sm text-pink-100">Always here to help</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Online & Ready</span>
                </div>
                <Link href="/counselor">
                  <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">Start New Session</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
