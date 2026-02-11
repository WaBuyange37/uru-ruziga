// app/api/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'
import { hasPermission } from '@/lib/permissions'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateRequest, createLessonSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

// Rich content mapping for lessons
const LESSON_CONTENT: Record<string, any> = {
  'vowel-a': {
    vowel: 'a',
    umwero: '"',
    pronunciation: '/a/ as in "Abana"',
    meaning: 'Inyambo Cow\'s head with Horns',
    culturalNote: 'The character for "a" symbolizes the sacred Inyambo cows with their distinctive long horns. These cows are a symbol of Rwandan heritage and beauty.',
    examples: [
      { umwero: '"M"Z}', latin: 'amazi', english: 'water' },
      { umwero: '"B"M}', latin: 'abami', english: 'Kings' },
      { umwero: '"M"T"', latin: 'amata', english: 'milk' },
      { umwero: '"B"NN:', latin: 'abantu', english: 'people' },
    ],
  },
  'vowel-u': {
    vowel: 'u',
    umwero: ':',
    pronunciation: '/u/ as in Umunyu or "rude"',
    meaning: 'Represents Umugozi/umurunga',
    culturalNote: 'A loop that ties together a relationship',
    examples: [
      { umwero: ':M:C{', latin: 'umuco', english: 'culture' },
      { umwero: ':B:NN:', latin: 'ubuntu', english: 'humanity' },
      { umwero: ':R:Z}G"', latin: 'uruziga', english: 'circle' },
      { umwero: ':RGW"ND"', latin: 'urwanda', english: 'Rwanda' },
    ],
  },
  'vowel-o': {
    vowel: 'o',
    umwero: '{',
    pronunciation: '/o/ as in "note"',
    meaning: '360 deg',
    culturalNote: 'It holds 360deg. As other O which is circle mean O can change because of language',
    examples: [
      { umwero: '{R{H"', latin: 'Oroha', english: 'be flex' },
      { umwero: 'B{R{G"', latin: 'boroga', english: 'scream' },
      { umwero: '{NG||R"', latin: 'ongeera', english: 'increase' },
      { umwero: 'H{ND"', latin: 'honda', english: 'beat' },
    ],
  },
  'vowel-e': {
    vowel: 'e',
    umwero: '|',
    pronunciation: '/e/ as "Emera" in "bed--english"',
    meaning: 'E',
    culturalNote: 'None.',
    examples: [
      { umwero: '|YY|', latin: 'enye', english: 'four/4' },
      { umwero: '|r|K"N"', latin: 'erekana', english: 'show' },
      { umwero: 'NN|G" "M"TKW}', latin: 'ntega amatwi', english: 'hear me' },
      { umwero: 'T|R"', latin: 'tera', english: 'throw' },
    ],
  },
  'vowel-i': {
    vowel: 'i',
    umwero: '}',
    pronunciation: '/i/ as in "inyinya" or "machine--eng"',
    meaning: 'long vowel',
    culturalNote: '  ',
    examples: [
      { umwero: '}B}', latin: 'ibi', english: 'these things' },
      { umwero: 'N} N}N}', latin: 'ni nini', english: 'it is big' },
      { umwero: '}M}Z}', latin: 'imizi', english: 'roots' },
      { umwero: '}M}B:', latin: 'imibu', english: 'mosquitos' },
    ],
  },
  'consonant-b': {
    consonant: 'b',
    umwero: 'B',
    pronunciation: '/b/',
    meaning: 'Basic consonant B',
    culturalNote: 'One of the fundamental consonants in Umwero',
    examples: [
      { umwero: 'B"B"', latin: 'baba', english: 'father' },
      { umwero: 'B}B}', latin: 'bibi', english: 'bad' },
    ],
  },
  'consonant-k': {
    consonant: 'k',
    umwero: 'K',
    pronunciation: '/k/',
    meaning: 'Basic consonant K',
    culturalNote: 'One of the fundamental consonants in Umwero',
    examples: [
      { umwero: 'K}"', latin: 'kua', english: 'to fall' },
      { umwero: 'K}', latin: 'ki', english: 'what' },
    ],
  },
  'consonant-m': {
    consonant: 'm',
    umwero: 'M',
    pronunciation: '/m/',
    meaning: 'Basic consonant M',
    culturalNote: 'One of the fundamental consonants in Umwero',
    examples: [
      { umwero: 'M"M"', latin: 'mama', english: 'mother' },
      { umwero: ':M:C{', latin: 'umuco', english: 'culture' },
    ],
  },
  'consonant-n': {
    consonant: 'n',
    umwero: 'N',
    pronunciation: '/n/',
    meaning: 'Basic consonant N',
    culturalNote: 'One of the fundamental consonants in Umwero',
    examples: [
      { umwero: 'N}N}', latin: 'nini', english: 'big' },
      { umwero: 'N"', latin: 'na', english: 'and/with' },
    ],
  },
  'consonant-r': {
    consonant: 'r',
    umwero: 'R',
    pronunciation: '/r/',
    meaning: 'Basic consonant R',
    culturalNote: 'One of the fundamental consonants in Umwero',
    examples: [
      { umwero: ':R:Z}G"', latin: 'uruziga', english: 'circle' },
      { umwero: ':RGW"ND"', latin: 'urwanda', english: 'Rwanda' },
    ],
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: any = { isPublished: true }
    
    if (type) {
      where.type = type
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: [
        { order: 'asc' }
      ],
      select: {
        id: true,
        code: true,
        type: true,
        order: true,
        estimatedTime: true,
        isPublished: true,
        createdAt: true,
      }
    })

    // Map lessons with rich content
    const lessonsWithContent = lessons.map(lesson => {
      const richContent = LESSON_CONTENT[lesson.code] || { code: lesson.code }
      
      return {
        id: lesson.id,
        title: lesson.code.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Learn ${lesson.code}`,
        content: JSON.stringify(richContent),
        module: 'BEGINNER',
        type: lesson.type,
        order: lesson.order,
        duration: lesson.estimatedTime,
        isPublished: lesson.isPublished,
        videoUrl: null,
        thumbnailUrl: null,
        createdAt: lesson.createdAt,
      }
    })

    return NextResponse.json({
      lessons: lessonsWithContent,
      count: lessonsWithContent.length
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, RATE_LIMITS.API_GENERAL)
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions (TEACHER or ADMIN only)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    })

    if (!user || !hasPermission(user.role as any, 'canCreateLesson')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Teacher or Admin role required.' },
        { status: 403 }
      )
    }

    // Validate input
    const validation = await validateRequest(request.clone(), createLessonSchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      content,
      module,
      type,
      order,
      duration,
      videoUrl,
      thumbnailUrl,
      prerequisites,
      isPublished,
    } = validation.data

    // Parse content if it's a string
    let parsedContent = content
    if (typeof content === 'string') {
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON content' },
          { status: 400 }
        )
      }
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        content: parsedContent,
        module,
        type,
        order,
        duration,
        videoUrl: videoUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        prerequisites: prerequisites || [],
        isPublished: isPublished !== undefined ? isPublished : true,
      }
    })

    return NextResponse.json({
      lesson,
      message: 'Lesson created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
