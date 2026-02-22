// app/api/character-progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const PASS_MARK = 70 // Minimum score to mark as LEARNED

interface UpdateProgressRequest {
  characterId: string
  score: number
  timeSpent?: number
}

// GET - Fetch user's character progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // vowel, consonant, ligature
    
    // Get user from JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    // Get character progress for user
    const progress = await prisma.userCharacterProgress.findMany({
      where: {
        userId,
        ...(type && {
          character: {
            type: type.toUpperCase() as 'VOWEL' | 'CONSONANT' | 'LIGATURE'
          }
        })
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
      },
      orderBy: {
        character: {
          order: 'asc'
        }
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error fetching character progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// POST - Update character progress after canvas evaluation
export async function POST(request: NextRequest) {
  try {
    const body: UpdateProgressRequest = await request.json()
    const { characterId, score, timeSpent = 0 } = body

    // Get user from JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    // Validate input
    if (!characterId || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Character ID and score are required' },
        { status: 400 }
      )
    }

    // Determine status based on score
    const status = score >= PASS_MARK ? 'LEARNED' : 'IN_PROGRESS'

    // Update or create character progress
    const progress = await prisma.userCharacterProgress.upsert({
      where: {
        userId_characterId: {
          userId,
          characterId
        }
      },
      update: {
        status,
        score: Math.max(score, 0), // Ensure score is not negative
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
            umweroGlyph: true
          }
        }
      }
    })

    // Log the achievement if character was learned
    if (status === 'LEARNED') {
      console.log(`🎉 User ${userId} learned character ${progress.character.latinEquivalent} with score ${score}`)
    }

    return NextResponse.json({
      success: true,
      progress,
      statusChanged: status === 'LEARNED',
      message: status === 'LEARNED' 
        ? `Congratulations! You've learned the character ${progress.character.latinEquivalent}!`
        : `Keep practicing! Score: ${score}/${PASS_MARK} needed to master this character.`
    })

  } catch (error) {
    console.error('Error updating character progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// PUT - Bulk update progress (for admin or data migration)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates } = body // Array of { characterId, userId, status, score }

    // Get user from JWT token (admin only)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string }
    
    // Only allow admin users to bulk update
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const results = await Promise.all(
      updates.map(async (update: any) => {
        return prisma.userCharacterProgress.upsert({
          where: {
            userId_characterId: {
              userId: update.userId,
              characterId: update.characterId
            }
          },
          update: {
            status: update.status,
            score: update.score,
            attempts: { increment: 1 },
            lastAttempt: new Date()
          },
          create: {
            userId: update.userId,
            characterId: update.characterId,
            status: update.status,
            score: update.score,
            attempts: 1,
            lastAttempt: new Date()
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      updated: results.length,
      message: `Successfully updated ${results.length} character progress records`
    })

  } catch (error) {
    console.error('Error bulk updating character progress:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update progress' },
      { status: 500 }
    )
  }
}