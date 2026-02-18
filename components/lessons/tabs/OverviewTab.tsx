'use client'

import { Volume2, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { AudioPlayer } from '@/components/learn/AudioPlayer'
import { getAudioPath, getKeyboardMapping, getUmweroAscii, getUmweroName, LATIN_TO_UMWERO_ASCII } from '@/lib/audio-utils'

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
  // Get the correct audio path using our mapping system
  const characterKey = character.vowel || character.consonant || ''
  const audioPath = getAudioPath(characterKey) || character.audioUrl
  
  // Get Umwero ASCII representation and name
  const umweroAscii = getUmweroAscii(characterKey)
  const umweroName = getUmweroName(characterKey)
  const keyboardMapping = getKeyboardMapping(characterKey)

  return (
    <div className="space-y-6">
      {/* Large Character Display with Real Umwero Character */}
      <Card className="bg-gradient-to-br from-[#FFF8DC] to-[#F3E5AB] border-2 border-[#D2691E]">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            {/* Always show the real Umwero character - Large, Bold, and Prominent */}
            <div 
              className="text-[240px] leading-none mb-6 text-[#8B4513] font-bold drop-shadow-lg"
              style={{ fontFamily: "'UMWEROalpha', 'Umwero', monospace" }}
            >
              {umweroAscii}
            </div>
            
            {/* Character name */}
            <h2 className="text-3xl font-bold text-[#8B4513] mb-6 text-center">
              {character.vowel ? `Vowel ${character.vowel?.toUpperCase()}: ${umweroName}` : 
               character.consonant ? `Consonant ${character.consonant?.toUpperCase()}: ${umweroName}` : 
               umweroName}
            </h2>
            
            {/* Audio Player */}
            {audioPath && (
              <AudioPlayer
                src={audioPath}
                label="Hear Pronunciation"
                size="lg"
                variant="outline"
                className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#F3E5AB] px-8 py-4 text-lg font-semibold"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pronunciation - Only show if available */}
      {character.pronunciation && (
        <Card className="border-2 border-[#8B4513]">
          <CardContent className="p-6">
            <h3 className="font-bold text-xl text-[#8B4513] mb-3">Pronunciation</h3>
            <p className="text-2xl text-[#D2691E] font-semibold">{character.pronunciation}</p>
          </CardContent>
        </Card>
      )}

      {/* Keyboard Mapping - Enhanced */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Keyboard className="h-6 w-6 text-blue-700" />
            <h3 className="font-bold text-xl text-blue-900">Keyboard Mapping</h3>
          </div>
          <div className="flex items-center justify-center gap-6 bg-white p-6 rounded-lg border border-blue-300">
            {/* Umwero Character */}
            <div className="text-center">
              <p className="text-sm text-blue-700 font-medium mb-2">Umwero</p>
              <div 
                className="text-8xl font-bold text-blue-800"
                style={{ fontFamily: "'UMWEROalpha', 'Umwero', monospace" }}
              >
                {umweroAscii}
              </div>
            </div>
            
            <div className="text-4xl text-blue-600">=</div>
            
            {/* Latin Character */}
            <div className="text-center">
              <p className="text-sm text-blue-700 font-medium mb-2">Latin</p>
              <kbd className="px-6 py-4 bg-gray-100 border-2 border-gray-400 rounded-lg text-4xl font-mono font-bold text-gray-800">
                {characterKey}
              </kbd>
            </div>
            
            <div className="text-4xl text-blue-600">=</div>
            
            {/* ASCII Code */}
            <div className="text-center">
              <p className="text-sm text-blue-700 font-medium mb-2">ASCII</p>
              <div className="px-4 py-3 bg-gray-100 border-2 border-gray-400 rounded-lg">
                <span className="text-2xl font-mono font-bold text-gray-800">{characterKey.charCodeAt(0)}</span>
              </div>
            </div>
          </div>
          <p className="text-center text-blue-700 mt-4 text-sm">
            Press <kbd className="px-2 py-1 bg-white border border-blue-300 rounded font-mono">{characterKey}</kbd> on your keyboard to type <span className="font-bold" style={{ fontFamily: "'UMWEROalpha', 'Umwero', monospace" }}>{umweroAscii}</span>
          </p>
        </CardContent>
      </Card>

      {/* Meaning - Only show if available */}
      {character.meaning && (
        <Card className="bg-[#FFF8DC] border-2 border-[#D2691E]">
          <CardContent className="p-6">
            <h3 className="font-bold text-xl text-[#8B4513] mb-3">Symbolic Meaning</h3>
            <p className="text-lg text-[#8B4513]">{character.meaning}</p>
          </CardContent>
        </Card>
      )}

      {/* Example Words - Only show if available */}
      {character.examples && character.examples.length > 0 && (
        <div>
          <h3 className="font-bold text-xl text-[#8B4513] mb-4">Example Words</h3>
          <div className="space-y-3">
            {character.examples.map((example, idx) => (
              <Card key={idx} className="border-2 border-[#F3E5AB] bg-gradient-to-r from-[#FFF8DC] to-[#F3E5AB]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div 
                        className="text-6xl font-bold text-[#8B4513]"
                        style={{ fontFamily: "'UMWEROalpha', 'Umwero', monospace" }}
                      >
                        {example.umwero}
                      </div>
                      <div>
                        <p className="font-bold text-[#8B4513] text-2xl">{example.latin}</p>
                        <p className="text-lg text-[#D2691E] mt-1">{example.meaning}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#D2691E]">{example.latin}</p>
                      <p className="text-sm text-gray-600">pronunciation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Learning Tip */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="font-bold text-xl text-blue-900 mb-2">Learning Tip</h4>
              <p className="text-blue-800 text-lg leading-relaxed">
                Practice pronouncing "<strong>{characterKey}</strong>" while looking at the Umwero character <span className="text-2xl font-bold" style={{ fontFamily: "'UMWEROalpha', 'Umwero', monospace" }}>{umweroAscii}</span>. 
                Connect the sound with the visual form to strengthen your memory. Use the audio button above to hear the correct pronunciation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
