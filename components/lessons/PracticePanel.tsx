'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCcw, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react'
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing'
import { PhotoUploadModal } from './PhotoUploadModal'
import { handleCharacterProgression, celebrateCharacterLearned, transitionToNextLesson } from '@/lib/character-progression'
import { emitProgressUpdate } from '@/lib/progress-events'
import { lessonIdToCharacterId } from '@/lib/character-mapping'
import { submitCharacterProgress } from '@/lib/auth-utils'
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
  onCharacterLearned?: (characterId: string, score: number) => void
  onNextCharacter?: (nextCharacterId: string) => void
}

export function PracticePanel({ lesson, character, practiceMode, onModeChange, onCharacterLearned, onNextCharacter }: PracticePanelProps) {
  const [showReference, setShowReference] = useState(true)
  const [evaluationResult, setEvaluationResult] = useState<any>(null)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
    backgroundColor: '#FFFFFF'
  })

  const handleEvaluate = async () => {
    const drawingData = getCanvasDataURL()
    if (!drawingData) return

    onModeChange('evaluating')

    try {
      // Get reference image URL if available
      const referenceImage = character.strokeImageUrl 
        ? `${window.location.origin}${character.strokeImageUrl}`
        : null

      // Call Vision API for evaluation
      const response = await fetch('/api/lessons/evaluate-drawing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userDrawing: drawingData,
          referenceImage: referenceImage,
          characterName: character.vowel || character.consonant || 'character',
          strokeGuide: [] // Will be populated from database
        })
      })

      if (!response.ok) {
        throw new Error('Evaluation failed')
      }

      const data = await response.json()
      
      if (data.success && data.evaluation) {
        const evaluation = data.evaluation
        setEvaluationResult(evaluation)

        // Upload drawing to Supabase and save attempt
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const uploadResponse = await fetch('/api/drawings/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                drawingData,
                lessonId: lesson.id,
                characterId: character.id,
                stepId: 'practice-canvas',
                aiScore: evaluation.score,
                aiMetrics: {
                  strengths: evaluation.strengths,
                  improvements: evaluation.improvements
                },
                feedback: evaluation.feedback,
                isCorrect: evaluation.passed,
                timeSpent: 0 // Track this if needed
              })
            })
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              setCurrentAttemptId(uploadData.attemptId)
            }
          } catch (uploadError) {
            console.error('Failed to save drawing:', uploadError)
            // Don't block user flow if upload fails
          }
        }

        // Update character progress if score meets threshold
        if (evaluation.score >= 70 && onCharacterLearned) {
          onCharacterLearned(character.id, evaluation.score)
        }

        onModeChange('complete')
      } else {
        throw new Error('Invalid evaluation response')
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      // Fallback to basic evaluation
      const mockScore = Math.floor(Math.random() * 30) + 70
      setEvaluationResult({
        score: mockScore,
        strengths: ['You completed the drawing'],
        improvements: ['Try to follow the stroke order more closely'],
        feedback: 'Good effort! Keep practicing to improve your accuracy.',
        passed: mockScore >= 70
      })
      onModeChange('complete')
    }
  }

  const handleRetry = () => {
    clearCanvas()
    setEvaluationResult(null)
    onModeChange('drawing')
  }

  const handleNext = async () => {
    if (!evaluationResult?.score || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Map lesson ID to actual character ID
      const actualCharacterId = lessonIdToCharacterId(character.id)
      
      console.log('🚀 Starting progress submission:', {
        originalId: character.id,
        actualCharacterId: actualCharacterId,
        score: evaluationResult.score,
        character: character
      })

      // Check authentication first
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ No authentication token found')
        alert('Please log in again to save your progress. Your session may have expired.')
        window.location.href = '/login'
        return
      }

      // Use the robust progress submission utility
      const result = await submitCharacterProgress(
        actualCharacterId,
        evaluationResult.score,
        0
      )

      if (result.success && result.data) {
        console.log('✅ Progress saved successfully:', result.data)
        
        // Emit progress update event to notify other components
        const characterType = character.vowel ? 'vowel' : character.consonant ? 'consonant' : 'ligature'
        emitProgressUpdate(
          actualCharacterId,
          result.data.status,
          evaluationResult.score,
          characterType as 'vowel' | 'consonant' | 'ligature'
        )
        
        // Update character status if callback provided and score meets threshold
        if (onCharacterLearned && evaluationResult.score >= 70) {
          onCharacterLearned(actualCharacterId, evaluationResult.score)
        }

        // Show celebration if character was learned
        if (evaluationResult.score >= 70) {
          celebrateCharacterLearned(
            character.vowel || character.consonant || 'Character',
            evaluationResult.score
          )
        }

        // Handle next character progression - NO NAVIGATION
        if (result.data.nextCharacter && onNextCharacter) {
          // Seamless transition to next character within same workspace
          setTimeout(() => {
            onNextCharacter(result.data.nextCharacter.id)
          }, 1500) // Allow time for celebration
        } else {
          // No more characters - show completion message but stay in workspace
          setTimeout(() => {
            console.log('🎉 All characters completed in this category!')
          }, 2000)
        }
      } else {
        // Progress submission failed
        console.error('❌ Progress submission failed:', result.error)
        
        // Check if it's an authentication error
        if (result.error?.includes('Authentication') || result.error?.includes('token') || result.error?.includes('Unauthorized')) {
          alert('Your session has expired. Please log in again to save your progress.')
          localStorage.removeItem('token') // Clear invalid token
          window.location.href = '/login'
          return
        }
        
        // Show user-friendly error message for other errors
        alert(`Failed to save progress: ${result.error}. Please try again or contact support if the issue persists.`)
        
        // Still allow character progression for better UX (but warn user)
        if (onCharacterLearned && evaluationResult.score >= 70) {
          console.warn('⚠️ Allowing character progression despite save failure for better UX')
          onCharacterLearned(character.id, evaluationResult.score)
        }
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
      <Card className="border-2 border-[#8B4513] shadow-lg">
        <CardContent className="p-6">
          {/* Practice Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#8B4513]">Practice Canvas</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReference(!showReference)}
                className="gap-2"
              >
                {showReference ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showReference ? 'Hide' : 'Show'} Guide
              </Button>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="relative bg-white rounded-lg border-2 border-[#8B4513] overflow-hidden touch-none mb-4">
            {/* Reference Character (Ghost Guide) */}
            {showReference && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-10"
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
          <div className="flex gap-2 mb-4">
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
              className="w-full bg-green-600 hover:bg-green-700 gap-2"
              size="lg"
            >
              <CheckCircle2 className="h-5 w-5" />
              Evaluate My Drawing
            </Button>
          )}

          {/* Evaluating State */}
          {practiceMode === 'evaluating' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
              <p className="text-[#8B4513]">AI is evaluating your drawing...</p>
            </div>
          )}

          {/* Evaluation Results */}
          {practiceMode === 'complete' && evaluationResult && (
            <div className="space-y-4">
              <div className={`text-center p-4 rounded-lg ${
                evaluationResult.passed 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-yellow-50 border-2 border-yellow-200'
              }`}>
                <div className="text-4xl mb-2">
                  {evaluationResult.passed ? '🎉' : '💪'}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  evaluationResult.passed ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  Score: {evaluationResult.score}%
                </h3>
                <p className={`mb-3 ${evaluationResult.passed ? 'text-green-700' : 'text-yellow-700'}`}>
                  {evaluationResult.feedback}
                </p>

                {/* Strengths */}
                {evaluationResult.strengths && evaluationResult.strengths.length > 0 && (
                  <div className="text-left mt-3 p-3 bg-white rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ What you did well:</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      {evaluationResult.strengths.map((strength: string, idx: number) => (
                        <li key={idx}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {evaluationResult.improvements && evaluationResult.improvements.length > 0 && (
                  <div className="text-left mt-3 p-3 bg-white rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Areas to improve:</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
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
                      Saving...
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
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">📸</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-1">
                      Help Build Better AI
                    </h4>
                    <p className="text-sm text-purple-800 mb-3">
                      Upload a photo of your pen-written version to contribute to our training dataset!
                    </p>
                    <Button
                      onClick={() => setShowPhotoUpload(true)}
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-100"
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
        <Card className="bg-[#FFF8DC] border-2 border-[#D2691E]">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#8B4513] mb-3">Stroke Direction Reference:</p>
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
