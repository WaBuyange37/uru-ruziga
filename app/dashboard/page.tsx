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
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <p className="text-gray-600">Failed to load dashboard</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl bg-[#FFFFFF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Muraho, {stats.user.fullName}! 👋
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Keep up the great work learning Umwero!
          </p>
        </div>
        <Badge className="bg-amber-600 text-white self-start">
          {stats.achievements.totalPoints} points
        </Badge>
      </div>

      {/* New Achievements Popup */}
      {showNewAchievements && stats.achievements.new.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              🎉 New Achievement{stats.achievements.new.length > 1 ? 's' : ''} Unlocked!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.achievements.new.map((ach: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <span className="text-xl sm:text-2xl">{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{ach.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{ach.description}</p>
                  </div>
                  <Badge className="bg-amber-600 text-white text-xs">{ach.points} pts</Badge>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowNewAchievements(false)}
              className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Awesome!
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513] shadow-md">
          <CardHeader className="pb-2 space-y-0">
            <CardDescription className="text-xs sm:text-sm text-[#D2691E]">Lessons</CardDescription>
            <CardTitle className="text-xl sm:text-3xl text-[#8B4513]">
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

        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513] shadow-md">
          <CardHeader className="pb-2 space-y-0">
            <CardDescription className="text-xs sm:text-sm text-[#D2691E]">Accuracy</CardDescription>
            <CardTitle className="text-xl sm:text-3xl text-[#8B4513] flex items-center gap-2">
              <Target className="h-4 w-4 sm:h-6 sm:w-6" />
              {stats.overview.accuracy}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-[#8B4513]">
              {stats.overview.correctDrawings}/{stats.overview.totalDrawings} correct
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513] shadow-md">
          <CardHeader className="pb-2 space-y-0">
            <CardDescription className="text-xs sm:text-sm text-[#D2691E]">Streak</CardDescription>
            <CardTitle className="text-xl sm:text-3xl text-[#8B4513] flex items-center gap-2">
              <Flame className="h-4 w-4 sm:h-6 sm:w-6 text-orange-500" />
              {stats.overview.learningStreak}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-[#8B4513]">
              {stats.overview.learningStreak > 0 
                ? `${stats.overview.learningStreak} day${stats.overview.learningStreak > 1 ? 's' : ''}!`
                : 'Start today!'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#F3E5AB] border-2 border-[#8B4513] shadow-md">
          <CardHeader className="pb-2 space-y-0">
            <CardDescription className="text-xs sm:text-sm text-[#D2691E]">Practice</CardDescription>
            <CardTitle className="text-xl sm:text-3xl text-[#8B4513] flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
              {formatTime(stats.overview.totalTimeSpent)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-[#8B4513]">
              Total time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Character Progress - Vowels */}
      <Card className="bg-[#F3E5AB] border-2 border-[#8B4513] shadow-md">
        <CardHeader>
          <CardTitle className="text-[#8B4513] flex items-center gap-2 text-lg sm:text-xl">
            <BookOpen className="h-5 w-5" />
            Vowel Characters Progress
          </CardTitle>
          <CardDescription className="text-[#D2691E] text-sm">
            Master all 5 vowels to unlock consonants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {[
              { vowel: 'A', umwero: '"', meaning: 'Horns' },
              { vowel: 'E', umwero: '|', meaning: 'Hoe' },
              { vowel: 'I', umwero: '}', meaning: 'Water' },
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
                  className={`relative p-2 sm:p-4 rounded-lg border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-green-500 rounded-full p-0.5 sm:p-1">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl sm:text-5xl font-umwero text-[#8B4513] mb-1 sm:mb-2">
                      {char.umwero}
                    </div>
                    <div className="text-base sm:text-xl font-bold text-[#8B4513]">
                      {char.vowel}
                    </div>
                    <div className="text-xs text-[#D2691E] mt-1 hidden sm:block">
                      {char.meaning}
                    </div>
                    {progress && (
                      <Badge 
                        className={`mt-1 sm:mt-2 text-xs ${
                          isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                      >
                        {progress.score}%
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Lessons */}
      <Card className="bg-[#F3E5AB] border-2 border-[#8B4513] shadow-md">
        <CardHeader>
          <CardTitle className="text-[#8B4513] flex items-center gap-2 text-lg sm:text-xl">
            <BookOpen className="h-5 w-5" />
            Recent Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.lessonProgress.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {stats.lessonProgress.slice(0, 5).map((progress, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-[#8B4513]">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {progress.completed && progress.score >= 70 ? (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-[#8B4513] flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-[#8B4513] text-sm sm:text-base truncate">
                        {progress.lesson.title}
                      </h3>
                      <p className="text-xs text-[#D2691E]">
                        {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {progress.score !== null && (
                    <Badge 
                      className={`text-xs flex-shrink-0 ${
                        progress.score >= 85 ? "bg-green-500" :
                        progress.score >= 70 ? "bg-blue-500" : "bg-yellow-500"
                      }`}
                    >
                      {progress.score}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#D2691E] py-4 text-sm">
              No lessons started yet. Begin your learning journey!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Button
          onClick={() => router.push('/learn')}
          className="bg-[#8B4513] hover:bg-[#A0522D] text-[#F3E5AB] h-14 sm:h-16 text-sm sm:text-base"
        >
          <BookOpen className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Continue Learning
        </Button>
        <Button
          onClick={() => router.push('/gallery')}
          variant="outline"
          className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] h-14 sm:h-16 text-sm sm:text-base"
        >
          <Star className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          View Gallery
        </Button>
        <Button
          onClick={loadStats}
          variant="outline"
          className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] h-14 sm:h-16 text-sm sm:text-base"
        >
          <TrendingUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Refresh Stats
        </Button>
      </div>
    </div>
  )
}
