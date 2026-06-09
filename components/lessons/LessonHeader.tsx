'use client'

import { ArrowLeft, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface LessonHeaderProps {
  lesson: {
    title: string
    description?: string
  }
  character: {
    umwero: string
    vowel?: string
    consonant?: string
  }
  progress: number
}

export function LessonHeader({ lesson, character, progress }: LessonHeaderProps) {
  const router = useRouter()

  return (
    <div className="sticky top-0 z-50 border-b border-[#8B4513]/20 bg-white">
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/learn')}
              className="text-[#8B4513] hover:bg-white"
              aria-label="Back to lessons"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div 
                className="text-5xl leading-none"
                style={{ fontFamily: "'UMWEROalpha', serif" }}
              >
                {character.umwero}
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">
                  {lesson.title}
                </h1>
                <p className="text-sm text-black/65">
                  Character: {character.vowel || character.consonant}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/learn')}
            className="text-[#8B4513] hover:bg-white"
            aria-label="Close lesson"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#8B4513]">
            <span>Lesson Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  )
}
