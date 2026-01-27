'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, RotateCcw, Eye, EyeOff } from 'lucide-react'

// Real Umwero keyboard mapping from your translation system
const VOWEL_LESSONS = [
  {
    id: 1,
    latin: 'a',
    umwero: '"',
    pronunciation: '/a/ as in "father"',
    meaning: 'Represents earth and foundation',
    culturalNote: 'The character for "a" symbolizes the grounding force of earth in Rwandan philosophy',
    examples: [
      { umwero: '"M"Z}', latin: 'amazi', meaning: 'water' },
      { umwero: '"A"', latin: 'aba', meaning: 'these' },
    ],
  },
  {
    id: 2,
    latin: 'e',
    umwero: '|',
    pronunciation: '/e/ as in "bed"',
    meaning: 'Represents air and breath',
    culturalNote: 'Air is the breath of life in Rwandan philosophy',
    examples: [
      { umwero: '|M|', latin: 'eme', meaning: 'stand' },
      { umwero: 'N|', latin: 'ne', meaning: 'and' },
    ],
  },
  {
    id: 3,
    latin: 'i',
    umwero: '}',
    pronunciation: '/i/ as in "machine"',
    meaning: 'Represents water and flow',
    culturalNote: 'Water symbolizes adaptability and continuous life force',
    examples: [
      { umwero: '}A}', latin: 'ibi', meaning: 'these things' },
      { umwero: '}N}', latin: 'ini', meaning: 'liver' },
    ],
  },
  {
    id: 4,
    latin: 'o',
    umwero: '{',
    pronunciation: '/o/ as in "note"',
    meaning: 'Represents spirit and wholeness',
    culturalNote: 'The circular form represents unity and completeness',
    examples: [
      { umwero: 'K{S{', latin: 'koko', meaning: 'chicken' },
      { umwero: 'G{S{', latin: 'goko', meaning: 'arm' },
    ],
  },
  {
    id: 5,
    latin: 'u',
    umwero: ':',
    pronunciation: '/u/ as in "rude"',
    meaning: 'Represents fire and energy',
    culturalNote: 'Fire is the transformative element in creation',
    examples: [
      { umwero: ':M:G{', latin: 'umuco', meaning: 'culture' },
      { umwero: ':A:NT:', latin: 'ubuntu', meaning: 'humanity' },
    ],
  },
]

export function CompleteVowelLesson() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPractice, setShowPractice] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showReference, setShowReference] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [completedVowels, setCompletedVowels] = useState<number[]>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const comparisonCanvasRef = useRef<HTMLCanvasElement>(null)
  const userDrawingData = useRef<string | null>(null)

  const currentVowel = VOWEL_LESSONS[currentIndex]

  // Initialize canvas with grid
  useEffect(() => {
    if (showPractice && canvasRef.current) {
      initializeCanvas()
    }
  }, [showPractice, currentIndex])

  const initializeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and draw grid
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx, canvas.width, canvas.height)
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20

    // Light grid lines
    ctx.strokeStyle = '#F3E5AB'
    ctx.lineWidth = 0.5

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Center guides (darker)
    ctx.strokeStyle = '#D2691E'
    ctx.lineWidth = 1.5

    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }

  // Drawing functions
  const startDrawing = (x: number, y: number) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (x: number, y: number) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

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

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    startDrawing(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    draw(e.clientX - rect.left, e.clientY - rect.top)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    draw(touch.clientX - rect.left, touch.clientY - rect.top)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    stopDrawing()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx, canvas.width, canvas.height)
  }

  const compareDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Save user drawing
    userDrawingData.current = canvas.toDataURL()
    setShowComparison(true)

    // Draw comparison
    setTimeout(() => {
      drawComparisonView()
    }, 100)
  }

  const drawComparisonView = () => {
    const canvas = comparisonCanvasRef.current
    if (!canvas || !userDrawingData.current) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Draw dividing line
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()

    // Left: User's drawing
    const userImg = new Image()
    userImg.onload = () => {
      ctx.drawImage(userImg, 0, 0, width / 2, height)
    }
    userImg.src = userDrawingData.current!

    // Right: Correct character
    ctx.save()
    ctx.translate(width * 0.75, height / 2)
    ctx.font = '160px UMWEROalpha, serif'
    ctx.fillStyle = '#8B4513'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(currentVowel.umwero, 0, 0)
    ctx.restore()

    // Labels
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = '#8B4513'
    ctx.textAlign = 'center'
    ctx.fillText('Your Writing', width / 4, 30)
    ctx.fillText('Correct Form', width * 0.75, 30)
  }

  const markComplete = () => {
    if (!completedVowels.includes(currentIndex)) {
      const newCompleted = [...completedVowels, currentIndex]
      setCompletedVowels(newCompleted)
      
      // Save to localStorage
      localStorage.setItem('completedVowels', JSON.stringify(newCompleted))
      
      // Update vowel progress
      const vowelsProgress = JSON.parse(localStorage.getItem('vowelsProgress') || '[]')
      const existingIndex = vowelsProgress.findIndex((v: any) => v.vowelIndex === currentIndex)
      
      const vowelData = {
        vowelIndex: currentIndex,
        vowel: currentVowel.latin,
        umwero: currentVowel.umwero,
        attempts: existingIndex >= 0 ? vowelsProgress[existingIndex].attempts + 1 : 1,
        bestScore: 100, // For now, assume completion = 100%
        lastPracticed: new Date().toISOString(),
        drawings: existingIndex >= 0 ? 
          [...vowelsProgress[existingIndex].drawings, userDrawingData.current] : 
          [userDrawingData.current]
      }
      
      if (existingIndex >= 0) {
        vowelsProgress[existingIndex] = vowelData
      } else {
        vowelsProgress.push(vowelData)
      }
      
      localStorage.setItem('vowelsProgress', JSON.stringify(vowelsProgress))
      
      // Update learning streak
      const lastLearningDate = localStorage.getItem('lastLearningDate')
      const today = new Date().toDateString()
      
      if (lastLearningDate !== today) {
        const currentStreak = parseInt(localStorage.getItem('learningStreak') || '0')
        localStorage.setItem('learningStreak', (currentStreak + 1).toString())
        localStorage.setItem('lastLearningDate', today)
      }
      
      // Update total time spent (add 5 minutes per vowel completed)
      const currentTime = parseInt(localStorage.getItem('totalTimeSpent') || '0')
      localStorage.setItem('totalTimeSpent', (currentTime + 5).toString())
    }
    
    setShowPractice(false)
    setShowComparison(false)
    
    // Move to next if available
    if (currentIndex < VOWEL_LESSONS.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, 500)
    }
  }

  const retryDrawing = () => {
    setShowComparison(false)
    clearCanvas()
  }

  const nextVowel = () => {
    if (currentIndex < VOWEL_LESSONS.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowPractice(false)
      setShowComparison(false)
    }
  }

  const prevVowel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowPractice(false)
      setShowComparison(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <div className="bg-[#8B4513] text-[#F3E5AB] py-6 px-8">
        <h1 className="text-3xl font-bold mb-1">Inyajwi - The Five Sacred Vowels</h1>
        <p className="text-sm opacity-90">Learn the foundation of Umwero alphabet</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Character Info */}
          <Card className="bg-[#F3E5AB] border-2 border-[#8B4513]">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#8B4513]">
                    Vowel: {currentVowel.latin.toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-700">{currentVowel.pronunciation}</p>
                </div>
                <span className="text-lg font-semibold text-[#D2691E]">
                  {currentIndex + 1} / {VOWEL_LESSONS.length}
                </span>
              </div>

              {/* Large Character Display */}
              <div className="bg-white border-2 border-[#D2691E] rounded-lg p-12 mb-4 flex items-center justify-center">
                <div 
                  className="text-[180px] leading-none"
                  style={{ fontFamily: "'UMWEROalpha', serif" }}
                >
                  {currentVowel.umwero}
                </div>
              </div>

              {/* Meaning */}
              <div className="bg-[#F5DEB3] p-4 rounded-lg mb-4">
                <p className="font-semibold text-[#8B4513] mb-1">Meaning:</p>
                <p className="text-gray-800">{currentVowel.meaning}</p>
              </div>

              {/* Cultural Context */}
              <div className="bg-[#FFF8DC] border border-[#D2691E] p-4 rounded-lg mb-4">
                <p className="font-semibold text-[#8B4513] mb-1">🌍 Cultural Context:</p>
                <p className="text-sm italic text-gray-700">{currentVowel.culturalNote}</p>
              </div>

              {/* Practice Button */}
              {!showPractice && !showComparison && (
                <Button
                  onClick={() => setShowPractice(true)}
                  className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white text-lg py-6"
                >
                  Practice Writing This Character
                </Button>
              )}
            </CardContent>
          </Card>

          {/* RIGHT COLUMN: Examples or Practice */}
          <div className="space-y-4">
            {!showPractice && !showComparison ? (
              // Example Words
              <Card className="bg-white border-2 border-[#8B4513]">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#8B4513] mb-4">
                    Example Words
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    See how this vowel is used in Kinyarwanda
                  </p>

                  <div className="space-y-3">
                    {currentVowel.examples.map((example, idx) => (
                      <div
                        key={idx}
                        className="bg-[#F3E5AB] p-4 rounded-lg border border-[#D2691E]"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="text-5xl"
                            style={{ fontFamily: "'UMWEROalpha', serif" }}
                          >
                            {example.umwero}
                          </div>
                          <div>
                            <p className="font-bold text-xl text-[#8B4513]">
                              {example.latin}
                            </p>
                            <p className="text-sm text-gray-600">{example.meaning}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Learning Tip */}
                  <div className="mt-6 bg-blue-50 border border-blue-300 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-1">💡 Learning Tip</p>
                    <p className="text-sm text-blue-800">
                      Practice pronouncing "{currentVowel.latin}" while looking at the 
                      Umwero character. Connect the sound with the visual form.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : showPractice && !showComparison ? (
              // Practice Canvas
              <Card className="bg-white border-2 border-[#8B4513]">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#8B4513] mb-2">
                    Practice Area
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Draw the character "{currentVowel.umwero}" on the canvas below
                  </p>

                  {/* Show Reference Toggle */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setShowReference(!showReference)}
                      className="flex items-center gap-2 text-sm text-[#8B4513] hover:text-[#A0522D]"
                    >
                      {showReference ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {showReference ? 'Hide' : 'Show'} reference character
                    </button>
                  </div>

                  {/* Canvas */}
                  <div className="relative aspect-square">
                    {showReference && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none"
                        style={{ 
                          fontFamily: "'UMWEROalpha', serif",
                          fontSize: '280px',
                          lineHeight: '1'
                        }}
                      >
                        {currentVowel.umwero}
                      </div>
                    )}
                    
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={600}
                      className="border-2 border-[#8B4513] rounded-lg w-full h-full cursor-crosshair touch-none bg-white"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button
                      onClick={clearCanvas}
                      variant="outline"
                      className="border-[#8B4513] text-[#8B4513]"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                    <Button
                      onClick={compareDrawing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Compare with Original
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Comparison View
              <Card className="bg-white border-2 border-[#8B4513]">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#8B4513] mb-2">
                    Comparison
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    How does your writing compare?
                  </p>

                  <canvas
                    ref={comparisonCanvasRef}
                    width={600}
                    height={600}
                    className="border-2 border-[#8B4513] rounded-lg w-full bg-white mb-4"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={retryDrawing}
                      variant="outline"
                      className="border-[#8B4513] text-[#8B4513]"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                    <Button
                      onClick={markComplete}
                      className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
                    >
                      Good! Next Character
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={prevVowel}
            disabled={currentIndex === 0}
            variant="outline"
            className="border-[#8B4513] text-[#8B4513]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Vowel
          </Button>

          <Button
            onClick={nextVowel}
            disabled={currentIndex === VOWEL_LESSONS.length - 1}
            className="bg-[#8B4513] hover:bg-[#A0522D] text-white ml-auto"
          >
            Next Vowel
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-3 justify-center mt-6">
          {VOWEL_LESSONS.map((_, index) => (
            <div
              key={index}
              className={`h-3 w-12 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[#8B4513] scale-110'
                  : completedVowels.includes(index)
                  ? 'bg-green-600'
                  : index < currentIndex
                  ? 'bg-[#D2691E]'
                  : 'bg-[#F3E5AB]'
              }`}
            />
          ))}
        </div>

        {/* Completion Message */}
        {completedVowels.length === VOWEL_LESSONS.length && (
          <Card className="mt-6 bg-green-50 border-2 border-green-600">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                🎉 Congratulations!
              </h3>
              <p className="text-green-700 mb-4">
                You've completed all 5 Umwero vowels! You're ready to move to intermediate lessons.
              </p>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Continue to Intermediate Level
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}