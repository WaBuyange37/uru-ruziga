// components/learn/EnhancedCharacterGrid.tsx
"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeOff, Trophy, Target } from 'lucide-react'
import CharacterCard from './CharacterCard'
import { useLearnQueue, Character } from '@/hooks/useLearnQueue'

interface EnhancedCharacterGridProps {
  characters: Character[]
  type: 'vowel' | 'consonant' | 'ligature'
  title: string
  description: string
  onStartLesson: (lessonId: string, type: 'vowel' | 'consonant' | 'ligature') => void
  language?: 'en' | 'rw'
}

export function EnhancedCharacterGrid({ 
  characters, 
  type, 
  title, 
  description, 
  onStartLesson,
  language = 'en'
}: EnhancedCharacterGridProps) {
  const { 
    learnState, 
    updateCharacterStatus, 
    getProgressStats, 
    showLearned, 
    setShowLearned,
    mounted,
    loading,
    refreshProgress
  } = useLearnQueue(characters, type)

  const stats = getProgressStats()

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const displayCharacters = showLearned ? learnState.learned : learnState.activeQueue

  return (
    <div className="space-y-6">
      {/* Header Card with Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                {type === 'vowel' ? '🌍' : type === 'consonant' ? '🎯' : '🧩'}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{title}</h3>
                <p className="text-blue-700">{description}</p>
              </div>
            </div>
            
            {/* Progress Stats */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-blue-800">
                  {stats.learned} / {stats.total} {language === 'rw' ? 'Byize' : 'Learned'}
                </span>
              </div>
              <Progress value={stats.percentage} className="w-32 h-2" />
            </div>
          </div>

          {/* Progress Details */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-blue-700">
                {stats.learned} {language === 'rw' ? 'Byize' : 'Learned'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-700">
                {stats.inProgress} {language === 'rw' ? 'Urakora' : 'In Progress'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-blue-700">
                {stats.notStarted} {language === 'rw' ? 'Ntabwo watangiye' : 'Not Started'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggle View Button */}
      {learnState.learned.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowLearned(!showLearned)}
            className="gap-2"
          >
            {showLearned ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showLearned 
              ? (language === 'rw' ? 'Reba ibyakozwe' : 'View Active Queue')
              : (language === 'rw' ? 'Reba ibyize' : 'View Learned Characters')
            }
            <Badge variant="secondary" className="ml-1">
              {showLearned ? learnState.activeQueue.length : learnState.learned.length}
            </Badge>
          </Button>
        </div>
      )}

      {/* Character Grid - 2 rows × 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {displayCharacters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            progress={learnState.progress[character.id] ? {
              completed: learnState.progress[character.id].status === 'LEARNED',
              score: learnState.progress[character.id].score,
              timeSpent: learnState.progress[character.id].timeSpent,
              attempts: learnState.progress[character.id].attempts,
              status: learnState.progress[character.id].status
            } : {
              completed: false,
              score: 0,
              timeSpent: 0,
              attempts: 0,
              status: 'NOT_STARTED'
            }}
            isLocked={false}
            onStart={() => onStartLesson(character.id, type)}
            onStatusChange={(status) => updateCharacterStatus(character.id, status)}
            language={language}
          />
        ))}
      </div>

      {/* Empty State */}
      {displayCharacters.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {showLearned 
                ? (language === 'rw' ? 'Nta kintu cyize' : 'No learned characters yet')
                : (language === 'rw' ? 'Byose byarangiye!' : 'All characters completed!')
              }
            </h3>
            <p className="text-gray-500">
              {showLearned
                ? (language === 'rw' ? 'Tangira kwiga kugira ngo ubone ibyakozwe hano' : 'Start learning to see completed characters here')
                : (language === 'rw' ? 'Wize byose muri iki cyiciro!' : 'You\'ve mastered all characters in this category!')
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Queue Info */}
      {!showLearned && learnState.remaining.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">
                {language === 'rw' 
                  ? `Hari ${learnState.remaining.length} inyuguti zisigaye mu murongo`
                  : `${learnState.remaining.length} more characters waiting in queue`
                }
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}