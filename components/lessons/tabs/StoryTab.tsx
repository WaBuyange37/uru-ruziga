'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BookMarked, FileText } from 'lucide-react'

interface StoryTabProps {
  character: {
    vowel?: string
    consonant?: string
    umwero: string
    description?: string
  }
}

export function StoryTab({ character }: StoryTabProps) {
  const charName = character.vowel || character.consonant || ''
  const hasDescription = character.description && character.description.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Character Description - Only if available in database */}
      {hasDescription && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl">📝</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookMarked className="h-5 w-5 text-indigo-700" />
                  <h3 className="text-xl font-semibold text-indigo-800">About This Character</h3>
                </div>
                <p className="text-indigo-900 leading-relaxed whitespace-pre-wrap">
                  {character.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Umwero Documentation Resources */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">📚</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-amber-700" />
                <h3 className="text-xl font-semibold text-amber-800">Authentic Documentation</h3>
              </div>
              <p className="text-amber-900 leading-relaxed mb-4">
                Learn more about Umwero script from the original creator's documentation:
              </p>
              <div className="space-y-2">
                <a 
                  href="/doc-umwero-explained/Umwero Visual Cultural-1.pdf" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-amber-900"
                >
                  📄 Umwero Visual Cultural Guide
                </a>
                <a 
                  href="/doc-umwero-explained/UmweroIPA-1.pdf" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-amber-900"
                >
                  📄 Umwero IPA (Phonetic Guide)
                </a>
                <a 
                  href="/doc-umwero-explained/Umwero Ibihekane (3).pdf" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-amber-900"
                >
                  📄 Umwero Ibihekane
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder if no description */}
      {!hasDescription && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Character Story Coming Soon
            </h3>
            <p className="text-gray-600">
              Detailed information about "{charName}" will be added from authentic Umwero documentation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
