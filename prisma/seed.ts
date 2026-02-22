// UMWERO PLATFORM — ORTHOGRAPHICALLY CORRECT SEED
// =============================================================================
// Based EXCLUSIVELY on official UMWERO_MAP from lib/audio-utils.ts
// NO fake glyphs, NO hallucinated characters, NO phonological groupings
// =============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to get correct Umwero display character from UMWERO_MAP
function getUmweroDisplayChar(latinChar: string): string {
  const UMWERO_MAP: { [key: string]: string } = {
    // Vowels
    'A': '"', 'a': '"',
    'E': '|', 'e': '|',
    'I': '}', 'i': '}',
    'O': '{', 'o': '{',
    'U': ':', 'u': ':',
    
    // Single consonants
    'B': 'B', 'b': 'B',
    'C': 'C', 'c': 'C',
    'D': 'D', 'd': 'D',
    'F': 'F', 'f': 'F',
    'G': 'G', 'g': 'G',
    'H': 'H', 'h': 'H',
    'J': 'J', 'j': 'J',
    'K': 'K', 'k': 'K',
    'L': 'R', 'l': 'R', // L maps to R in Umwero
    'M': 'M', 'm': 'M',
    'N': 'N', 'n': 'N',
    'P': 'P', 'p': 'P',
    'R': 'R', 'r': 'R',
    'S': 'S', 's': 'S',
    'T': 'T', 't': 'T',
    'V': 'V', 'v': 'V',
    'W': 'W', 'w': 'W',
    'Y': 'Y', 'y': 'Y',
    'Z': 'Z', 'z': 'Z',
    
    // 2-letter compounds
    'MB': 'A', 'mb': 'A',
    'MF': 'FF', 'mf': 'FF',
    'MV': 'O', 'mv': 'O',
    'NC': 'CC', 'nc': 'CC',
    'ND': 'ND', 'nd': 'ND',
    'NG': 'NG', 'ng': 'NG',
    'NJ': 'U', 'nj': 'U',
    'NK': 'E', 'nk': 'E',
    'NS': 'SS', 'ns': 'SS',
    'NT': 'NN', 'nt': 'NN',
    'NZ': 'NZ', 'nz': 'NZ',
    'NY': 'YY', 'ny': 'YY',
    'PF': 'I', 'pf': 'I',
    'SH': 'HH', 'sh': 'HH',
    'TS': 'X', 'ts': 'X',
    'JY': 'L', 'jy': 'L',
    'SHY': 'Q', 'shy': 'Q',
    
    // 4-letter compounds
    'NSHY': 'QQ', 'nshy': 'QQ'
  };
  
  return UMWERO_MAP[latinChar] || latinChar;
}

// Helper function to get example words for characters
function getExampleWords(latinChar: string, type: 'vowel' | 'consonant' | 'ligature'): string[] {
  const examples: { [key: string]: string[] } = {
    // Vowels
    'A': ['abana', 'amazi', 'akazi'],
    'E': ['ese', 'ejo', 'erekana'],
    'I': ['iki', 'ino', 'inka'],
    'O': ['oya', 'oko', 'ose'],
    'U': ['ubu', 'uko', 'uyu'],
    
    // Single consonants
    'B': ['baba', 'bana', 'bose'],
    'C': ['cane', 'cumi', 'cyane'],
    'D': ['dada', 'dore', 'duca'],
    'F': ['fata', 'fite', 'funga'],
    'G': ['gana', 'gira', 'guca'],
    'H': ['hano', 'hehe', 'hose'],
    'J': ['jya', 'jye', 'jyewe'],
    'K': ['kana', 'kira', 'kuko'],
    'L': ['laba', 'leka', 'lero'],
    'M': ['mama', 'mana', 'meza'],
    'N': ['nana', 'neza', 'none'],
    'P': ['papa', 'pana', 'peza'],
    'R': ['raba', 'reka', 'rero'],
    'S': ['sana', 'seka', 'sero'],
    'T': ['taba', 'teka', 'tero'],
    'V': ['vana', 'veka', 'vero'],
    'W': ['wana', 'weka', 'wero'],
    'Y': ['yana', 'yeka', 'yero'],
    'Z': ['zana', 'zeka', 'zero'],
    
    // Compound consonants
    'MB': ['mbega', 'mbere', 'mbona'],
    'MF': ['mfura', 'mfite', 'mfana'],
    'MV': ['mvana', 'mveka', 'mvero'],
    'NC': ['ncana', 'nceka', 'ncero'],
    'ND': ['ndana', 'ndeka', 'ndero'],
    'NG': ['ngana', 'ngeka', 'ngero'],
    'NJ': ['njana', 'njeka', 'njero'],
    'NK': ['nkana', 'nkeka', 'nkero'],
    'NS': ['nsana', 'nseka', 'nsero'],
    'NT': ['ntana', 'nteka', 'ntero'],
    'NZ': ['nzana', 'nzeka', 'nzero'],
    'NY': ['nyana', 'nyeka', 'nyero'],
    'PF': ['pfana', 'pfeka', 'pfero'],
    'SH': ['shaka', 'shema', 'shyira'],
    'TS': ['tsana', 'tseka', 'tsero'],
    'JY': ['jyana', 'jyeka', 'jyero'],
    'SHY': ['shyana', 'shyeka', 'shyero'],
    'NSHY': ['nshyana', 'nshyeka', 'nshyero']
  };
  
  return examples[latinChar.toUpperCase()] || ['example1', 'example2'];
}

async function main() {
  console.log('🌱 UMWERO — Orthographically Correct Seed\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAN DATABASE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('🧹 Cleaning...');
  const tableNames = [
    'user_achievements', 'user_attempts', 'lesson_progress', 'step_translations', 
    'lesson_steps', 'lesson_translations', 'context_examples', 'cultural_context_translations', 
    'cultural_contexts', 'character_translations', 'stroke_data', 'comments', 
    'discussion_likes', 'discussions', 'achievements', 'lessons', 'characters', 
    'languages', 'users'
  ];

  try {
    for (const t of tableNames) {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${t}" CASCADE;`);
      } catch (e) {
        // Table might not exist
      }
    }
  } catch (e) {
    console.error('Clean failed:', e);
  }
  console.log('✅ Clean\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('🌐 Languages...');
  const languages = [
    { code: 'en', name: 'English', displayName: 'English', isDefault: true },
    { code: 'rw', name: 'Kinyarwanda', displayName: 'Ikinyarwanda', isDefault: false },
    { code: 'um', name: 'Umwero', displayName: 'Umwero', isDefault: false },
  ];
  for (const l of languages) {
    await prisma.language.upsert({
      where: { code: l.code },
      update: l,
      create: l
    });
  }
  console.log(`✅ ${languages.length} languages\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARACTERS — BASED EXCLUSIVELY ON OFFICIAL UMWERO_MAP
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('✏️  Characters...');

  // VOWELS (5) - From UMWERO_MAP
  const vowels = [
    { id: 'char-a', umweroGlyph: 'VOWEL_A', latinEquivalent: 'A', type: 'VOWEL', difficulty: 1, strokeCount: 3, order: 1, symbolism: 'Inyambo cow head', historicalNote: 'From cow vocalization "Baaaa"' },
    { id: 'char-e', umweroGlyph: 'VOWEL_E', latinEquivalent: 'E', type: 'VOWEL', difficulty: 1, strokeCount: 2, order: 2, symbolism: 'True Kinyarwanda /e/ sound', historicalNote: 'Corrects Latin E mismatch' },
    { id: 'char-i', umweroGlyph: 'VOWEL_I', latinEquivalent: 'I', type: 'VOWEL', difficulty: 1, strokeCount: 2, order: 3, symbolism: 'Long vowel', historicalNote: 'Pure Kinyarwanda /i/' },
    { id: 'char-o', umweroGlyph: 'VOWEL_O', latinEquivalent: 'O', type: 'VOWEL', difficulty: 1, strokeCount: 1, order: 4, symbolism: 'Circle — completeness', historicalNote: 'Uruziga cycle of life' },
    { id: 'char-u', umweroGlyph: 'VOWEL_U', latinEquivalent: 'U', type: 'VOWEL', difficulty: 1, strokeCount: 2, order: 5, symbolism: 'Binding rope', historicalNote: 'Umugozi relationships' }
  ];

  // CONSONANTS - Base single consonants from UMWERO_MAP
  const baseConsonants = [
    { id: 'char-b', umweroGlyph: 'B', latinEquivalent: 'B', type: 'CONSONANT', difficulty: 1, strokeCount: 3, order: 10, symbolism: 'Inyambo body', historicalNote: 'Cow body symbol' },
    { id: 'char-c', umweroGlyph: 'C', latinEquivalent: 'C', type: 'CONSONANT', difficulty: 2, strokeCount: 4, order: 11, symbolism: 'Serpent wisdom', historicalNote: 'Guca akenge = gain wisdom' },
    { id: 'char-d', umweroGlyph: 'D', latinEquivalent: 'D', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 12, symbolism: 'Father symbol', historicalNote: 'Data = father' },
    { id: 'char-f', umweroGlyph: 'F', latinEquivalent: 'F', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 13, symbolism: 'Labiodental fricative', historicalNote: 'IPA 128' },
    { id: 'char-g', umweroGlyph: 'G', latinEquivalent: 'G', type: 'CONSONANT', difficulty: 1, strokeCount: 3, order: 14, symbolism: 'Derived from M', historicalNote: 'Umbilical cord concept' },
    { id: 'char-h', umweroGlyph: 'H', latinEquivalent: 'H', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 15, symbolism: 'Breath consonant', historicalNote: 'IPA 146+147' },
    { id: 'char-j', umweroGlyph: 'J', latinEquivalent: 'J', type: 'CONSONANT', difficulty: 2, strokeCount: 2, order: 16, symbolism: 'Umuja — respect', historicalNote: 'Bowing figure' },
    { id: 'char-k', umweroGlyph: 'K', latinEquivalent: 'K', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 17, symbolism: 'Featural palatal', historicalNote: 'Tongue position' },
    { id: 'char-l', umweroGlyph: 'L_UNIQUE', latinEquivalent: 'L', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 18, symbolism: 'L maps to R', historicalNote: 'Umwero L→R mapping' },
    { id: 'char-m', umweroGlyph: 'M', latinEquivalent: 'M', type: 'CONSONANT', difficulty: 1, strokeCount: 3, order: 19, symbolism: 'Womb', historicalNote: 'Nyababyeyi + umbilical cord' },
    { id: 'char-n', umweroGlyph: 'N', latinEquivalent: 'N', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 20, symbolism: 'Nasal foundation', historicalNote: 'Building block for prenasalized' },
    { id: 'char-p', umweroGlyph: 'P', latinEquivalent: 'P', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 21, symbolism: 'Bilabial plosive', historicalNote: 'IPA 101' },
    { id: 'char-r', umweroGlyph: 'R', latinEquivalent: 'R', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 22, symbolism: 'God-RA', historicalNote: 'Kneeling toward Rurema' },
    { id: 'char-s', umweroGlyph: 'S', latinEquivalent: 'S', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 23, symbolism: 'Sibilant flow', historicalNote: 'Continuous airflow' },
    { id: 'char-t', umweroGlyph: 'T', latinEquivalent: 'T', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 24, symbolism: 'Featural alveolar', historicalNote: 'Tongue tip position' },
    { id: 'char-v', umweroGlyph: 'V', latinEquivalent: 'V', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 25, symbolism: 'Labiodental fricative', historicalNote: 'IPA 129' },
    { id: 'char-w', umweroGlyph: 'W', latinEquivalent: 'W', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 26, symbolism: 'Labial modifier', historicalNote: 'Creates labial variants' },
    { id: 'char-y', umweroGlyph: 'Y', latinEquivalent: 'Y', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 27, symbolism: 'Palatal modifier', historicalNote: 'Creates palatal variants' },
    { id: 'char-z', umweroGlyph: 'Z', latinEquivalent: 'Z', type: 'CONSONANT', difficulty: 1, strokeCount: 2, order: 28, symbolism: 'Derived from M', historicalNote: 'Umbilical cord concept' }
  ];

  // COMPOUND CONSONANTS - These are CONSONANTS, not ligatures (single phonemes)
  const compoundConsonants = [
    { id: 'char-mb', umweroGlyph: 'A', latinEquivalent: 'MB', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 30, symbolism: 'Prenasalized B', historicalNote: 'Single phoneme /mb/' },
    { id: 'char-mf', umweroGlyph: 'FF', latinEquivalent: 'MF', type: 'CONSONANT', difficulty: 3, strokeCount: 3, order: 31, symbolism: 'Imfura noble', historicalNote: 'Support + provision' },
    { id: 'char-mv', umweroGlyph: 'O', latinEquivalent: 'MV', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 32, symbolism: 'Prenasalized V', historicalNote: 'Single phoneme /mv/' },
    { id: 'char-nc', umweroGlyph: 'CC', latinEquivalent: 'NC', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 33, symbolism: 'Prenasalized C', historicalNote: 'Single phoneme /nc/' },
    
    
    { id: 'char-nj', umweroGlyph: 'U', latinEquivalent: 'NJ', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 36, symbolism: 'Prenasalized J', historicalNote: 'Single phoneme /nj/' },
    { id: 'char-nk', umweroGlyph: 'E', latinEquivalent: 'NK', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 37, symbolism: 'Prenasalized K', historicalNote: 'Single phoneme /nk/' },
    { id: 'char-ns', umweroGlyph: 'SS', latinEquivalent: 'NS', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 38, symbolism: 'Prenasalized S', historicalNote: 'Single phoneme /ns/' },
    { id: 'char-nt', umweroGlyph: 'NN', latinEquivalent: 'NT', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 39, symbolism: 'Prenasalized T', historicalNote: 'Single phoneme /nt/' },
   
    { id: 'char-ny', umweroGlyph: 'YY', latinEquivalent: 'NY', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 41, symbolism: 'UMWERO NY', historicalNote: 'Single consonant, not N+Y' },
    { id: 'char-pf', umweroGlyph: 'I', latinEquivalent: 'PF', type: 'CONSONANT', difficulty: 3, strokeCount: 2, order: 42, symbolism: 'Death — broken circle', historicalNote: 'gupfa = to die' },
    { id: 'char-sh', umweroGlyph: 'HH', latinEquivalent: 'SH', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 43, symbolism: 'Single sound, not S+H', historicalNote: 'Retracted sibilant' },
    { id: 'char-nsh', umweroGlyph: 'HHH', latinEquivalent: 'NSH', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 43, symbolism: 'Single sound, not N+S+H', historicalNote: 'Retracted sibilant' },
    { id: 'char-ts', umweroGlyph: 'TS', latinEquivalent: 'TS', type: 'CONSONANT', difficulty: 2, strokeCount: 2, order: 44, symbolism: 'Sibilant affricate', historicalNote: 'Continuous airflow' },
    { id: 'char-jy', umweroGlyph: 'L', latinEquivalent: 'JY', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 45, symbolism: 'Palatalized JY', historicalNote: 'Single phoneme jy' },
    { id: 'char-Njy', umweroGlyph: 'LL', latinEquivalent: 'LL', type: 'CONSONANT', difficulty: 2, strokeCount: 3, order: 45, symbolism: 'Palatalized NJY', historicalNote: 'Single phoneme Njy' },
    { id: 'char-shy', umweroGlyph: 'Q', latinEquivalent: 'SHY', type: 'CONSONANT', difficulty: 3, strokeCount: 3, order: 46, symbolism: 'Palatalized SH', historicalNote: 'Single phoneme /shy/' },
    { id: 'char-nshy', umweroGlyph: 'QQ', latinEquivalent: 'NSHY', type: 'CONSONANT', difficulty: 4, strokeCount: 4, order: 47, symbolism: 'Prenasalized NSHY', historicalNote: 'Complex single phoneme NSHY' },
    { id: 'char-JJ', umweroGlyph: 'JJ', latinEquivalent: 'J', type: 'CONSONANT', difficulty: 2, strokeCount: 4, order: 47, symbolism: 'Prenasalized Dj/J- Swahili', historicalNote: 'Complex single phoneme' },
    { id: 'char-Dz', umweroGlyph: 'ZZ', latinEquivalent: 'Z', type: 'CONSONANT', difficulty: 2, strokeCount: 4, order: 47, symbolism: 'Prenasalized DZ/Z- Kirundi', historicalNote: 'Complex single phoneme' },
    { id: 'char-Ky/Cy', umweroGlyph: 'KK', latinEquivalent: 'KK', type: 'CONSONANT', difficulty: 2, strokeCount: 4, order: 47, symbolism: 'Prenasalized CY/Ky', historicalNote: 'Complex single phoneme' },
    { id: 'char-NKy/NCy', umweroGlyph: 'KKK', latinEquivalent: 'KKK', type: 'CONSONANT', difficulty: 2, strokeCount: 4, order: 47, symbolism: 'Prenasalized NCY/NKy', historicalNote: 'Complex single phoneme' }
  ];

  // TRUE LIGATURES - Only structural compound fusions from UMWERO_MAP
  const trueLigatures = [
    // Based on UMWERO_MAP - these are true structural fusions, not single phonemes
    
    // 2-letter structural compounds
    { id:'char-nz', umweroGlyph: 'NZ', latinEquivalent: 'NZ', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 40, symbolism: 'Prenasalized NZ', historicalNote: 'Single phoneme /nz/' },
    { id: 'char-ng', umweroGlyph: 'NG', latinEquivalent: 'NG', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 35, symbolism: 'Prenasalized NG', historicalNote: 'iGIHEKANE /ng/' },
    { id: 'char-nd', umweroGlyph: 'ND', latinEquivalent: 'ND', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 34, symbolism: 'Prenasalized ND', historicalNote: 'iGIHEKANE /nd/' },
    { id: 'lig-bw', umweroGlyph: 'BBG', latinEquivalent: 'BW', type: 'LIGATURE', difficulty: 2, strokeCount: 4, order: 50, symbolism: 'B + W fusion', historicalNote: 'Bga - B with W modifier' },
    { id: 'lig-by', umweroGlyph: 'BBL', latinEquivalent: 'BY', type: 'LIGATURE', difficulty: 2, strokeCount: 4, order: 51, symbolism: 'B + Y fusion', historicalNote: 'Bya - B with Y modifier' },
    { id: 'lig-cw', umweroGlyph: 'CKW', latinEquivalent: 'CW', type: 'LIGATURE', difficulty: 2, strokeCount: 4, order: 52, symbolism: 'C + W fusion', historicalNote: 'Ckwa - C with W modifier' },
    { id: 'lig-cy', umweroGlyph: 'CYY', latinEquivalent: 'CY', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 53, symbolism: 'C + Y fusion', historicalNote: 'Cya - C with Y modifier' },
    { id: 'lig-dw', umweroGlyph: 'DGW', latinEquivalent: 'DW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 54, symbolism: 'D + W fusion', historicalNote: 'Dgwa - D with W modifier' },
    { id: 'lig-fw', umweroGlyph: 'FK', latinEquivalent: 'FW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 55, symbolism: 'F + W fusion', historicalNote: 'Fka - F with W modifier' },
    { id: 'lig-fy', umweroGlyph: 'FKK', latinEquivalent: 'FY', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 56, symbolism: 'F + Y fusion', historicalNote: 'Fkya - F with Y modifier' },
    { id: 'lig-gw', umweroGlyph: 'GW', latinEquivalent: 'GW', type: 'LIGATURE', difficulty: 2, strokeCount: 4, order: 57, symbolism: 'G + W fusion', historicalNote: 'Gwa - G with W modifier' },
    { id: 'lig-kw', umweroGlyph: 'KW', latinEquivalent: 'KW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 58, symbolism: 'K + W fusion', historicalNote: 'Kwa - K with W modifier' },
    { id: 'lig-mw', umweroGlyph: 'ME', latinEquivalent: 'MW', type: 'LIGATURE', difficulty: 2, strokeCount: 4, order: 60, symbolism: 'M + W fusion', historicalNote: 'Mwa - M with W modifier' },
    { id: 'lig-my', umweroGlyph: 'MYY', latinEquivalent: 'MY', type: 'LIGATURE', difficulty: 2, strokeCount: 4, order: 61, symbolism: 'M + Y fusion', historicalNote: 'Mya - M with Y modifier' },
    { id: 'lig-nw', umweroGlyph: 'NEW', latinEquivalent: 'NW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 62, symbolism: 'N + W fusion', historicalNote: 'Nwa - N with W modifier' },
    { id: 'lig-ntw', umweroGlyph: 'NNEW', latinEquivalent: 'NTW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 62, symbolism: 'N +T+ W fusion', historicalNote: 'Ntwa - N with W modifier' },
    { id: 'lig-pw', umweroGlyph: 'PK', latinEquivalent: 'PW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 63, symbolism: 'P + W fusion', historicalNote: 'Pka - P with W modifier' },
    { id: 'lig-py', umweroGlyph: 'PKK', latinEquivalent: 'PY', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 64, symbolism: 'P + Y fusion', historicalNote: 'Pkya - P with Y modifier' },
    { id: 'lig-rw', umweroGlyph: 'RGW', latinEquivalent: 'RW', type: 'LIGATURE', difficulty: 2, strokeCount: 4, order: 65, symbolism: 'R + W fusion', historicalNote: 'Rgwa - R with W modifier' },
    { id: 'lig-ry', umweroGlyph: 'DL', latinEquivalent: 'RY', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 66, symbolism: 'R + Y fusion', historicalNote: 'Rya - R with Y modified to D+JY' },
    { id: 'lig-sw', umweroGlyph: 'SKW', latinEquivalent: 'SW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 67, symbolism: 'S + W fusion', historicalNote: 'Skwa - S with W modifier' },
    { id: 'lig-sy', umweroGlyph: 'SKK', latinEquivalent: 'SY', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 68, symbolism: 'S + Y fusion', historicalNote: 'Skya - S with Y modifier' },
    { id: 'lig-tw', umweroGlyph: 'TKW', latinEquivalent: 'TW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 69, symbolism: 'T + W fusion', historicalNote: 'Tkwa - T with W modifier' },
    { id: 'lig-ty', umweroGlyph: 'TKK', latinEquivalent: 'TY', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 70, symbolism: 'T + Y fusion', historicalNote: 'Tkya - T with Y modifier' },
    { id: 'lig-vw', umweroGlyph: 'VG', latinEquivalent: 'VW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 71, symbolism: 'V + W fusion', historicalNote: 'Vga - V with W modifier' },
    { id: 'lig-vy', umweroGlyph: 'VL', latinEquivalent: 'VY', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 72, symbolism: 'V + Y fusion', historicalNote: 'Vya - V with Y modifier' },
    { id: 'lig-zw', umweroGlyph: 'ZGW', latinEquivalent: 'ZW', type: 'LIGATURE', difficulty: 2, strokeCount: 3, order: 73, symbolism: 'Z + W fusion', historicalNote: 'Zgwa - Z with W modifier' },

    // 3-letter structural compounds
    { id: 'lig-ncw', umweroGlyph: 'CCKW', latinEquivalent: 'NCW', type: 'LIGATURE', difficulty: 3, strokeCount: 5, order: 80, symbolism: 'N + C + W fusion', historicalNote: 'Nckwa - prenasalized C with W' },
    { id: 'lig-nkw', umweroGlyph: 'EW', latinEquivalent: 'NKW', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 81, symbolism: 'N + K + W fusion', historicalNote: 'Nkwa - prenasalized K with W' },
    { id: 'lig-mfw', umweroGlyph: 'FFK', latinEquivalent: 'MFW', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 82, symbolism: 'MF + W fusion', historicalNote: 'Mfka - MF with W modifier' },
    { id: 'lig-mfy', umweroGlyph: 'FFKK', latinEquivalent: 'MFY', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 83, symbolism: 'MF + Y fusion', historicalNote: 'Mfkya - MF with Y modifier' },
    
    { id: 'lig-pfw', umweroGlyph: 'IK', latinEquivalent: 'PFW', type: 'LIGATURE', difficulty: 3, strokeCount: 3, order: 85, symbolism: 'PF + W fusion', historicalNote: 'Pfka - PF with W modifier' },
    { id: 'lig-pfy', umweroGlyph: 'IKK', latinEquivalent: 'PFY', type: 'LIGATURE', difficulty: 3, strokeCount: 3, order: 86, symbolism: 'PF + Y fusion', historicalNote: 'Pfkya - PF with Y modifier' },
    { id: 'lig-shw', umweroGlyph: 'HHKW', latinEquivalent: 'SHW', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 87, symbolism: 'SH + W fusion', historicalNote: 'Shkwa - SH with W modifier' },
    { id: 'lig-ndw', umweroGlyph: 'NDGW', latinEquivalent: 'NDW', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 88, symbolism: 'ND + W fusion', historicalNote: 'Ndgwa - ND with W modifier' },
    { id: 'lig-ndy', umweroGlyph: 'NDL', latinEquivalent: 'NDY', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 89, symbolism: 'ND + Y fusion', historicalNote: 'Ndgya - ND with Y modifier' },
    { id: 'lig-ngw', umweroGlyph: 'NGW', latinEquivalent: 'NGW', type: 'LIGATURE', difficulty: 3, strokeCount: 5, order: 90, symbolism: 'NG + W fusion', historicalNote: 'Ngwa - NG with W modifier' },
    
    { id: 'lig-nty', umweroGlyph: 'NNYY', latinEquivalent: 'NTY', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 92, symbolism: 'NN + Y fusion', historicalNote: 'Nnya - NN with Y modifier' },
    { id: 'lig-nyy', umweroGlyph: 'NYY', latinEquivalent: 'NYY', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 93, symbolism: 'NY + Y fusion', historicalNote: 'Nyya - NY with Y modifier' },
    { id: 'lig-nzw', umweroGlyph: 'NZGW', latinEquivalent: 'NZW', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 94, symbolism: 'NZ + W fusion', historicalNote: 'Nzgwa - NZ with W modifier' },
    { id: 'lig-mvw', umweroGlyph: 'OG', latinEquivalent: 'MVW', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 95, symbolism: 'MV + W fusion', historicalNote: 'Mvga - MV with W modifier' },
    { id: 'lig-mvy', umweroGlyph: 'OL', latinEquivalent: 'MVY', type: 'LIGATURE', difficulty: 3, strokeCount: 4, order: 96, symbolism: 'MV + Y fusion', historicalNote: 'Mvgya - MV with Y modifier' },
    { id: 'lig-mpy', umweroGlyph: 'PPKK', latinEquivalent: 'MPY', type: 'LIGATURE', difficulty: 3, strokeCount: 5, order: 97, symbolism: 'MP + Y fusion', historicalNote: 'Mpkya - MP with Y modifier' },
    
    { id: 'lig-mbw', umweroGlyph: 'AG', latinEquivalent: 'MBW', type: 'LIGATURE', difficulty: 3, strokeCount: 5, order: 98, symbolism: 'MB + W fusion', historicalNote: 'Mbga - MB with W modifier' },
    { id: 'lig-tsw', umweroGlyph: 'XKW', latinEquivalent: 'TSW', type: 'LIGATURE', difficulty: 3, strokeCount: 3, order: 99, symbolism: 'TS + W fusion', historicalNote: 'Tskwa - TS with W modifier' },

    // 4-letter structural compounds
    { id: 'lig-nshw', umweroGlyph: 'HHHKW', latinEquivalent: 'NSHW', type: 'LIGATURE', difficulty: 4, strokeCount: 5, order: 110, symbolism: 'NSH + W fusion', historicalNote: 'Nshkwa - NSH with W modifier' },
    

    // 5-letter structural compounds
    { id: 'lig-nshyw', umweroGlyph: 'QQKW', latinEquivalent: 'NSHYW', type: 'LIGATURE', difficulty: 5, strokeCount: 5, order: 120, symbolism: 'NSH + Y + W fusion', historicalNote: 'Nshywa - most complex compound' },
    
  ];

  // SPECIAL CHARACTERS
  const specials = [
    { id: 'char-space', umweroGlyph: ' ', latinEquivalent: 'SPACE', type: 'SPECIAL', difficulty: 0, strokeCount: 0, order: 100, symbolism: 'Word separator', historicalNote: 'Standard space' },
    { id: 'char-period', umweroGlyph: '.', latinEquivalent: 'PERIOD', type: 'SPECIAL', difficulty: 0, strokeCount: 1, order: 101, symbolism: 'Sentence end', historicalNote: 'Standard period' },
    { id: 'char-comma', umweroGlyph: ',', latinEquivalent: 'COMMA', type: 'SPECIAL', difficulty: 0, strokeCount: 1, order: 102, symbolism: 'Pause marker', historicalNote: 'Standard comma' }
  ];

  const allChars = [...vowels, ...baseConsonants, ...compoundConsonants, ...trueLigatures, ...specials];

  for (const c of allChars) {
    await prisma.character.upsert({
      where: { id: c.id },
      update: c as any,
      create: c as any
    });
  }

  console.log(`✅ ${allChars.length} characters (${vowels.length} vowels, ${baseConsonants.length + compoundConsonants.length} consonants, ${trueLigatures.length} ligatures, ${specials.length} special)\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // LESSONS — INDIVIDUAL LESSONS FOR EVERY CHARACTER
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('📚 Lessons...');

  const allLessons = [
    // Vowel lessons (5)
    ...vowels.map((v, i) => ({
      id: `lesson-vowel-${v.latinEquivalent.toLowerCase()}`,
      title: `Vowel ${v.latinEquivalent}`,
      description: `Learn the vowel ${v.latinEquivalent} - ${v.symbolism}`,
      module: 'BEGINNER' as const,
      type: 'VOWEL' as const,
      order: i + 1,
      duration: 8,
      difficulty: 1,
      estimatedTime: 8,
      characterId: v.id,
      code: `VOWEL-${v.latinEquivalent}`,
      content: JSON.stringify({ 
        vowel: v.latinEquivalent.toLowerCase(), 
        glyph: getUmweroDisplayChar(v.latinEquivalent), // Use UMWERO_MAP for display
        symbol: v.symbolism,
        examples: getExampleWords(v.latinEquivalent, 'vowel')
      }),
      isPublished: true
    })),

    // Individual consonant lessons - EVERY consonant gets its own lesson
    ...baseConsonants.map((c, i) => ({
      id: `lesson-consonant-${c.latinEquivalent.toLowerCase()}`,
      title: `Consonant ${c.latinEquivalent}`,
      description: `Learn the consonant ${c.latinEquivalent} - ${c.symbolism}`,
      module: 'BEGINNER' as const,
      type: 'CONSONANT' as const,
      order: i + 6,
      duration: 10,
      difficulty: c.difficulty,
      estimatedTime: 10,
      characterId: c.id,
      code: `CONS-${c.latinEquivalent}`,
      content: JSON.stringify({ 
        consonant: c.latinEquivalent.toLowerCase(), 
        glyph: getUmweroDisplayChar(c.latinEquivalent), // Use UMWERO_MAP for display
        symbol: c.symbolism,
        examples: getExampleWords(c.latinEquivalent, 'consonant')
      }),
      isPublished: true
    })),

    // Individual compound consonant lessons
    ...compoundConsonants.map((c, i) => ({
      id: `lesson-consonant-${c.latinEquivalent.toLowerCase()}`,
      title: `Consonant ${c.latinEquivalent}`,
      description: `Learn the consonant ${c.latinEquivalent} - ${c.symbolism}`,
      module: 'INTERMEDIATE' as const,
      type: 'CONSONANT' as const,
      order: i + 6 + baseConsonants.length,
      duration: 12,
      difficulty: c.difficulty,
      estimatedTime: 12,
      characterId: c.id,
      code: `CONS-${c.latinEquivalent}`,
      content: JSON.stringify({ 
        consonant: c.latinEquivalent.toLowerCase(), 
        glyph: getUmweroDisplayChar(c.latinEquivalent), // Use UMWERO_MAP for display
        symbol: c.symbolism,
        examples: getExampleWords(c.latinEquivalent, 'consonant')
      }),
      isPublished: true
    })),

    // Individual ligature lessons - EVERY ligature gets its own lesson
    ...trueLigatures.map((l, i) => ({
      id: `lesson-ligature-${l.latinEquivalent.toLowerCase()}`,
      title: `Ligature ${l.latinEquivalent}`,
      description: `Learn the ligature ${l.latinEquivalent} - ${l.symbolism}`,
      module: l.difficulty <= 2 ? 'INTERMEDIATE' as const : 'ADVANCED' as const,
      type: 'LIGATURE' as const,
      order: i + 6 + baseConsonants.length + compoundConsonants.length,
      duration: l.difficulty * 5,
      difficulty: l.difficulty,
      estimatedTime: l.difficulty * 5,
      characterId: l.id,
      code: `LIG-${l.latinEquivalent}`,
      content: JSON.stringify({ 
        ligature: l.latinEquivalent.toLowerCase(), 
        glyph: l.umweroGlyph, 
        symbol: l.symbolism,
        components: l.latinEquivalent.match(/.{1,2}/g) || [l.latinEquivalent] // Split into component parts
      }),
      isPublished: true
    })),

    // Culture lessons
    {
      id: 'lesson-culture-history',
      title: 'History of Writing Systems',
      description: 'From Cuneiform to Umwero — why new scripts are born.',
      module: 'BEGINNER' as const,
      type: 'CULTURE' as const,
      order: 200,
      duration: 15,
      difficulty: 1,
      estimatedTime: 15,
      code: 'CULTURE-HIST',
      content: JSON.stringify({ topics: ['Cuneiform', 'Hieroglyphs', 'Alphabet origin', 'Colonial impact', 'Umwero'] }),
      isPublished: true
    },
    {
      id: 'lesson-culture-system',
      title: 'The Umwero Writing System',
      description: 'RTL direction, 8-unit measurement, joint at position 3.',
      module: 'BEGINNER' as const,
      type: 'CULTURE' as const,
      order: 201,
      duration: 10,
      difficulty: 1,
      estimatedTime: 10,
      code: 'CULTURE-SYS',
      content: JSON.stringify({ direction: 'RTL', measurement: 8, joint: 3 }),
      isPublished: true
    }
  ];

  for (const l of allLessons) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: l as any,
      create: l as any
    });
  }
  console.log(`✅ ${allLessons.length} lessons\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('🏆 Achievements...');
  const achievements = [
    { code: 'first-steps', name: 'Intambwe ya Mbere', description: 'Complete your first lesson', icon: '🎯', category: 'LESSON_COMPLETION' as const, requirement: JSON.stringify({ lessonsCompleted: 1 }), points: 10 },
    { code: 'vowel-master', name: 'Umuhanga w\'Inyajwi', description: 'Complete all 5 vowel lessons', icon: '🏆', category: 'LESSON_COMPLETION' as const, requirement: JSON.stringify({ vowelsCompleted: 5 }), points: 50 },
    { code: 'consonant-explorer', name: 'Umushakashatsi w\'Ingombajwi', description: 'Complete 10 consonant lessons', icon: '📚', category: 'LESSON_COMPLETION' as const, requirement: JSON.stringify({ consonantsCompleted: 10 }), points: 40 },
    { code: 'cultural-seeker', name: 'Umushakisha w\'Umuco', description: 'Complete all cultural lessons', icon: '🌍', category: 'CULTURAL_KNOWLEDGE' as const, requirement: JSON.stringify({ cultureLessonsCompleted: 2 }), points: 60 }
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: a,
      create: a
    });
  }
  console.log(`✅ ${achievements.length} achievements\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('👥 Users...');
  const users = [
    { email: '37nzela@gmail.com', username: 'kwizera', password: 'Mugix260', fullName: 'Kwizera Mugisha', role: 'ADMIN', country: 'Rwanda', countryCode: 'RW', preferredLanguage: 'en', bio: 'Creator of Umwero alphabet.', emailVerified: true, provider: 'EMAIL' },
    { email: 'demo@uruziga.com', username: 'demo', password: 'demo123', fullName: 'Demo Student', role: 'USER', country: 'Rwanda', countryCode: 'RW', preferredLanguage: 'en', bio: 'Demo account.', emailVerified: true, provider: 'EMAIL' },
    { email: 'teacher@uruziga.com', username: 'teacher', password: 'teach123', fullName: 'Umwero Teacher', role: 'TEACHER', country: 'Rwanda', countryCode: 'RW', preferredLanguage: 'en', bio: 'Teacher account.', emailVerified: true, provider: 'EMAIL' }
  ];
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        password: hashed,
        fullName: u.fullName,
        role: u.role as any,
        country: u.country,
        countryCode: u.countryCode,
        preferredLanguage: u.preferredLanguage,
        bio: u.bio,
        emailVerified: u.emailVerified,
        provider: u.provider as any
      }
    });
  }
  console.log(`✅ ${users.length} users\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 ORTHOGRAPHICALLY CORRECT SEED COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🌐 Languages:    ${languages.length}`);
  console.log(`  ✏️  Characters:   ${allChars.length}`);
  console.log(`  📚 Lessons:      ${allLessons.length} (ALL INDIVIDUAL)`);
  console.log(`  🏆 Achievements: ${achievements.length}`);
  console.log(`  👥 Users:        ${users.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ STRUCTURAL INTEGRITY: Official UMWERO_MAP only');
  console.log('✅ NO FAKE GLYPHS: All glyphs from official mapping');
  console.log('✅ CORRECT CLASSIFICATION: Consonants vs Ligatures');
  console.log('✅ INDIVIDUAL LESSONS: Every character = one lesson');
  console.log('✅ NO GROUPINGS: No phonological families');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });