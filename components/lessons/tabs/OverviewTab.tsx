'use client'

import { Keyboard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AudioPlayer } from '@/components/learn/AudioPlayer'
import { getAudioPath, getKeyboardMapping, getUmweroAscii, getUmweroName } from '@/lib/audio-utils'

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
    <div className="space-y-4">
      {/* Large Character Display with Real Umwero Character */}
      <Card className="border border-[#8B4513]/25 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center">
            {/* Always show the real Umwero character - Large, Bold, and Prominent */}
            <div 
              className="mb-4 text-[160px] font-bold leading-none text-[#8B4513]"
              style={{ fontFamily: "'UMWEROalpha', 'Umwero', monospace" }}
            >
              {umweroAscii}
            </div>
            
            {/* Character name */}
            <h2 className="mb-4 text-center text-2xl font-bold text-black">
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
                className="border-[#8B4513] text-[#8B4513] hover:bg-white"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <details className="rounded-lg border border-[#8B4513]/20 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#8B4513]">
          Character details
        </summary>

        <div className="mt-4 space-y-4">
          {character.pronunciation && (
            <div>
              <h3 className="mb-1 font-semibold text-black">Pronunciation</h3>
              <p className="text-black/70">{character.pronunciation}</p>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-[#8B4513]" />
              <h3 className="font-semibold text-black">Keyboard mapping</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#8B4513]/15 bg-white p-3 text-center">
              <div>
                <p className="mb-1 text-xs font-medium text-black/55">Umwero</p>
                <div className="text-4xl font-bold text-[#8B4513]" style={{ fontFamily: "'UMWEROalpha', 'Umwero', monospace" }}>
                  {umweroAscii}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-black/55">Latin</p>
                <kbd className="inline-flex min-h-10 items-center rounded border border-[#8B4513]/25 bg-white px-3 font-mono text-lg text-black">
                  {keyboardMapping || characterKey}
                </kbd>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-black/55">ASCII</p>
                <span className="inline-flex min-h-10 items-center rounded border border-[#8B4513]/25 bg-white px-3 font-mono text-lg text-black">
                  {characterKey.charCodeAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </details>

      {/* Meaning - Only show if available */}
      {character.meaning && (
        <Card className="border border-[#8B4513]/20 bg-white">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold text-black">Symbolic meaning</h3>
            <p className="text-sm text-black/70">{character.meaning}</p>
          </CardContent>
        </Card>
      )}

      {/* Example Words - Only show if available */}
      {character.examples && character.examples.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-black">Example words</h3>
          <div className="space-y-3">
            {character.examples.map((example, idx) => (
              <Card key={idx} className="border border-[#8B4513]/20 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="text-4xl font-bold text-[#8B4513]"
                        style={{ fontFamily: "'UMWEROalpha', 'Umwero', monospace" }}
                      >
                        {example.umwero}
                      </div>
                      <div>
                        <p className="font-bold text-black">{example.latin}</p>
                        <p className="mt-1 text-sm text-black/65">{example.meaning}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-black/60">
        Next: draw the character on the practice canvas and submit your writing.
      </p>
    </div>
  )
}
