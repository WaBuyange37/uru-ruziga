"use client"

import { Metadata } from 'next'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import Link from 'next/link'
import { useTranslation } from '../../hooks/useTranslation'

export const metadata: Metadata = {
  title: 'About Uruziga - The Umwero Movement',
  description: 'Learn about the Umwero Movement and our mission to preserve Kinyarwanda culture and language.',
}

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFFFF]">
      <h1 className="text-4xl font-bold mb-6 text-center text-[#8B4513]">{t('umweroMovement')}: {t('culturalRenaissance')}</h1>
      
      <Card className="mb-8 bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">{t('ourMission')}</CardTitle>
          <CardDescription className="text-[#D2691E]">{t('preservingKinyarwandaCulture')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-[#8B4513]">
            {t('umweroMovementDescription')}
          </p>
          <p className="mb-4 text-[#8B4513]">
            {t('umweroAlphabetDescription')}
          </p>
          <blockquote className="border-l-4 border-[#8B4513] pl-4 italic my-4 text-[#D2691E]">
            {t('umweroQuote')}
          </blockquote>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">{t('ourVision')}</CardTitle>
          <CardDescription className="text-[#D2691E]">{t('buildingCulturalSchool')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-[#8B4513]">
            {t('visionDescription')}
          </p>
          <p className="mb-4 text-[#8B4513]">
            {t('schoolDescription')}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513]">{t('joinMovement')}</CardTitle>
          <CardDescription className="text-[#D2691E]">{t('bePartOfRenaissance')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-[#8B4513]">
            {t('movementParticipationDescription')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild>
              <Link href="/learn">{t('startLearningUmwero')}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/fund">{t('supportOurMission')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

