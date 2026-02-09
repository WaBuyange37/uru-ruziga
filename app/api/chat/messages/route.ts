// app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyToken } from '../../../../lib/jwt'
import { withRateLimit, RATE_LIMITS } from '../../../../lib/rate-limit'
import { validateRequest, createChatMessageSchema } from '../../../../lib/validators'
import { collectFromChat } from '../../../../lib/training-data-collector'

export const dynamic = 'force-dynamic'

// POST - Save chat message
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.CHAT_MESSAGE)
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
    const validation = await validateRequest(request.clone(), createChatMessageSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { latinText, umweroText, imageUrl, fontSize } = validation.data

    const message = await prisma.chatMessage.create({
      data: {
        userId: decoded.userId,
        latinText,
        umweroText,
        imageUrl,
        fontSize: fontSize || 24,
      },
    })

    // Collect training data
    await collectFromChat(decoded.userId, message.id, latinText, umweroText)

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error saving message:', error)
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    )
  }
}

// GET - Fetch user's chat messages
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
