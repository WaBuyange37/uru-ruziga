import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { resolveUmweroFontInput } from '@/lib/umwero-font-input';

export const dynamic = 'force-dynamic';

const PYTHON_SERVICE_URL =
  process.env.PYTHON_OCR_SERVICE_URL || process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

type PythonReferencePayload = {
  character?: string;
  character_id?: string;
  image_url?: string;
  cached?: boolean;
  metadata?: Record<string, unknown>;
};

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  return authorization.slice('Bearer '.length);
}

async function requireAdmin(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded?.userId) return null;

  return prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true }
  });
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'unknown';
}

async function generateReference(character: {
  id: string;
  umweroGlyph: string;
  latinEquivalent: string;
  type: string;
  difficulty: number;
}) {
  const fontInput = resolveUmweroFontInput(character.latinEquivalent, character.umweroGlyph);
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
      signal: AbortSignal.timeout(15000)
    }
  );

  if (!response.ok) {
    throw new Error(`Python service returned ${response.status}`);
  }

  const generated = (await response.json()) as PythonReferencePayload;
  const referenceUrl = generated.image_url ?? `characters/references/${sanitizePathSegment(character.id)}.png`;

  const reference = await prisma.characterReference.upsert({
    where: { umweroChar: character.umweroGlyph },
    update: {
      latinEquivalent: character.latinEquivalent,
      characterType: character.type.toLowerCase(),
      imageFontPath: referenceUrl,
      fontImageUrl: referenceUrl,
      difficulty: character.difficulty,
      metadata: {
        source: generated.image_url ? 'python-font-renderer-supabase' : 'deterministic-reference-path',
        characterId: character.id,
        python: generated.metadata ?? null
      } as Prisma.InputJsonValue
    },
    create: {
      umweroChar: character.umweroGlyph,
      latinEquivalent: character.latinEquivalent,
      characterType: character.type.toLowerCase(),
      imageFontPath: referenceUrl,
      fontImageUrl: referenceUrl,
      difficulty: character.difficulty,
      metadata: {
        source: generated.image_url ? 'python-font-renderer-supabase' : 'deterministic-reference-path',
        characterId: character.id,
        python: generated.metadata ?? null
      } as Prisma.InputJsonValue
    }
  });

  if (generated.image_url) {
    await prisma.character.update({
      where: { id: character.id },
      data: { glyphImageUrl: generated.image_url }
    });
  }

  return {
    characterId: character.id,
    umweroGlyph: character.umweroGlyph,
    referenceId: reference.id,
    imageUrl: referenceUrl
  };
}

export async function POST(request: NextRequest) {
  try {
    console.info('[OCR diagnostic] endpoint hit', {
      endpoint: '/api/ocr/reference/sync',
      bucketUploadExpected: 'character-images'
    });

    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const characters = await prisma.character.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        umweroGlyph: true,
        latinEquivalent: true,
        type: true,
        difficulty: true
      }
    });

    const synced = [];
    const failed = [];

    for (const character of characters) {
      try {
        synced.push(await generateReference(character));
      } catch (error) {
        failed.push({
          characterId: character.id,
          umweroGlyph: character.umweroGlyph,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: failed.length === 0,
      synced,
      failed,
      total: characters.length
    });
  } catch (error) {
    console.error('Reference sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync character references'
      },
      { status: 500 }
    );
  }
}
