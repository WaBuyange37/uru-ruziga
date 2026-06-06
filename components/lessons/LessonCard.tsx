// components/lessons/LessonCard.tsx
"use client"

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  CheckCircle, 
  Lock
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { LessonMetadata, LessonProgress } from '@/types/lesson-progress'

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
        <Badge className="bg-white text-black/65 border-[#8B4513]/25">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      )
    }
    if (progress?.completed) {
      return (
        <Badge className="bg-white text-[#8B4513] border-[#8B4513]/35">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    }
    if (progress && progress.attempts > 0) {
      return (
        <Badge className="bg-white text-[#8B4513] border-[#8B4513]/35">
          <Play className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      )
    }
    return (
      <Badge className="bg-white text-black/65 border-[#8B4513]/25">
        <Play className="h-3 w-3 mr-1" />
        Start
      </Badge>
    )
  }

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
          border-[#8B4513]/20 bg-white
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
              <div className="bg-[#8B4513] rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </div>
        )}

        <CardContent className="p-0">
          {/* Character Display */}
          <div className="relative h-24 bg-white flex items-center justify-center border-b border-[#8B4513]/10">
            {lesson.character && (
              <div className="text-5xl font-umwero text-[#8B4513]">
                {lesson.character.umwero}
              </div>
            )}
            
            {/* Difficulty Badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="bg-white/90">
                Level {lesson.difficulty}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-[#8B4513] text-lg line-clamp-1">
                  {lesson.title}
                </h3>
              </div>
              {getStatusBadge()}
            </div>

            {/* Action Button */}
            <Button
              className={`
                w-full
                ${isLocked 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : progress?.completed
                    ? 'bg-[#8B4513] hover:bg-[#A0522D]'
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
