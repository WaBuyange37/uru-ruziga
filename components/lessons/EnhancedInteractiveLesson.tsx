'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Star
} from 'lucide-react'
import { type LessonContent, type UmweroCharacter } from '@/lib/lessons/lesson-data'

interface EnhancedLessonProps {
  lessonData: LessonContent
  onComplete?: (score: number) => void
  onExit?: () => void
}

type LessonSection = 'theory' | 'characters' | 'practice' | 'quiz'

export function EnhancedInteractiveLesson({ lessonData, onComplete, onExit }: EnhancedLessonProps) {
  // State Management
  const [currentSection, setCurrentSection] = useState<LessonSection>('theory')
  const [characterIndex, setCharacterIndex] = useState(0)
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [quizScore, setQuizScore] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Calculate overall progress
  const sectionWeights = { theory: 0.2, characters: 0.3, practice: 0.3, quiz: 0.2 }
  const sectionProgress = {
    theory: currentSection === 'theory' ? 100 : 0,
    characters: (characterIndex / lessonData.characters.length) * 100,
    practice: (practiceIndex / lessonData.exercises.length) * 100,
    quiz: (quizIndex / lessonData.quiz.questions.length) * 100,
  }
  
  const overallProgress = Object.entries(sectionProgress).reduce(
    (acc, [section, progress]) => acc + progress * sectionWeights[section as LessonSection],
    0
  )

  // Canvas Drawing Functions
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        drawGrid(ctx)
      }
    }
  }, [currentSection, characterIndex])

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 20
    const { width, height } = ctx.canvas
    
    // Draw grid lines
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
    
    // Draw center guides (red lines)
    ctx.strokeStyle = '#D2691E'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }

  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    setIsDrawing(true)
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
    ctx.lineWidth = 3
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
    drawGrid(ctx)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    startDrawing(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    draw(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    draw(touch.clientX - rect.left, touch.clientY - rect.top)
  }

  // Quiz Functions
  const handleQuizAnswer = (questionIndex: number, answer: any) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: answer })
  }

  const submitQuiz = () => {
    let correct = 0
    lessonData.quiz.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correct) {
        correct++
      }
    })
    const score = Math.round((correct / lessonData.quiz.questions.length) * 100)
    setQuizScore(score)
    
    if (onComplete) {
      onComplete(score)
    }
  }

  // Navigation
  const nextCharacter = () => {
    if (characterIndex < lessonData.characters.length - 1) {
      setCharacterIndex(characterIndex + 1)
      clearCanvas()
    }
  }

  const prevCharacter = () => {
    if (characterIndex > 0) {
      setCharacterIndex(characterIndex - 1)
      clearCanvas()
    }
  }

  const nextPractice = () => {
    if (practiceIndex < lessonData.exercises.length - 1) {
      setPracticeIndex(practiceIndex + 1)
    } else {
      setCurrentSection('quiz')
    }
  }

  const nextQuestion = () => {
    if (quizIndex < lessonData.quiz.questions.length - 1) {
      setQuizIndex(quizIndex + 1)
    }
  }

  const currentCharacter = lessonData.characters[characterIndex]

  return (
    <div className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#F3E5AB] to-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#8B4513] text-[#F3E5AB] p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">{lessonData.title}</h1>
            <p className="text-sm opacity-90">Module: {lessonData.module} • Duration: {lessonData.duration} min</p>
          </div>
          <Button variant="outline" onClick={onExit} className="bg-transparent border-[#F3E5AB] text-[#F3E5AB]">
            Exit Lesson
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={currentSection} onValueChange={(value) => setCurrentSection(value as LessonSection)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="theory" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Theory
              {currentSection !== 'theory' && sectionProgress.theory === 100 && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Characters ({characterIndex + 1}/{lessonData.characters.length})
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              ✍️ Practice ({practiceIndex + 1}/{lessonData.exercises.length})
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          {/* Theory Section */}
          <TabsContent value="theory">
            <Card className="border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">Lesson Introduction</CardTitle>
                <CardDescription>Understanding the fundamentals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Learning Objectives */}
                <div>
                  <h3 className="font-semibold text-[#8B4513] mb-3">Learning Objectives:</h3>
                  <ul className="space-y-2">
                    {lessonData.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Circle className="h-4 w-4 mt-1 text-[#D2691E]" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Theory Content */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-lg leading-relaxed">{lessonData.theory.introduction}</p>
                  
                  <h3 className="font-semibold text-[#8B4513] mt-6 mb-3">Key Points:</h3>
                  <ul className="space-y-2">
                    {lessonData.theory.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {lessonData.theory.culturalContext && (
                    <div className="mt-6 p-4 bg-[#F3E5AB] rounded-lg border-2 border-[#D2691E]">
                      <h4 className="font-semibold text-[#8B4513] mb-2">🌍 Cultural Context</h4>
                      <p className="italic">{lessonData.theory.culturalContext}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-[#8B4513] hover:bg-[#A0522D]"
                  onClick={() => setCurrentSection('characters')}
                >
                  Begin Learning Characters
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Characters Section */}
          <TabsContent value="characters">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Character Display */}
              <Card className="border-[#8B4513]">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-[#8B4513]">
                      Character: {currentCharacter.latin.toUpperCase()}
                    </CardTitle>
                    <Badge className="bg-[#8B4513]">
                      {characterIndex + 1} / {lessonData.characters.length}
                    </Badge>
                  </div>
                  <CardDescription>{currentCharacter.pronunciation}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Large Character Display */}
                  <div className="flex justify-center items-center bg-white rounded-lg border-2 border-[#D2691E] p-8">
                    <div 
                      className="text-9xl"
                      style={{ fontFamily: "'UMWEROalpha', serif" }}
                    >
                      {currentCharacter.umwero}
                    </div>
                  </div>

                  {/* Character Info */}
                  {currentCharacter.meaning && (
                    <div className="p-4 bg-[#F3E5AB] rounded-lg">
                      <p className="font-semibold text-[#8B4513]">Meaning:</p>
                      <p>{currentCharacter.meaning}</p>
                    </div>
                  )}

                  {currentCharacter.culturalNote && (
                    <div className="p-4 bg-[#FFF8DC] rounded-lg border border-[#D2691E]">
                      <p className="font-semibold text-[#8B4513] mb-1">Cultural Note:</p>
                      <p className="text-sm italic">{currentCharacter.culturalNote}</p>
                    </div>
                  )}

                  {/* Stroke Order */}
                  <div>
                    <h4 className="font-semibold text-[#8B4513] mb-2">Stroke Order:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {currentCharacter.strokeOrder.map((stroke, index) => (
                        <li key={index} className="text-sm">{stroke}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Example Words */}
                  <div>
                    <h4 className="font-semibold text-[#8B4513] mb-3">Example Words:</h4>
                    <div className="space-y-2">
                      {currentCharacter.exampleWords.map((word, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-4">
                            <span 
                              className="text-3xl"
                              style={{ fontFamily: "'UMWEROalpha', serif" }}
                            >
                              {word.umwero}
                            </span>
                            <div>
                              <p className="font-semibold">{word.latin}</p>
                              <p className="text-sm text-gray-600">{word.meaning}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Practice Canvas */}
              <Card className="border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="text-[#8B4513]">Practice Writing</CardTitle>
                  <CardDescription>Trace or write the character</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reference Character (Light) */}
                  <div className="relative">
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-9xl opacity-10 pointer-events-none"
                      style={{ fontFamily: "'UMWEROalpha', serif" }}
                    >
                      {currentCharacter.umwero}
                    </div>
                    
                    {/* Drawing Canvas */}
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={400}
                      className="border-2 border-[#8B4513] rounded-lg w-full cursor-crosshair touch-none"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={stopDrawing}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={clearCanvas}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    <Button
                      onClick={() => setShowHint(!showHint)}
                      variant="outline"
                      className="flex-1"
                    >
                      {showHint ? 'Hide' : 'Show'} Hint
                    </Button>
                  </div>

                  {showHint && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <p className="font-semibold mb-1">💡 Tip:</p>
                      <p>Start from the center and follow the stroke order shown above.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={prevCharacter}
                    disabled={characterIndex === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={nextCharacter}
                    disabled={characterIndex === lessonData.characters.length - 1}
                    className="flex-1 bg-[#8B4513] hover:bg-[#A0522D]"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Practice Section */}
          <TabsContent value="practice">
            <Card className="border-[#8B4513]">
              <CardHeader>
                <CardTitle className="text-[#8B4513]">
                  Practice Exercise {practiceIndex + 1}
                </CardTitle>
                <CardDescription>
                  {lessonData.exercises[practiceIndex].instruction}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Exercise content would go here - customized per exercise type */}
                <div className="p-8 bg-[#F3E5AB] rounded-lg text-center">
                  <p className="text-lg">
                    Exercise Type: {lessonData.exercises[practiceIndex].type}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Interactive exercise component will render here based on exercise type
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={nextPractice}
                  className="w-full bg-[#8B4513] hover:bg-[#A0522D]"
                >
                  {practiceIndex === lessonData.exercises.length - 1 ? 'Proceed to Quiz' : 'Next Exercise'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Quiz Section */}
          <TabsContent value="quiz">
            {quizScore === 0 ? (
              <Card className="border-[#8B4513]">
                <CardHeader>
                  <CardTitle className="text-[#8B4513]">
                    Question {quizIndex + 1} of {lessonData.quiz.questions.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg font-semibold">
                    {lessonData.quiz.questions[quizIndex].question}
                  </p>

                  {lessonData.quiz.questions[quizIndex].options && (
                    <div className="space-y-3">
                      {lessonData.quiz.questions[quizIndex].options!.map((option, index) => (
                        <Button
                          key={index}
                          onClick={() => handleQuizAnswer(quizIndex, index)}
                          variant={userAnswers[quizIndex] === index ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto py-4"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  {quizIndex < lessonData.quiz.questions.length - 1 ? (
                    <Button
                      onClick={nextQuestion}
                      disabled={userAnswers[quizIndex] === undefined}
                      className="w-full bg-[#8B4513] hover:bg-[#A0522D]"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      onClick={submitQuiz}
                      disabled={Object.keys(userAnswers).length < lessonData.quiz.questions.length}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Submit Quiz
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ) : (
              // Quiz Results
              <Card className="border-[#8B4513] text-center">
                <CardHeader>
                  <CardTitle className="text-[#8B4513] text-3xl">
                    Quiz Complete!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Trophy className="h-24 w-24 text-yellow-500 mb-4" />
                    <p className="text-6xl font-bold text-[#8B4513]">{quizScore}%</p>
                    <p className="text-lg text-gray-600 mt-2">
                      {quizScore >= 70 ? 'Congratulations! You passed!' : 'Keep practicing!'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F3E5AB] rounded-lg">
                      <p className="text-sm text-gray-600">Questions Answered</p>
                      <p className="text-2xl font-bold text-[#8B4513]">
                        {lessonData.quiz.questions.length}
                      </p>
                    </div>
                    <div className="p-4 bg-[#F3E5AB] rounded-lg">
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-2xl font-bold text-[#8B4513]">{quizScore}%</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={onExit}
                    variant="outline"
                    className="flex-1"
                  >
                    Return to Dashboard
                  </Button>
                  <Button
                    onClick={() => {
                      setQuizScore(0)
                      setQuizIndex(0)
                      setUserAnswers({})
                    }}
                    className="flex-1 bg-[#8B4513] hover:bg-[#A0522D]"
                  >
                    Retake Quiz
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}