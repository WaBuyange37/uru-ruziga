// app/api/discussions/[discussionId]/like/route.ts
// Like/Unlike discussion
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'

export const dynamic = 'force-dynamic'

/**
 * POST /api/discussions/[discussionId]/like
 * Toggle like on discussion
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { discussionId: string } }
) {
  try {
    const { discussionId } = params

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

    // Check if discussion exists
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { id: true, likesCount: true }
    })

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      )
    }

    // Check if user already liked
    const existingLike = await prisma.discussionLike.findUnique({
      where: {
        userId_discussionId: {
          userId: decoded.userId,
          discussionId
        }
      }
    })

    let liked = false
    let newLikesCount = discussion.likesCount

    if (existingLike) {
      // Unlike - remove like
      await prisma.discussionLike.delete({
        where: { id: existingLike.id }
      })
      newLikesCount = Math.max(0, discussion.likesCount - 1)
      liked = false
    } else {
      // Like - add like
      await prisma.discussionLike.create({
        data: {
          userId: decoded.userId,
          discussionId
        }
      })
      newLikesCount = discussion.likesCount + 1
      liked = true
    }

    // Update discussion likes count
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { likesCount: newLikesCount }
    })

    return NextResponse.json({
      success: true,
      liked,
      likesCount: newLikesCount,
      message: liked ? 'Discussion liked' : 'Discussion unliked'
    })

  } catch (error: any) {
    console.error('Toggle like error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/discussions/[discussionId]/like
 * Check if current user liked this discussion
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { discussionId: string } }
) {
  try {
    const { discussionId } = params

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ liked: false })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, getJwtSecret())
    } catch (error) {
      return NextResponse.json({ liked: false })
    }

    const like = await prisma.discussionLike.findUnique({
      where: {
        userId_discussionId: {
          userId: decoded.userId,
          discussionId
        }
      }
    })

    return NextResponse.json({ liked: !!like })

  } catch (error: any) {
    console.error('Check like error:', error)
    return NextResponse.json({ liked: false })
  }
}
