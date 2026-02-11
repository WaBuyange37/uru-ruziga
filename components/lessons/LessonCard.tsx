// components/lessons/LessonCard.tsx
"use client"

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  Star,
  Volume2,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { LessonMetadata, LessonProgress } from '@/types/lesson-progress'
import Image from 'next/image'

interface LessonCardProps {
  lesson: LessonMetadata
  progress: LessonProgress | null
  isLocked: boolean
  onStart: () => void
  index: number
}

export const LessonCard = memo(function LessonCard({
  lesson,
  progress,
  isLocked,
  onStart,
  index
}: LessonCardProps) {
  const getStatusBadge = () => {
    if (isLocked) {
      return (
        <Badge className="bg-gray-200 text-gray-700 border-gray-300">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      )
    }
    if (progress?.completed) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    }
    if (progress && progress.attempts > 0) {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          <TrendingUp className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      )
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-300">
        <Play className="h-3 w-3 mr-1" />
        Start
      </Badge>
    )
  }

  const progressPercentage = progress 
    ? progress.completed 
      ? 100 
      : (progress.currentStep && progress.totalSteps) 
        ? (progress.currentStep / progress.totalSteps) * 100 
        : 30
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={!isLocked ? { y: -4, transition: { duration: 0.2 } } : {}}
    >
      <Card 
        className={`
          relative overflow-hidden transition-all duration-300
          ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
          ${progress?.completed ? 'border-green-300 bg-green-50/30' : 'border-[#D2691E]/30'}
        `}
        onClick={!isLocked ? onStart : undefined}
      >
        {/* Completion Overlay */}
        {progress?.completed && (
          <div className="absolute top-2 right-2 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="bg-green-500 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </div>
        )}

        <CardContent className="p-0">
          {/* Character Display */}
          <div className="relative h-32 bg-gradient-to-br from-[#F3E5AB] to-[#D2691E]/20 flex items-center justify-center">
            {lesson.character && (
              <div className="text-6xl font-umwero text-[#8B4513]">
                {lesson.character.umwero}
              </div>
            )}
            
            {/* Difficulty Badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="bg-white/90">
                Level {lesson.difficulty}
              </Badge>
            </div>

            {/* Audio Button */}
            {lesson.character && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute bottom-2 right-2 bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation()
                  const audio = new Audio(`/UmweroLetaByLeta/${lesson.character!.latin.toLowerCase()}/${lesson.character!.latin}.mp3`)
                  audio.play()
                }}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-[#8B4513] text-lg line-clamp-1">
                  {lesson.title}
                </h3>
                {lesson.character && (
                  <p className="text-sm text-[#D2691E] mt-1">
                    {lesson.character.latin.toUpperCase()} - {lesson.character.pronunciation}
                  </p>
                )}
              </div>
              {getStatusBadge()}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2">
              {lesson.description}
            </p>

            {/* Progress Bar */}
            {progress && progressPercentage > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Stats */}
            {progress && (
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {progress.score > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span>{progress.score}%</span>
                  </div>
                )}
                {progress.timeSpent > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{Math.floor(progress.timeSpent / 60)}m</span>
                  </div>
                )}
                {progress.attempts > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{progress.attempts} {progress.attempts === 1 ? 'attempt' : 'attempts'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button
              className={`
                w-full
                ${isLocked 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : progress?.completed
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#8B4513] hover:bg-[#A0522D]'
                }
              `}
              disabled={isLocked}
              onClick={(e) => {
                e.stopPropagation()
                onStart()
              }}
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Complete Prerequisites
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
              {lesson.duration} minutes
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
