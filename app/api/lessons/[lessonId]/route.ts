import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedLesson, setCachedLesson } from '@/lib/lesson-cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params

    // Try cache first
    const cachedLesson = getCachedLesson(lessonId)
    if (cachedLesson) {
      return NextResponse.json({ lesson: cachedLesson })
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        module: true,
        type: true,
        order: true,
        duration: true,
        videoUrl: true,
        thumbnailUrl: true,
        prerequisites: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    if (!lesson.isPublished) {
      return NextResponse.json(
        { error: 'Lesson not available' },
        { status: 403 }
      )
    }

    // Cache the lesson for future requests
    setCachedLesson(lesson)

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}
