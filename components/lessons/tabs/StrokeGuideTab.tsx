'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Pen, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface StrokeGuideTabProps {
  character: {
    umwero: string
    strokeGuide: string[]
    strokeImageUrl?: string
    imageUrl?: string
  }
}

export function StrokeGuideTab({ character }: StrokeGuideTabProps) {
  return (
    <div className="space-y-6">
      {/* Character Display */}
      <Card className="bg-gradient-to-br from-[#FFF8DC] to-[#F3E5AB] border-2 border-[#D2691E]">
        <CardContent className="p-8">
          <div className="flex justify-center">
            {character.imageUrl ? (
              <div className="relative w-full max-w-md aspect-square">
                <Image
                  src={character.imageUrl}
                  alt={`Character ${character.umwero}`}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div 
                className="text-[200px] leading-none"
                style={{ fontFamily: "'UMWEROalpha', serif" }}
              >
                {character.umwero}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stroke Direction Image */}
      {character.strokeImageUrl && (
        <Card className="border-2 border-[#8B4513]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Pen className="h-5 w-5 text-[#8B4513]" />
              <h3 className="text-xl font-semibold text-[#8B4513]">Stroke Direction Guide</h3>
            </div>
            <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden">
              <Image
                src={character.strokeImageUrl}
                alt="Stroke direction guide"
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stroke Instructions (if available from database) */}
      {character.strokeGuide && character.strokeGuide.length > 0 && (
        <Card className="border-2 border-[#8B4513]">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Writing Instructions</h3>
            <ol className="space-y-4">
              {character.strokeGuide.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B4513] text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-800">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-yellow-50 border-2 border-yellow-200">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-yellow-900 mb-4">✍️ Writing Tips</h3>
          <ul className="space-y-3 text-yellow-900">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Start slowly and focus on accuracy rather than speed</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Follow the stroke order exactly as shown for proper form</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Use the grid lines in the practice canvas to maintain proportion</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Practice each stroke multiple times before moving to the next</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Toggle the reference guide on/off to test your memory</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Practice Reminder */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Ready to Practice?</h3>
            <p className="text-green-700">
              Use the practice canvas on the right to try writing this character. 
              The AI will evaluate your strokes and provide feedback!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
