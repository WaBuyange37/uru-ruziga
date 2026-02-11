// components/lessons/LessonCanvas.tsx
"use client"

import { memo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Eraser, 
  RotateCcw, 
  Check, 
  X as XIcon,
  Sparkles,
  Volume2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing'
import Image from 'next/image'

interface LessonCanvasProps {
  character: {
    umwero: string
    latin: string
    pronunciation: string
    meaning: string
  }
  imageUrl: string
  audioUrl: string
  onComplete: (score: number) => void
  onSkip?: () => void
}

export const LessonCanvas = memo(function LessonCanvas({
  character,
  imageUrl,
  audioUrl,
  onComplete,
  onSkip
}: LessonCanvasProps) {
  const [showReference, setShowReference] = useState(true)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [score, setScore] = useState(100)

  const {
    canvasRef,
    isDrawing,
    strokes,
    clearCanvas,
    undoStroke,
    getCanvasDataURL
  } = useCanvasDrawing({
    strokeColor: '#8B4513',
    strokeWidth: 4,
    backgroundColor: '#FFFFFF',
    onStrokeComplete: () => {
      // Auto-hide reference after first stroke
      if (strokes.length === 0) {
        setShowReference(false)
      }
    }
  })

  const playPronunciation = () => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  const handleCheck = () => {
    if (strokes.length === 0) {
      return
    }

    setAttempts(prev => prev + 1)
    
    // Simple validation: if user drew something, give positive feedback
    // In production, this would use AI comparison
    const hasEnoughStrokes = strokes.length >= 2
    
    if (hasEnoughStrokes) {
      setFeedback('correct')
      const finalScore = Math.max(50, score - (attempts * 10))
      setTimeout(() => {
        onComplete(finalScore)
      }, 2000)
    } else {
      setFeedback('incorrect')
      setScore(prev => Math.max(50, prev - 10))
      setTimeout(() => {
        setFeedback(null)
      }, 2000)
    }
  }

  const handleClear = () => {
    clearCanvas()
    setFeedback(null)
    setShowReference(true)
  }

  useEffect(() => {
    // Play pronunciation on mount
    playPronunciation()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] via-[#FFFFFF] to-[#F3E5AB] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#8B4513]">
            Practice Writing
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="text-6xl font-umwero text-[#8B4513]">
              {character.umwero}
            </div>
            <div className="text-left">
              <p className="text-xl font-semibold text-[#D2691E]">
                {character.latin.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">{character.pronunciation}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={playPronunciation}
            className="gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Listen Again
          </Button>
        </motion.div>

        {/* Main Canvas Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-white shadow-2xl">
            <div className="space-y-4">
              {/* Instructions */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {showReference ? 'Trace the character below' : 'Draw the character from memory'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Attempt {attempts + 1}
                  </Badge>
                  <Badge className="bg-[#8B4513] text-white">
                    Score: {score}%
                  </Badge>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="relative">
                {/* Reference Image Overlay */}
                <AnimatePresence>
                  {showReference && (
                    <motion.div
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 pointer-events-none"
                    >
                      <Image
                        src={imageUrl}
                        alt={`${character.latin} reference`}
                        fill
                        className="object-contain p-4"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Drawing Canvas */}
                <div className="relative bg-white border-4 border-[#D2691E] rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full touch-none"
                    style={{ 
                      height: '400px',
                      cursor: isDrawing ? 'crosshair' : 'pointer'
                    }}
                  />
                  
                  {/* Drawing Indicator */}
                  {isDrawing && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-500 animate-pulse">
                        Drawing...
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Feedback Overlay */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
                    >
                      {feedback === 'correct' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          className="bg-green-500 rounded-full p-8"
                        >
                          <Check className="h-16 w-16 text-white" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          className="bg-red-500 rounded-full p-8"
                        >
                          <XIcon className="h-16 w-16 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowReference(!showReference)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {showReference ? 'Hide' : 'Show'} Reference
                </Button>
                
                <Button
                  variant="outline"
                  onClick={undoStroke}
                  disabled={strokes.length === 0}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Undo
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="gap-2"
                >
                  <Eraser className="h-4 w-4" />
                  Clear
                </Button>

                <Button
                  onClick={handleCheck}
                  disabled={strokes.length === 0 || feedback !== null}
                  className="gap-2 bg-[#8B4513] hover:bg-[#A0522D]"
                >
                  <Check className="h-4 w-4" />
                  Check My Drawing
                </Button>

                {onSkip && (
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="gap-2"
                  >
                    Skip for Now
                  </Button>
                )}
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> {character.meaning}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
})
