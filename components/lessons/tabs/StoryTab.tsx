'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BookMarked, FileText } from 'lucide-react'
import { getUmweroLessonContent } from '@/lib/umwero-lesson-content'

interface StoryTabProps {
  character: {
    vowel?: string
    consonant?: string
    umwero: string
    description?: string
  }
}

export function StoryTab({ character }: StoryTabProps) {
  const lessonContent = getUmweroLessonContent(character)
  const hasDescription = Boolean(character.description?.trim())

  return (
    <div className="space-y-6">
      <Card className="border border-[#8B4513]/20 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookMarked className="h-5 w-5 text-[#8B4513]" />
                <h3 className="text-xl font-semibold text-black">{lessonContent.storyTitle}</h3>
              </div>
              <p className="leading-relaxed text-black/70 whitespace-pre-wrap">
                {lessonContent.story}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasDescription && (
        <Card className="border border-[#8B4513]/20 bg-white">
          <CardContent className="p-5">
            <h3 className="mb-3 text-xl font-semibold text-black">Lesson Note</h3>
            <p className="leading-relaxed text-black/70 whitespace-pre-wrap">
              {character.description}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border border-[#8B4513]/20 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-[#8B4513]" />
                <h3 className="text-xl font-semibold text-black">Keep Learning</h3>
              </div>
              <p className="text-black/70 leading-relaxed mb-4">
                Umwero becomes clearer when you connect practice with culture. After writing this character, explore how Imana, Inka, and Ingoma shape the wider story.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a 
                  href="/culture-and-history"
                  className="rounded-lg border border-[#8B4513] px-4 py-2 text-center text-[#8B4513] transition-colors hover:bg-white"
                >
                  Culture & History
                </a>
                <a 
                  href="/learn"
                  className="rounded-lg bg-[#8B4513] px-4 py-2 text-center text-white transition-colors hover:bg-[#A0522D]"
                >
                  More Lessons
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
