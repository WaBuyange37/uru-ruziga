'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Simplified version using your existing UI components
export function VowelLesson() {
  const vowels = [
    { umwero: '"', latin: 'a', pronunciation: '/a/ as in father', meaning: 'Represents Cows' },
    { umwero: '|', latin: 'e', pronunciation: '/e/ as in bed', meaning: 'e e e ' },
    { umwero: '}', latin: 'i', pronunciation: '/i/ as in machine', meaning: 'i i i ' },
    { umwero: '{', latin: 'o', pronunciation: '/o/ as in note', meaning: 'o o o ' },
    { umwero: ':', latin: 'u', pronunciation: '/u/ as in rude', meaning: 'u u u ' },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const current = vowels[currentIndex]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-[#F3E5AB] border-[#8B4513]">
        <CardHeader>
          <CardTitle className="text-[#8B4513] text-2xl">
            Learn Umwero Vowels (Inyajwi)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Character Display */}
          <div className="bg-white rounded-lg p-8 text-center border-2 border-[#D2691E]">
            <div 
              className="text-9xl mb-4"
              style={{ fontFamily: "'UMWEROalpha', serif" }}
            >
              {current.umwero}
            </div>
            <div className="text-4xl font-bold text-[#8B4513] mb-2">
              {current.latin.toUpperCase()}
            </div>
            <p className="text-lg text-[#D2691E]">{current.pronunciation}</p>
          </div>

          {/* Info */}
          <div className="bg-[#FFF8DC] p-4 rounded-lg border border-[#D2691E]">
            <p className="font-semibold text-[#8B4513]">Cultural Meaning:</p>
            <p>{current.meaning}</p>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              variant="outline"
              className="flex-1"
            >
              Previous
            </Button>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[#8B4513] font-semibold">
                {currentIndex + 1} / {vowels.length}
              </span>
            </div>
            <Button
              onClick={() => setCurrentIndex(Math.min(vowels.length - 1, currentIndex + 1))}
              disabled={currentIndex === vowels.length - 1}
              className="flex-1 bg-[#8B4513] hover:bg-[#A0522D]"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}