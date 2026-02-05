// app/dashboard/page.tsx
// Dashboard with real database stats

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { 
  BookOpen, 
  Target, 
  Flame, 
  Clock, 
  Trophy,
  TrendingUp,
  Star,
  RefreshCw,
  Loader2
} from "lucide-react"

interface Stats {
  lessonsCompleted: number
  totalLessons: number
  drawingAccuracy: number
  averageScore: number
  learningStreak: number
  totalPracticeTime: number
  recentLessons: Array<{
    id: string
    title: string
    type: string
    completed: boolean
    score: number | null
    updatedAt: string
  }>
  achievements: Array<{
    id: string
    name: string
    description: string
    unlockedAt: string
    points: number
  }>
  totalPoints: number
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
    }
  }, [isAuthenticated])

  const loadStats = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch('/api/progress/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Failed to load stats')
      }
    } catch (error: any) {
      console.error('Error loading stats:', error)
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Failed to load dashboard"}</p>
            <Button onClick={loadStats} className="bg-[#8B4513] text-[#F3E5AB]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completionPercentage = stats.totalLessons > 0 
    ? Math.round((stats.lessonsCompleted / stats.totalLessons) * 100) 
    : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#8B4513] mb-2">
            Muraho, {user?.name}! 👋
          </h1>
          <p className="text-[#D2691E]">Keep up the great work learning Umwero!</p>
        </div>
        <Badge className="bg-[#8B4513] text-[#F3E5AB] text-lg px-4 py-2">
          {stats.totalPoints} points
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lessons Completed */}
        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#D2691E] text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Lessons Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#8B4513] mb-2">
              {stats.lessonsCompleted}/{stats.totalLessons}
            </div>
            <Progress value={completionPercentage} className="h-2 mb-2" />
            <p className="text-xs text-[#D2691E]">{completionPercentage}% complete</p>
          </CardContent>
        </Card>

        {/* Drawing Accuracy */}
        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#D2691E] text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Drawing Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#8B4513] mb-2">
              {Math.round(stats.drawingAccuracy)}%
            </div>
            <p className="text-xs text-[#D2691E]">
              {stats.lessonsCompleted > 0 ? `${stats.lessonsCompleted}/0 correct` : '0/0 correct'}
            </p>
            <p className="text-xs text-[#D2691E]">
              Avg score: {Math.round(stats.averageScore)}%
            </p>
          </CardContent>
        </Card>

        {/* Learning Streak */}
        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#D2691E] text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#8B4513] mb-2">
              {stats.learningStreak}
            </div>
            <p className="text-xs text-[#D2691E]">
              {stats.learningStreak > 0 ? "Keep it up! 🔥" : "Start your streak today!"}
            </p>
          </CardContent>
        </Card>

        {/* Practice Time */}
        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#D2691E] text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Practice Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#8B4513] mb-2">
              {Math.floor(stats.totalPracticeTime / 60)}m
            </div>
            <p className="text-xs text-[#D2691E]">Total practice time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Lessons */}
      <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentLessons.length > 0 ? (
            <div className="space-y-3">
              {stats.recentLessons.map((lesson) => (
                <div 
                  key={lesson.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#8B4513]"
                >
                  <div className="flex items-center gap-3">
                    {lesson.completed ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[#8B4513]">{lesson.title}</p>
                      <p className="text-xs text-[#D2691E]">
                        {new Date(lesson.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.score !== null && (
                      <Badge variant="outline" className="border-[#8B4513] text-[#8B4513]">
                        {lesson.score}%
                      </Badge>
                    )}
                    {lesson.completed && (
                      <Badge className="bg-green-500 text-white">
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-[#8B4513] opacity-50" />
              <p className="text-[#D2691E]">
                No lessons started yet. Begin your learning journey!
              </p>
              <Button 
                onClick={() => router.push('/learn')}
                className="mt-4 bg-[#8B4513] text-[#F3E5AB]"
              >
                Start Learning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements ({stats.achievements.length})
            </CardTitle>
            <p className="text-sm text-[#D2691E]">Total: {stats.totalPoints} points</p>
          </div>
        </CardHeader>
        <CardContent>
          {stats.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="p-4 bg-white rounded-lg border-2 border-[#8B4513]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <Badge className="bg-[#8B4513] text-[#F3E5AB]">
                      {achievement.points} pts
                    </Badge>
                  </div>
                  <h3 className="font-bold text-[#8B4513] mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-[#D2691E] mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-green-700">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-[#8B4513] opacity-50" />
              <p className="text-[#D2691E]">
                No achievements yet. Keep practicing to unlock them!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => router.push('/learn')}
          className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] py-6 text-lg"
        >
          <BookOpen className="mr-2 h-5 w-5" />
          Continue Learning
        </Button>
        <Button
          onClick={() => router.push('/gallery')}
          variant="outline"
          className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-[#F3E5AB] py-6 text-lg"
        >
          <Star className="mr-2 h-5 w-5" />
          View Gallery
        </Button>
        <Button
          onClick={loadStats}
          variant="outline"
          className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-[#F3E5AB] py-6 text-lg"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Refresh Stats
        </Button>
      </div>
    </div>
  )
}