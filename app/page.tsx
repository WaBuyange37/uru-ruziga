'use client'

import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { CircleIcon, BookOpen, Calendar, Calculator, GamepadIcon, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from './contexts/AuthContext'

export default function Home() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3E5AB] to-[#FFFFFF]">
        <div className="container mx-auto text-center">
          <CircleIcon className="mx-auto h-24 w-24 mb-8 text-[#8B4513]" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[#8B4513]">
            {isAuthenticated ? t('welcomeBack', { name: user?.fullName }) : t('enterCircleOfKnowledge')}
          </h1>
          <p className="text-xl text-[#D2691E] mb-8">
            {t('whereEveryLetterTellsStory')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">{t('continueLearning')}</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/learn">{t('startLearning')}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    {t('logIn')}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#FFFFFF]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#8B4513]">{t('coreFeatures')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <BookOpen className="h-5 w-5" />
                  {t('learnUmwero')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t('interactiveLessons')}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calendar className="h-5 w-5" />
                  {t('calendar')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t('exploreAncientCalendar')}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <Calculator className="h-5 w-5" />
                  {t('tools')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t('accessTools')}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#F3E5AB] border-[#8B4513]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                  <GamepadIcon className="h-5 w-5" />
                  {t('gamesAndQuizzes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#D2691E]">{t('learnThroughGames')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

