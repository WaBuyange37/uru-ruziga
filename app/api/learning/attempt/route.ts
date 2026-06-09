import { NextRequest, NextResponse } from 'next/server';
import { Prisma, StepType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getFileUrl, STORAGE_BUCKETS, uploadFile } from '@/lib/storage';
import { verifyToken } from '@/lib/jwt';
import { buildJourneyPhaseStates } from '@/lib/learning-journey';
import { resolveUmweroFontInput } from '@/lib/umwero-font-input';

export const dynamic = 'force-dynamic';

const PYTHON_SERVICE_URL =
  process.env.OCR_API_URL || process.env.PYTHON_OCR_SERVICE_URL || process.env.PYTHON_AI_SERVICE_URL || null;
const MIN_CONFIDENT_OCR_CONFIDENCE = 0.35;
const FALLBACK_FEEDBACK = 'Your writing has been saved. Detailed handwriting feedback is still being improved.';

type Point = {
  x: number;
  y: number;
  timestamp: number;
  pressure?: number;
};

type Stroke = {
  points: Point[];
  startTime: number;
  endTime: number;
};

type DrawingMetadata = {
  canvasSize?: { width: number; height: number };
  devicePixelRatio?: number;
  inputMethod?: 'mouse' | 'touch' | 'stylus';
  totalDuration?: number;
  strokeCount?: number;
  totalPoints?: number;
  deviceInfo?: unknown;
  normalized?: unknown;
  [key: string]: unknown;
};

type LearningAttemptRequest = {
  characterId: string;
  lessonId?: string;
  stepId?: string;
  learningStage: string;
  journeyPhase: string;
  imageData: string;
  strokes: Stroke[];
  metadata?: DrawingMetadata;
};

type AuthPayload = {
  userId?: string;
};

type EvaluationPayload = {
  score: number | null;
  confidence: number;
  passed: boolean;
  feedback: string[];
  strengths: string[];
  weaknesses: string[];
  practiceAreas: string[];
  metrics: {
    shapeAccuracy?: number;
    strokeOrder?: number;
    strokeDirection?: number;
    strokeConsistency?: number;
    sizeBalance?: number;
    spacing?: number;
    ssimScore?: number;
    contourScore?: number;
    skeletonScore?: number;
    [key: string]: number | undefined;
  };
  featureVector?: unknown;
  processedImageUrl?: string;
  skeletonImageUrl?: string;
  heatmapUrl?: string;
  raw: unknown;
};

type PythonReferencePayload = {
  character?: string;
  character_id?: string;
  image_url?: string;
  cached?: boolean;
  metadata?: Record<string, unknown>;
};

class LearningAttemptPipelineError extends Error {
  constructor(
    public readonly stage: 'UPLOAD' | 'OCR' | 'EVALUATION_SAVE' | 'PROGRESS_SAVE' | 'DATASET_SAVE',
    message: string,
    public readonly status = 500
  ) {
    super(message);
    this.name = 'LearningAttemptPipelineError';
  }
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length);
}

async function requireUserId(request: NextRequest): Promise<string | null> {
  const token = getBearerToken(request);
  if (!token) return null;

  const decoded = (await verifyToken(token)) as AuthPayload | null;
  return decoded?.userId ?? null;
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; contentType: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('imageData must be a base64 data URL');
  }

  return {
    buffer: Buffer.from(match[2], 'base64'),
    contentType: match[1]
  };
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'unknown';
}

function clampScore(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, value));
}

function normalizeConfidence(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return value > 1 ? Math.max(0, Math.min(100, value)) : Math.max(0, Math.min(1, value));
}

function arrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'message' in item && typeof item.message === 'string') {
        return item.message;
      }
      return null;
    })
    .filter((item): item is string => Boolean(item));
}

function feedbackObjectStrings(value: unknown, key: string): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return arrayOfStrings((value as Record<string, unknown>)[key]);
}

function suggestionsFromDetailedFeedback(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      return typeof record.suggestion === 'string' ? record.suggestion : null;
    })
    .filter((item): item is string => Boolean(item));
}

function metricFromFeedback(raw: unknown, category: string): number | undefined {
  if (!Array.isArray(raw)) return undefined;

  const found = raw.find((item) => {
    if (!item || typeof item !== 'object') return false;
    return 'category' in item && typeof item.category === 'string' && item.category.toLowerCase() === category;
  });

  if (!found || typeof found !== 'object' || !('confidence' in found)) return undefined;
  return clampScore(found.confidence) ?? undefined;
}

function normalizeEvaluation(raw: unknown): EvaluationPayload {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const metrics = (record.metrics && typeof record.metrics === 'object' ? record.metrics : {}) as Record<string, unknown>;
  const detailedFeedback = record.detailed_feedback ?? record.detailedFeedback;
  const feedbackObject = record.feedback;
  const score = clampScore(record.score ?? metrics.score ?? metrics.overallScore);
  const confidence = normalizeConfidence(record.confidence ?? metrics.confidence);
  const feedback = arrayOfStrings(record.feedback).length
    ? arrayOfStrings(record.feedback)
    : feedbackObjectStrings(feedbackObject, 'tips');
  const strengths = arrayOfStrings(record.strengths).length
    ? arrayOfStrings(record.strengths)
    : feedbackObjectStrings(feedbackObject, 'strengths');
  const weaknesses = arrayOfStrings(record.weaknesses).length
    ? arrayOfStrings(record.weaknesses)
    : feedbackObjectStrings(feedbackObject, 'issues');
  const practiceAreas = arrayOfStrings(record.practice_areas ?? record.practiceAreas ?? weaknesses).length
    ? arrayOfStrings(record.practice_areas ?? record.practiceAreas ?? weaknesses)
    : suggestionsFromDetailedFeedback(detailedFeedback);

  return {
    score,
    confidence,
    passed: typeof record.passed === 'boolean' ? record.passed : (score ?? 0) >= 80,
    feedback,
    strengths,
    weaknesses,
    practiceAreas,
    metrics: {
      shapeAccuracy: clampScore(metrics.shapeAccuracy ?? metrics.shape_accuracy ?? record.shape_accuracy) ?? undefined,
      strokeOrder: clampScore(metrics.strokeOrder ?? metrics.stroke_order ?? record.stroke_order) ?? undefined,
      strokeDirection: clampScore(metrics.strokeDirection ?? metrics.stroke_direction ?? record.stroke_direction) ?? undefined,
      strokeConsistency:
        clampScore(metrics.strokeConsistency ?? metrics.stroke_consistency ?? record.stroke_consistency) ?? undefined,
      sizeBalance: clampScore(metrics.sizeBalance ?? metrics.size_balance ?? record.size_balance) ?? undefined,
      spacing: clampScore(metrics.spacing ?? record.spacing) ?? undefined,
      ssimScore: clampScore(metrics.ssimScore ?? metrics.ssim_score) ?? metricFromFeedback(detailedFeedback, 'ssim'),
      contourScore:
        clampScore(metrics.contourScore ?? metrics.contour_score) ?? metricFromFeedback(detailedFeedback, 'contour'),
      skeletonScore:
        clampScore(metrics.skeletonScore ?? metrics.skeleton_score) ?? metricFromFeedback(detailedFeedback, 'skeleton')
    },
    featureVector: record.featureVector ?? record.feature_vector,
    processedImageUrl:
      typeof record.processedImageUrl === 'string'
        ? record.processedImageUrl
        : typeof record.processed_image_url === 'string'
          ? record.processed_image_url
          : undefined,
    skeletonImageUrl:
      typeof record.skeletonImageUrl === 'string'
        ? record.skeletonImageUrl
        : typeof record.skeleton_image_url === 'string'
          ? record.skeleton_image_url
          : undefined,
    heatmapUrl:
      typeof record.heatmapUrl === 'string'
        ? record.heatmapUrl
        : typeof record.heatmap_url === 'string'
          ? record.heatmap_url
          : undefined,
    raw
  };
}

function isOcrFailure(evaluation: EvaluationPayload): boolean {
  if (evaluation.score === null) return true;
  if (evaluation.confidence < MIN_CONFIDENT_OCR_CONFIDENCE) return true;
  return evaluation.feedback.some((message) => message.toLowerCase().startsWith('evaluation failed:'));
}

function fallbackEvaluation(reason: string): EvaluationPayload {
  return {
    score: null,
    confidence: 0,
    passed: false,
    feedback: [FALLBACK_FEEDBACK],
    strengths: ['Practice recorded'],
    weaknesses: [],
    practiceAreas: ['Keep practicing this character. More detailed handwriting feedback will be added as OCR improves.'],
    metrics: {},
    raw: {
      fallback: true,
      reason,
      scoreSource: 'PRACTICE_RECORDED'
    }
  };
}

function qualityLabel(score: number | null): string | null {
  if (score === null) return null;
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function feedbackType(score: number | null): string {
  if (score === null) return 'constructive';
  if (score < 50) return 'corrective';
  if (score < 85) return 'constructive';
  return 'encouraging';
}

function stageThreshold(stageName: string): number {
  if (stageName === 'CULTURAL_APPLICATION') return 75;
  if (stageName === 'INDEPENDENT_WRITING') return 90;
  if (stageName.includes('WRITING') || stageName === 'TRACING') return 85;
  return 80;
}

function nextPhase(currentPhase: string | null | undefined, completedPhases: string[]): string {
  const phases = buildJourneyPhaseStates({ currentPhase, completedPhases });
  const currentIndex = phases.findIndex((phase) => phase.id === currentPhase);
  if (currentIndex < 0) return 'INTRODUCTION';
  return phases[currentIndex + 1]?.id ?? phases[currentIndex].id;
}

async function resolveLessonStep(input: {
  stepId?: string;
  lessonId?: string;
  characterId: string;
}) {
  const practiceStepTypes: StepType[] = ['PRACTICE_CANVAS', 'AI_COMPARISON', 'STROKE_ORDER'];

  if (input.stepId) {
    const step = await prisma.lessonStep.findFirst({
      where: {
        id: input.stepId,
        isActive: true,
        lesson: {
          ...(input.lessonId ? { id: input.lessonId } : {}),
          ...(input.lessonId ? {} : { characterId: input.characterId })
        }
      },
      select: { id: true, lessonId: true }
    });
    if (step) return step;
  }

  if (input.lessonId) {
    const lessonStep = await prisma.lessonStep.findFirst({
      where: {
        isActive: true,
        lesson: {
          id: input.lessonId,
          isPublished: true
        },
        stepType: {
          in: practiceStepTypes
        }
      },
      orderBy: { order: 'asc' },
      select: { id: true, lessonId: true }
    });
    if (lessonStep) return lessonStep;
  }

  const characterStep = await prisma.lessonStep.findFirst({
    where: {
      isActive: true,
      lesson: {
        characterId: input.characterId,
        isPublished: true
      },
      stepType: {
        in: practiceStepTypes
      }
    },
    orderBy: { order: 'asc' },
    select: { id: true, lessonId: true }
  });
  if (characterStep) return characterStep;

  const lesson = await prisma.lesson.findFirst({
    where: {
      isPublished: true,
      OR: [
        ...(input.lessonId ? [{ id: input.lessonId }] : []),
        { characterId: input.characterId }
      ]
    },
    select: { id: true }
  });

  if (!lesson) return null;

  return prisma.lessonStep.create({
    data: {
      lessonId: lesson.id,
      stepType: 'PRACTICE_CANVAS',
      order: 999,
      config: {
        source: 'learning-attempt-runtime',
        reason: 'Created because learner canvas submitted before a practice step existed.'
      } as Prisma.InputJsonValue,
      isRequired: true,
      isActive: true
    },
    select: { id: true, lessonId: true }
  });
}

async function resolveCharacterReference(character: {
  id: string;
  umweroGlyph: string;
  latinEquivalent: string;
  type: string;
  difficulty: number;
  glyphImageUrl: string | null;
}) {
  let generatedReference: PythonReferencePayload | null = null;
  const fontInput = resolveUmweroFontInput(character.latinEquivalent, character.umweroGlyph);

  if (!character.glyphImageUrl && PYTHON_SERVICE_URL) {
    try {
      console.info('[OCR diagnostic] reference generation requested', {
        characterId: character.id,
        bucket: STORAGE_BUCKETS.characterImages,
        pythonEndpoint: '/api/reference/{character}',
        upload: true
      });
      const params = new URLSearchParams({
        upload: 'true',
        character_id: character.id,
        latin_equivalent: character.latinEquivalent,
        character_type: character.type.toLowerCase()
      });
      const response = await fetch(
        `${PYTHON_SERVICE_URL}/api/reference/${encodeURIComponent(fontInput)}?${params.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000)
        }
      );

      if (response.ok) {
        generatedReference = (await response.json()) as PythonReferencePayload;
        console.info('[OCR diagnostic] reference generation response', {
          characterId: character.id,
          generated: Boolean(generatedReference.image_url),
          bucket: STORAGE_BUCKETS.characterImages
        });
      } else {
        console.error('[OCR diagnostic] reference generation failed', {
          status: response.status,
          characterId: character.id
        });
      }
    } catch (error) {
      console.error('[OCR diagnostic] reference generation unavailable', {
        characterId: character.id,
        message: error instanceof Error ? error.message : 'Unknown reference generation error'
      });
    }
  } else {
    console.info('[OCR diagnostic] reference generation skipped', {
      characterId: character.id,
      reason: character.glyphImageUrl ? 'Character.glyphImageUrl already exists' : 'OCR service URL is not configured'
    });
  }

  const referenceUrl =
    character.glyphImageUrl ??
    generatedReference?.image_url ??
    `characters/references/${sanitizePathSegment(character.id)}.png`;
  const referenceSource = character.glyphImageUrl
    ? 'character.glyphImageUrl'
    : generatedReference?.image_url
      ? 'python-font-renderer-supabase'
      : 'deterministic-reference-path';

  if (!character.glyphImageUrl && generatedReference?.image_url) {
    await prisma.character.update({
      where: { id: character.id },
      data: { glyphImageUrl: generatedReference.image_url }
    });
  }

  return prisma.characterReference.upsert({
    where: { umweroChar: character.umweroGlyph },
    update: {
      latinEquivalent: character.latinEquivalent,
      characterType: character.type.toLowerCase(),
      imageFontPath: referenceUrl,
      fontImageUrl: referenceUrl,
      difficulty: character.difficulty,
      metadata: {
        source: referenceSource,
        characterId: character.id,
        python: generatedReference?.metadata ?? null
      } as Prisma.InputJsonValue
    },
    create: {
      umweroChar: character.umweroGlyph,
      latinEquivalent: character.latinEquivalent,
      characterType: character.type.toLowerCase(),
      imageFontPath: referenceUrl,
      fontImageUrl: referenceUrl,
      metadata: {
        source: referenceSource,
        characterId: character.id,
        python: generatedReference?.metadata ?? null
      } as Prisma.InputJsonValue,
      difficulty: character.difficulty
    }
  });
}

async function callPythonEvaluation(input: {
  character: { id: string; latinEquivalent: string; umweroGlyph: string; strokeCount: number };
  imageUrl: string;
  referenceImageUrl: string | null;
  imageData: string;
  strokes: Stroke[];
  sessionId: string;
  userAttemptId: string;
  userId: string;
}) {
  if (!PYTHON_SERVICE_URL) {
    throw new LearningAttemptPipelineError('OCR', 'OCR service URL is not configured.', 503);
  }

  const response = await fetch(`${PYTHON_SERVICE_URL}/api/evaluate-character`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      character: resolveUmweroFontInput(input.character.latinEquivalent, input.character.umweroGlyph),
      character_id: input.character.id,
      latin_equivalent: input.character.latinEquivalent,
      image_url: input.imageUrl,
      reference_image_url: input.referenceImageUrl,
      image: input.imageData,
      strokes: input.strokes,
      session_id: input.sessionId,
      user_attempt_id: input.userAttemptId,
      user_id: input.userId,
      expected_stroke_count: input.character.strokeCount
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new LearningAttemptPipelineError('OCR', `OCR failed: Python service returned ${response.status}`, 502);
  }

  const evaluation = normalizeEvaluation(await response.json());
  if (isOcrFailure(evaluation)) {
    throw new LearningAttemptPipelineError(
      'OCR',
      evaluation.feedback.join(' ') || 'OCR failed while comparing the learner image.',
      502
    );
  }

  return evaluation;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    console.info('[OCR diagnostic] endpoint hit', {
      endpoint: '/api/learning/attempt',
      bucketUploadExpected: STORAGE_BUCKETS.userDrawings,
      ocrServiceCalled: false
    });

    const userId = await requireUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as LearningAttemptRequest;

    if (!body.characterId || !body.learningStage || !body.journeyPhase || !body.imageData || !Array.isArray(body.strokes)) {
      return NextResponse.json(
        {
          error:
            'characterId, learningStage, journeyPhase, imageData, and strokes are required for learning attempt submission'
        },
        { status: 400 }
      );
    }

    if (body.strokes.length === 0) {
      return NextResponse.json({ error: 'At least one stroke is required' }, { status: 400 });
    }

    const [user, character] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.character.findUnique({
        where: { id: body.characterId },
        select: {
          id: true,
          umweroGlyph: true,
          latinEquivalent: true,
          type: true,
          difficulty: true,
          strokeCount: true,
          glyphImageUrl: true,
          isActive: true
        }
      })
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Authenticated user not found' }, { status: 404 });
    }

    if (!character?.isActive) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const lessonStep = await resolveLessonStep({
      stepId: body.stepId,
      lessonId: body.lessonId,
      characterId: character.id
    });

    if (!lessonStep) {
      return NextResponse.json(
        { error: 'A valid lesson step is required before storing an adaptive attempt' },
        { status: 400 }
      );
    }

    const { buffer, contentType } = dataUrlToBuffer(body.imageData);
    const safeStage = sanitizePathSegment(body.learningStage.toLowerCase());
    const uploadKey = `${STORAGE_BUCKETS.userDrawings}/${userId}/${character.id}/${safeStage}/${Date.now()}-${crypto.randomUUID()}.png`;
    console.info('[OCR diagnostic] bucket upload attempted', {
      endpoint: '/api/learning/attempt',
      bucket: STORAGE_BUCKETS.userDrawings,
      path: uploadKey.replace(`${STORAGE_BUCKETS.userDrawings}/`, ''),
      upsert: false
    });
    let upload: Awaited<ReturnType<typeof uploadFile>>;
    let evaluationImageUrl: string;
    try {
      upload = await uploadFile(buffer, uploadKey, contentType, { upsert: false });
      evaluationImageUrl = await getFileUrl(
        `${STORAGE_BUCKETS.userDrawings}/${upload.path}`,
        { signed: true, expiresIn: 600 }
      );
    } catch (error) {
      throw new LearningAttemptPipelineError(
        'UPLOAD',
        `Upload failed: ${error instanceof Error ? error.message : 'Could not upload learner drawing.'}`,
        502
      );
    }

    const imageUrl = upload.publicUrl;
    console.info('[OCR diagnostic] bucket upload succeeded', {
      endpoint: '/api/learning/attempt',
      bucket: upload.bucket,
      path: upload.path,
      signedEvaluationUrlCreated: true
    });

    const reference = await resolveCharacterReference(character);
    const referenceImageUrl = reference.fontImageUrl ?? reference.imageFontPath;
    if (!referenceImageUrl) {
      throw new LearningAttemptPipelineError(
        'OCR',
        'OCR failed: no canonical reference image is available for this character.',
        502
      );
    }
    const totalPoints = body.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
    const drawingDuration = Math.round(body.metadata?.totalDuration ?? 0);

    const userAttempt = await prisma.userAttempt.create({
      data: {
        userId,
        stepId: lessonStep.id,
        characterId: character.id,
        attemptType: 'DRAWING',
        drawingData: imageUrl,
        answer: {
          storage: {
            bucket: upload.bucket,
            path: upload.path
          },
          strokeCount: body.strokes.length,
          totalPoints
        },
        uploadedImageUrl: imageUrl,
        timeSpent: Math.round((body.metadata?.totalDuration ?? 0) / 1000),
        learningStage: body.learningStage,
        journeyPhase: body.journeyPhase,
        aiMetrics: Prisma.JsonNull,
        visualOverlay: Prisma.JsonNull,
        isCorrect: false
      }
    });

    const handwritingAttempt = await prisma.handwritingAttempt.create({
      data: {
        userId,
        characterId: reference.id,
        lessonId: lessonStep.lessonId,
        strokes: body.strokes as unknown as Prisma.InputJsonValue,
        strokeCount: body.strokes.length,
        totalPoints,
        drawingDuration,
        imageUrl,
        metadata: {
          ...(body.metadata ?? {}),
          adaptive: {
            characterId: character.id,
            userAttemptId: userAttempt.id,
            learningStage: body.learningStage,
            journeyPhase: body.journeyPhase,
            lessonId: lessonStep.lessonId,
            stepId: lessonStep.id,
            storage: {
              bucket: upload.bucket,
              path: upload.path
            },
            referenceId: reference.id,
            referenceImageUrl
          }
        } as Prisma.InputJsonValue
      }
    });

    let evaluation: EvaluationPayload;
    let ocrFeedbackAvailable = false;
    let ocrFallbackReason: string | null = null;
    try {
      console.info('[OCR diagnostic] OCR service called', {
        endpoint: '/api/learning/attempt',
        ocrEndpoint: '/api/evaluate-character',
        imageUrlProvided: true,
        referenceImageUrlProvided: true,
        serviceConfigured: Boolean(PYTHON_SERVICE_URL)
      });
      evaluation = await callPythonEvaluation({
        character,
        imageUrl: evaluationImageUrl,
        referenceImageUrl,
        imageData: body.imageData,
        strokes: body.strokes,
        sessionId: handwritingAttempt.id,
        userAttemptId: userAttempt.id,
        userId
      });
      ocrFeedbackAvailable = true;
    } catch (error) {
      ocrFallbackReason = error instanceof Error ? error.message : 'Unknown OCR error';
      console.warn('[OCR diagnostic] OCR fallback used', {
        endpoint: '/api/learning/attempt',
        message: ocrFallbackReason
      });
      evaluation = fallbackEvaluation(ocrFallbackReason);
    }
    console.info('[OCR diagnostic] OCR evaluation resolved', {
      endpoint: '/api/learning/attempt',
      scoreSource: ocrFeedbackAvailable ? 'PYTHON_OCR' : 'PRACTICE_RECORDED',
      score: evaluation.score,
      confidence: evaluation.confidence,
      fallback: !ocrFeedbackAvailable
    });

    const roundedScore = evaluation.score === null ? null : Math.round(evaluation.score);
    const attemptQuality = qualityLabel(evaluation.score);
    const attemptFeedbackType = feedbackType(evaluation.score);
    const threshold = stageThreshold(body.learningStage);
    const stageCompleted = ocrFeedbackAvailable ? (evaluation.score ?? 0) >= threshold : true;
    const stagePassed = ocrFeedbackAvailable && (evaluation.score ?? 0) >= threshold;
    const scoreSource = ocrFeedbackAvailable ? 'PYTHON_OCR' : 'PRACTICE_RECORDED';
    const persistedEvaluationType = ocrFeedbackAvailable ? 'PYTHON_OCR' : 'OCR_FALLBACK';
    const feedbackText = evaluation.feedback.join('\n') || FALLBACK_FEEDBACK;

    let updatedUserAttempt;
    let updatedHandwritingAttempt;
    try {
      updatedUserAttempt = await prisma.userAttempt.update({
        where: { id: userAttempt.id },
        data: {
          aiScore: roundedScore,
          aiMetrics: {
            ...evaluation.metrics,
            confidence: evaluation.confidence,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            practiceAreas: evaluation.practiceAreas,
            threshold,
            passed: stagePassed,
            stageCompleted,
            handwritingAttemptId: handwritingAttempt.id,
            scoreSource,
            fallback: !ocrFeedbackAvailable,
            fallbackReason: ocrFallbackReason,
            imageBucket: upload.bucket,
            imagePath: upload.path,
            referenceImageUrl
          } as Prisma.InputJsonValue,
          feedback: feedbackText,
          confidenceScore: evaluation.confidence,
          evaluationType: persistedEvaluationType,
          isCorrect: stagePassed,
          shapeAccuracy: evaluation.metrics.shapeAccuracy,
          strokeOrder: evaluation.metrics.strokeOrder,
          strokeDirection: evaluation.metrics.strokeDirection,
          strokeConsistency: evaluation.metrics.strokeConsistency,
          sizeBalance: evaluation.metrics.sizeBalance,
          spacing: evaluation.metrics.spacing,
          feedbackType: attemptFeedbackType,
          improvementSteps: evaluation.practiceAreas
        }
      });

      updatedHandwritingAttempt = await prisma.handwritingAttempt.update({
        where: { id: handwritingAttempt.id },
        data: {
          processedImageUrl: evaluation.processedImageUrl,
          skeletonImageUrl: evaluation.skeletonImageUrl,
          heatmapUrl: evaluation.heatmapUrl,
          score: evaluation.score,
          ssimScore: evaluation.metrics.ssimScore,
          contourScore: evaluation.metrics.contourScore,
          skeletonScore: evaluation.metrics.skeletonScore,
          confidenceScore: evaluation.confidence,
          feedback: {
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            raw: evaluation.raw,
            scoreSource,
            fallback: !ocrFeedbackAvailable,
            fallbackReason: ocrFallbackReason
          } as Prisma.InputJsonValue,
          feedbackType: attemptFeedbackType,
          practiceAreas: evaluation.practiceAreas,
          featureVector:
            evaluation.featureVector === undefined ? undefined : (evaluation.featureVector as Prisma.InputJsonValue),
          qualityLabel: ocrFeedbackAvailable ? attemptQuality : 'needs_review',
          processingTime: Date.now() - startedAt
        }
      });
    } catch (error) {
      throw new LearningAttemptPipelineError(
        'EVALUATION_SAVE',
        `Evaluation save failed: ${error instanceof Error ? error.message : 'Could not save OCR result.'}`,
        500
      );
    }

    let progress;
    try {
      const existingProgress = await prisma.userCharacterProgress.findUnique({
        where: {
          userId_characterId: {
            userId,
            characterId: character.id
          }
        },
        select: {
          attempts: true,
          score: true,
          masteryScore: true,
          completedStages: true,
          completedPhases: true,
          stageScores: true,
          stageAttempts: true,
          timeSpent: true
        }
      });

      const completedStages = new Set(existingProgress?.completedStages ?? []);
      if (stageCompleted) completedStages.add(body.learningStage);

      const completedPhases = new Set(existingProgress?.completedPhases ?? []);
      if (stageCompleted) completedPhases.add(body.journeyPhase);

      const nextJourneyPhase = stageCompleted
        ? nextPhase(body.journeyPhase, Array.from(completedPhases))
        : body.journeyPhase;

      const nextAttempts = (existingProgress?.attempts ?? 0) + 1;
      const scoreForProgress = roundedScore ?? existingProgress?.score ?? 0;
      const bestScore = Math.max(existingProgress?.score ?? 0, scoreForProgress);
      const participationMastery = Math.min(70, Math.round((completedStages.size / 8) * 70));
      const masteryScore = Math.round(
        Math.max(
          existingProgress?.masteryScore ?? 0,
          ocrFeedbackAvailable ? bestScore * 0.7 + (completedStages.size / 8) * 30 : participationMastery
        )
      );
      const nextStatus = masteryScore >= 90 ? 'MASTERED' : masteryScore >= 80 ? 'LEARNED' : 'IN_PROGRESS';
      const legacyStatus = masteryScore >= 80 ? 'LEARNED' : 'IN_PROGRESS';
      const stageScores =
        existingProgress?.stageScores && typeof existingProgress.stageScores === 'object' && !Array.isArray(existingProgress.stageScores)
          ? { ...(existingProgress.stageScores as Record<string, unknown>) }
          : {};
      const stageAttempts =
        existingProgress?.stageAttempts &&
        typeof existingProgress.stageAttempts === 'object' &&
        !Array.isArray(existingProgress.stageAttempts)
          ? { ...(existingProgress.stageAttempts as Record<string, unknown>) }
          : {};

      if (ocrFeedbackAvailable) {
        stageScores[body.learningStage] = Math.max(
          typeof stageScores[body.learningStage] === 'number' ? (stageScores[body.learningStage] as number) : 0,
          scoreForProgress
        );
      }
      stageAttempts[body.learningStage] =
        (typeof stageAttempts[body.learningStage] === 'number' ? (stageAttempts[body.learningStage] as number) : 0) + 1;
      const stageScoresJson = stageScores as Prisma.InputJsonValue;
      const stageAttemptsJson = stageAttempts as Prisma.InputJsonValue;

      progress = await prisma.userCharacterProgress.upsert({
        where: {
          userId_characterId: {
            userId,
            characterId: character.id
          }
        },
        create: {
          userId,
          characterId: character.id,
          status: legacyStatus,
          score: bestScore,
          timeSpent: Math.round((body.metadata?.totalDuration ?? 0) / 1000),
          attempts: 1,
          lastAttempt: new Date(),
          masteryScore,
          accuracyRate: ocrFeedbackAvailable && stagePassed ? 1 : 0,
          confidenceScore: evaluation.confidence,
          completionStatus: nextStatus,
          currentStage: body.learningStage,
          completedStages: Array.from(completedStages),
          stageScores: stageScoresJson,
          stageAttempts: stageAttemptsJson,
          journeyPhase: nextJourneyPhase,
          completedPhases: Array.from(completedPhases)
        },
        update: {
          status: legacyStatus,
          score: bestScore,
          timeSpent: { increment: Math.round((body.metadata?.totalDuration ?? 0) / 1000) },
          attempts: { increment: 1 },
          lastAttempt: new Date(),
          masteryScore,
          accuracyRate: ocrFeedbackAvailable
            ? Array.from(completedStages).length / Math.max(nextAttempts, 1)
            : existingProgress?.timeSpent
              ? undefined
              : 0,
          confidenceScore: evaluation.confidence,
          completionStatus: nextStatus,
          currentStage: body.learningStage,
          completedStages: Array.from(completedStages),
          stageScores: stageScoresJson,
          stageAttempts: stageAttemptsJson,
          journeyPhase: nextJourneyPhase,
          completedPhases: Array.from(completedPhases)
        }
      });
    } catch (error) {
      throw new LearningAttemptPipelineError(
        'PROGRESS_SAVE',
        `Progress save failed: ${error instanceof Error ? error.message : 'Could not update learner progress.'}`,
        500
      );
    }

    let datasetEntry: Awaited<ReturnType<typeof prisma.datasetEntry.upsert>> | null = null;
    let datasetWarning: string | null = null;
    if (ocrFeedbackAvailable && evaluation.score !== null) {
      try {
        datasetEntry = await prisma.datasetEntry.upsert({
          where: { attemptId: handwritingAttempt.id },
          update: {
            userId,
            characterId: reference.id,
            characterType: reference.characterType,
            strokesData: body.strokes as unknown as Prisma.InputJsonValue,
            imageUrl,
            processedImageUrl: updatedHandwritingAttempt.processedImageUrl,
            score: evaluation.score,
            qualityLabel: attemptQuality,
            featureVector:
              evaluation.featureVector === undefined ? undefined : (evaluation.featureVector as Prisma.InputJsonValue),
            timeTaken: drawingDuration,
            userMetadata: {
              inputMethod: body.metadata?.inputMethod,
              canvasSize: body.metadata?.canvasSize,
              deviceInfo: body.metadata?.deviceInfo,
              adaptive: {
                userAttemptId: updatedUserAttempt.id,
                characterId: character.id,
                learningStage: body.learningStage,
                journeyPhase: body.journeyPhase,
                lessonId: lessonStep.lessonId,
                scoreSource
              }
            } as Prisma.InputJsonValue,
            split: updatedHandwritingAttempt.datasetSplit,
            version: updatedHandwritingAttempt.datasetVersion ?? '1.0'
          },
          create: {
            attemptId: handwritingAttempt.id,
            userId,
            characterId: reference.id,
            characterType: reference.characterType,
            strokesData: body.strokes as unknown as Prisma.InputJsonValue,
            imageUrl,
            processedImageUrl: updatedHandwritingAttempt.processedImageUrl,
            score: evaluation.score,
            qualityLabel: attemptQuality,
            featureVector:
              evaluation.featureVector === undefined ? undefined : (evaluation.featureVector as Prisma.InputJsonValue),
            timeTaken: drawingDuration,
            userMetadata: {
              inputMethod: body.metadata?.inputMethod,
              canvasSize: body.metadata?.canvasSize,
              deviceInfo: body.metadata?.deviceInfo,
              adaptive: {
                userAttemptId: updatedUserAttempt.id,
                characterId: character.id,
                learningStage: body.learningStage,
                journeyPhase: body.journeyPhase,
                lessonId: lessonStep.lessonId,
                scoreSource
              }
            } as Prisma.InputJsonValue,
            version: '1.0'
          }
        });

        await prisma.handwritingAttempt.update({
          where: { id: handwritingAttempt.id },
          data: { includedInDataset: true }
        });
      } catch (error) {
        datasetWarning = error instanceof Error ? error.message : 'Could not save OCR training entry.';
        console.error('[OCR diagnostic] dataset entry save skipped after failure', {
          endpoint: '/api/learning/attempt',
          handwritingAttemptId: handwritingAttempt.id,
          message: datasetWarning
        });
      }
    }

    return NextResponse.json({
      success: true,
      attempt: {
        userAttemptId: updatedUserAttempt.id,
        handwritingAttemptId: updatedHandwritingAttempt.id,
        datasetEntryId: datasetEntry?.id ?? null,
        imageUrl,
        referenceImageUrl,
        storage: {
          bucket: upload.bucket,
          path: upload.path
        },
        saved: true
      },
      evaluation: {
        score: evaluation.score,
        scoreSource,
        persistedEvaluationType: updatedUserAttempt.evaluationType,
        confidence: evaluation.confidence,
        passed: stageCompleted,
        ocrPassed: stagePassed,
        ocrFeedbackAvailable,
        fallback: !ocrFeedbackAvailable,
        fallbackReason: ocrFallbackReason,
        statusLabel: ocrFeedbackAvailable ? 'OCR feedback available' : 'Practice recorded',
        threshold,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        practiceAreas: evaluation.practiceAreas,
        metrics: evaluation.metrics
      },
      progression: {
        masteryScore: progress.masteryScore,
        completionStatus: progress.completionStatus,
        currentStage: progress.currentStage,
        currentPhase: progress.journeyPhase,
        completedStages: progress.completedStages,
        completedPhases: progress.completedPhases,
        nextPhaseUnlocked: stageCompleted,
        fallbackProgression: !ocrFeedbackAvailable
      },
      dataset: {
        included: Boolean(datasetEntry),
        qualityLabel: ocrFeedbackAvailable ? attemptQuality : 'needs_review',
        pendingReview: !ocrFeedbackAvailable,
        warning: datasetWarning
      }
    });
  } catch (error) {
    console.error('Learning attempt submission error:', error);
    if (error instanceof LearningAttemptPipelineError) {
      return NextResponse.json(
        {
          success: false,
          stage: error.stage,
          error: error.message
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit learning attempt'
      },
      { status: 500 }
    );
  }
}
