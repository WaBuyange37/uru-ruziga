// components/learn/CharacterCard.tsx
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Lock, CheckCircle, Clock, Star, Volume2 } from 'lucide-react'
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
    audioUrl: string
  }
  progress?: {
    completed: boolean
    score: number
    timeSpent: number
    attempts: number
  }
  isLocked: boolean
  onStart: () => void
}

export function CharacterCard({ character, progress, isLocked, onStart }: CharacterCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const playPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = new Audio(character.audioUrl)
    setIsPlayingAudio(true)
    audio.play()
    audio.onended = () => setIsPlayingAudio(false)
  }

  const getStatusColor = () => {
    if (progress?.completed) return 'bg-green-100 text-green-700 border-green-300'
    if (progress) return 'bg-blue-100 text-blue-700 border-blue-300'
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  const getStatusText = () => {
    if (progress?.completed) return 'Completed'
    if (progress) return 'In Progress'
    return 'Not Started'
  }

  return (
    <Card className={`hover:shadow-xl transition-all duration-300 ${isLocked ? 'opacity-60' : 'hover:-translate-y-1'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Character Display */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-[#F3E5AB] to-[#D2691E] rounded-lg flex items-center justify-center">
              <span className="text-4xl font-umwero text-[#8B4513]">{character.umwero}</span>
            </div>
            
            <div>
              <CardTitle className="text-lg text-[#8B4513]">{character.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {character.vowel.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Level {character.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge className={`${getStatusColor()} border`}>
            {progress?.completed && <CheckCircle className="h-3 w-3 mr-1" />}
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Character Image */}
        <div className="relative w-full h-32 bg-gray-50 rounded-lg overflow-hidden">
          <Image
            src={character.imageUrl}
            alt={`${character.title} character`}
            fill
            className="object-contain p-2"
          />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{character.description}</p>

        {/* Pronunciation */}
        <div className="flex items-center justify-between bg-[#F3E5AB] p-3 rounded-lg">
          <div className="flex-1">
            <p className="text-xs text-[#8B4513] font-medium">Pronunciation</p>
            <p className="text-sm text-[#D2691E]">{character.pronunciation}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-[#8B4513] hover:bg-[#D2691E] hover:text-white"
            onClick={playPronunciation}
            disabled={isLocked}
          >
            <Volume2 className={`h-4 w-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
          </Button>
        </div>

        {/* Progress Info */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor(progress.timeSpent / 60)}m {progress.timeSpent % 60}s
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                {progress.score}%
              </span>
            </div>
            <Progress value={progress.completed ? 100 : 50} className="h-2" />
          </div>
        )}

        {/* Cultural Note Preview */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 font-medium mb-1">Cultural Significance</p>
          <p className="text-xs text-blue-700 line-clamp-2">{character.culturalNote}</p>
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white"
          onClick={onStart}
          disabled={isLocked}
        >
          {isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Complete Previous Lesson
            </>
          ) : progress?.completed ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Review Lesson
            </>
          ) : progress ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Continue Learning
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Lesson
            </>
          )}
        </Button>

        {/* Duration */}
        <div className="flex items-center justify-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          {character.duration} minutes
        </div>
      </CardContent>
    </Card>
  )
}
