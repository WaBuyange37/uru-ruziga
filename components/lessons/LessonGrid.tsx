// components/lessons/LessonGrid.tsx
"use client"

import { memo } from 'react'
import { LessonCard } from './LessonCard'
import type { LessonMetadata, LessonProgress } from '@/types/lesson-progress'
import { motion } from 'framer-motion'

interface LessonGridProps {
  lessons: LessonMetadata[]
  progressState: Record<string, LessonProgress>
  onStartLesson: (lessonId: string) => void
  isLessonLocked: (lessonId: string, prerequisites: string[]) => boolean
}

export const LessonGrid = memo(function LessonGrid({
  lessons,
  progressState,
  onStartLesson,
  isLessonLocked
}: LessonGridProps) {
  if (lessons.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-gray-500 text-lg">No lessons available yet.</p>
        <p className="text-gray-400 text-sm mt-2">Check back soon for new content!</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson, index) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          progress={progressState[lesson.id] || null}
          isLocked={isLessonLocked(lesson.id, lesson.prerequisites)}
          onStart={() => onStartLesson(lesson.id)}
          index={index}
        />
      ))}
    </div>
  )
})
