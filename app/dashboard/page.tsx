// app/dashboard/page-enhanced.tsx
// Interactive dashboard with real database stats

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Badge } from "../../components/ui/badge"
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Target,
  Flame,
  Star,
  Award,
  CheckCircle2,
  Loader2
} from "lucide-react"

interface Stats {
  user: {
    fullName: string
    email: string
    createdAt: string
  }
  overview: {
    completedLessons: number
    totalLessons: number
    progressPercentage: number
    totalDrawings: number
    correctDrawings: number
    accuracy: number
    averageScore: number
    totalTimeSpent: number
    learningStreak: number
  }
  lessonProgress: Array<{
    lesson: {
      title: string
      type: string
      module: string
    }
    completed: boolean
    score: number
    attempts: number
  }>
  achievements: {
    unlocked: Array<{
      name: string
      description: string
      icon: string
      points: number
      unlockedAt: string
    }>
    new: Array<any>
    totalPoints: number
  }
}

export default function EnhancedDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewAchievements, setShowNewAchievements] = useState(false)

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
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/progress/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
        
        // Show new achievements popup
        if (data.achievements.new.length > 0) {
          setShowNewAchievements(true)
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <p>Failed to load dashboard</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4513]">
            Muraho, {stats.user.fullName}! 👋
          </h1>
          <p className="text-[#D2691E] mt-1">
            Keep up the great work learning Umwero!
          </p>
        </div>
        <Badge className="bg-[#8B4513] text-[#F3E5AB]">
          {stats.achievements.totalPoints} points
        </Badge>
      </div>

      {/* New Achievements Popup */}
      {showNewAchievements && stats.achievements.new.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              🎉 New Achievement{stats.achievements.new.length > 1 ? 's' : ''} Unlocked!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.achievements.new.map((ach: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[#8B4513]">{ach.name}</h3>
                    <p className="text-sm text-[#D2691E]">{ach.description}</p>
                  </div>
                  <Badge className="ml-auto">{ach.points} pts</Badge>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowNewAchievements(false)}
              className="w-full mt-4 bg-[#8B4513] text-[#F3E5AB]"
            >
              Awesome!
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Lessons Progress */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#D2691E]">Lessons Completed</CardDescription>
            <CardTitle className="text-3xl text-[#8B4513]">
              {stats.overview.completedLessons}/{stats.overview.totalLessons}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.overview.progressPercentage} className="h-2" />
            <p className="text-xs text-[#D2691E] mt-2">
              {stats.overview.progressPercentage}% complete
            </p>
          </CardContent>
        </Card>

        {/* Drawing Accuracy */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#D2691E]">Drawing Accuracy</CardDescription>
            <CardTitle className="text-3xl text-[#8B4513] flex items-center gap-2">
              <Target className="h-6 w-6" />
              {stats.overview.accuracy}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#8B4513]">
              {stats.overview.correctDrawings}/{stats.overview.totalDrawings} correct
            </p>
            <p className="text-xs text-[#D2691E] mt-1">
              Avg score: {stats.overview.averageScore}%
            </p>
          </CardContent>
        </Card>

        {/* Learning Streak */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#D2691E]">Learning Streak</CardDescription>
            <CardTitle className="text-3xl text-[#8B4513] flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              {stats.overview.learningStreak}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#8B4513]">
              {stats.overview.learningStreak > 0 
                ? `${stats.overview.learningStreak} day${stats.overview.learningStreak > 1 ? 's' : ''} in a row!`
                : 'Start your streak today!'
              }
            </p>
          </CardContent>
        </Card>

        {/* Time Spent */}
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[#D2691E]">Practice Time</CardDescription>
            <CardTitle className="text-3xl text-[#8B4513] flex items-center gap-2">
              <Clock className="h-6 w-6" />
              {formatTime(stats.overview.totalTimeSpent)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#8B4513]">
              Total practice time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Character Progress - Vowels */}
      <Card className="bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Vowel Characters Progress
          </CardTitle>
          <CardDescription className="text-[#D2691E]">
            Master all 5 vowels to unlock consonants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {[
              { vowel: 'A', umwero: '"', meaning: 'Cow Horns' },
              { vowel: 'E', umwero: '|', meaning: 'Hoe' },
              { vowel: 'I', umwero: '}', meaning: 'Water Flow' },
              { vowel: 'O', umwero: '{', meaning: 'Spirit' },
              { vowel: 'U', umwero: ':', meaning: 'Fire' }
            ].map((char, idx) => {
              const progress = stats.lessonProgress.find(p => 
                p.lesson.title.includes(`Vowel: ${char.vowel}`)
              )
              const isCompleted = progress?.completed && (progress?.score || 0) >= 70
              
              return (
                <div 
                  key={idx}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-5xl font-umwero text-[#8B4513] mb-2">
                      {char.umwero}
                    </div>
                    <div className="text-xl font-bold text-[#8B4513]">
                      {char.vowel}
                    </div>
                    <div className="text-xs text-[#D2691E] mt-1">
                      {char.meaning}
                    </div>
                    {progress && (
                      <Badge 
                        className={`mt-2 ${
                          isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      >
                        {progress.score}%
                      </Badge>
                    )}
                    {!progress && (
                      <div className="text-xs text-gray-400 mt-2">
                        Not started
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Lessons */}
      <Card className="bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Practice Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.lessonProgress.length > 0 ? (
            <div className="space-y-3">
              {stats.lessonProgress.slice(0, 5).map((progress, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    {progress.completed && progress.score >= 70 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : progress.completed ? (
                      <div className="h-5 w-5 rounded-full bg-yellow-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <h3 className="font-medium text-[#8B4513]">
                        {progress.lesson.title}
                      </h3>
                      <p className="text-xs text-[#D2691E]">
                        {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}
                        {progress.completed && progress.score >= 70 && ' • Mastered ✓'}
                      </p>
                    </div>
                  </div>
                  {progress.score !== null && (
                    <Badge 
                      className={
                        progress.score >= 85 ? "bg-green-500" :
                        progress.score >= 70 ? "bg-blue-500" : "bg-yellow-500"
                      }
                    >
                      {progress.score}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#D2691E] py-4">
              No lessons started yet. Begin your learning journey!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements ({stats.achievements.unlocked.length})
          </CardTitle>
          <CardDescription className="text-[#D2691E]">
            Total: {stats.achievements.totalPoints} points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.achievements.unlocked.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {stats.achievements.unlocked.map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#8B4513]">
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-[#D2691E]">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {achievement.points} pts
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#D2691E] py-4">
              No achievements yet. Keep practicing to unlock them!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          onClick={() => router.push('/learn')}
          className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] h-20"
        >
          <BookOpen className="mr-2 h-5 w-5" />
          Continue Learning
        </Button>
        <Button
          onClick={() => router.push('/gallery')}
          variant="outline"
          className="border-[#8B4513] text-[#8B4513] h-20"
        >
          <Star className="mr-2 h-5 w-5" />
          View Gallery
        </Button>
        <Button
          onClick={loadStats}
          variant="outline"
          className="border-[#8B4513] text-[#8B4513] h-20"
        >
          <TrendingUp className="mr-2 h-5 w-5" />
          Refresh Stats
        </Button>
      </div>
    </div>
  )
}