"use client"

import React, { useState } from 'react'
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Progress } from "../ui/progress"
import { useDrawing } from "../../hooks/useDrawing"

interface Lesson {
  character: string
  pronunciation: string
  meaning: string
  steps: string[]
}

const lessons: Lesson[] = [
  {
    character: "ა",
    pronunciation: "a",
    meaning: "First letter of the Umwero alphabet",
    steps: [
      "Start with a small circle in the center",
      "Draw a line extending upwards from the circle",
      "Curve the line to the right, forming a hook shape",
    ],
  },
  // Add more lessons here
]

export function InteractiveUmweroLesson() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const { canvasRef, startDrawing, draw, stopDrawing, clearCanvas } = useDrawing()

  const currentLesson = lessons[currentLessonIndex]
  const progress = ((currentLessonIndex * currentLesson.steps.length + currentStepIndex + 1) / (lessons.length * currentLesson.steps.length)) * 100

  const handleNextStep = () => {
    if (currentStepIndex < currentLesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      setCurrentStepIndex(0)
    }
  }

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    } else if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
      setCurrentStepIndex(lessons[currentLessonIndex - 1].steps.length - 1)
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      startDrawing(touch.clientX - rect.left, touch.clientY - rect.top)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      draw(touch.clientX - rect.left, touch.clientY - rect.top)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      startDrawing(e.clientX - rect.left, e.clientY - rect.top)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      draw(e.clientX - rect.left, e.clientY - rect.top)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-[#F3E5AB] border-[#8B4513]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#8B4513]">Learn Umwero: {currentLesson.character}</CardTitle>
        <CardDescription className="text-[#D2691E]">
          Pronunciation: {currentLesson.pronunciation} | Meaning: {currentLesson.meaning}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-[#D2691E]">
              {currentLesson.steps.map((step, index) => (
                <li key={index} className={index === currentStepIndex ? "font-bold" : ""}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">Practice Area</h3>
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="border-2 border-[#8B4513] rounded-md touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={stopDrawing}
            />
            <Button onClick={clearCanvas} className="mt-2 bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
              Clear Canvas
            </Button>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Button onClick={handlePreviousStep} disabled={currentLessonIndex === 0 && currentStepIndex === 0} className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
            Previous Step
          </Button>
          <Button onClick={handleNextStep} disabled={currentLessonIndex === lessons.length - 1 && currentStepIndex === currentLesson.steps.length - 1} className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
            Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

