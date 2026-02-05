// app/api/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const module = searchParams.get('module')
    const type = searchParams.get('type')

    const where: any = {}
    
    if (module) {
      where.module = module
    }
    
    if (type) {
      where.type = type
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: [
        { module: 'asc' },
        { order: 'asc' }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        module: true,
        type: true,
        order: true,
        duration: true,
        isPublished: true,
        videoUrl: true,
        thumbnailUrl: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      lessons,
      count: lessons.length
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      content,
      module,
      type,
      order,
      duration,
      videoUrl,
      thumbnailUrl,
    } = body

    // Validation
    if (!title || !description || !content || !module || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Parse content if it's a string
    let parsedContent = content
    if (typeof content === 'string') {
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON content' },
          { status: 400 }
        )
      }
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        content: parsedContent,
        module,
        type,
        order: order || 1,
        duration: duration || 10,
        videoUrl: videoUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        isPublished: true,
      }
    })

    return NextResponse.json({
      lesson,
      message: 'Lesson created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
