// app/api/community/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/jwt'
import { withRateLimit, RATE_LIMITS } from '../../../../lib/rate-limit'
import { validateRequest, createPostSchema } from '../../../../lib/validators'
import { collectFromPost } from '../../../../lib/training-data-collector'

export const dynamic = 'force-dynamic'

// GET - Fetch all community posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const isChallenge = searchParams.get('isChallenge') === 'true'
    const skip = (page - 1) * limit

    const where = isChallenge ? { isChallenge: true, isPublic: true } : { isPublic: true }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.communityPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - Create a new community post
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.POST_CREATE)
    if (rateLimitResponse) return rateLimitResponse

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Validate input
    const validation = await validateRequest(request.clone(), createPostSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const {
      content,
      language,
      latinText,
      umweroText,
      imageUrl,
      isChallenge,
      challengeType,
    } = validation.data

    // Create the post
    const post = await prisma.communityPost.create({
      data: {
        userId: decoded.userId,
        content,
        language,
        latinText,
        umweroText,
        imageUrl,
        isChallenge: isChallenge || false,
        challengeType,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    // Collect training data
    if (latinText && umweroText) {
      await collectFromPost(
        decoded.userId,
        post.id,
        content,
        language,
        latinText,
        umweroText
      )
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
