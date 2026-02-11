// components/learn/practice/StrokeHint.tsx
"use client"

import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

interface StrokeHintProps {
  hint: string
  show: boolean
}

export function StrokeHint({ hint, show }: StrokeHintProps) {
  if (!show || !hint) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-800 text-sm mb-1">Hint</h4>
          <p className="text-blue-700 text-sm leading-relaxed">{hint}</p>
        </div>
      </div>
    </motion.div>
  )
}
