import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { buildJourneyPhaseStates, getOverallJourneyProgress } from '@/lib/learning-journey';
import { normalizePublicImageUrl } from '@/lib/image-url';

type JwtPayload = {
  userId?: string;
};

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  return authorization.slice('Bearer '.length);
}

async function getOptionalUserId(request: NextRequest): Promise<string | null> {
  const token = getBearerToken(request);
  if (!token) return null;

  const decoded = (await verifyToken(token)) as JwtPayload | null;
  return decoded?.userId ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    const { characterId } = await params;
    const decodedCharacterId = decodeURIComponent(characterId);
    const userId = await getOptionalUserId(request);

    const character = await prisma.character.findFirst({
      where: {
        isActive: true,
        OR: [
          { id: decodedCharacterId },
          { latinEquivalent: decodedCharacterId },
          { latinEquivalent: decodedCharacterId.toUpperCase() },
          { latinEquivalent: decodedCharacterId.toLowerCase() }
        ]
      },
      select: {
        id: true,
        latinEquivalent: true,
        umweroGlyph: true,
        type: true,
        difficulty: true,
        strokeCount: true,
        order: true,
        symbolism: true,
        historicalNote: true,
        glyphImageUrl: true,
        audioUrl: true,
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true
          },
          take: 1
        },
        translations: {
          select: {
            name: true,
            pronunciation: true,
            meaning: true,
            description: true
          },
          take: 1
        }
      }
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const [learningStages, progress] = await Promise.all([
      prisma.learningStage.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          name: true,
          displayName: true,
          masteryThreshold: true,
          minAttempts: true,
          estimatedMinutes: true
        }
      }),
      userId
        ? prisma.userCharacterProgress.findUnique({
            where: {
              userId_characterId: {
                userId,
                characterId: character.id
              }
            },
            select: {
              status: true,
              score: true,
              timeSpent: true,
              attempts: true,
              masteryScore: true,
              accuracyRate: true,
              confidenceScore: true,
              completionStatus: true,
              currentStage: true,
              completedStages: true,
              journeyPhase: true,
              completedPhases: true
            }
          })
        : Promise.resolve(null)
    ]);

    const phases = buildJourneyPhaseStates({
      currentPhase: progress?.journeyPhase,
      completedPhases: progress?.completedPhases,
      currentStage: progress?.currentStage,
      completedStages: progress?.completedStages,
      masteryScore: progress?.masteryScore ?? progress?.score
    });

    const primaryLesson = character.lessons[0] ?? null;
    const translation = character.translations[0] ?? null;

    return NextResponse.json({
      character: {
        id: character.id,
        latinEquivalent: character.latinEquivalent,
        umweroGlyph: character.umweroGlyph,
        type: character.type,
        difficulty: character.difficulty,
        strokeCount: character.strokeCount,
        order: character.order,
        symbolism: character.symbolism,
        historicalNote: character.historicalNote,
        glyphImageUrl: normalizePublicImageUrl(
          character.glyphImageUrl,
          `learningJourney:${character.id}.glyphImageUrl`
        ),
        audioUrl: character.audioUrl,
        name: translation?.name ?? primaryLesson?.title ?? character.latinEquivalent,
        pronunciation: translation?.pronunciation ?? null,
        meaning: translation?.meaning ?? character.symbolism,
        description: translation?.description ?? primaryLesson?.description ?? character.historicalNote
      },
      lesson: primaryLesson,
      progress: {
        status: progress?.completionStatus ?? progress?.status ?? 'NOT_STARTED',
        masteryScore: progress?.masteryScore ?? progress?.score ?? 0,
        accuracyRate: progress?.accuracyRate ?? 0,
        confidenceScore: progress?.confidenceScore ?? 0,
        attempts: progress?.attempts ?? 0,
        timeSpent: progress?.timeSpent ?? 0,
        currentStage: progress?.currentStage ?? learningStages[0]?.name ?? 'RECOGNITION',
        currentPhase: phases.find((phase) => phase.status === 'current')?.id ?? 'INTRODUCTION',
        completedStages: progress?.completedStages ?? [],
        completedPhases: progress?.completedPhases ?? [],
        overallProgress: getOverallJourneyProgress(phases)
      },
      learningStages,
      phases
    });
  } catch (error) {
    console.error('Error fetching learning journey:', error);
    return NextResponse.json({ error: 'Failed to fetch learning journey' }, { status: 500 });
  }
}
