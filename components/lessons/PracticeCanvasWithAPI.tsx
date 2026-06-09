// components/lessons/PracticeCanvasWithAPI.tsx
// Updated practice canvas that uses the Handwriting Evaluation API

"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { RefreshCw, Loader2 } from "lucide-react"
import { useEvaluationAPI, interpretScore } from "../../lib/evaluation-api"

// Map Latin to Umwero characters (same as in evaluation-api.ts)
const LATIN_TO_UMWERO: Record<string, string> = {
  'a': '"',   // Umwero vowel A
  'u': ':',   // Umwero vowel U
  'o': '{',   // Umwero vowel O
  'e': '|',   // Umwero vowel E
  'i': '}',   // Umwero vowel I
  // Add consonants as needed
};

interface Props {
  character: string;
  umweroGlyph: string;
  onComplete?: (score: number) => void;
}

export function PracticeCanvasWithAPI({ character, umweroGlyph, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [userDrawingImage, setUserDrawingImage] = useState<string>("")
  const [referenceImage, setReferenceImage] = useState<string>("")
  const [error, setError] = useState<string>("")

  const { evaluateDrawing } = useEvaluationAPI()

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
    setReferenceImage("")
    setScore(null)
    setError("")
  }

  const checkDrawing = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setEvaluating(true)
    setError("")

    try {
      // Save canvas as image for comparison
      const imageData = canvas.toDataURL('image/png')
      setUserDrawingImage(imageData)

      // Call evaluation API
      const result = await evaluateDrawing(character, canvas)
      setScore(result.score)

      // Fetch reference image from API
      try {
        const umweroChar = LATIN_TO_UMWERO[character.toLowerCase()] || character;
        const referenceResponse = await fetch(`${process.env.NEXT_PUBLIC_EVALUATION_API_URL}/api/get-reference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character: umweroChar, // Send Umwero character directly
            image: imageData, // Required by the interface but not used for reference generation
          }),
        })

        if (referenceResponse.ok) {
          const referenceData = await referenceResponse.json()
          setReferenceImage(referenceData.reference_image)
        }
      } catch (referenceError) {
        console.warn('Could not fetch reference image:', referenceError)
        // Fallback to font rendering if reference endpoint fails
      }

      setShowComparison(true)

      // Call onComplete callback with score
      if (onComplete) {
        onComplete(result.score)
      }
    } catch (err) {
      console.error('Evaluation failed:', err)
      setError(err instanceof Error ? err.message : 'Evaluation failed. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  const scoreInfo = score !== null ? interpretScore(score) : null

  return (
    <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
      <CardHeader className="border-b-2 border-[#8B4513] pb-4">
        <CardTitle className="text-xl text-[#8B4513]">
          ✏ Practice: "{umweroGlyph}"
        </CardTitle>
        <p className="text-[#D2691E] text-sm">
          Draw the character {character.toUpperCase()}
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        {!showComparison ? (
          /* Drawing Mode */
          <div className="space-y-4">
            {/* Canvas */}
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

            {/* Controls */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={clearCanvas}
                variant="outline"
                disabled={evaluating}
                className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-[#F3E5AB]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button
                onClick={checkDrawing}
                disabled={!hasDrawn || evaluating}
                className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  'Check'
                )}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : (
          /* Comparison Mode */
          <div className="space-y-4">
            {/* Score Badge */}
            {scoreInfo && (
              <div className="text-center">
                <Badge className={`text-2xl px-6 py-2 ${
                  scoreInfo.level === 'excellent' ? 'bg-green-600' :
                  scoreInfo.level === 'good' ? 'bg-blue-600' :
                  scoreInfo.level === 'fair' ? 'bg-yellow-600' :
                  'bg-red-600'
                } text-white`}>
                  Score: {score?.toFixed(1)}%
                </Badge>
              </div>
            )}

            <h3 className="text-center font-bold text-[#8B4513] text-lg">
              How does your writing compare?
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Your Writing */}
              <div>
                <h4 className="text-center font-semibold text-[#8B4513] mb-2">
                  Your Writing
                </h4>
                <div className="bg-white rounded-lg border-2 border-[#8B4513] aspect-square flex items-center justify-center p-2">
                  {userDrawingImage && (
                    <img 
                      src={userDrawingImage} 
                      alt="Your drawing" 
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Correct Form */}
              <div>
                <h4 className="text-center font-semibold text-[#8B4513] mb-2">
                  Reference (Font-Generated)
                </h4>
                <div className="bg-white rounded-lg border-2 border-[#8B4513] aspect-square flex items-center justify-center p-2">
                  {referenceImage ? (
                    <img 
                      src={referenceImage} 
                      alt="Font-generated reference" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-9xl font-umwero text-[#8B4513]">
                      {umweroGlyph}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {scoreInfo && (
              <div className={`rounded-lg border p-3 text-center ${
                scoreInfo.level === 'excellent' ? 'bg-green-50 border-green-200' :
                scoreInfo.level === 'good' ? 'bg-blue-50 border-blue-200' :
                scoreInfo.level === 'fair' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm font-medium ${
                  scoreInfo.level === 'excellent' ? 'text-green-800' :
                  scoreInfo.level === 'good' ? 'text-blue-800' :
                  scoreInfo.level === 'fair' ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  {scoreInfo.message}
                </p>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={clearCanvas}
              variant="outline"
              className="w-full border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-[#F3E5AB]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}