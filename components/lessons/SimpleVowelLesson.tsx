'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from 'lucide-react'

// Real Umwero vowel data
const UMWERO_VOWELS = [
  {
    umwero: '"',
    latin: 'a',
    pronunciation: '/a/ as in "father"',
    meaning: 'Represents earth and foundation',
    culturalNote: 'The character for "a" symbolizes the grounding force of earth in Rwandan philosophy',
    examples: [
      { umwero: '"M"Z}', latin: 'amazi', meaning: 'water' },
      { umwero: '"A"', latin: 'aba', meaning: 'these' },
    ]
  },
  {
    umwero: '|',
    latin: 'e',
    pronunciation: '/e/ as in "bed"',
    meaning: 'Represents air and breath',
    culturalNote: 'Air is the breath of life in Rwandan philosophy',
    examples: [
      { umwero: '|M|', latin: 'eme', meaning: 'stand' },
      { umwero: 'N|', latin: 'ne', meaning: 'and' },
    ]
  },
  {
    umwero: '}',
    latin: 'i',
    pronunciation: '/i/ as in "machine"',
    meaning: 'Represents water and flow',
    culturalNote: 'Water symbolizes adaptability and life force',
    examples: [
      { umwero: '}A}', latin: 'ibi', meaning: 'these things' },
      { umwero: '}N}', latin: 'ini', meaning: 'liver' },
    ]
  },
  {
    umwero: '{',
    latin: 'o',
    pronunciation: '/o/ as in "note"',
    meaning: 'Represents spirit and wholeness',
    culturalNote: 'The circle represents unity and completeness',
    examples: [
      { umwero: 'K{S{', latin: 'koko', meaning: 'chicken' },
      { umwero: 'G{S{', latin: 'goko', meaning: 'arm' },
    ]
  },
  {
    umwero: ':',
    latin: 'u',
    pronunciation: '/u/ as in "rude"',
    meaning: 'Represents fire and energy',
    culturalNote: 'Fire is the transformative element in creation',
    examples: [
      { umwero: ':M:G{', latin: 'umuco', meaning: 'culture' },
      { umwero: ':A:NT:', latin: 'ubuntu', meaning: 'humanity' },
    ]
  },
]

export function SimpleVowelLesson() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const current = UMWERO_VOWELS[currentIndex]

  const next = () => {
    if (currentIndex < UMWERO_VOWELS.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-b from-[#F3E5AB] to-white rounded-lg">
      {/* Header */}
      <div className="bg-[#8B4513] text-[#F3E5AB] p-6 rounded-t-lg mb-6">
        <h1 className="text-3xl font-bold mb-2">Inyajwi - The Five Sacred Vowels</h1>
        <p className="text-sm opacity-90">Learn the foundation of Umwero alphabet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Character Display */}
        <Card className="border-[#8B4513]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#8B4513] text-2xl">
                Vowel: {current.latin.toUpperCase()}
              </CardTitle>
              <span className="text-[#D2691E] font-semibold">
                {currentIndex + 1} / {UMWERO_VOWELS.length}
              </span>
            </div>
            <CardDescription>{current.pronunciation}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Large Character Display */}
            <div className="flex justify-center items-center bg-white rounded-lg border-2 border-[#D2691E] p-12">
              <div 
                className="text-[180px] leading-none"
                style={{ fontFamily: "'UMWEROalpha', serif" }}
              >
                {current.umwero}
              </div>
            </div>

            {/* Meaning */}
            <div className="p-4 bg-[#F3E5AB] rounded-lg">
              <p className="font-semibold text-[#8B4513] mb-1">Meaning:</p>
              <p className="text-gray-700">{current.meaning}</p>
            </div>

            {/* Cultural Note */}
            <div className="p-4 bg-[#FFF8DC] rounded-lg border border-[#D2691E]">
              <p className="font-semibold text-[#8B4513] mb-1">🌍 Cultural Context:</p>
              <p className="text-sm italic text-gray-700">{current.culturalNote}</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Examples */}
        <Card className="border-[#8B4513]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Example Words</CardTitle>
            <CardDescription>See how this vowel is used in Kinyarwanda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {current.examples.map((example, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border-2 border-[#F3E5AB]">
                <div className="flex items-center gap-4 mb-2">
                  <div 
                    className="text-5xl"
                    style={{ fontFamily: "'UMWEROalpha', serif" }}
                  >
                    {example.umwero}
                  </div>
                  <div>
                    <p className="font-bold text-xl text-[#8B4513]">{example.latin}</p>
                    <p className="text-sm text-gray-600">{example.meaning}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Learning Tip */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">💡 Learning Tip</p>
              <p className="text-sm text-blue-800">
                Practice pronouncing "{current.latin}" while looking at the Umwero character "{current.umwero}". 
                Connect the sound with the visual form.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <Button
          onClick={prev}
          disabled={currentIndex === 0}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Previous Vowel
        </Button>
        <Button
          onClick={next}
          disabled={currentIndex === UMWERO_VOWELS.length - 1}
          size="lg"
          className="flex-1 bg-[#8B4513] hover:bg-[#A0522D]"
        >
          Next Vowel
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 flex gap-2 justify-center">
        {UMWERO_VOWELS.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-12 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-[#8B4513]'
                : index < currentIndex
                ? 'bg-[#D2691E]'
                : 'bg-[#F3E5AB]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}