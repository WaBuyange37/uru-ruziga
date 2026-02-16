'use client'

import { useParams } from 'next/navigation'
import { LessonWorkspace } from '@/components/lessons/LessonWorkspace'

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.lessonId as string

  return <LessonWorkspace lessonId={lessonId} />
}
