'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Lesson {
  character: string
  pronunciation: string
  meaning: string
  imageUrl: string
  gifUrl: string
  steps: string[]
}

const lessons: Lesson[] = [
  {
    character: "ა",
    pronunciation: "a",
    meaning: "First letter of the Umwero alphabet",
    imageUrl: "/umwero-characters/a.png",
    gifUrl: "/umwero-characters/a-writing.gif",
    steps: [
      "Start with a small circle in the center",
      "Draw a line extending upwards from the circle",
      "Curve the line to the right, forming a hook shape",
    ],
  },
  // Add more lessons here
]

export function InteractiveUmweroLesson() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const currentLesson = lessons[currentLessonIndex];

  const progress = ((currentLessonIndex * 3 + currentStepIndex + 1) / (lessons.length * 3)) * 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGrid(ctx);
      }
    }
  }, [currentStepIndex]);

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 20;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Vertical lines (unchanged)
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Horizontal lines with the specified pattern
    let skipCount = 0;
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      if (skipCount === 0 || skipCount === 1) {
        ctx.strokeStyle = '#FF0000'; // Red color
      } else {
        ctx.strokeStyle = '#D3D3D3'; // Light gray color
      }

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();

      if (skipCount === 0) {
        skipCount = 1;
      } else if (skipCount === 1) {
        skipCount = 2;
      } else if (skipCount === 3) {
        skipCount = 2;
      } else {
        skipCount = 0;
      }
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < 2) {
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
      setCurrentStepIndex(2)
    }
  }

  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (canvas && isDrawing) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      startDrawing(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      draw(x, y);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      startDrawing(x, y);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      draw(x, y);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx);
      }
    }
  };


  return (
    <Card className="w-full max-w-4xl mx-auto bg-[#F3E5AB] border-[#8B4513]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#8B4513]">
          Learn Umwero: <span className="font-umwero">{currentLesson.character}</span>
        </CardTitle>
        <CardDescription className="text-[#D2691E]">
          Pronunciation: {currentLesson.pronunciation} | Meaning: {currentLesson.meaning}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="grid grid-cols-1 gap-4">
          {currentStepIndex === 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#8B4513] mb-2">Introduction</h3>
              <Image src={currentLesson.imageUrl || "/placeholder.svg"} alt={`Umwero character ${currentLesson.character}`} width={300} height={300} className="mx-auto" />
            </div>
          )}
          {currentStepIndex === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-[#8B4513] mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-[#D2691E]">
                {currentLesson.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <Image src={currentLesson.gifUrl || "/placeholder.svg"} alt={`How to write Umwero character ${currentLesson.character}`} width={300} height={300} className="mx-auto mt-4" />
            </div>
          )}
          {currentStepIndex === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-[#8B4513] mb-2">Practice Area</h3>
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border-2 border-[#8B4513] rounded-md touch-none mx-auto"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={stopDrawing}
              />
              <Button onClick={clearCanvas} className="mt-2 bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D] mx-auto block">
                Clear Canvas
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-4">
          <Button onClick={handlePreviousStep} disabled={currentLessonIndex === 0 && currentStepIndex === 0} className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
            Previous
          </Button>
          <Button onClick={handleNextStep} disabled={currentLessonIndex === lessons.length - 1 && currentStepIndex === 2} className="bg-[#8B4513] text-[#F3E5AB] hover:bg-[#A0522D]">
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

