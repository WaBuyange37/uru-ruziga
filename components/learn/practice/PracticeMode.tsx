// components/learn/practice/PracticeMode.tsx
"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { PracticeLayout } from './PracticeLayout'
import { PracticeHeader } from './PracticeHeader'
import { PracticeCanvas, PracticeCanvasRef } from './PracticeCanvas'
import { PracticeControls } from './PracticeControls'
import { StrokeHint } from './StrokeHint'
import { Button } from '@/components/ui/button'
import { useStrokeValidation } from '@/hooks/useStrokeValidation'
import { useLessonProgress } from '@/hooks/useLessonProgress'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import type { Stroke } from '@/types/stroke-validation'

interface PracticeModeProps {
  lessonId: string
  character: string
  title: string
  referenceImageUrl?: string
  templateStrokes?: any[][]
  currentStep?: number
  totalSteps?: number
  onComplete: () => void
  onNext?: () => void
  onBack: () => void
}

export function PracticeMode({
  lessonId,
  character,
  title,
  referenceImageUrl,
  templateStrokes = [],
  currentStep = 1,
  totalSteps = 1,
  onComplete,
  onNext,
  onBack
}: PracticeModeProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [showGuide, setShowGuide] = useState(true)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [hasValidated, setHasValidated] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  const { completeLesson } = useLessonProgress()
  const { validationResult, validate, clearValidation } = useStrokeValidation({
    templateStrokes,
    passingThreshold: 70,
    useBasicValidation: templateStrokes.length === 0
  })

  // Handle stroke completion
  const handleStrokeComplete = useCallback((newStrokes: Stroke[]) => {
    setStrokes(newStrokes)
    setHasValidated(false)
    clearValidation()
  }, [clearValidation])

  // Validate drawing
  const handleValidate = useCallback(() => {
    if (strokes.length === 0) return

    const result = validate(strokes)
    setHasValidated(true)

    // Auto-complete if passed
    if (result.passed && !isCompleted) {
      setIsCompleted(true)
      setShowSuccessAnimation(true)
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Mark lesson as completed
      completeLesson(lessonId, result.accuracy)

      // Auto-advance after delay
      setTimeout(() => {
        if (onNext) {
          onNext()
        } else {
          onComplete()
        }
      }, 2000)
    }
  }, [strokes, validate, isCompleted, lessonId, completeLesson, onNext, onComplete])

  // Clear canvas
  const handleClear = useCallback(() => {
    const container = canvasContainerRef.current as any
    if (container?.clearCanvas) {
      container.clearCanvas()
    }
    setStrokes([])
    setHasValidated(false)
    clearValidation()
  }, [clearValidation])

  // Undo last stroke
  const handleUndo = useCallback(() => {
    const container = canvasContainerRef.current as any
    if (container?.undoStroke) {
      container.undoStroke()
      const newStrokes = container.getStrokes?.() || []
      setStrokes(newStrokes)
      setHasValidated(false)
      clearValidation()
    }
  }, [clearValidation])

  // Toggle guide visibility
  const handleToggleGuide = useCallback(() => {
    setShowGuide(prev => !prev)
  }, [])

  // Get hint based on current state
  const getHint = useCallback(() => {
    if (strokes.length === 0) {
      return "Trace the character following the guide. Take your time and be precise."
    }
    if (!hasValidated) {
      return "When you're ready, tap 'Check' to validate your drawing."
    }
    if (validationResult) {
      if (validationResult.grade === 'excellent') {
        return "Perfect! You've mastered this character."
      } else if (validationResult.grade === 'good') {
        return "Great work! You can continue to the next character."
      } else if (validationResult.grade === 'acceptable') {
        return "Good effort! You've passed. Keep practicing to improve."
      } else {
        return "Try again. Follow the guide more carefully and take your time."
      }
    }
    return ""
  }, [strokes, hasValidated, validationResult])

  return (
    <PracticeLayout>
      <PracticeHeader
        title={title}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
      />

      <StrokeHint hint={getHint()} show={true} />

      <div ref={canvasContainerRef}>
        <PracticeCanvas
          character={character}
          referenceImageUrl={referenceImageUrl}
          showGuide={showGuide}
          onStrokeComplete={handleStrokeComplete}
          validationResult={validationResult}
          disabled={isCompleted}
        />
      </div>

      <PracticeControls
        onUndo={handleUndo}
        onClear={handleClear}
        onToggleGuide={handleToggleGuide}
        showGuide={showGuide}
        canUndo={strokes.length > 0}
        disabled={isCompleted}
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {!isCompleted && (
          <Button
            size="lg"
            onClick={handleValidate}
            disabled={strokes.length === 0 || isCompleted}
            className="flex-1 max-w-xs bg-[#8B4513] hover:bg-[#A0522D] text-white gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            Check My Drawing
          </Button>
        )}

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 max-w-xs"
          >
            <Button
              size="lg"
              onClick={onNext || onComplete}
              className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {onNext ? (
                <>
                  Next Character
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Complete Lesson
                  <CheckCircle2 className="h-5 w-5" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/20 z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="bg-white rounded-full p-8 shadow-2xl"
            >
              <CheckCircle2 className="h-24 w-24 text-green-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PracticeLayout>
  )
}
