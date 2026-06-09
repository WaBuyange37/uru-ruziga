'use client'

/**
 * OCR Practice Canvas Component
 * Production-grade canvas with OCR evaluation integration
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing'
import { ocrApiClient, type EvaluationResponse } from '@/lib/ocr-api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle, RotateCcw, Send } from 'lucide-react'

interface OCRPracticeCanvasProps {
  characterId: string
  lessonId?: string
  stepId?: string
  learningStage?: string
  journeyPhase?: string
  onEvaluationComplete?: (result: EvaluationResponse) => void
  className?: string
}

export function OCRPracticeCanvas({
  characterId,
  lessonId,
  stepId,
  learningStage,
  journeyPhase,
  onEvaluationComplete,
  className = '',
}: OCRPracticeCanvasProps) {
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    canvasRef,
    isDrawing,
    strokes,
    clearCanvas,
    undoLastStroke,
    exportDrawingData,
    replayStrokes,
  } = useCanvasDrawing({
    strokeColor: '#8B4513',
    strokeWidth: 4,
    backgroundColor: '#FFFFFF',
    enablePerformanceMonitoring: true,
    onStrokeComplete: (stroke) => {
      // Clear previous evaluation when user starts drawing again
      if (evaluation) {
        setEvaluation(null)
        setError(null)
      }
    },
  })

  const handleSubmit = useCallback(async () => {
    if (strokes.length === 0) {
      setError('Please draw something before submitting')
      return
    }

    setIsEvaluating(true)
    setError(null)

    try {
      // Export complete drawing data
      const drawingData = exportDrawingData()
      
      if (!drawingData) {
        throw new Error('Failed to export drawing data')
      }

      const request = {
        characterId,
        strokes: drawingData.strokes,
        imageData: drawingData.imageDataURL,
        lessonId,
        metadata: drawingData.metadata,
      }

      const result =
        learningStage && journeyPhase
          ? (console.info('[OCR diagnostic] endpoint called', {
              endpoint: '/api/learning/attempt',
              hasLearningStage: true,
              hasJourneyPhase: true,
            }),
            await ocrApiClient.submitLearningAttempt({
                ...request,
                stepId,
                learningStage,
                journeyPhase,
              }))
          : (console.info('[OCR diagnostic] endpoint called', {
              endpoint: '/api/ocr/evaluate',
              hasLearningStage: Boolean(learningStage),
              hasJourneyPhase: Boolean(journeyPhase),
            }),
            await ocrApiClient.evaluate(request))

      setEvaluation(result)
      
      if (onEvaluationComplete) {
        onEvaluationComplete(result)
      }

    } catch (err) {
      console.error('Evaluation error:', err)
      setError(err instanceof Error ? err.message : 'Evaluation failed')
    } finally {
      setIsEvaluating(false)
    }
  }, [strokes, characterId, lessonId, stepId, learningStage, journeyPhase, exportDrawingData, onEvaluationComplete])

  const handleClear = useCallback(() => {
    clearCanvas()
    setEvaluation(null)
    setError(null)
  }, [clearCanvas])

  const handleReplay = useCallback(async () => {
    await replayStrokes(1.5) // 1.5x speed
  }, [replayStrokes])

  const hasDrawing = strokes.length > 0

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Canvas */}
      <Card className="relative overflow-hidden border-[#8B4513]/30 bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-auto touch-none rounded-lg border border-[#8B4513]/25"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Drawing indicator */}
        {isDrawing && (
          <div className="absolute top-2 right-2 rounded-md bg-[#8B4513] px-2 py-1 text-xs font-medium text-white">
            Drawing...
          </div>
        )}
      </Card>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleSubmit}
          disabled={!hasDrawing || isEvaluating}
          className="flex-1 min-w-[120px]"
        >
          {isEvaluating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </>
          )}
        </Button>

        <Button
          onClick={undoLastStroke}
          disabled={!hasDrawing || isEvaluating}
          variant="outline"
        >
          Undo
        </Button>

        <Button
          onClick={handleClear}
          disabled={!hasDrawing || isEvaluating}
          variant="outline"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear
        </Button>

        {hasDrawing && !isEvaluating && (
          <Button
            onClick={handleReplay}
            variant="ghost"
            size="sm"
          >
            Replay
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-black bg-white p-4">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-black">Error</p>
              <p className="text-sm text-black/70">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Evaluation Results */}
      {evaluation && evaluation.success && (
        <Card className="border-[#8B4513]/25 bg-white p-4">
          <div className="flex items-start gap-3">
            {evaluation.evaluation.passed ? (
              <CheckCircle2 className="h-6 w-6 text-[#8B4513] flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-6 w-6 text-[#8B4513] flex-shrink-0 mt-0.5" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  {typeof evaluation.evaluation.score === 'number'
                    ? `Score: ${Math.round(evaluation.evaluation.score)}%`
                    : 'Practice saved'}
                </h3>
                <span className="text-sm text-black/60">
                  Confidence: {Math.round(evaluation.evaluation.confidence * 100)}%
                </span>
              </div>

              {/* Feedback */}
              {evaluation.evaluation.feedback.length > 0 && (
                <div className="space-y-1 mb-3">
                  {evaluation.evaluation.feedback.map((feedback, index) => (
                    <p key={index} className="text-sm text-black/70">
                      • {feedback}
                    </p>
                  ))}
                </div>
              )}

              {/* Detailed Feedback */}
              {evaluation.evaluation.detailedFeedback.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm font-medium cursor-pointer text-black/70 hover:text-black">
                    View Detailed Feedback
                  </summary>
                  <div className="mt-2 space-y-2">
                    {evaluation.evaluation.detailedFeedback.map((item, index) => (
                      <div key={index} className="text-sm bg-white p-2 rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{item.category}</span>
                          <span className="rounded border border-[#8B4513]/20 bg-white px-2 py-0.5 text-xs text-[#8B4513]">
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-black/70">{item.message}</p>
                        {item.suggestion && (
                          <p className="mt-1 italic text-black/60">{item.suggestion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Progress */}
              {evaluation.progress && (
                <div className="mt-3 border-t pt-3 text-sm text-black/60">
                  <p>Attempts: {evaluation.progress.totalAttempts} | Best Score: {evaluation.progress.bestScore}%</p>
                </div>
              )}

              {/* Processing Time */}
              <p className="mt-2 text-xs text-black/50">
                Processed in {evaluation.evaluation.processingTime}ms
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
