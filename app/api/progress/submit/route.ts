// app/api/progress/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const PASS_MARK = 70 // Minimum score to mark as LEARNED

interface SubmitProgressRequest {
  characterId: string
  score: number
  timeSpent?: number
  status?: 'LEARNED' | 'IN_PROGRESS' | 'NOT_STARTED'
}

interface NextCharacterResponse {
  saved: boolean
  status: 'LEARNED' | 'IN_PROGRESS' | 'NOT_STARTED'
  nextCharacter?: {
    id: string
    title: string
    umwero: string
    type: string
  }
  queueInfo: {
    remaining: number
    learned: number
    total: number
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<NextCharacterResponse | { error: string }>> {
  try {
    const body: SubmitProgressRequest = await request.json()
    const { characterId, score, timeSpent = 0 } = body

    console.log('Progress submission request:', { characterId, score, timeSpent })

    // Get user from JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.error('No authorization token provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      console.log('JWT decoded successfully, userId:', decoded.userId)
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    // Validate input
    if (!characterId || typeof score !== 'number') {
      console.error('Invalid input:', { characterId, score, scoreType: typeof score })
      return NextResponse.json(
        { error: 'Character ID and score are required' },
        { status: 400 }
      )
    }

    // Check if character exists
    const characterExists = await prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, latinEquivalent: true, type: true }
    })

    if (!characterExists) {
      console.error('Character not found:', characterId)
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    console.log('Character found:', characterExists)

    // Determine status based on score
    const status = score >= PASS_MARK ? 'LEARNED' : 'IN_PROGRESS'
    console.log('Determined status:', status, 'for score:', score)

    // Update or create character progress
    console.log('Attempting to upsert progress for:', { userId, characterId, status, score })
    
    const progress = await prisma.userCharacterProgress.upsert({
      where: {
        userId_characterId: {
          userId,
          characterId
        }
      },
      update: {
        status,
        score: Math.max(score, 0),
        timeSpent: {
          increment: timeSpent
        },
        attempts: {
          increment: 1
        },
        lastAttempt: new Date()
      },
      create: {
        userId,
        characterId,
        status,
        score: Math.max(score, 0),
        timeSpent,
        attempts: 1,
        lastAttempt: new Date()
      },
      include: {
        character: {
          select: {
            id: true,
            latinEquivalent: true,
            type: true,
            order: true
          }
        }
      }
    })

    console.log('Progress upserted successfully:', progress)

    // Get current character info to determine next character
    const currentCharacter = await prisma.character.findUnique({
      where: { id: characterId },
      select: { type: true, order: true }
    })

    if (!currentCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Find next character in the same type (vowel, consonant, ligature)
    let nextCharacter = null
    if (status === 'LEARNED') {
      // Only suggest next character if current one was learned
      nextCharacter = await prisma.character.findFirst({
        where: {
          type: currentCharacter.type,
          order: { gt: currentCharacter.order },
          isActive: true
        },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          latinEquivalent: true,
          umweroGlyph: true,
          type: true
        }
      })

      // If no next character in same type, try next type
      if (!nextCharacter) {
        const nextTypeOrder = currentCharacter.type === 'VOWEL' ? 'CONSONANT' : 
                             currentCharacter.type === 'CONSONANT' ? 'LIGATURE' : null
        
        if (nextTypeOrder) {
          nextCharacter = await prisma.character.findFirst({
            where: {
              type: nextTypeOrder as any,
              isActive: true
            },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              latinEquivalent: true,
              umweroGlyph: true,
              type: true
            }
          })
        }
      }
    }

    // Get queue statistics
    const allCharacters = await prisma.character.count({
      where: { isActive: true }
    })

    const learnedCount = await prisma.userCharacterProgress.count({
      where: {
        userId,
        status: 'LEARNED'
      }
    })

    const response: NextCharacterResponse = {
      saved: true,
      status,
      nextCharacter: nextCharacter ? {
        id: nextCharacter.id,
        title: `${nextCharacter.type.charAt(0)}${nextCharacter.type.slice(1).toLowerCase()} ${nextCharacter.latinEquivalent}`,
        umwero: nextCharacter.umweroGlyph,
        type: nextCharacter.type
      } : undefined,
      queueInfo: {
        remaining: allCharacters - learnedCount,
        learned: learnedCount,
        total: allCharacters
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error submitting progress - Full error details:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      timestamp: new Date().toISOString()
    })
    
    // Return more specific error information
    let errorMessage = 'Failed to submit progress'
    if (error instanceof Error) {
      if (error.message.includes('jwt')) {
        errorMessage = 'Authentication token is invalid or expired'
      } else if (error.message.includes('character')) {
        errorMessage = 'Character not found in database'
      } else if (error.message.includes('user')) {
        errorMessage = 'User not found or unauthorized'
      } else {
        errorMessage = `Database error: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}