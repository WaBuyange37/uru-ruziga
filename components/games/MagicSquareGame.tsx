"use client"

import React, { useState, useEffect, useCallback } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Cell } from "./Cell"

const initialNumbers = [4, 5, 3, 19, 91, 33, 27, 90, 11, 21, 17, 99, 16, 15, 83, 18]

const targetSum = 138 // Sum that equals 3 in numerology (1+3+8=12, 1+2=3)

export function MagicSquareGame() {
  const [numbers, setNumbers] = useState(initialNumbers)
  const [score, setScore] = useState(0)
  const [fontLoaded, setFontLoaded] = useState(false)

  useEffect(() => {
    // Load the Umwero font
    const loadFont = async () => {
      try {
        const font = new FontFace("UMWEROalpha", "url(/UMWEROPUAnumbers.otf)")
        await font.load()
        document.fonts.add(font)
        setFontLoaded(true)
        console.log("Umwero font loaded successfully")
      } catch (error) {
        console.error("Error loading Umwero font:", error)
        alert("Failed to load the Umwero font. Some features may not work correctly.")
      }
    }

    loadFont()
  }, [])

  const checkAlignment = useCallback(() => {
    let newScore = 0

    // Check rows
    for (let i = 0; i < 4; i++) {
      const rowSum = numbers.slice(i * 4, (i + 1) * 4).reduce((a, b) => a + b, 0)
      if (rowSum === targetSum) newScore += 5
    }

    // Check columns
    for (let i = 0; i < 4; i++) {
      const colSum = numbers[i] + numbers[i + 4] + numbers[i + 8] + numbers[i + 12]
      if (colSum === targetSum) newScore += 5
    }

    // Check diagonals
    const diag1Sum = numbers[0] + numbers[5] + numbers[10] + numbers[15]
    const diag2Sum = numbers[3] + numbers[6] + numbers[9] + numbers[12]
    if (diag1Sum === targetSum) newScore += 5
    if (diag2Sum === targetSum) newScore += 5

    setScore(newScore)
  }, [numbers])

  useEffect(() => {
    checkAlignment()
  }, [numbers, checkAlignment])

  const moveCell = useCallback((dragIndex: number, hoverIndex: number) => {
    setNumbers((prevNumbers) => {
      const newNumbers = [...prevNumbers]
      const draggedNumber = newNumbers[dragIndex]
      newNumbers[dragIndex] = newNumbers[hoverIndex]
      newNumbers[hoverIndex] = draggedNumber
      return newNumbers
    })
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className={`w-full max-w-2xl mx-auto ${fontLoaded ? "font-umwero" : ""}`}>
        <CardHeader>
          <CardTitle className="text-3xl">Magic Square of Numerology 3 for Pisces</CardTitle>
          <CardDescription className="text-lg">
            Swap the numbers to create rows, columns, or diagonals that sum to 138 (3 in numerology)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {numbers.map((number, index) => (
              <Cell key={index} number={number} index={index} moveCell={moveCell} fontLoaded={fontLoaded} />
            ))}
          </div>
          <div className="text-center font-bold text-2xl">Score: {score}</div>
        </CardContent>
      </Card>
    </DndProvider>
  )
}

