"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../../hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, BookOpen, GraduationCap, Trophy, Clock, ArrowRight } from 'lucide-react'

interface ProgressData {
  lessonsCompleted: number
  totalLessons: number
  currentStreak: number
  quizzesPassed: number
  achievementsEarned: number
  progressFromLastWeek: number
  nextLesson: {
    id: string
    title: string
    description: string
    module: string
  } | null
  practiceLesson: {
    id: string
    title: string
    description: string
  } | null
  recentProgress: Array<{
    lessonTitle: string
    completedAt: string
    score: number | null
  }>
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated && user) {
      fetchProgressData()
    }
  }, [isAuthenticated, user, loading, router])

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch progress data')
      }

      const data = await response.json()
      setProgressData(data.progress)
    } catch (error) {
      console.error('Error fetching progress:', error)
      setError('Failed to load progress data')
    } finally {
      setLoadingProgress(false)
    }
  }

  const startLesson = (lessonId: string) => {
    router.push(`/learn?lesson=${lessonId}`)
  }

  const takeQuiz = (lessonId: string) => {
    router.push(`/quiz?lesson=${lessonId}`)
  }

  if (loading || loadingProgress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-[#8B4513]">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          {error}
          <Button onClick={fetchProgressData} className="ml-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#8B4513]">
          {t('welcome')}, {user?.fullName}! 👋
        </h1>
        <p className="text-[#D2691E]">Here's your Umwero learning progress</p>
      </div>

      {/* Progress Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#8B4513]">
              Lessons Completed
            </CardTitle>
            <BookOpen className="h-4 w-4 text-[#8B4513]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B4513]">
              {progressData?.lessonsCompleted || 0}
            </div>
            <p className="text-xs text-[#D2691E]">
              +{progressData?.progressFromLastWeek || 0} from last week
            </p>
            <div className="mt-2">
              <div className="text-xs text-[#8B4513]">
                {progressData?.lessonsCompleted || 0} of {progressData?.totalLessons || 0} total
              </div>
              <div className="w-full bg-[#DEB887] rounded-full h-2 mt-1">
                <div 
                  className="bg-[#8B4513] h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${progressData?.totalLessons ? 
                      (progressData.lessonsCompleted / progressData.totalLessons) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#8B4513]">
              Current Streak
            </CardTitle>
            <BarChart className="h-4 w-4 text-[#8B4513]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B4513]">
              {progressData?.currentStreak || 0} days
            </div>
            <p className="text-xs text-[#D2691E]">
              {progressData?.currentStreak ? 'Keep it up!' : 'Start your streak today!'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#8B4513]">
              Quizzes Passed
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-[#8B4513]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B4513]">
              {progressData?.quizzesPassed || 0}
            </div>
            <p className="text-xs text-[#D2691E]">
              Great job on your assessments!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#8B4513]">
              Achievements Earned
            </CardTitle>
            <Trophy className="h-4 w-4 text-[#8B4513]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#8B4513]">
              {progressData?.achievementsEarned || 0}
            </div>
            <p className="text-xs text-[#D2691E]">
              {progressData?.achievementsEarned ? 'Unlock more achievements!' : 'Complete lessons to unlock achievements'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Next Lesson */}
        {progressData?.nextLesson ? (
          <Card className="bg-[#F3E5AB] border-[#8B4513]">
            <CardHeader>
              <CardTitle className="text-[#8B4513] flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Next Lesson
              </CardTitle>
              <CardDescription className="text-[#D2691E]">
                Continue your Umwero journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-[#8B4513] mb-2">
                {progressData.nextLesson.title}
              </h3>
              <p className="text-[#D2691E] mb-4">
                {progressData.nextLesson.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8B4513] bg-[#DEB887] px-2 py-1 rounded">
                  {progressData.nextLesson.module}
                </span>
                <Button 
                  onClick={() => startLesson(progressData.nextLesson!.id)}
                  className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                >
                  Start Lesson
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#F3E5AB] border-[#8B4513]">
            <CardHeader>
              <CardTitle className="text-[#8B4513]">🎉 Congratulations!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#D2691E]">
                You've completed all available lessons! Check back soon for new content.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Practice Quiz */}
        {progressData?.practiceLesson ? (
          <Card className="bg-[#F3E5AB] border-[#8B4513]">
            <CardHeader>
              <CardTitle className="text-[#8B4513] flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Practice Quiz
              </CardTitle>
              <CardDescription className="text-[#D2691E]">
                Test your knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-[#8B4513] mb-2">
                Review: {progressData.practiceLesson.title}
              </h3>
              <p className="text-[#D2691E] mb-4">
                {progressData.practiceLesson.description}
              </p>
              <Button 
                onClick={() => takeQuiz(progressData.practiceLesson!.id)}
                variant="outline" 
                className="w-full border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
              >
                Take Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#F3E5AB] border-[#8B4513]">
            <CardHeader>
              <CardTitle className="text-[#8B4513]">Practice Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#D2691E]">
                Complete some lessons first to unlock practice quizzes!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      {progressData?.recentProgress && progressData.recentProgress.length > 0 && (
        <Card className="bg-[#F3E5AB] border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-[#D2691E]">
              Your latest completed lessons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressData.recentProgress.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-[#DEB887]">
                  <div>
                    <p className="font-semibold text-[#8B4513]">{activity.lessonTitle}</p>
                    <p className="text-sm text-[#D2691E]">
                      Completed on {new Date(activity.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.score && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#8B4513]">{activity.score}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button asChild className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
          <Link href="/learn">Browse All Lessons</Link>
        </Button>
        <Button asChild variant="outline" className="border-[#8B4513] text-[#8B4513]">
          <Link href="/community">Join Community</Link>
        </Button>
        <Button asChild variant="outline" className="border-[#8B4513] text-[#8B4513]">
          <Link href="/translate">Use Translator</Link>
        </Button>
      </div>
    </div>
  )
}