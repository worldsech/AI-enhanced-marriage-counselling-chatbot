"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useUserAnalytics } from "@/hooks/useDataSync"
import {
  Heart,
  ArrowLeft,
  TrendingUp,
  Clock,
  Brain,
  Smartphone,
  Monitor,
  Tablet,
  BarChart3,
  Calendar,
} from "lucide-react"

export default function AnalyticsPage() {
  const { userProfile } = useAuth()
  const { analyses, analytics, loading } = useUserAnalytics(userProfile?.uid)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-100"
      case "negative":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600"
      case "declining":
        return "text-red-600"
      default:
        return "text-gray-600"
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
            <span className="text-xl font-bold text-pink-500">Your Analytics</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Sessions</p>
                  <p className="text-3xl font-bold text-gray-800">{analytics.totalAnalyses}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Overall Mood</p>
                  <Badge className={getSentimentColor(analytics.averageSentiment)}>{analytics.averageSentiment}</Badge>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Most Active Time</p>
                  <p className="text-lg font-semibold capitalize">{analytics.mostActiveTimeOfDay}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Progress Trend</p>
                  <p className={`text-lg font-semibold capitalize ${getTrendColor(analytics.progressTrend)}`}>
                    {analytics.progressTrend}
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${getTrendColor(analytics.progressTrend)}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Top Concerns */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Top Discussion Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.topConcerns.length > 0 ? (
                analytics.topConcerns.map((concern, index) => (
                  <div key={concern} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{concern.replace("_", " ")}</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={((analytics.topConcerns.length - index) / analytics.topConcerns.length) * 100}
                        className="w-20 h-2"
                      />
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No discussion topics yet</p>
              )}
            </CardContent>
          </Card>

          {/* Device Usage */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-500" />
                Device Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analytics.deviceUsage).length > 0 ? (
                Object.entries(analytics.deviceUsage).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device)}
                      <span className="text-sm font-medium capitalize">{device}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(count / Math.max(...Object.values(analytics.deviceUsage))) * 100}
                        className="w-20 h-2"
                      />
                      <span className="text-xs text-gray-500">{count} sessions</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No device data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Analysis Timeline */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Recent Session Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyses.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analyses.slice(0, 10).map((analysis) => (
                    <div key={analysis.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge className={getSentimentColor(analysis.analysisData.sentiment)}>
                          {analysis.analysisData.sentiment}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {analysis.analysisType.replace("_", " ").toUpperCase()} Session
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {analysis.timeOfDay}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          Topics: {analysis.analysisData.keyTopics.join(", ") || "General discussion"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {analysis.timestamp.toLocaleDateString()} at {analysis.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge
                          variant={
                            analysis.analysisData.concernLevel === "high"
                              ? "destructive"
                              : analysis.analysisData.concernLevel === "moderate"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {analysis.analysisData.concernLevel} concern
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No analysis data yet</p>
                  <Link href="/counselor">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600">Start Your First Session</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Communication Patterns</h4>
                <p className="text-sm text-blue-700">
                  {analytics.averageSentiment === "positive"
                    ? "Your recent conversations show positive engagement. Keep focusing on open, honest communication."
                    : analytics.averageSentiment === "negative"
                      ? "Recent sessions indicate some challenges. Consider scheduling more frequent check-ins with your partner."
                      : "Your communication patterns are balanced. Continue working on active listening and empathy."}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Session Timing</h4>
                <p className="text-sm text-green-700">
                  You're most active during {analytics.mostActiveTimeOfDay} sessions.
                  {analytics.mostActiveTimeOfDay === "evening"
                    ? " This is often a good time for reflection and deeper conversations."
                    : analytics.mostActiveTimeOfDay === "morning"
                      ? " Morning sessions can set a positive tone for your day."
                      : " Consider if this timing works well for both you and your partner."}
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Progress Tracking</h4>
                <p className="text-sm text-purple-700">
                  Your relationship journey shows {analytics.progressTrend} trends.
                  {analytics.progressTrend === "improving"
                    ? " Keep up the great work and continue building on your successes."
                    : analytics.progressTrend === "declining"
                      ? " Consider focusing on the fundamentals and perhaps seeking additional support."
                      : " Consistency in your efforts will help maintain steady progress."}
                </p>
              </div>

              <div className="p-4 bg-pink-50 rounded-lg">
                <h4 className="font-semibold text-pink-800 mb-2">Next Steps</h4>
                <p className="text-sm text-pink-700">
                  Based on your patterns, consider focusing on {analytics.topConcerns[0] || "communication"}
                  in your next sessions. Regular practice and patience are key to lasting relationship growth.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
