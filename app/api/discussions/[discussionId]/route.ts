// app/api/discussions/[discussionId]/route.ts
// Single discussion with comments (UTF-8 preserved)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'

export const dynamic = 'force-dynamic'

/**
 * GET /api/discussions/[discussionId]
 * Fetch single discussion with comments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { discussionId: string } }
) {
  try {
    const { discussionId } = params

    // Increment view count
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { views: { increment: 1 } }
    })

    // Fetch discussion with comments
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
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
        comments: {
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
        }
      }
    })

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ discussion })

  } catch (error: any) {
    console.error('Get discussion error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discussion' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/discussions/[discussionId]
 * Delete discussion (owner or admin only)
 */
export async function DELETE(
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

    // Check ownership or admin
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { userId: true }
    })

    if (!discussion) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (discussion.userId !== decoded.userId && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to delete this discussion' },
        { status: 403 }
      )
    }

    // Delete discussion (cascades to comments)
    await prisma.discussion.delete({
      where: { id: discussionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Discussion deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete discussion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete discussion' },
      { status: 500 }
    )
  }
}
