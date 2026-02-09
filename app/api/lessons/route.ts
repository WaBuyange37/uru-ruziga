// app/api/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'
import { hasPermission } from '@/lib/permissions'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateRequest, createLessonSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

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
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.API_GENERAL)
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions (TEACHER or ADMIN only)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    })

    if (!user || !hasPermission(user.role as any, 'canCreateLesson')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Teacher or Admin role required.' },
        { status: 403 }
      )
    }

    // Validate input
    const validation = await validateRequest(request.clone(), createLessonSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

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
      prerequisites,
      isPublished,
    } = validation.data

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
        order,
        duration,
        videoUrl: videoUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        prerequisites: prerequisites || [],
        isPublished: isPublished !== undefined ? isPublished : true,
      }
    })

    return NextResponse.json({
      lesson,
      message: 'Lesson created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
