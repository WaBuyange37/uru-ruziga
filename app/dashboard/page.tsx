"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Award,
  BookOpen,
  CheckCircle2,
  Loader2,
  PenTool,
  RefreshCw,
  Trophy,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import { EmptyState, PageContainer, SectionHeader } from "../../components/ui/page"

interface DrawingAttempt {
  id: string
  vowel: string
  umweroChar: string
  aiScore: number
  isCorrect: boolean
  timeSpent: number
  createdAt: string
  feedback: string
}

interface LessonProgressData {
  lesson: {
    id: string
    title: string
    type: string
    module: string
  }
  completed: boolean
  score: number
  attempts: number
  timeSpent: number
  completedAt?: string
}

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
    charactersLearned: number
    perfectScores: number
  }
  lessonProgress: LessonProgressData[]
  recentDrawings: DrawingAttempt[]
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
  weeklyActivity: Array<{
    date: string
    drawings: number
    timeSpent: number
  }>
}

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login")
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) loadStats()
  }, [isAuthenticated])

  const loadStats = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/progress/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Dashboard progress could not be loaded.")
      setStats(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dashboard progress could not be loaded.")
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

  const nextLesson = useMemo(() => {
    if (!stats?.lessonProgress.length) return null
    return stats.lessonProgress.find((item) => !item.completed) || stats.lessonProgress[0]
  }, [stats])

  if (authLoading || loading) {
    return (
      <PageContainer className="flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#8B4513]" />
          <p className="mt-4 text-base font-medium text-black">Loading your learning progress...</p>
        </div>
      </PageContainer>
    )
  }

  if (error || !stats) {
    return (
      <PageContainer className="flex items-center justify-center bg-white">
        <EmptyState
          title="We could not load your dashboard"
          description={error || "Please try again."}
          actionLabel="Try Again"
          onAction={loadStats}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="bg-white">
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Learner Dashboard"
          title={`Continue learning, ${stats.user.fullName}`}
          description="Your next step is first. Everything here comes from your saved lessons, drawing attempts, and achievements."
          action={
            <Button variant="outline" onClick={loadStats}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          }
        />

        <Card className="border-[#8B4513]/35">
          <CardContent className="grid gap-5 p-5 sm:grid-cols-[1.5fr_1fr] sm:p-6">
            <div>
              <Badge variant="outline">What to do next</Badge>
              <h2 className="mt-3 text-2xl font-bold text-black">
                {nextLesson ? nextLesson.lesson.title : "Start your first Umwero lesson"}
              </h2>
              <p className="mt-2 text-base text-black/70">
                {nextLesson
                  ? `${nextLesson.attempts} attempt${nextLesson.attempts === 1 ? "" : "s"} recorded. Keep practicing until the character feels natural.`
                  : "Begin with the first available lesson, then return here to continue from your real progress."}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => router.push("/learn")}>
                  <BookOpen className="h-4 w-4" />
                  Continue Learning
                </Button>
                <Button variant="outline" onClick={() => router.push("/learn")}>
                  <PenTool className="h-4 w-4" />
                  Practice Drawing
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-[#8B4513]/20 bg-white p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-black/60">Overall progress</p>
                  <p className="mt-1 text-3xl font-bold text-[#8B4513]">{stats.overview.progressPercentage}%</p>
                </div>
                <p className="text-right text-sm text-black/65">
                  {stats.overview.completedLessons}/{stats.overview.totalLessons} lessons
                </p>
              </div>
              <Progress value={stats.overview.progressPercentage} className="mt-4 h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Drawing accuracy", `${stats.overview.accuracy}%`, `${stats.overview.correctDrawings}/${stats.overview.totalDrawings} correct`, PenTool],
            ["Average score", `${stats.overview.averageScore}%`, `${stats.overview.totalDrawings} attempts`, CheckCircle2],
            ["Achievements", `${stats.achievements.unlocked.length}`, `${stats.achievements.totalPoints} points earned`, Trophy],
          ].map(([label, value, detail, Icon]) => (
            <Card key={label as string}>
              <CardContent className="p-5">
                <Icon className="h-5 w-5 text-[#8B4513]" />
                <p className="mt-4 text-sm font-medium text-black/65">{label as string}</p>
                <p className="mt-1 text-2xl font-bold text-black">{value as string}</p>
                <p className="mt-1 text-sm text-black/60">{detail as string}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <PenTool className="h-5 w-5 text-[#8B4513]" />
                Recent Practice
              </CardTitle>
              <CardDescription>Your latest saved drawing attempts.</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentDrawings.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentDrawings.slice(0, 5).map((drawing) => (
                    <div key={drawing.id} className="flex items-center justify-between gap-4 rounded-lg border border-[#8B4513]/15 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="font-umwero text-3xl text-[#8B4513]">{drawing.umweroChar}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black">{drawing.vowel.toUpperCase()}</p>
                          <p className="truncate text-sm text-black/60">
                            {formatTime(drawing.timeSpent)} · {new Date(drawing.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{drawing.aiScore}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No practice attempts yet"
                  description="Start a lesson and submit your writing to see attempts here."
                  actionLabel="Start Practicing"
                  onAction={() => router.push("/learn")}
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-[#8B4513]" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Choose one focused next step.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button className="justify-start" onClick={() => router.push("/learn")}>
                  <BookOpen className="h-4 w-4" />
                  Continue Learning
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => router.push("/learn")}>
                  <PenTool className="h-4 w-4" />
                  Practice Drawing
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Award className="h-5 w-5 text-[#8B4513]" />
                  Achievements
                </CardTitle>
                <CardDescription>Real milestones you have unlocked.</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.achievements.unlocked.length > 0 ? (
                  <div className="space-y-3">
                    {stats.achievements.unlocked.slice(0, 3).map((achievement) => (
                      <div key={`${achievement.name}-${achievement.unlockedAt}`} className="rounded-lg border border-[#8B4513]/15 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-black">{achievement.name}</p>
                            <p className="mt-1 text-sm text-black/65">{achievement.description}</p>
                          </div>
                          <Badge>{achievement.points} pts</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No achievements yet"
                    description="Complete lessons and practice drawings to unlock achievements."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
