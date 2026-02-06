// components/lessons/CompleteVowelLesson.tsx
// FINAL: With Previous/Next buttons at bottom like the image

"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { RefreshCw, ArrowRight, ArrowLeft, Lightbulb, CheckCircle, Circle } from "lucide-react"
import { useAuth } from "../../app/contexts/AuthContext"

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
  vowelNumber: number
  totalVowels: number
  allVowels?: Array<{ vowel: string; completed: boolean }>
  onComplete?: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export function CompleteVowelLesson({ 
  vowelData, 
  lessonId, 
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
  const [isDrawing, setIsDrawing] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [userDrawingImage, setUserDrawingImage] = useState<string>("")
  const [aiScore, setAiScore] = useState<number>(0)
  const [aiFeedback, setAiFeedback] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)
  const [showPractice, setShowPractice] = useState(false) // New: controls whether to show canvas
  const { user } = useAuth()

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 400
    canvas.height = 400

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw grid
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 0)
    ctx.lineTo(200, 400)
    ctx.moveTo(0, 200)
    ctx.lineTo(400, 200)
    ctx.stroke()
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)

    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    ctx.lineTo(x, y)
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Redraw grid
    ctx.strokeStyle = '#E0E0E0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(200, 0)
    ctx.lineTo(200, 400)
    ctx.moveTo(0, 200)
    ctx.lineTo(400, 200)
    ctx.stroke()

    setShowComparison(false)
    setHasDrawn(false)
    setUserDrawingImage("")
    setAiScore(0)
    setAiFeedback("")
  }

  const checkDrawing = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsChecking(true)

    // Convert canvas to image
    const imageData = canvas.toDataURL('image/png')
    setUserDrawingImage(imageData)

    // Create reference image for the correct character
    const referenceCanvas = document.createElement('canvas')
    referenceCanvas.width = 400
    referenceCanvas.height = 400
    const refCtx = referenceCanvas.getContext('2d')
    if (refCtx) {
      refCtx.fillStyle = 'white'
      refCtx.fillRect(0, 0, 400, 400)
      refCtx.font = '200px UMWEROalpha'
      refCtx.fillStyle = '#8B4513'
      refCtx.textAlign = 'center'
      refCtx.textBaseline = 'middle'
      refCtx.fillText(vowelData.umwero, 200, 200)
    }
    const referenceImage = referenceCanvas.toDataURL('image/png')

    // AI Comparison
    let score = 0
    let feedback = "Practice completed"
    
    try {
      const response = await fetch('/api/drawings/ai-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDrawingBase64: imageData.split(',')[1],
          referenceCharacterBase64: referenceImage.split(',')[1],
          vowel: vowelData.vowel,
          umweroChar: vowelData.umwero
        })
      })

      if (response.ok) {
        const result = await response.json()
        score = result.score
        feedback = result.feedback
      } else {
        // Fallback scoring
        score = 70
        feedback = "Drawing saved for review"
      }
    } catch (error) {
      console.error('AI validation error:', error)
      score = 70
      feedback = "Drawing saved for review"
    }

    setAiScore(score)
    setAiFeedback(feedback)
    setShowComparison(true)
    setIsChecking(false)

    // Save to database
    if (user) {
      try {
        const token = localStorage.getItem('token')
        
        const response = await fetch('/api/drawings/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            vowel: vowelData.vowel,
            umweroChar: vowelData.umwero,
            drawingData: imageData,
            aiScore: score,
            feedback,
            lessonId,
            timeSpent: 0,
          })
        })

        if (response.ok && onComplete) {
          onComplete()
        }
      } catch (error) {
        console.error('Save error:', error)
      }
    }
  }

  const handleNext = () => {
    clearCanvas()
    setShowPractice(false) // Reset to learning phase
    if (onNext) {
      onNext()
    }
  }

  const handlePrevious = () => {
    clearCanvas()
    setShowPractice(false) // Reset to learning phase
    if (onPrevious) {
      onPrevious()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B4513] to-[#A0522D] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#F3E5AB] mb-2">
            Inyajwi - The Five Sacred Vowels
          </h1>
          <p className="text-[#F3E5AB]/80">Learn the foundation of Umwero alphabet</p>
        </div>

        {/* Vowel Progress List at Top */}
        {allVowels.length > 0 && (
          <div className="mb-6 flex justify-center">
            <div className="bg-[#F3E5AB] rounded-lg border-2 border-[#8B4513] p-3 inline-flex gap-3">
              {allVowels.map((v, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 rounded ${
                    idx === vowelNumber - 1 
                      ? 'bg-[#8B4513] text-[#F3E5AB]' 
                      : 'bg-white text-[#8B4513]'
                  }`}
                >
                  {v.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="font-bold">{v.vowel.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left - Info */}
          <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
            <CardHeader className="border-b-2 border-[#8B4513] pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-[#8B4513]">
                    Vowel: {vowelData.vowel.toUpperCase()}
                  </CardTitle>
                  <p className="text-[#D2691E] text-sm mt-1">{vowelData.pronunciation}</p>
                </div>
                <Badge className="bg-[#8B4513] text-[#F3E5AB] text-lg px-3 py-1">
                  {vowelNumber} / {totalVowels}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="bg-white rounded-lg border-2 border-[#8B4513] p-8 flex items-center justify-center">
                <div className="text-9xl font-umwero text-[#8B4513]">{vowelData.umwero}</div>
              </div>

              <div className="bg-white/70 rounded-lg border border-[#8B4513] p-4">
                <h3 className="font-bold text-[#8B4513] mb-2">Meaning:</h3>
                <p className="text-[#8B4513]">{vowelData.meaning}</p>
              </div>

              <div className="bg-white/70 rounded-lg border border-[#8B4513] p-4">
                <h3 className="font-bold text-[#8B4513] mb-2 flex items-center gap-2">
                  🌍 Cultural Context:
                </h3>
                <p className="text-[#8B4513] text-sm italic">{vowelData.culturalNote}</p>
              </div>
            </CardContent>
          </Card>

          {/* Right - Examples or Practice */}
          <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
            {!showPractice ? (
              /* Learning Phase - Show Examples */
              <>
                <CardHeader className="border-b-2 border-[#8B4513] pb-4">
                  <CardTitle className="text-xl text-[#8B4513]">
                    📚 Example Words
                  </CardTitle>
                  <p className="text-[#D2691E] text-sm">
                    See how this vowel is used in Kinyarwanda
                  </p>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  {/* Example Words from Database */}
                  {vowelData.examples && vowelData.examples.length > 0 ? (
                    <div className="space-y-3">
                      {vowelData.examples.map((example, idx) => (
                        <div key={idx} className="bg-white rounded-lg border-2 border-[#8B4513] p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-3xl font-umwero text-[#8B4513]">
                              {example.umwero}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#8B4513]">{example.latin}</div>
                              <div className="text-sm text-[#D2691E]">{example.english}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border-2 border-[#8B4513] p-4">
                      <p className="text-[#8B4513]">No examples available yet.</p>
                    </div>
                  )}

                  {/* Learning Tip */}
                  <div className="bg-blue-50 rounded-lg border border-blue-300 p-4">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Learning Tip
                    </h4>
                    <p className="text-sm text-blue-700">
                      Practice pronouncing "{vowelData.vowel}" while looking at the Umwero character. 
                      Connect the sound with the visual form.
                    </p>
                  </div>

                  {/* Start Practice Button */}
                  <Button
                    onClick={() => setShowPractice(true)}
                    className="w-full bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] h-12"
                  >
                    Ready to Practice Drawing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </>
            ) : !showComparison ? (
              /* Drawing Mode */
              <>
                <CardHeader className="border-b-2 border-[#8B4513] pb-4">
                  <CardTitle className="text-xl text-[#8B4513]">
                    ✏ Andika: "{vowelData.umwero}"
                  </CardTitle>
                  <p className="text-[#D2691E] text-sm">
                    Koresha imirongo {vowelData.vowel === 'a' || vowelData.vowel === 'u' ? '2' : '1'}
                  </p>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  <div className="bg-white rounded-lg border-2 border-[#8B4513] overflow-hidden relative aspect-square">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={clearCanvas}
                      variant="outline"
                      className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-[#F3E5AB]"
                      disabled={isChecking}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button
                      onClick={checkDrawing}
                      disabled={!hasDrawn || isChecking}
                      className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                    >
                      {isChecking ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        'Check'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              /* Comparison Mode */
              <>
                <CardHeader className="border-b-2 border-[#8B4513] pb-4">
                  <CardTitle className="text-xl text-[#8B4513]">Comparison</CardTitle>
                  <p className="text-[#D2691E] text-sm">How does your writing compare?</p>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  {/* AI Feedback */}
                  {aiFeedback && (
                    <div className={`p-4 rounded-lg border-2 ${
                      aiScore >= 70 ? 'bg-green-50 border-green-500' : 
                      aiScore >= 55 ? 'bg-yellow-50 border-yellow-500' : 
                      'bg-red-50 border-red-500'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#8B4513]">AI Score:</span>
                        <span className="text-2xl font-bold">{aiScore}%</span>
                      </div>
                      <p className="text-sm text-[#8B4513]">{aiFeedback}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-center font-semibold text-[#8B4513] mb-2">Your Writing</h4>
                      <div className="bg-white rounded-lg border-2 border-[#8B4513] aspect-square flex items-center justify-center p-2">
                        {userDrawingImage && (
                          <img src={userDrawingImage} alt="Drawing" className="w-full h-full object-contain" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-center font-semibold text-[#8B4513] mb-2">Correct Form</h4>
                      <div className="bg-white rounded-lg border-2 border-[#8B4513] aspect-square flex items-center justify-center">
                        <div className="text-9xl font-umwero text-[#8B4513]">{vowelData.umwero}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={clearCanvas}
                      variant="outline"
                      className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-[#F3E5AB]"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!hasNext}
                      className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
                    >
                      {aiScore >= 55 ? 'Good! Next Character' : 'Continue Anyway'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Previous/Next Navigation at Bottom - Like the image! */}
        <div className="mt-8 flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            variant="outline"
            className="border-2 border-[#F3E5AB] text-[#F3E5AB] hover:bg-[#F3E5AB] hover:text-[#8B4513] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Vowel
          </Button>

          <div className="inline-flex gap-2">
            {Array.from({ length: totalVowels }).map((_, idx) => (
              <div
                key={idx}
                className={`w-12 h-2 rounded-full ${
                  allVowels[idx]?.completed ? 'bg-green-500' 
                  : idx === vowelNumber - 1 ? 'bg-[#8B4513]' 
                  : 'bg-[#F3E5AB]'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!hasNext}
            className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next Vowel
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}