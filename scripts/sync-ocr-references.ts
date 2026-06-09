import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import { Prisma } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '../lib/prisma'
import { resolveUmweroFontInput } from '../lib/umwero-font-input'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const sourceDirectory = path.resolve(
  process.cwd(),
  'umwero-handwriting-ocr-system/backend/umwero_character_images'
)
const bucket = 'character-images'
const destinationPrefix = 'references'

function requireEnvironment(name: string, fallbackName?: string): string {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined)
  if (!value || value.includes('<') || value.includes('your-')) {
    throw new Error(`${name}${fallbackName ? ` or ${fallbackName}` : ''} is required`)
  }
  return value
}

function contentType(filename: string): string {
  return filename.toLowerCase().endsWith('.svg') ? 'image/svg+xml' : 'image/png'
}

function unicodeFilenamePrefix(fontInput: string): string {
  return `U+${fontInput.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}_`
}

function findReferenceFilename(fontInput: string, filenames: string[]): string | null {
  if (Array.from(fontInput).length === 1) {
    const prefix = unicodeFilenamePrefix(fontInput)
    return filenames.find((filename) => filename.startsWith(prefix) && filename.endsWith('.svg')) ?? null
  }

  const sequenceFilename = `${Array.from(fontInput).join('_')}.png`
  return filenames.includes(sequenceFilename) ? sequenceFilename : null
}

function publicUrl(supabaseUrl: string, filename: string): string {
  const encodedPath = [destinationPrefix, filename]
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`
}

function categorizeUnmatchedFile(filename: string): 'numbers' | 'punctuation' | 'alternates' | '.notdef' | 'other' {
  if (filename === '.notdef.svg') return '.notdef'

  if (/^U\+(0028|0029|002A|002B|002C|002D|002E|002F|003D|003F)_/.test(filename)) {
    return 'punctuation'
  }

  if (/^U\+006[125]_/.test(filename) || (filename.endsWith('.png') && filename.includes('_'))) {
    return 'alternates'
  }

  if (
    /^U\+(003[1-9]|0718|0781|F)/.test(filename) ||
    /(?:hundred|ten|illion|\d)/i.test(filename)
  ) {
    return 'numbers'
  }

  return 'other'
}

async function main() {
  const supabaseUrl = requireEnvironment('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL').replace(/\/$/, '')
  const serviceRoleKey = requireEnvironment('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const directoryEntries = await fs.readdir(sourceDirectory, { withFileTypes: true })
  const filenames = directoryEntries
    .filter((entry) => entry.isFile() && /\.(png|svg)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort()

  const { data: existingObjects, error: listError } = await supabase.storage
    .from(bucket)
    .list(destinationPrefix, { limit: 1000 })
  if (listError) throw listError

  const existingNames = new Set((existingObjects ?? []).map((object) => object.name))
  let uploaded = 0
  let skipped = 0
  const uploadFailures: Array<{ filename: string; error: string }> = []

  for (const filename of filenames) {
    if (existingNames.has(filename)) {
      skipped += 1
      continue
    }

    try {
      const file = await fs.readFile(path.join(sourceDirectory, filename))
      const { error } = await supabase.storage
        .from(bucket)
        .upload(`${destinationPrefix}/${filename}`, file, {
          contentType: contentType(filename),
          cacheControl: '31536000',
          upsert: false,
        })
      if (error) throw error
      uploaded += 1
    } catch (error) {
      uploadFailures.push({
        filename,
        error: error instanceof Error ? error.message : 'Unknown upload error',
      })
    }
  }

  const characters = await prisma.character.findMany({
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
    select: {
      id: true,
      latinEquivalent: true,
      umweroGlyph: true,
      type: true,
      difficulty: true,
    },
  })

  let referencesUpdated = 0
  const matchedFilenames = new Set<string>()
  const missingCharacters: Array<{ characterId: string; latinEquivalent: string; fontInput: string }> = []

  for (const character of characters) {
    if (character.id === 'char-space') continue

    const fontInput = resolveUmweroFontInput(character.latinEquivalent, character.umweroGlyph)
    const filename = findReferenceFilename(fontInput, filenames)
    if (!filename) {
      missingCharacters.push({
        characterId: character.id,
        latinEquivalent: character.latinEquivalent,
        fontInput,
      })
      continue
    }

    matchedFilenames.add(filename)
    const imageUrl = publicUrl(supabaseUrl, filename)
    const metadata = {
      source: 'fontforge-generated-folder',
      characterId: character.id,
      fontInput,
      sourceFilename: filename,
      storage: { bucket, path: `${destinationPrefix}/${filename}` },
    } as Prisma.InputJsonValue

    await prisma.$transaction([
      prisma.characterReference.upsert({
        where: { umweroChar: character.umweroGlyph },
        update: {
          latinEquivalent: character.latinEquivalent,
          characterType: character.type.toLowerCase(),
          imageFontPath: imageUrl,
          fontImageUrl: imageUrl,
          difficulty: character.difficulty,
          metadata,
        },
        create: {
          umweroChar: character.umweroGlyph,
          latinEquivalent: character.latinEquivalent,
          characterType: character.type.toLowerCase(),
          imageFontPath: imageUrl,
          fontImageUrl: imageUrl,
          difficulty: character.difficulty,
          metadata,
        },
      }),
      prisma.character.update({
        where: { id: character.id },
        data: { glyphImageUrl: imageUrl },
      }),
    ])
    referencesUpdated += 1
  }

  const unmatchedFiles = filenames.filter((filename) => !matchedFilenames.has(filename))
  const unmatchedCategories = {
    numbers: 0,
    punctuation: 0,
    alternates: 0,
    '.notdef': 0,
    other: 0,
  }
  for (const filename of unmatchedFiles) {
    unmatchedCategories[categorizeUnmatchedFile(filename)] += 1
  }

  const report = {
    sourceDirectory,
    bucket,
    destinationPrefix,
    totalImagesFound: filenames.length,
    totalUploaded: uploaded,
    totalSkipped: skipped,
    uploadFailures,
    characterReferenceRecordsUpdated: referencesUpdated,
    matchedFileCount: matchedFilenames.size,
    unmatchedFileCount: unmatchedFiles.length,
    unmatchedCategories,
    unmatchedFiles,
    missingCharacterCount: missingCharacters.length,
    missingCharacters,
  }

  console.info(JSON.stringify(report, null, 2))
  if (uploadFailures.length > 0) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error('[reference-sync] fatal:', error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
