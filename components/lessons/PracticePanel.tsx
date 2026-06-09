'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCcw, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing'
import { PhotoUploadModal } from './PhotoUploadModal'
import { celebrateCharacterLearned } from '@/lib/character-progression'
import { emitProgressUpdate } from '@/lib/progress-events'
import { lessonIdToCharacterId } from '@/lib/character-mapping'
import Image from 'next/image'
import type { PracticeMode } from '@/hooks/useLessonState'

interface PracticePanelProps {
  lesson: any
  character: {
    id: string
    umwero: string
    vowel?: string
    consonant?: string
    strokeImageUrl?: string
  }
  practiceMode: PracticeMode
  onModeChange: (mode: PracticeMode) => void
  onNextCharacter?: (nextCharacterId: string) => void
}

export function PracticePanel({ lesson, character, practiceMode, onModeChange }: PracticePanelProps) {
  const [showReference, setShowReference] = useState(true)
  const [evaluationResult, setEvaluationResult] = useState<any>(null)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const {
    canvasRef,
    isDrawing,
    strokes,
    clearCanvas,
    undoStroke,
    exportDrawingData
  } = useCanvasDrawing({
    strokeColor: '#8B4513',
    strokeWidth: 4,
    backgroundColor: '#FFFFFF'
  })

  const handleEvaluate = async () => {
    const drawingData = exportDrawingData()
    if (!drawingData) return

    onModeChange('evaluating')
    setSubmissionError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Please sign in before submitting your writing attempt.')
      }

      const resolvedCharacterId = lessonIdToCharacterId(character.id || lesson.id)
      const response = await fetch('/api/learning/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          characterId: resolvedCharacterId,
          lessonId: lesson.id,
          imageData: drawingData.imageDataURL,
          strokes: drawingData.strokes,
          learningStage: 'TRACING',
          journeyPhase: 'TRACE',
          metadata: {
            ...drawingData.metadata,
            normalized: drawingData.normalized,
          },
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Python OCR evaluation failed.')
      }

      if (data.success && data.evaluation?.score !== undefined && data.attempt?.saved) {
        const evaluation = {
          score: data.evaluation.score,
          scoreSource: data.evaluation.scoreSource,
          confidence: data.evaluation.confidence,
          ocrFeedbackAvailable: Boolean(data.evaluation.ocrFeedbackAvailable),
          fallback: Boolean(data.evaluation.fallback),
          statusLabel: data.evaluation.statusLabel,
          strengths: data.evaluation.strengths ?? [],
          improvements: data.evaluation.practiceAreas ?? data.evaluation.weaknesses ?? [],
          feedback: (data.evaluation.feedback ?? []).join(' ') || 'Practice saved.',
          passed: Boolean(data.evaluation.passed),
        }
        setEvaluationResult(evaluation)
        setCurrentAttemptId(data.attempt.userAttemptId ?? null)

        onModeChange('complete')
      } else {
        throw new Error('Python OCR did not return a saved evaluation.')
      }
    } catch (error) {
      console.error('Python OCR submission error:', error)
      setEvaluationResult(null)
      setSubmissionError(error instanceof Error ? error.message : 'Python OCR evaluation failed.')
      onModeChange('drawing')
    }
  }

  const handleRetry = () => {
    clearCanvas()
    setEvaluationResult(null)
    setSubmissionError(null)
    onModeChange('drawing')
  }

  const handleNext = async () => {
    if (!currentAttemptId || isSubmitting) return

    setIsSubmitting(true)

    try {
      // The learning-attempt endpoint already saved the attempt, OCR result,
      // and character progress before this button became available.
      const actualCharacterId = lessonIdToCharacterId(character.id)

      console.log('🚀 Starting progress submission:', {
        originalId: character.id,
        actualCharacterId: actualCharacterId,
        score: evaluationResult.score,
        scoreSource: evaluationResult.scoreSource,
        character: character
      })

      const characterType = character.vowel ? 'vowel' : character.consonant ? 'consonant' : 'ligature'
      const numericScore = typeof evaluationResult.score === 'number' ? evaluationResult.score : 0
      emitProgressUpdate(
        actualCharacterId,
        evaluationResult.ocrFeedbackAvailable && numericScore >= 70 ? 'LEARNED' : 'IN_PROGRESS',
        numericScore,
        characterType as 'vowel' | 'consonant' | 'ligature'
      )

      if (evaluationResult.ocrFeedbackAvailable && numericScore >= 70) {
        celebrateCharacterLearned(
          character.vowel || character.consonant || 'Character',
          numericScore
        )
      }

    } catch (error) {
      console.error('❌ Unexpected error in character progression:', error)

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Network error: Please check your internet connection and try again.')
      } else {
        alert('An unexpected error occurred. Please try again or refresh the page.')
      }

    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = async (imageFile: File) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not authenticated')

    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('lessonId', lesson.id)
    formData.append('characterId', character.id)
    formData.append('stepId', 'photo-upload')
    if (currentAttemptId) {
      formData.append('relatedAttemptId', currentAttemptId)
    }

    const response = await fetch('/api/drawings/upload-photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }

  return (
    <div className="space-y-4">
      <Card className="border border-[#8B4513]/30 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-6">
          {/* Practice Header */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-black">Write this character</h3>
              <p className="mt-1 text-sm text-black/65">Draw on the canvas, then submit for feedback.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReference(!showReference)}
                className="gap-2 text-[#8B4513] hover:bg-white"
              >
                {showReference ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showReference ? 'Hide' : 'Show'} Guide
              </Button>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="relative mb-4 overflow-hidden rounded-lg border border-[#8B4513]/35 bg-white touch-none">
            {/* Reference Character (Ghost Guide) */}
            {showReference && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-10"
                style={{ fontFamily: "'UMWEROalpha', serif" }}
              >
                <div className="text-[280px] leading-none">
                  {character.umwero}
                </div>
              </div>
            )}

            {/* Drawing Canvas */}
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="w-full cursor-crosshair touch-none select-none"
              style={{
                maxHeight: '400px',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>

          {/* Canvas Controls */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button
              onClick={undoStroke}
              variant="outline"
              disabled={strokes.length === 0}
              className="flex-1"
            >
              Undo
            </Button>
            <Button
              onClick={clearCanvas}
              variant="outline"
              className="flex-1 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>

          {/* Evaluation Button */}
          {practiceMode !== 'evaluating' && practiceMode !== 'complete' && (
            <Button
              onClick={handleEvaluate}
              disabled={strokes.length === 0}
              className="w-full gap-2 bg-[#8B4513] hover:bg-[#A0522D]"
              size="lg"
            >
              <CheckCircle2 className="h-5 w-5" />
              Submit writing
            </Button>
          )}

          {/* Evaluating State */}
          {practiceMode === 'evaluating' && (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
              <p className="text-[#8B4513]">Checking your writing...</p>
            </div>
          )}

          {submissionError && (
            <div className="rounded-lg border border-black bg-white p-4 text-sm text-black">
              {submissionError}
            </div>
          )}

          {/* Evaluation Results */}
          {practiceMode === 'complete' && evaluationResult && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#8B4513]/25 bg-white p-4">
                <div className="text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8B4513]">Practice saved</p>
                  {evaluationResult.ocrFeedbackAvailable && typeof evaluationResult.score === 'number' ? (
                    <h3 className="mb-2 mt-2 text-xl font-bold text-[#8B4513]">
                      OCR Score: {Math.round(evaluationResult.score)}%
                    </h3>
                  ) : (
                    <h3 className="mb-2 mt-2 text-xl font-bold text-[#8B4513]">
                      Practice Recorded
                    </h3>
                  )}
                </div>

                <div className="my-3 rounded-lg border border-[#8B4513]/15 bg-white p-3 text-left">
                  <h4 className="mb-1 font-semibold text-black">
                    {evaluationResult.ocrFeedbackAvailable ? 'OCR feedback available' : 'OCR feedback pending'}
                  </h4>
                  <p className="text-sm text-black/70">
                    {evaluationResult.ocrFeedbackAvailable
                      ? 'Detailed handwriting feedback was saved with this attempt.'
                      : 'Your drawing was saved for practice history and future OCR training.'}
                  </p>
                </div>

                <p className="mb-3 text-center text-black/75">
                  {evaluationResult.feedback}
                </p>

                {/* Strengths */}
                {evaluationResult.strengths && evaluationResult.strengths.length > 0 && (
                  <div className="mt-3 rounded-lg border border-[#8B4513]/15 bg-white p-3 text-left">
                    <h4 className="mb-2 font-semibold text-black">What you did well</h4>
                    <ul className="space-y-1 text-sm text-black/70">
                      {evaluationResult.strengths.map((strength: string, idx: number) => (
                        <li key={idx}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {evaluationResult.improvements && evaluationResult.improvements.length > 0 && (
                  <div className="mt-3 rounded-lg border border-[#8B4513]/15 bg-white p-3 text-left">
                    <h4 className="mb-2 font-semibold text-black">Areas to improve</h4>
                    <ul className="space-y-1 text-sm text-black/70">
                      {evaluationResult.improvements.map((improvement: string, idx: number) => (
                        <li key={idx}>• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-[#8B4513] hover:bg-[#A0522D] gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Continuing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Continue
                    </>
                  )}
                </Button>
              </div>

              {/* Photo Upload Prompt */}
              <div className="mt-4 rounded-lg border border-[#8B4513]/20 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold text-black">
                      Help improve handwriting recognition
                    </h4>
                    <p className="mb-3 text-sm text-black/65">
                      Upload a photo of your pen-written version to contribute to our training dataset!
                    </p>
                    <Button
                      onClick={() => setShowPhotoUpload(true)}
                      variant="outline"
                      size="sm"
                    >
                      Upload Real Handwriting
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stroke Direction Reference Below Canvas */}
      {character.strokeImageUrl && (
        <Card className="border border-[#8B4513]/20 bg-white">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-semibold text-black">Stroke direction reference</p>
            <div className="relative w-full aspect-square bg-white rounded overflow-hidden">
              <Image
                src={character.strokeImageUrl}
                alt="Stroke direction guide"
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onUpload={handlePhotoUpload}
        characterName={character.vowel || character.consonant || 'character'}
      />
    </div>
  )
}
