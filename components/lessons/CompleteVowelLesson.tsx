// components/lessons/CompleteVowelLesson.tsx
// FINAL: With Previous/Next buttons at bottom like the image

"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { RefreshCw, ArrowRight, ArrowLeft, Lightbulb, CheckCircle, Circle, Send } from "lucide-react"
import { lessonIdToCharacterId } from "@/lib/character-mapping"

const SAVE_PROGRESS_SIGN_IN_MESSAGE = 'Please sign in to save your progress.'

export interface VowelData {
  vowel: string
  umwero: string
  pronunciation: string
  meaning: string
  culturalNote: string
  examples: Array<{ umwero: string; latin: string; english: string }>
}

interface Props {
  vowelData: VowelData
  lessonId: string
  characterId?: string
  vowelNumber: number
  totalVowels: number
  allVowels?: Array<{ vowel: string; completed: boolean }>
  onComplete?: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

interface StrokePoint {
  x: number
  y: number
  timestamp: number
  pressure?: number
}

interface DrawingStroke {
  points: StrokePoint[]
  startTime: number
  endTime: number
}

interface LearningAttemptResponse {
  success: boolean
  error?: string
  evaluation?: {
    score: number | null
    confidence: number
    feedback: string[]
    strengths: string[]
    weaknesses: string[]
    practiceAreas: string[]
  }
}

export function CompleteVowelLesson({
  vowelData,
  lessonId,
  characterId,
  vowelNumber,
  totalVowels,
  allVowels = [],
  onComplete,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentStrokeRef = useRef<StrokePoint[]>([])
  const strokesRef = useRef<DrawingStroke[]>([])
  const drawingStartedAtRef = useRef<number | null>(null)
  const inputMethodRef = useRef<'mouse' | 'touch' | 'stylus'>('mouse')
  const [isDrawing, setIsDrawing] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [userDrawingImage, setUserDrawingImage] = useState<string>("")
  const [ocrScore, setOcrScore] = useState<number | null>(null)
  const [ocrFeedback, setOcrFeedback] = useState<string>("")
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])
  const [submissionError, setSubmissionError] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 })
  // Initialize canvas with responsive sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Calculate responsive size
      const container = canvas.parentElement
      if (container) {
        const size = Math.min(container.clientWidth, container.clientHeight, 600)
        setCanvasSize({ width: size, height: size })
        canvas.width = size
        canvas.height = size

        // Redraw grid after resize
        drawGrid()
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  // Draw grid helper function
  const drawGrid = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw grid
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }

  // Get coordinates from mouse or touch event
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return null
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)

    const rawPressure = 'nativeEvent' in e && 'pressure' in e.nativeEvent
      ? e.nativeEvent.pressure
      : undefined
    const pressure = typeof rawPressure === 'number' ? rawPressure : undefined

    return { x, y, pressure }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent scrolling on touch
    const canvas = canvasRef.current
    if (!canvas) return

    const coords = getCoordinates(e)
    if (!coords) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)
    const timestamp = Date.now()
    drawingStartedAtRef.current ??= timestamp
    inputMethodRef.current = 'touches' in e ? 'touch' : 'mouse'
    currentStrokeRef.current = [{ ...coords, timestamp }]

    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent scrolling on touch
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const coords = getCoordinates(e)
    if (!coords) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    currentStrokeRef.current.push({ ...coords, timestamp: Date.now() })
    ctx.lineTo(coords.x, coords.y)
    ctx.strokeStyle = '#8B4513'
    // Responsive line width based on canvas size
    ctx.lineWidth = Math.max(3, canvas.width / 100)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing && currentStrokeRef.current.length > 0) {
      const points = currentStrokeRef.current
      strokesRef.current.push({
        points,
        startTime: points[0].timestamp,
        endTime: points[points.length - 1].timestamp,
      })
      currentStrokeRef.current = []
    }
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid()

    setShowComparison(false)
    setHasDrawn(false)
    setUserDrawingImage("")
    setOcrScore(null)
    setOcrFeedback("")
    setPracticeAreas([])
    setSubmissionError("")
    currentStrokeRef.current = []
    strokesRef.current = []
    drawingStartedAtRef.current = null
  }

  const checkDrawing = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsChecking(true)
    setSubmissionError("")

    // Convert canvas to image
    const imageData = canvas.toDataURL('image/png')
    setUserDrawingImage(imageData)

    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const strokes = [...strokesRef.current]
      if (currentStrokeRef.current.length > 0) {
        const points = currentStrokeRef.current
        strokes.push({
          points,
          startTime: points[0].timestamp,
          endTime: points[points.length - 1].timestamp,
        })
      }

      const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.points.length, 0)
      const now = Date.now()
      const resolvedCharacterId = characterId || lessonIdToCharacterId(lessonId)

      console.info('[OCR diagnostic] endpoint called', {
        endpoint: '/api/learning/attempt',
        characterId: resolvedCharacterId,
        lessonId,
        strokeCount: strokes.length,
      })

      const response = await fetch('/api/learning/attempt', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          characterId: resolvedCharacterId,
          lessonId,
          imageData,
          strokes,
          learningStage: 'TRACING',
          journeyPhase: 'TRACE',
          metadata: {
            canvasSize: { width: canvas.width, height: canvas.height },
            devicePixelRatio: window.devicePixelRatio || 1,
            inputMethod: inputMethodRef.current,
            totalDuration: drawingStartedAtRef.current ? now - drawingStartedAtRef.current : 0,
            strokeCount: strokes.length,
            totalPoints,
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              isMobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
              isTouch: navigator.maxTouchPoints > 0,
              screenWidth: window.screen.width,
              screenHeight: window.screen.height,
            },
          },
        }),
      })

      const result = await response.json() as LearningAttemptResponse
      if (!response.ok || !result.success) {
        throw new Error(
          response.status === 401
            ? SAVE_PROGRESS_SIGN_IN_MESSAGE
            : result.error || 'Writing attempt could not be submitted.'
        )
      }
      if (result.evaluation?.score === null || result.evaluation?.score === undefined) {
        throw new Error(
          result.evaluation?.feedback?.join(' ') ||
          'Your attempt was saved, but the OCR service could not evaluate it.'
        )
      }

      setOcrScore(result.evaluation.score)
      setOcrFeedback(result.evaluation.feedback.join(' ') || 'Python OCR evaluation completed.')
      setPracticeAreas(result.evaluation.practiceAreas)
      setShowComparison(true)

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Writing attempt could not be submitted.'
      if (message !== SAVE_PROGRESS_SIGN_IN_MESSAGE) {
        console.error('Learning attempt submission error:', error)
      }
      setOcrScore(null)
      setOcrFeedback("")
      setPracticeAreas([])
      setSubmissionError(message)
    } finally {
      setIsChecking(false)
    }
  }

  const handleNext = () => {
    clearCanvas()
    if (onNext) {
      onNext()
    }
  }

  const handlePrevious = () => {
    clearCanvas()
    if (onPrevious) {
      onPrevious()
    }
  }

  const progressValue = Math.round((vowelNumber / totalVowels) * 100)

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mb-5 rounded-lg border border-[#8B4513]/20 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[#8B4513]/25 bg-white font-umwero text-5xl text-[#8B4513]">
                {vowelData.umwero}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#8B4513]">Lesson {vowelNumber} of {totalVowels}</p>
                <h1 className="text-2xl font-bold text-black">Vowel {vowelData.vowel.toUpperCase()}</h1>
                <p className="text-base text-black/65">{vowelData.pronunciation || "Practice the character, submit, then continue."}</p>
              </div>
            </div>
            <div className="min-w-[180px]">
              <div className="mb-2 flex justify-between text-sm font-medium text-black/65">
                <span>Progress</span>
                <span>{progressValue}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10">
                <div className="h-full bg-[#8B4513]" style={{ width: `${progressValue}%` }} />
              </div>
            </div>
          </div>
        </div>

        {allVowels.length > 0 && (
          <div className="mb-5 overflow-x-auto">
            <div className="inline-flex min-w-full gap-2 rounded-lg border border-[#8B4513]/20 bg-white p-2 sm:min-w-0">
              {allVowels.map((v, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                    idx === vowelNumber - 1
                      ? 'bg-[#8B4513] text-white'
                      : 'bg-white text-[#8B4513]'
                  }`}
                >
                  {v.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="font-bold">{v.vowel.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-black">Character Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex aspect-square items-center justify-center rounded-lg border border-[#8B4513]/20 bg-white font-umwero text-9xl text-[#8B4513]">
                  {vowelData.umwero}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">Meaning</p>
                  <p className="mt-1 text-base text-black/70">{vowelData.meaning || "Practice this character form."}</p>
                </div>
                <details className="rounded-lg border border-[#8B4513]/20 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-[#8B4513]">Culture and examples</summary>
                  {vowelData.culturalNote && <p className="mt-3 text-sm leading-6 text-black/70">{vowelData.culturalNote}</p>}
                  {vowelData.examples?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {vowelData.examples.slice(0, 3).map((example, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-md bg-white p-2">
                          <span className="font-umwero text-2xl text-[#8B4513]">{example.umwero}</span>
                          <span className="text-right text-sm text-black/70">{example.latin}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </details>
              </CardContent>
            </Card>
          </aside>

          <Card className="border-[#8B4513]/35">
          {!showComparison ? (
            <>
              <CardHeader className="border-b border-[#8B4513]/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-xl text-black">Practice Canvas</CardTitle>
                    <p className="mt-1 text-base text-black/65">Draw the character, submit it, then use feedback to decide your next step.</p>
                  </div>
                  <Badge variant="outline">{hasDrawn ? "Ready to submit" : "Draw first"}</Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-5">
                <div className="mx-auto max-w-3xl space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-[#8B4513]/30 bg-white touch-none">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                      <div className="text-[13rem] font-umwero text-[#8B4513] leading-none sm:text-[20rem]">
                        {vowelData.umwero}
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-black/10" />
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-black/10" />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      onTouchCancel={stopDrawing}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr]">
                    <Button
                      onClick={clearCanvas}
                      variant="outline"
                      disabled={isChecking}
                    >
                      <RefreshCw className="h-4 w-4" /> Undo
                    </Button>
                    <Button
                      onClick={clearCanvas}
                      variant="outline"
                      disabled={isChecking}
                    >
                      Clear
                    </Button>
                    <Button onClick={checkDrawing} disabled={!hasDrawn || isChecking}>
                      {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isChecking ? "Evaluating..." : "Submit Writing"}
                    </Button>
                  </div>

                  <div className="rounded-lg border border-[#8B4513]/20 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-[#8B4513]" />
                      <div>
                        <p className="text-sm leading-6 text-black/70">
                          Keep your stroke steady and use the faint reference as a guide. Each submit is saved as its own attempt.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  {submissionError && (
                    <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-sm text-red-800">
                      {submissionError}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      onClick={handlePrevious}
                      disabled={!hasPrevious}
                      variant="outline"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-black/55">Submit to unlock feedback</span>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            /* Comparison Mode */
            <>
              <CardHeader className="border-b border-[#8B4513]/20">
                <CardTitle className="text-xl text-black">Feedback</CardTitle>
                <p className="text-base text-black/65">Review your attempt, then continue or try again.</p>
              </CardHeader>

              <CardContent className="pt-5">
                <div className="mx-auto max-w-3xl space-y-4">
                  {ocrFeedback && ocrScore !== null && (
                    <div className="rounded-lg border border-[#8B4513]/25 bg-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-black">Score</span>
                        <span className="text-2xl font-bold text-[#8B4513]">{Math.round(ocrScore)}%</span>
                      </div>
                      <p className="text-sm leading-6 text-black/70">{ocrFeedback}</p>
                      {practiceAreas.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-black">Practice next:</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-black/70">
                            {practiceAreas.map((area) => (
                              <li key={area}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-center font-semibold text-black mb-2">Your Writing</h4>
                      <div className="bg-white rounded-lg border border-[#8B4513]/25 aspect-square flex items-center justify-center p-2">
                        {userDrawingImage && (
                          <img src={userDrawingImage} alt="Drawing" className="w-full h-full object-contain" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-center font-semibold text-black mb-2">Reference</h4>
                      <div className="bg-white rounded-lg border border-[#8B4513]/25 aspect-square flex items-center justify-center">
                        <div className="text-9xl font-umwero text-[#8B4513]">{vowelData.umwero}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      onClick={clearCanvas}
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4" /> Try Again
                    </Button>
                    <Button
                      onClick={hasNext ? handleNext : onComplete}
                    >
                      {hasNext ? "Continue Lesson" : "Finish Lesson"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
          </Card>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex gap-2">
            {Array.from({ length: totalVowels }).map((_, idx) => (
              <div
                key={idx}
                className={`w-12 h-2 rounded-full ${
                  allVowels[idx]?.completed ? 'bg-[#8B4513]'
                  : idx === vowelNumber - 1 ? 'bg-[#8B4513]'
                  : 'bg-black/15'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
