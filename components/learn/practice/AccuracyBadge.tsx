// components/learn/practice/AccuracyBadge.tsx
"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react'
import type { ValidationResult } from '@/types/stroke-validation'

interface AccuracyBadgeProps {
  result: ValidationResult | null
  show: boolean
}

export function AccuracyBadge({ result, show }: AccuracyBadgeProps) {
  if (!result || !show) return null

  const getGradeConfig = () => {
    switch (result.grade) {
      case 'excellent':
        return {
          icon: Sparkles,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Excellent!'
        }
      case 'good':
        return {
          icon: CheckCircle2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Good!'
        }
      case 'acceptable':
        return {
          icon: CheckCircle2,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Acceptable'
        }
      case 'retry':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Try Again'
        }
    }
  }

  const config = getGradeConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`absolute top-4 right-4 ${config.bgColor} ${config.borderColor} border-2 rounded-lg shadow-lg p-4 min-w-[160px]`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${config.color}`} />
          <div>
            <div className={`font-bold ${config.color} text-lg`}>
              {result.accuracy}%
            </div>
            <div className={`text-sm ${config.color}`}>
              {config.label}
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          {result.feedback}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
