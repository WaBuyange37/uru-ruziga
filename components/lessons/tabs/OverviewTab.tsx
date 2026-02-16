'use client'

import { Volume2, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface OverviewTabProps {
  character: {
    umwero: string
    vowel?: string
    consonant?: string
    pronunciation: string
    meaning: string
    examples: Array<{ umwero: string; latin: string; meaning: string }>
    audioUrl?: string
    imageUrl?: string
  }
}

export function OverviewTab({ character }: OverviewTabProps) {
  const playAudio = () => {
    if (character.audioUrl) {
      const audio = new Audio(character.audioUrl)
      audio.play().catch(err => console.error('Audio playback failed:', err))
    }
  }

  return (
    <div className="space-y-6">
      {/* Large Character Display with Actual Image */}
      <Card className="bg-gradient-to-br from-[#FFF8DC] to-[#F3E5AB] border-2 border-[#D2691E]">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            {character.imageUrl ? (
              <div className="relative w-full max-w-md aspect-square mb-4">
                <Image
                  src={character.imageUrl}
                  alt={`Umwero character ${character.vowel || character.consonant}`}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Fallback to text rendering if image fails
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div 
                className="text-[180px] leading-none mb-4"
                style={{ fontFamily: "'UMWEROalpha', serif" }}
              >
                {character.umwero}
              </div>
            )}
            <Button
              onClick={playAudio}
              variant="outline"
              className="gap-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB]"
            >
              <Volume2 className="h-4 w-4" />
              Hear Pronunciation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pronunciation - Only show if available */}
      {character.pronunciation && (
        <Card className="border-[#8B4513]">
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#8B4513] mb-2">Pronunciation</h3>
            <p className="text-lg">{character.pronunciation}</p>
          </CardContent>
        </Card>
      )}

      {/* Keyboard Mapping */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Keyboard className="h-5 w-5 text-blue-700" />
            <h3 className="font-semibold text-blue-900">Keyboard Mapping</h3>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-4 py-2 bg-white border-2 border-gray-300 rounded text-xl font-mono">
              {character.vowel || character.consonant}
            </kbd>
            <span className="text-2xl">→</span>
            <div 
              className="text-5xl"
              style={{ fontFamily: "'UMWEROalpha', serif" }}
            >
              {character.umwero}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meaning - Only show if available */}
      {character.meaning && (
        <Card className="bg-[#FFF8DC] border-[#D2691E]">
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#8B4513] mb-2">Symbolic Meaning</h3>
            <p>{character.meaning}</p>
          </CardContent>
        </Card>
      )}

      {/* Example Words - Only show if available */}
      {character.examples && character.examples.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#8B4513] mb-3">Example Words</h3>
          <div className="space-y-2">
            {character.examples.map((example, idx) => (
              <Card key={idx} className="border-[#F3E5AB]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="text-4xl"
                      style={{ fontFamily: "'UMWEROalpha', serif" }}
                    >
                      {example.umwero}
                    </div>
                    <div>
                      <p className="font-bold text-[#8B4513]">{example.latin}</p>
                      <p className="text-sm text-gray-600">{example.meaning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
