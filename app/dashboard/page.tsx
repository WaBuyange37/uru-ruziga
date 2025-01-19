"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../../hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, BookOpen, GraduationCap, Trophy } from 'lucide-react'
import { ProtectedRoute } from '../../components/ProtectedRoute'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('welcome')}, {user?.fullName}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('lessonsCompleted')}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 {t('fromLastWeek')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('currentStreak')}
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 {t('days')}</div>
            <p className="text-xs text-muted-foreground">
              {t('keepItUp')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('quizzesPassed')}
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              +1 {t('fromLastWeek')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('achievementsEarned')}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              {t('unlockMore')}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{t('continueYourJourney')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('nextLesson')}</CardTitle>
              <CardDescription>{t('advancedCharacterCombinations')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('learnToCombineCharacters')}</p>
              <Button className="mt-4">{t('startLesson')}</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('practiceQuiz')}</CardTitle>
              <CardDescription>{t('testYourKnowledge')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('quizDescription')}</p>
              <Button className="mt-4">{t('takeQuiz')}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

