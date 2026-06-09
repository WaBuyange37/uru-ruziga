'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Globe, Heart } from 'lucide-react'
import { getFoundationSummary, getUmweroLessonContent } from '@/lib/umwero-lesson-content'

interface CultureTabProps {
  character: {
    culturalNote: string
    meaning: string
    vowel?: string
    consonant?: string
  }
}

export function CultureTab({ character }: CultureTabProps) {
  const lessonContent = getUmweroLessonContent(character)

  return (
    <div className="space-y-6">
      <Card className="border border-[#8B4513]/20 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-[#8B4513]" />
                <h3 className="text-xl font-semibold text-black">{lessonContent.cultureTitle}</h3>
              </div>
              <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
                {lessonContent.culture}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#8B4513]/20 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-[#8B4513]" />
                <h3 className="text-xl font-semibold text-black">{lessonContent.meaningTitle}</h3>
              </div>
              <p className="text-black/70 leading-relaxed whitespace-pre-wrap">
                {lessonContent.meaning}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[#8B4513]/20 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div>
              <h3 className="text-xl font-semibold text-black mb-3">Cultural Foundations</h3>
              <p className="text-black/70 leading-relaxed mb-4">
                {getFoundationSummary()}
              </p>
              <a 
                href="/culture-and-history" 
                className="inline-block rounded-lg bg-[#8B4513] px-4 py-2 text-white transition-colors hover:bg-[#A0522D]"
              >
                Explore Culture & History
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
