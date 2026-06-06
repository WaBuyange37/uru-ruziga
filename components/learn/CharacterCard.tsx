// components/learn/CharacterCard.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Lock, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface CharacterCardProps {
  character: {
    id: string
    vowel: string
    umwero: string
    title: string
    description: string
    pronunciation: string
    meaning: string
    culturalNote: string
    duration: number
    difficulty: number
    order: number
    imageUrl: string
    audioUrl?: string
    examples: string[]
  }
  progress?: {
    completed: boolean
    score: number
    timeSpent: number
    attempts: number
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'LEARNED'
  }
  isLocked: boolean
  onStart: () => void
  onStatusChange?: (status: 'LEARNED') => void
  language?: 'en' | 'rw'
}

function CharacterCard({ character, progress, isLocked, onStart, onStatusChange, language = 'en' }: CharacterCardProps) {
  // Use the umwero character directly from the database (already correct from UMWERO_MAP)
  const umweroAscii = character.umwero

  const getStatusColor = () => {
    if (progress?.status === 'LEARNED') return 'bg-white text-[#8B4513] border-[#8B4513]/35'
    if (progress?.status === 'IN_PROGRESS') return 'bg-white text-[#8B4513] border-[#8B4513]/35'
    return 'bg-white text-black/65 border-[#8B4513]/25'
  }

  const getStatusText = () => {
    if (progress?.status === 'LEARNED') return language === 'rw' ? 'Yizwe' : 'Learned'
    if (progress?.status === 'IN_PROGRESS') return language === 'rw' ? 'Urakora' : 'In Progress'
    return language === 'rw' ? 'Ntabwo watangiye' : 'Not Started'
  }

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 ${isLocked ? 'opacity-60' : 'hover:-translate-y-1'} w-full`}>
      <CardHeader className="pb-3 p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Umwero Character Display - Responsive sizing */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl flex items-center justify-center border-2 border-[#8B4513]">
              <span 
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#8B4513]" 
                style={{ fontFamily: 'UMWEROalpha, Umwero, monospace' }}
              >
                {umweroAscii}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base md:text-lg text-[#8B4513] truncate">{character.title}</CardTitle>
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {character.vowel.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Level {character.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status Badge - Responsive */}
          <Badge className={`${getStatusColor()} border text-xs flex-shrink-0`}>
            {progress?.completed && <CheckCircle className="h-3 w-3 mr-1" />}
            <span className="hidden sm:inline">{getStatusText()}</span>
            <span className="sm:hidden">{progress?.completed ? '✓' : progress?.status === 'IN_PROGRESS' ? '...' : '○'}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3 sm:p-4 md:p-5 pt-0">
        {/* Character Image - Responsive height */}
        <div className="relative w-full h-20 sm:h-24 bg-white rounded-lg overflow-hidden border border-[#8B4513]/15">
          {character.imageUrl ? (
            <Image
              src={character.imageUrl}
              alt={`${character.title} character`}
              fill
              className="object-contain p-2"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span 
                className="text-4xl sm:text-6xl text-[#8B4513] opacity-30"
                style={{ fontFamily: 'UMWEROalpha, Umwero, monospace' }}
              >
                {umweroAscii}
              </span>
            </div>
          )}
        </div>

        {/* Action Button - Mobile optimized */}
        <Button
          className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white text-sm sm:text-base py-2 sm:py-3"
          onClick={onStart}
          disabled={isLocked}
        >
          {isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{language === 'rw' ? 'Rangiza isomo ribanziriza' : 'Complete Previous Lesson'}</span>
              <span className="sm:hidden">{language === 'rw' ? 'Rangiza' : 'Locked'}</span>
            </>
          ) : progress?.status === 'LEARNED' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{language === 'rw' ? 'Subiramo isomo' : 'Review Lesson'}</span>
              <span className="sm:hidden">{language === 'rw' ? 'Subiramo' : 'Review'}</span>
            </>
          ) : progress?.status === 'IN_PROGRESS' ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{language === 'rw' ? 'Komeza kwiga' : 'Continue Learning'}</span>
              <span className="sm:hidden">{language === 'rw' ? 'Komeza' : 'Continue'}</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{language === 'rw' ? 'Tangira isomo' : 'Start Lesson'}</span>
              <span className="sm:hidden">{language === 'rw' ? 'Tangira' : 'Start'}</span>
            </>
          )}
        </Button>

      </CardContent>
    </Card>
  )
}

export default CharacterCard
