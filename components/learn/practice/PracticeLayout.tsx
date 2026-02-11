// components/learn/practice/PracticeLayout.tsx
"use client"

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PracticeLayoutProps {
  children: ReactNode
}

export function PracticeLayout({ children }: PracticeLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#F5F1E8] overflow-hidden"
    >
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        {children}
      </div>
    </motion.div>
  )
}
