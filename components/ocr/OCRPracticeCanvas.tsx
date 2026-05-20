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
  onEvaluationComplete?: (result: EvaluationResponse) => void
  className?: string
}

export function OCRPracticeCanvas({
  characterId,
  lessonId,
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
    strokeColor: '#2C5F2D',
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

      // Submit to OCR API
      const result = await ocrApiClient.evaluate({
        characterId,
        strokes: drawingData.strokes,
        imageData: drawingData.imageDataURL,
        lessonId,
        metadata: drawingData.metadata,
      })

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
  }, [strokes, characterId, lessonId, exportDrawingData, onEvaluationComplete])

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
      <Card className="relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-auto touch-none border-2 border-gray-200 rounded-lg"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Drawing indicator */}
        {isDrawing && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Evaluation Results */}
      {evaluation && evaluation.success && (
        <Card className={`p-4 ${evaluation.evaluation.passed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-start gap-3">
            {evaluation.evaluation.passed ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  Score: {Math.round(evaluation.evaluation.score)}%
                </h3>
                <span className="text-sm text-gray-600">
                  Confidence: {Math.round(evaluation.evaluation.confidence * 100)}%
                </span>
              </div>

              {/* Feedback */}
              {evaluation.evaluation.feedback.length > 0 && (
                <div className="space-y-1 mb-3">
                  {evaluation.evaluation.feedback.map((feedback, index) => (
                    <p key={index} className="text-sm text-gray-700">
                      • {feedback}
                    </p>
                  ))}
                </div>
              )}

              {/* Detailed Feedback */}
              {evaluation.evaluation.detailedFeedback.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm font-medium cursor-pointer text-gray-700 hover:text-gray-900">
                    View Detailed Feedback
                  </summary>
                  <div className="mt-2 space-y-2">
                    {evaluation.evaluation.detailedFeedback.map((item, index) => (
                      <div key={index} className="text-sm bg-white p-2 rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{item.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.severity === 'high' ? 'bg-red-100 text-red-700' :
                            item.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-gray-700">{item.message}</p>
                        {item.suggestion && (
                          <p className="text-gray-600 mt-1 italic">💡 {item.suggestion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Progress */}
              {evaluation.progress && (
                <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                  <p>Attempts: {evaluation.progress.totalAttempts} | Best Score: {evaluation.progress.bestScore}%</p>
                </div>
              )}

              {/* Processing Time */}
              <p className="text-xs text-gray-500 mt-2">
                Processed in {evaluation.evaluation.processingTime}ms
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
