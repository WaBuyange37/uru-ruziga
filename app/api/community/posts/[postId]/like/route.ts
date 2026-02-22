// app/api/community/posts/[postId]/like/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { verifyToken } from '../../../../../../lib/jwt'

export const dynamic = 'force-dynamic'

// POST - Like/Unlike a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: postId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      })

      await prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      })

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          userId: decoded.userId,
          postId: postId,
        },
      })

      await prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
