// components/lessons/LessonProgressBar.tsx
"use client"

import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target, Trophy, Clock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import type { GlobalProgress } from '@/types/lesson-progress'

interface LessonProgressBarProps {
  globalProgress: GlobalProgress
  className?: string
}

export const LessonProgressBar = memo(function LessonProgressBar({
  globalProgress,
  className = ''
}: LessonProgressBarProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="bg-gradient-to-r from-[#F3E5AB] to-[#D2691E]/20 border-[#8B4513]/30 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#8B4513]" />
                <h3 className="font-semibold text-[#8B4513]">Your Learning Progress</h3>
              </div>
              <motion.div
                key={globalProgress.percentageComplete}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Badge className="bg-[#8B4513] text-white text-lg px-3 py-1">
                  {globalProgress.percentageComplete}%
                </Badge>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={globalProgress.percentageComplete} 
                className="h-3"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {globalProgress.completedLessons} of {globalProgress.totalLessons} lessons completed
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Completed */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 rounded-lg p-3 text-center"
              >
                <Trophy className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-600">
                  {globalProgress.completedLessons}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </motion.div>

              {/* In Progress */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 rounded-lg p-3 text-center"
              >
                <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-blue-600">
                  {globalProgress.inProgressLessons}
                </div>
                <div className="text-xs text-gray-600">In Progress</div>
              </motion.div>

              {/* Time Spent */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 rounded-lg p-3 text-center"
              >
                <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(globalProgress.totalTimeSpent)}
                </div>
                <div className="text-xs text-gray-600">Time Spent</div>
              </motion.div>

              {/* Average Score */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 rounded-lg p-3 text-center"
              >
                <Target className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-amber-600">
                  {globalProgress.averageScore}%
                </div>
                <div className="text-xs text-gray-600">Avg Score</div>
              </motion.div>
            </div>

            {/* Motivational Message */}
            {globalProgress.percentageComplete === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-100 border border-green-300 rounded-lg p-3 text-center"
              >
                <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">
                  🎉 Congratulations! You've completed all lessons!
                </p>
              </motion.div>
            )}

            {globalProgress.percentageComplete > 0 && globalProgress.percentageComplete < 100 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-blue-800 text-sm">
                  Keep going! You're {100 - globalProgress.percentageComplete}% away from mastering Umwero!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
