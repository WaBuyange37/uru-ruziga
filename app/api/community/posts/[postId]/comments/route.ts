// app/api/community/posts/[postId]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { verifyToken } from '../../../../../../lib/jwt'

export const dynamic = 'force-dynamic'

// POST - Add comment to post
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { content, language, latinText, umweroText } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!language || !['en', 'rw', 'um'].includes(language)) {
      return NextResponse.json(
        { error: 'Valid language is required (en, rw, or um)' },
        { status: 400 }
      )
    }

    const comment = await prisma.postComment.create({
      data: {
        userId: decoded.userId,
        postId: params.postId,
        content,
        language,
        latinText,
        umweroText,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    })

    // Increment comments count
    await prisma.communityPost.update({
      where: { id: params.postId },
      data: { commentsCount: { increment: 1 } },
    })

    // Store in training data if has translation
    if (latinText && umweroText) {
      await prisma.trainingData.create({
        data: {
          userId: decoded.userId,
          sourceType: 'POST_COMMENT',
          sourceId: comment.id,
          latinText,
          umweroText,
          context: 'post_comment',
          language: language === 'um' ? 'rw' : language,
        },
      })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
