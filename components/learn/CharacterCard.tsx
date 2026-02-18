// components/learn/CharacterCard.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Lock, CheckCircle, Clock, Star, Keyboard } from 'lucide-react'
import Image from 'next/image'
import { AudioPlayer } from './AudioPlayer'
import { getAudioPath, getUmweroAscii } from '@/lib/audio-utils'

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
  // Get audio path from our mapping system
  const audioPath = getAudioPath(character.vowel) || character.audioUrl
  
  // Get Umwero ASCII representation
  const umweroAscii = getUmweroAscii(character.vowel)
  
  // Get the latin character for keyboard mapping
  const latinChar = character.vowel.toLowerCase()

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
            {/* Umwero Character Display - Large and Bold */}
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#F3E5AB] to-[#D2691E] rounded-xl flex items-center justify-center border-2 border-[#8B4513]">
              <span 
                className="text-5xl font-bold text-[#8B4513]" 
                style={{ fontFamily: 'UMWEROalpha, Umwero, monospace' }}
              >
                {umweroAscii}
              </span>
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

        {/* Keyboard Mapping */}
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex-1">
            <p className="text-xs text-blue-700 font-medium mb-1">Keyboard Mapping</p>
            <div className="flex items-center gap-2">
              <span 
                className="text-2xl font-bold text-blue-800"
                style={{ fontFamily: 'UMWEROalpha, Umwero, monospace' }}
              >
                {umweroAscii}
              </span>
              <span className="text-blue-600">=</span>
              <div className="bg-white border border-blue-300 rounded px-2 py-1">
                <span className="text-sm font-mono text-blue-800">{latinChar}</span>
              </div>
              <span className="text-blue-600">=</span>
              <div className="bg-white border border-blue-300 rounded px-2 py-1">
                <span className="text-sm font-mono text-blue-800">ASCII {latinChar.charCodeAt(0)}</span>
              </div>
            </div>
          </div>
          <Keyboard className="h-5 w-5 text-blue-600" />
        </div>

        {/* Pronunciation with Audio */}
        <div className="flex items-center justify-between bg-[#F3E5AB] p-3 rounded-lg">
          <div className="flex-1">
            <p className="text-xs text-[#8B4513] font-medium">Pronunciation</p>
            <p className="text-sm text-[#D2691E]">{character.pronunciation}</p>
          </div>
          {audioPath && (
            <AudioPlayer
              src={audioPath}
              label="Hear Pronunciation"
              size="md"
              variant="ghost"
              className="text-[#8B4513] hover:bg-[#D2691E] hover:text-white"
            />
          )}
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
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800 font-medium mb-1">Cultural Significance</p>
          <p className="text-xs text-amber-700 line-clamp-2">{character.culturalNote}</p>
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
