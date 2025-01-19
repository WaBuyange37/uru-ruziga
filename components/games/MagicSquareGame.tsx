"use client"

import React, { useState } from 'react'
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"

const magicSquareNumbers = [
  [4, 18, 33, 83],
  [27, 5, 91, 15],
  [90, 16, 11, 21],
  [17, 99, 3, 19]
]

export function MagicSquareGame() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [result, setResult] = useState<string | null>(null)

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, number])
    }
  }

  const calculateSum = () => {
    const sum = selectedNumbers.reduce((acc, num) => acc + num, 0)
    const digitSum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0)
    const finalSum = digitSum > 9 ? digitSum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0) : digitSum
    setResult(`Sum: ${sum}, Digit Sum: ${finalSum}`)
  }

  const resetGame = () => {
    setSelectedNumbers([])
    setResult(null)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Magic Square of Numerology 3 for Pisces</CardTitle>
        <CardDescription>Select four numbers and verify if their sum's digits equal 3</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {magicSquareNumbers.flat().map((number, index) => (
            <Button
              key={index}
              onClick={() => handleNumberClick(number)}
              disabled={selectedNumbers.includes(number) || selectedNumbers.length >= 4}
              variant={selectedNumbers.includes(number) ? "secondary" : "outline"}
            >
              {number}
            </Button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div>Selected: {selectedNumbers.join(', ')}</div>
          <div className="space-x-2">
            <Button onClick={calculateSum} disabled={selectedNumbers.length !== 4}>Calculate</Button>
            <Button onClick={resetGame} variant="outline">Reset</Button>
          </div>
        </div>
        {result && (
          <div className="mt-4 text-center font-bold">
            {result}
            <div className="text-sm font-normal mt-2">
              {result.endsWith('3') ? "Magic square verified!" : "Try again!"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

