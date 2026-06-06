'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Globe, Heart } from 'lucide-react'

interface CultureTabProps {
  character: {
    culturalNote: string
    meaning: string
    vowel?: string
    consonant?: string
  }
}

export function CultureTab({ character }: CultureTabProps) {
  // Only display content from database - no fabricated content
  const hasCulturalNote = character.culturalNote && character.culturalNote.trim().length > 0
  const hasMeaning = character.meaning && character.meaning.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Cultural Context - Only if available in database */}
      {hasCulturalNote && (
        <Card className="border border-[#8B4513]/20 bg-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-5 w-5 text-[#8B4513]" />
                  <h3 className="text-xl font-semibold text-black">Cultural Significance</h3>
                </div>
                <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
                  {character.culturalNote}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symbolic Meaning - Only if available in database */}
      {hasMeaning && (
        <Card className="border border-[#8B4513]/20 bg-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-[#8B4513]" />
                  <h3 className="text-xl font-semibold text-black">Symbolic Representation</h3>
                </div>
                <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
                  {character.meaning}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder if no cultural content available */}
      {!hasCulturalNote && !hasMeaning && (
        <Card className="border border-[#8B4513]/20 bg-white">
          <CardContent className="p-8 text-center">
            <BookOpen className="mx-auto mb-4 h-8 w-8 text-[#8B4513]" />
            <h3 className="text-xl font-semibold text-black mb-2">
              Cultural Content Coming Soon
            </h3>
            <p className="text-black/65">
              Detailed cultural information for this character will be added from authentic Umwero documentation.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Link to Documentation */}
      <Card className="border border-[#8B4513]/20 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div>
              <h3 className="text-xl font-semibold text-black mb-3">Learn More</h3>
              <p className="text-black/70 leading-relaxed mb-4">
                For comprehensive information about Umwero script, explore the authentic documentation 
                in the resources section.
              </p>
              <a 
                href="/doc-umwero-explained/umweroChart.PNG" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-[#8B4513] px-4 py-2 text-white transition-colors hover:bg-[#A0522D]"
              >
                View Umwero Chart
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
