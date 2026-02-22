'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Globe, Heart } from 'lucide-react'

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
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl">🌍</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-5 w-5 text-amber-700" />
                  <h3 className="text-xl font-semibold text-amber-800">Cultural Significance</h3>
                </div>
                <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">
                  {character.culturalNote}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symbolic Meaning - Only if available in database */}
      {hasMeaning && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl">✨</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-purple-700" />
                  <h3 className="text-xl font-semibold text-purple-800">Symbolic Representation</h3>
                </div>
                <p className="text-purple-900 leading-relaxed whitespace-pre-wrap">
                  {character.meaning}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placeholder if no cultural content available */}
      {!hasCulturalNote && !hasMeaning && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Cultural Content Coming Soon
            </h3>
            <p className="text-gray-600">
              Detailed cultural information for this character will be added from authentic Umwero documentation.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Link to Documentation */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">📖</div>
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Learn More</h3>
              <p className="text-blue-900 leading-relaxed mb-4">
                For comprehensive information about Umwero script, explore the authentic documentation 
                in the resources section.
              </p>
              <a 
                href="/doc-umwero-explained/umweroChart.PNG" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
