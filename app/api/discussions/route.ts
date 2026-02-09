// app/api/discussions/route.ts
// Discussions API with FULL Umwero support (NO conversion to Latin)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateRequest, createDiscussionSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

/**
 * GET /api/discussions
 * Fetch all discussions with UTF-8 preservation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const script = searchParams.get('script')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (script) {
      where.script = script
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatar: true,
              role: true,
            }
          },
          _count: {
            select: {
              comments: true,
            }
          }
        }
      }),
      prisma.discussion.count({ where })
    ])

    return NextResponse.json({
      discussions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    })

  } catch (error: any) {
    console.error('Get discussions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/discussions
 * Create new discussion with Umwero/Latin support
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, {
      interval: 60 * 60 * 1000, // 1 hour
      uniqueTokenPerInterval: 5, // 5 discussions per hour
    })
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Validate input
    const validation = await validateRequest(request.clone(), createDiscussionSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { title, content, script, category, mediaUrls } = validation.data

    // Normalize script to lowercase for DB storage
    const normalizedScript = script.toLowerCase()

    // Create discussion (UTF-8 preserved)
    const discussion = await prisma.discussion.create({
      data: {
        userId: decoded.userId,
        title,
        content,
        script: normalizedScript,
        category,
        mediaUrls,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
            role: true,
          }
        },
        _count: {
          select: {
            comments: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      discussion,
      message: 'Discussion created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create discussion error:', error)
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    )
  }
}
