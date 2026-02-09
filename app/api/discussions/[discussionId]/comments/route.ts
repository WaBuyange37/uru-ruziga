// app/api/discussions/[discussionId]/comments/route.ts
// Comments API with Umwero support
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateRequest, createDiscussionCommentSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

/**
 * POST /api/discussions/[discussionId]/comments
 * Add comment to discussion (UTF-8 preserved)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { discussionId: string } }
) {
  try {
    const { discussionId } = params

    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, {
      interval: 60 * 60 * 1000, // 1 hour
      uniqueTokenPerInterval: 30, // 30 comments per hour
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
    const validation = await validateRequest(request.clone(), createDiscussionCommentSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { content, script } = validation.data

    // Check if discussion exists
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true }
    })

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      )
    }

    // Create comment (UTF-8 preserved)
    const comment = await prisma.comment.create({
      data: {
        userId: decoded.userId,
        discussionId,
        content,
        script,
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment added successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/discussions/[discussionId]/comments
 * Get all comments for a discussion
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { discussionId: string } }
) {
  try {
    const { discussionId } = params

    const comments = await prisma.comment.findMany({
      where: { discussionId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
            role: true,
          }
        }
      }
    })

    return NextResponse.json({ comments })

  } catch (error: any) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
