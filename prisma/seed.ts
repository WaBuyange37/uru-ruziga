// prisma/seed.ts
// =============================================================================
// UMWERO PLATFORM — COMPREHENSIVE DATABASE SEED (Corrected from source docs)
// =============================================================================
// All character data sourced directly from:
//   - UmweroIPA-1.pdf (glyph mappings, IPA numbers, ASCII codes)
//   - Umwero_Visual_Cultural.pdf (cultural symbolism, character design rationale)
//   - Umwero Kabbalah + History HTML (history, numbers philosophy, creator story)
// =============================================================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

// ─── TRANSLATION MAPPING GUIDE ──────────────────────────────────────────────
// How Umwero letters map to useTranslation (i18n) keys:
//
//   character.latinEquivalent → used as the i18n lookup key
//   
//   Example flow:
//     DB: { latinEquivalent: "B", umweroGlyph: "ꮾ" }
//     i18n key: t(`characters.B.name`)        → "Ba"
//     i18n key: t(`characters.B.pronunciation`) → "/b/ voiced bilabial"
//     i18n key: t(`characters.B.meaning`)      → "Inyambo cow's body"
//     Font render: umweroGlyph value "ꮾ"      → displays Umwero B glyph
//
//   For compounds:
//     DB: { latinEquivalent: "BW", type: "LIGATURE" }
//     i18n key: t(`characters.BW.name`)       → "Bga"
//     Font: compound glyph
//
//   The `character_translations` table stores per-language translations,
//   which can be loaded into i18n JSON files or served via API.
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 UMWERO — Comprehensive Seed (Source-verified)\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAN
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('🧹 Cleaning with TRUNCATE...');
  const tableNames = [
    'UserAchievement', 'UserAttempt', // PascalCase for table names usually, checking mapping... 
    // Actually Prisma models are PascalCase, but table names are usually lowercase or mapped.
    // Using $executeRawUnsafe with quote identifiers is safer for Postgres.
    'user_achievements', 'user_attempts',
    'lesson_progress', 'step_translations', 'lesson_steps', 'lesson_translations',
    'context_examples', 'cultural_context_translations', 'cultural_contexts',
    'character_translations', 'stroke_data', 'comments', 'discussion_likes',
    'discussions',
    'achievements', 'lessons', 'characters', 'languages', 'users'
  ];

  try {
    // Disable triggers/constraints if needed, or just Cascade
    for (const t of tableNames) {
      // Attempt to truncate, ignore if not exists
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${t}" CASCADE;`);
      } catch (e) {
        // console.log(`Table ${t} truncate failed (might not exist): ${e.message}`);
      }
    }
    // Fallback to deleteMany for Prisma models if Truncate misses some
    // (Using the original list for Prisma client access)
    const models = [
      'userAchievement', 'userAttempt',
      'lessonProgress', 'stepTranslation', 'lessonStep', 'lessonTranslation',
      'contextExample', 'culturalContextTranslation', 'culturalContext',
      'characterTranslation', 'strokeData', 'comment', 'discussionLike',
      'discussion',
      'achievement', 'lesson', 'character', 'language', 'user'
    ];
    for (const m of models) {
      try { if ((prisma as any)[m]) await (prisma as any)[m].deleteMany(); } catch { }
    }

  } catch (e) {
    console.error('Clean failed:', e);
  }
  console.log('✅ Clean\n');

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGES
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('🌐 Languages...');
  const langs = [
    { code: 'en', name: 'English', displayName: 'English', isDefault: true, direction: 'ltr' },
    { code: 'rw', name: 'Ikinyarwanda', displayName: 'Ikinyarwanda', isDefault: false, direction: 'ltr' },
    { code: 'um', name: 'Umwero', displayName: 'Umwero', isDefault: false, direction: 'rtl' },
    { code: 'rn', name: 'Ikirundi', displayName: 'Ikirundi', isDefault: false, direction: 'ltr' },
    { code: 'sw', name: 'Kiswahili', displayName: 'Kiswahili', isDefault: false, direction: 'ltr' },
  ];
  for (const l of langs) {
    await prisma.language.upsert({
      where: { code: l.code },
      update: l,
      create: l
    });
  }
  const enLang = await prisma.language.findUnique({ where: { code: 'en' } });
  const rwLang = await prisma.language.findUnique({ where: { code: 'rw' } });
  console.log(`✅ ${langs.length} languages\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARACTERS — From UmweroIPA-1.pdf & Umwero_Visual_Cultural.pdf
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // Schema: umweroGlyph = ASCII font character, latinEquivalent = canonical key
  //
  console.log('✏️  Characters...');

  // --- VOWELS (5) ---
  const vowels = [
    {
      id: 'char-a', glyph: 'ȏ', latin: 'A', type: 'VOWEL', diff: 1, strokes: 3, ord: 1,
      symbol: 'Inyambo cow head with horns — wealth, sustenance, heritage',
      history: 'From the Inyambo cow vocalization "Baaaa". A = head. B+A = full cow. IPA page 1.',
      enName: 'A (ah)', enPron: '/a/ as in "Abana"', enMean: 'Inyambo Cow\'s Head',
      enDesc: 'First vowel. Shaped like Inyambo cow head with long horns. Symbol of wealth.',
      rwName: 'A (ah)', rwPron: '/a/ nka muri "Abana"', rwMean: 'Umutwe w\'Inyambo',
      rwDesc: 'Inyajwi ya mbere. Ishushanyije nk\'umutwe w\'inyambo.'
    },
    {
      id: 'char-u', glyph: 'ɗ', latin: 'U', type: 'VOWEL', diff: 1, strokes: 2, ord: 2,
      symbol: 'Umugozi/Umurunga — binding rope of relationships',
      history: 'Loop shape = ties binding people. Begins Ubuntu, Umuco, Urwanda.',
      enName: 'U (uh)', enPron: '/u/ as in "Umunyu"', enMean: 'Binding Rope',
      enDesc: 'Loop shape representing community ties. Begins foundational Rwandan words.',
      rwName: 'U (uh)', rwPron: '/u/ nka muri "Umunyu"', rwMean: 'Umurunga',
      rwDesc: 'Igaragaza imibanire n\'ubumwe. Itangira Ubuntu, Umuco, Urwanda.'
    },
    {
      id: 'char-o', glyph: 'Ɨ', latin: 'O', type: 'VOWEL', diff: 1, strokes: 1, ord: 3,
      symbol: '360° circle — completeness, cycle of life (Uruziga)',
      history: 'Circle = Hero na Herezo (Alpha & Omega). Basis for PF (death = broken circle).',
      enName: 'O (oh)', enPron: '/o/ as in "note"', enMean: 'Circle of Life',
      enDesc: '360° circle representing completeness. Uruziga = beginning and end.',
      rwName: 'O (oh)', rwPron: '/o/ nka muri "Oroha"', rwMean: 'Uruziga rw\'ubuzima',
      rwDesc: 'Uruziga rugaragaza Hero na Herezo — intangiriro n\'iherezo.'
    },
    {
      id: 'char-e', glyph: 'ᒍ', latin: 'E', type: 'VOWEL', diff: 1, strokes: 2, ord: 4,
      symbol: 'E — the true Kinyarwanda /e/ sound',
      history: 'Corrects Latin E (originally "ih") to actual Kinyarwanda "eh" sound.',
      enName: 'E (eh)', enPron: '/e/ as in "Emera"', enMean: 'Open Vowel',
      enDesc: 'True Kinyarwanda /e/ sound, correcting Latin mismatch.',
      rwName: 'E (eh)', rwPron: '/e/ nka muri "Emera"', rwMean: 'Inyajwi ifunguye',
      rwDesc: 'Ijwi ry\'ikinyarwanda nyakuri, itandukanye n\'iyi Latin E.'
    },
    {
      id: 'char-i', glyph: 'Ꮮ', latin: 'I', type: 'VOWEL', diff: 1, strokes: 2, ord: 5,
      symbol: 'I — the long vowel',
      history: 'Pure Kinyarwanda /i/ as in "inyinya".',
      enName: 'I (ih)', enPron: '/i/ as in "inyinya"', enMean: 'Long Vowel',
      enDesc: 'The long vowel appearing in fundamental words like ibi, imizi, imibu.',
      rwName: 'I (ih)', rwPron: '/i/ nka muri "inyinya"', rwMean: 'Inyajwi ndende',
      rwDesc: 'Igaragara mu magambo y\'ibanze nka ibi, imizi, imibu.'
    },
  ];

  // --- CONSONANTS (20 base) from IPA doc ---
  const consonants = [
    {
      id: 'char-b', glyph: 'ꮾ', latin: 'B', type: 'CONSONANT', diff: 1, strokes: 3, ord: 10,
      symbol: 'Inyambo cow body — B+A = complete cow',
      history: 'From "Baaaa" vocalization. B = body. Combined with A = whole Inyambo. Voiced bilabial approximant.'
    },
    {
      id: 'char-r', glyph: 'Ɍ', latin: 'R', type: 'CONSONANT', diff: 2, strokes: 3, ord: 11,
      symbol: 'God-RA — person kneeling in praise toward Rurema',
      history: 'Ra = divine. Rurema = Ra + Urema (creator). Shape = kneeling person, rotated for readability. IPA 124.'
    },
    {
      id: 'char-m', glyph: 'Ꮈ', latin: 'M', type: 'CONSONANT', diff: 1, strokes: 3, ord: 12,
      symbol: 'Womb (Nyababyeyi) — baby connected to umbilical cord (Umura)',
      history: 'Ma begins Maama, Maawe, Maaye. Parent of L, LL, G, Z via Umura. "Iyo abyaye, twunguka amaboko." IPA 114.'
    },
    {
      id: 'char-n', glyph: 'Ꮿ', latin: 'N', type: 'CONSONANT', diff: 1, strokes: 2, ord: 13,
      symbol: 'Foundational nasal — building block for prenasalized sounds',
      history: 'Combines with D→Nd, G→Ng, J→Nj, Z→Nz, K→NK, S→Ns, Sh→Nsh, T→Nt. IPA 116.'
    },
    {
      id: 'char-t', glyph: 'Ɫ', latin: 'T', type: 'CONSONANT', diff: 1, strokes: 2, ord: 14,
      symbol: 'Featural: tongue tip touching alveolar ridge',
      history: 'Voiceless alveolar plosive. IPA [t] 103. Flipped horizontally for RTL = matches IPA diagram. Like Hangul.'
    },
    {
      id: 'char-k', glyph: 'Ⴒ', latin: 'K', type: 'CONSONANT', diff: 1, strokes: 2, ord: 15,
      symbol: 'Featural: back of tongue touching soft palate',
      history: 'Voiceless velar plosive. IPA [k] 109. Flipped for RTL = matches IPA diagram.'
    },
    {
      id: 'char-s', glyph: 'Ȥ', latin: 'S', type: 'CONSONANT', diff: 1, strokes: 2, ord: 16,
      symbol: 'Sibilant: flowing uninterrupted strokes = continuous airflow',
      history: 'Voiceless alveolar sibilant. IPA 132. Cannot be stopped abruptly ("Siiiiiii").'
    },
    {
      id: 'char-ch', glyph: 'Ꮇ', latin: 'C', type: 'CONSONANT', diff: 2, strokes: 4, ord: 17,
      symbol: 'Serpent (inzoka) + pathway — wisdom (guca akenge) and movement',
      history: 'Resembles serpent and path. "Guca akenge" = gain wisdom. "Guca mu nzira" = pass through path. IPA 103+134.'
    },
    {
      id: 'char-d', glyph: 'ꟼ', latin: 'D', type: 'CONSONANT', diff: 1, strokes: 2, ord: 18,
      symbol: 'Male symbol (♂) — Data (father), masculinity',
      history: 'Resembles ♂. Data=father, Daye=my father, Dawe=our father. M(♀) points down, D(♂) points up. IPA 104.'
    },
    {
      id: 'char-j', glyph: 'ꝺ', latin: 'J', type: 'CONSONANT', diff: 2, strokes: 2, ord: 19,
      symbol: 'Umuja (slave/laborer) — bowed figure = servitude AND respect',
      history: '"Umuja ni umugonda Josi" = A slave bows. Umu+Ja=Umuja. Duality: bowing = submission AND respect. IPA 135+137.'
    },
    {
      id: 'char-g', glyph: 'Ɉ', latin: 'G', type: 'CONSONANT', diff: 1, strokes: 3, ord: 20,
      symbol: 'Derived from M through Umura (umbilical cord)',
      history: 'One of 4 letters directly derived from M via umbilical cord concept. IPA 110.'
    },
    {
      id: 'char-h', glyph: 'ꞕ', latin: 'H', type: 'CONSONANT', diff: 1, strokes: 2, ord: 21,
      symbol: 'H — the breath consonant', history: 'IPA 146+147.'
    },
    {
      id: 'char-f', glyph: 'Ꮙ', latin: 'F', type: 'CONSONANT', diff: 1, strokes: 2, ord: 22,
      symbol: 'F — labiodental fricative', history: 'IPA 128.'
    },
    {
      id: 'char-p', glyph: 'Ꮥ', latin: 'P', type: 'CONSONANT', diff: 1, strokes: 2, ord: 23,
      symbol: 'P — voiceless bilabial plosive', history: 'IPA 101.'
    },
    {
      id: 'char-v', glyph: 'Ꮠ', latin: 'V', type: 'CONSONANT', diff: 1, strokes: 2, ord: 24,
      symbol: 'V — voiced labiodental fricative', history: 'IPA 129.'
    },
    {
      id: 'char-w', glyph: 'Ꮹ', latin: 'W', type: 'CONSONANT', diff: 1, strokes: 2, ord: 25,
      symbol: 'W — key modifier for "kwa/gwa" compound variants',
      history: 'IPA 170. Adding W to base consonant = labial variant.'
    },
    {
      id: 'char-y', glyph: 'Ꮍ', latin: 'Y', type: 'CONSONANT', diff: 1, strokes: 2, ord: 26,
      symbol: 'Y — key modifier for "kya/gya" compound variants',
      history: 'IPA 153. Adding Y to base consonant = palatal variant.'
    },
    {
      id: 'char-z', glyph: 'Ɀ', latin: 'Z', type: 'CONSONANT', diff: 1, strokes: 2, ord: 27,
      symbol: 'Derived from M through Umura. Kirundi uses DZ instead.',
      history: 'IPA 133. Separate Dza character exists for Kirundi Z-sound.'
    },
    {
      id: 'char-sh', glyph: 'Ꮎ', latin: 'Sh', type: 'CONSONANT', diff: 2, strokes: 3, ord: 28,
      symbol: 'Sh — single sound, not S+H',
      history: 'Voiceless alveolar retracted sibilant. Key Umwero improvement: 1 sound = 1 character.'
    },
    {
      id: 'char-ny', glyph: 'Ꮌ', latin: 'Ny', type: 'CONSONANT', diff: 2, strokes: 3, ord: 29,
      symbol: 'Ny — palatal nasal, single consonant',
      history: 'IPA 118. Not N+Y. Begins Nyina (mother), Nyabarongo.'
    },
    {
      id: 'char-mf', glyph: 'Ꮛ', latin: 'MF', type: 'CONSONANT', diff: 3, strokes: 3, ord: 30,
      symbol: 'Imfura (noble/firstborn) — support from back (mugongo) + front (inda)',
      history: '"Iyo Imfura igufashe mu mugongo, ntisiga no mu nda." Upper half-circle=support, lower=provision. Words: imfura, imfubyi, imfuruka.'
    },
    {
      id: 'char-pf', glyph: 'Ꝋ', latin: 'PF', type: 'CONSONANT', diff: 3, strokes: 2, ord: 31,
      symbol: 'Circle of life broken — death (gupfa)',
      history: 'Circle(Uruziga)=life. Line through circle=death. gupfa=to die, yapfuye=s/he died. Voiceless labiodental affricate.'
    },
    {
      id: 'char-ts', glyph: 'Ꮆ', latin: 'Ts', type: 'CONSONANT', diff: 2, strokes: 2, ord: 32,
      symbol: 'Sibilant affricate — shares flowing design with S',
      history: 'IPA 103+132. Like S, produces continuous unbreakable airflow.'
    },
    {
      id: 'char-shy', glyph: 'Ꮏ', latin: 'Shy', type: 'COMPOUND', diff: 3, strokes: 3, ord: 33,
      symbol: 'ONE sound written as 3 Latin letters — proof Umwero is needed',
      history: 'IPA 138. Most Rwandans struggle to write "shy" in Latin. In Umwero = 1 character.'
    },
    {
      id: 'char-ky', glyph: 'Ⴓ', latin: 'Ky', type: 'COMPOUND', diff: 2, strokes: 3, ord: 34,
      symbol: 'Palatalized velar — K + Y modifier', history: 'IPA 107.'
    },
  ];

  // --- LIGATURES (ibihekane) — all compound forms from IPA doc pages 2-6 ---
  const ligatures = [
    // B-family
    { id: 'lig-nb', glyph: 'Ꮿꮾ', latin: 'Nb', type: 'LIGATURE', diff: 2, strokes: 3, ord: 40, history: 'Prenasalized B. IPA B~ 102.' },
    { id: 'lig-bw', glyph: 'ꮾꞗ', latin: 'BW', type: 'LIGATURE', diff: 2, strokes: 4, ord: 41, history: 'Bga — B+W.' },
    { id: 'lig-by', glyph: 'ꮾꝹ', latin: 'BY', type: 'LIGATURE', diff: 2, strokes: 4, ord: 42, history: 'Bgya — B+Y.' },
    { id: 'lig-byw', glyph: 'ꮾꝹꞗ', latin: 'BYW', type: 'LIGATURE', diff: 3, strokes: 5, ord: 43, history: 'Bygwa — B+Y+W.' },
    // C-family
    { id: 'lig-nc', glyph: 'ꮿꮇ', latin: 'NC', type: 'LIGATURE', diff: 2, strokes: 4, ord: 44, history: 'Nca — prenasalized CH.' },
    { id: 'lig-ncw', glyph: 'ꮿꮇꞗ', latin: 'NCW', type: 'LIGATURE', diff: 3, strokes: 5, ord: 45, history: 'Nckwa — N+CH+W.' },
    { id: 'lig-cw', glyph: 'ꮇꞗ', latin: 'CW', type: 'LIGATURE', diff: 2, strokes: 4, ord: 46, history: 'Ckwa — CH+W.' },
    // D-family
    { id: 'lig-dw', glyph: 'ꟼꞗ', latin: 'DW', type: 'LIGATURE', diff: 2, strokes: 3, ord: 47, history: 'Dgwa — D+W.' },
    { id: 'lig-ry', glyph: 'ꟼꝹ', latin: 'RY', type: 'LIGATURE', diff: 2, strokes: 3, ord: 48, history: 'Dgya — D+Y → mapped to RY.' },
    // F-family
    { id: 'lig-fw', glyph: 'Ꮙꞗ', latin: 'FW', type: 'LIGATURE', diff: 2, strokes: 3, ord: 49, history: 'Fka — F+W.' },
    { id: 'lig-fy', glyph: 'ᏉꝹ', latin: 'FY', type: 'LIGATURE', diff: 2, strokes: 3, ord: 50, history: 'Fkya — F+Y.' },
    // G/K families
    { id: 'lig-gw', glyph: 'Ɉꞗ', latin: 'Gw', type: 'LIGATURE', diff: 2, strokes: 4, ord: 51, history: 'Gwa — G+W.' },
    { id: 'lig-kw', glyph: 'Ⴒꞗ', latin: 'Kw', type: 'LIGATURE', diff: 2, strokes: 3, ord: 52, history: 'Kwa — K+W.' },
    { id: 'lig-nky', glyph: 'ꮿⴓ', latin: 'NKY', type: 'LIGATURE', diff: 3, strokes: 4, ord: 53, history: 'NKYA — N+Ky.' },
    // M-family
    { id: 'lig-mw', glyph: 'Ꮈꞗ', latin: 'MW', type: 'LIGATURE', diff: 2, strokes: 4, ord: 54, history: 'M-Nkha — M+W.' },
    { id: 'lig-my', glyph: 'ᎸꝹ', latin: 'MY', type: 'LIGATURE', diff: 2, strokes: 4, ord: 55, history: 'Mnya — M+Y.' },
    { id: 'lig-myw', glyph: 'ᎸꝹꞗ', latin: 'MYW', type: 'LIGATURE', diff: 3, strokes: 5, ord: 56, history: 'M+Ny+Nkh-Wa.' },
    // MF-family
    { id: 'lig-mfw', glyph: 'Ꮛꞗ', latin: 'MFW', type: 'LIGATURE', diff: 3, strokes: 4, ord: 57, history: 'Mfka — MF+W.' },
    { id: 'lig-mfy', glyph: 'ᏋꝹ', latin: 'MFY', type: 'LIGATURE', diff: 3, strokes: 4, ord: 58, history: 'Mfkya — MF+Y.' },
    // MV-family
    { id: 'lig-mv', glyph: 'ꮈꮠ', latin: 'MV', type: 'LIGATURE', diff: 2, strokes: 3, ord: 59, history: 'MVA.' },
    { id: 'lig-mvw', glyph: 'ꮈꮠꞗ', latin: 'MVW', type: 'LIGATURE', diff: 3, strokes: 4, ord: 60, history: 'Mvga/Mvgwa.' },
    { id: 'lig-mvy', glyph: 'ꮈꮠꝹ', latin: 'MVY', type: 'LIGATURE', diff: 3, strokes: 4, ord: 61, history: 'Mvgya.' },
    // N-compound family
    { id: 'lig-nd', glyph: 'ꮿꟼ', latin: 'Nd', type: 'LIGATURE', diff: 2, strokes: 3, ord: 62, history: 'Nda — prenasalized D.' },
    { id: 'lig-ndw', glyph: 'ꮿꟼꞗ', latin: 'NDW', type: 'LIGATURE', diff: 3, strokes: 4, ord: 63, history: 'Ndgwa.' },
    { id: 'lig-ndy', glyph: 'ꮿꟼꝹ', latin: 'NDY', type: 'LIGATURE', diff: 3, strokes: 4, ord: 64, history: 'Ndgya.' },
    { id: 'lig-nw', glyph: 'ꮿꞗ', latin: 'NW', type: 'LIGATURE', diff: 2, strokes: 3, ord: 65, history: 'N-Nkh-Wa.' },
    { id: 'lig-ng', glyph: 'ꮿɈ', latin: 'Ng', type: 'LIGATURE', diff: 2, strokes: 4, ord: 66, history: 'Nga.' },
    { id: 'lig-ngw', glyph: 'ꮿɈꞗ', latin: 'Ngw', type: 'LIGATURE', diff: 3, strokes: 5, ord: 67, history: 'Ngwa.' },
    { id: 'lig-nj', glyph: 'ꮿꝺ', latin: 'Nj', type: 'LIGATURE', diff: 2, strokes: 3, ord: 68, history: 'Nja.' },
    { id: 'lig-njw', glyph: 'ꮿꝺꞗ', latin: 'Njw', type: 'LIGATURE', diff: 3, strokes: 4, ord: 69, history: 'Njgwa.' },
    { id: 'lig-nz', glyph: 'ꮿɀ', latin: 'Nz', type: 'LIGATURE', diff: 2, strokes: 3, ord: 70, history: 'Nza.' },
    { id: 'lig-nzw', glyph: 'ꮿɀꞗ', latin: 'NZW', type: 'LIGATURE', diff: 3, strokes: 4, ord: 71, history: 'Nzgwa.' },
    { id: 'lig-nt', glyph: 'ꮿɫ', latin: 'NT', type: 'LIGATURE', diff: 2, strokes: 3, ord: 72, history: 'Nha (prenasalized T).' },
    { id: 'lig-ntw', glyph: 'ꮿɫꞗ', latin: 'NTW', type: 'LIGATURE', diff: 3, strokes: 4, ord: 73, history: 'Nhu-Nkwa.' },
    { id: 'lig-nny', glyph: 'ꮿꮿꝹ', latin: 'NNY', type: 'LIGATURE', diff: 3, strokes: 4, ord: 74, history: 'Nh-Nya / N-Nya.' },
    { id: 'lig-nk', glyph: 'ꮿⴒ', latin: 'NK', type: 'LIGATURE', diff: 2, strokes: 3, ord: 75, history: 'NKHA.' },
    { id: 'lig-nkw', glyph: 'ꮿⴒꞗ', latin: 'NKW', type: 'LIGATURE', diff: 3, strokes: 4, ord: 76, history: 'Nkh-Wa.' },
    { id: 'lig-ns', glyph: 'ꮿȤ', latin: 'Ns', type: 'LIGATURE', diff: 2, strokes: 3, ord: 77, history: 'Nsa.' },
    { id: 'lig-nsy', glyph: 'ꮿȤꝹ', latin: 'Nsy', type: 'LIGATURE', diff: 3, strokes: 4, ord: 78, history: 'Nskya.' },
    { id: 'lig-nsw', glyph: 'ꮿȤꞗ', latin: 'Nsw', type: 'LIGATURE', diff: 3, strokes: 4, ord: 79, history: 'Nskwa.' },
    { id: 'lig-nsh', glyph: 'ꮿꮎ', latin: 'NSH', type: 'LIGATURE', diff: 2, strokes: 4, ord: 80, history: 'Nsh.' },
    { id: 'lig-nshw', glyph: 'ꮿꮎꞗ', latin: 'NSHW', type: 'LIGATURE', diff: 3, strokes: 5, ord: 81, history: 'Nshkwa.' },
    { id: 'lig-shw', glyph: 'ꮎꞗ', latin: 'SHW', type: 'LIGATURE', diff: 3, strokes: 4, ord: 82, history: 'Shkwa.' },
    { id: 'lig-nshy', glyph: 'ꮿꮏ', latin: 'Nshy', type: 'LIGATURE', diff: 3, strokes: 4, ord: 83, history: 'Nshya.' },
    { id: 'lig-nshyw', glyph: 'ꮿꮏꞗ', latin: 'Nshyw', type: 'LIGATURE', diff: 3, strokes: 5, ord: 84, history: 'Nshykwa.' },
    { id: 'lig-shyw', glyph: 'ꮏꞗ', latin: 'Shyw', type: 'LIGATURE', diff: 3, strokes: 4, ord: 85, history: 'Shykwa.' },
    // P-family
    { id: 'lig-pw', glyph: 'Ꮥꞗ', latin: 'PW', type: 'LIGATURE', diff: 2, strokes: 3, ord: 86, history: 'Pka — P+W.' },
    { id: 'lig-py', glyph: 'ᏕꝹ', latin: 'PY', type: 'LIGATURE', diff: 2, strokes: 3, ord: 87, history: 'Pkya — P+Y.' },
    { id: 'lig-mp', glyph: 'ꮈꮥ', latin: 'Mp', type: 'LIGATURE', diff: 2, strokes: 4, ord: 88, history: 'Mpa — Kinyamulenge & other Bantu.' },
    { id: 'lig-mpk', glyph: 'ꮈꮥꞗ', latin: 'Mpk', type: 'LIGATURE', diff: 3, strokes: 5, ord: 89, history: 'Mpka — for other Ntu.' },
    { id: 'lig-mpy', glyph: 'ꮈꮥꝹ', latin: 'Mpy', type: 'LIGATURE', diff: 3, strokes: 5, ord: 90, history: 'Mpkya.' },
    // PF-family
    { id: 'lig-pfw', glyph: 'Ꝋꞗ', latin: 'PFW', type: 'LIGATURE', diff: 3, strokes: 3, ord: 91, history: 'Pfka.' },
    { id: 'lig-pfy', glyph: 'ꝊꝹ', latin: 'PFY', type: 'LIGATURE', diff: 3, strokes: 3, ord: 92, history: 'Pfkya.' },
    // R-family
    { id: 'lig-rw', glyph: 'Ɍꞗ', latin: 'Rw', type: 'LIGATURE', diff: 2, strokes: 4, ord: 93, history: 'Rgwa.' },
    // S/T families
    { id: 'lig-sy', glyph: 'ȤꝹ', latin: 'Sy', type: 'LIGATURE', diff: 2, strokes: 3, ord: 94, history: 'Skya.' },
    { id: 'lig-sw', glyph: 'Ȥꞗ', latin: 'Sw', type: 'LIGATURE', diff: 2, strokes: 3, ord: 95, history: 'Skwa.' },
    { id: 'lig-ty', glyph: 'ⱢꝹ', latin: 'Ty', type: 'LIGATURE', diff: 2, strokes: 3, ord: 96, history: 'Tkya.' },
    { id: 'lig-tw', glyph: 'Ɫꞗ', latin: 'Tw', type: 'LIGATURE', diff: 2, strokes: 3, ord: 97, history: 'Tkwa. The TW ligature: actually T+K+W, not T+W.' },
    { id: 'lig-tsw', glyph: 'Ꮆꞗ', latin: 'Tsw', type: 'LIGATURE', diff: 3, strokes: 3, ord: 98, history: 'Tskwa.' },
    // V/Z/J/Y/Ny families
    { id: 'lig-vw', glyph: 'Ꮠꞗ', latin: 'Vw', type: 'LIGATURE', diff: 2, strokes: 3, ord: 99, history: 'Vga.' },
    { id: 'lig-vy', glyph: 'ᏐꝹ', latin: 'Vy', type: 'LIGATURE', diff: 2, strokes: 3, ord: 100, history: 'Vgya.' },
    { id: 'lig-zw', glyph: 'Ɀꞗ', latin: 'Zw', type: 'LIGATURE', diff: 2, strokes: 3, ord: 101, history: 'Zgwa.' },
    { id: 'lig-jw', glyph: 'ꝺꞗ', latin: 'JW', type: 'LIGATURE', diff: 2, strokes: 3, ord: 102, history: 'Jgwa.' },
    { id: 'lig-jy', glyph: 'ꝺꝹ', latin: 'JY', type: 'LIGATURE', diff: 2, strokes: 3, ord: 103, history: 'Gya. IPA 108.' },
    { id: 'lig-njy', glyph: 'ꮿꝺꝹ', latin: 'NJY', type: 'LIGATURE', diff: 3, strokes: 4, ord: 104, history: 'Ngya.' },
    { id: 'lig-nyw', glyph: 'Ꮌꞗ', latin: 'Nyw', type: 'LIGATURE', diff: 3, strokes: 4, ord: 105, history: 'Ny-Nkh-Wa.' },
    // Mba family (special prenasalized from IPA page 1)
    { id: 'lig-mba', glyph: 'ꮈꮾ', latin: 'Mba', type: 'LIGATURE', diff: 2, strokes: 4, ord: 106, history: 'IPA: A 304.' },
    { id: 'lig-mbw', glyph: 'ꮈꮾꞗ', latin: 'MBW', type: 'LIGATURE', diff: 3, strokes: 5, ord: 107, history: 'Mbga.' },
    { id: 'lig-mby', glyph: 'ꮈꮾꝹ', latin: 'MBY', type: 'LIGATURE', diff: 3, strokes: 5, ord: 108, history: 'Mbgya.' },
    { id: 'lig-mbyw', glyph: 'ꮈꮾꝹꞗ', latin: 'MBYW', type: 'LIGATURE', diff: 3, strokes: 6, ord: 109, history: 'Aygw (!).' },
    // Cross-language variants
    { id: 'lig-dza', glyph: 'ꟼɀ', latin: 'Dza', type: 'LIGATURE', diff: 2, strokes: 3, ord: 110, history: 'Z for Kirundi — DZ pronunciation.' },
    { id: 'lig-dja', glyph: 'ꟼꝺ', latin: 'DJA', type: 'LIGATURE', diff: 2, strokes: 3, ord: 111, history: 'J for Kiswahili pronunciation.' },
  ];

  // --- SPECIAL CHARACTERS from IPA page 1 ---
  const specials = [
    { id: 'sp-period', glyph: '⊕', latin: '.', type: 'SPECIAL', diff: 1, strokes: 1, ord: 200, history: 'Period.' },
    { id: 'sp-comma', glyph: '◎', latin: ',', type: 'SPECIAL', diff: 1, strokes: 1, ord: 201, history: 'Comma/semicolon.' },
    { id: 'sp-question', glyph: 'Ꮻ̃', latin: '?', type: 'SPECIAL', diff: 1, strokes: 2, ord: 202, history: 'Question mark.' },
    { id: 'sp-equals', glyph: 'Ꮻ̊', latin: '=', type: 'SPECIAL', diff: 1, strokes: 2, ord: 203, history: 'Equals = represents "Umwero" name. Harvest fruit symbol.' },
    { id: 'sp-paren', glyph: '├', latin: '(', type: 'SPECIAL', diff: 1, strokes: 1, ord: 204, history: 'Opening bracket.' },
    { id: 'sp-plus', glyph: 'Ꮻ', latin: '+', type: 'SPECIAL', diff: 1, strokes: 2, ord: 205, history: 'Plus/conjunction.' },
    { id: 'sp-dash', glyph: 'Ꮻ̄', latin: '-', type: 'SPECIAL', diff: 1, strokes: 1, ord: 206, history: 'Dash/hyphen.' },
  ];

  const allChars = [...vowels, ...consonants, ...ligatures, ...specials];

  for (const c of allChars) {
    const char = await prisma.character.upsert({
      where: { id: c.id },
      update: {
        umweroGlyph: c.glyph,
        latinEquivalent: c.latin,
        type: c.type as any,
        difficulty: c.diff,
        strokeCount: c.strokes,
        order: c.ord,
        symbolism: (c as any).symbol || null,
        historicalNote: c.history || null,
        isActive: true,
      },
      create: {
        id: c.id,
        umweroGlyph: c.glyph,
        latinEquivalent: c.latin,
        type: c.type as any,
        difficulty: c.diff,
        strokeCount: c.strokes,
        order: c.ord,
        symbolism: (c as any).symbol || null,
        historicalNote: c.history || null,
        isActive: true,
      },
    });

    // Add translations for vowels (they have enName etc.)
    if ((c as any).enName && enLang && rwLang) {
      // Upsert English translation
      await prisma.characterTranslation.upsert({
        where: {
          characterId_languageId: { characterId: char.id, languageId: enLang.id }
        },
        update: {
          name: (c as any).enName,
          pronunciation: (c as any).enPron,
          meaning: (c as any).enMean,
          description: (c as any).enDesc,
        },
        create: {
          characterId: char.id,
          languageId: enLang.id,
          name: (c as any).enName,
          pronunciation: (c as any).enPron,
          meaning: (c as any).enMean,
          description: (c as any).enDesc,
        },
      });

      // Upsert Kinyarwanda translation
      await prisma.characterTranslation.upsert({
        where: {
          characterId_languageId: { characterId: char.id, languageId: rwLang.id }
        },
        update: {
          name: (c as any).rwName,
          pronunciation: (c as any).rwPron,
          meaning: (c as any).rwMean,
          description: (c as any).rwDesc,
        },
        create: {
          characterId: char.id,
          languageId: rwLang.id,
          name: (c as any).rwName,
          pronunciation: (c as any).rwPron,
          meaning: (c as any).rwMean,
          description: (c as any).rwDesc,
        },
      });
    }
  }

  console.log(`✅ ${allChars.length} characters (${vowels.length} vowels, ${consonants.length} consonants, ${ligatures.length} ligatures, ${specials.length} special)\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // LESSONS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('📚 Lessons...');
  const allLessons = [
    // 5 vowel lessons
    ...['A', 'U', 'O', 'E', 'I'].map((v, i) => ({
      id: `lesson-vowel-${v.toLowerCase()}`,
      title: `Vowel ${v}: ${['Inyambo Cow Head', 'Binding Rope', 'Circle of Life', 'True Kinyarwanda Sound', 'Long Vowel'][i]}`,
      description: `Learn the Umwero vowel ${v}`,
      module: 'BEGINNER', type: 'VOWEL', order: i + 1, duration: 8, difficulty: 1,
      estimatedTime: 8, characterId: `char-${v.toLowerCase()}`, code: `VOWEL-${v}`,
      content: JSON.stringify({ vowel: v.toLowerCase(), glyph: vowels[i].glyph, latin: v }),
      isPublished: true,
    })),
    // Consonant lessons
    {
      id: 'lesson-cons-b', title: 'Consonant B: Inyambo Body', description: 'B + A = complete Inyambo cow',
      module: 'BEGINNER', type: 'CONSONANT', order: 6, duration: 10, difficulty: 1, estimatedTime: 10,
      characterId: 'char-b', code: 'CONS-B', content: JSON.stringify({ consonant: 'b', glyph: 'ꮾ', ipa: 'bilabial approx' }), isPublished: true
    },
    {
      id: 'lesson-cons-m', title: 'Consonant M: Womb (Nyababyeyi)', description: 'Baby in womb + umbilical cord. Mother of derived letters.',
      module: 'BEGINNER', type: 'CONSONANT', order: 7, duration: 12, difficulty: 1, estimatedTime: 12,
      characterId: 'char-m', code: 'CONS-M', content: JSON.stringify({ consonant: 'm', glyph: 'Ꮈ', ipa: '114', derived: ['L', 'LL', 'G', 'Z'] }), isPublished: true
    },
    {
      id: 'lesson-cons-r', title: 'Consonant R: God-RA (Praising)', description: 'Person kneeling toward Rurema the Creator.',
      module: 'BEGINNER', type: 'CONSONANT', order: 8, duration: 10, difficulty: 2, estimatedTime: 10,
      characterId: 'char-r', code: 'CONS-R', content: JSON.stringify({ consonant: 'r', glyph: 'Ɍ', ipa: '124' }), isPublished: true
    },
    {
      id: 'lesson-cons-n', title: 'Consonant N: Nasal Foundation', description: 'Building block for Bantu prenasalized sounds.',
      module: 'BEGINNER', type: 'CONSONANT', order: 9, duration: 10, difficulty: 1, estimatedTime: 10,
      characterId: 'char-n', code: 'CONS-N', content: JSON.stringify({ consonant: 'n', glyph: 'Ꮿ', ipa: '116' }), isPublished: true
    },
    {
      id: 'lesson-cons-tk', title: 'Consonants T & K: Featural Pair', description: 'Shapes mirror tongue position — like Korean Hangul.',
      module: 'BEGINNER', type: 'CONSONANT', order: 10, duration: 15, difficulty: 1, estimatedTime: 15,
      code: 'CONS-TK', content: JSON.stringify({ t: { glyph: 'Ɫ', ipa: '103' }, k: { glyph: 'Ⴒ', ipa: '109' } }), isPublished: true
    },
    {
      id: 'lesson-cons-ch', title: 'Consonant CH: Serpent\'s Wisdom', description: 'Serpent + pathway = wisdom & movement.',
      module: 'BEGINNER', type: 'CONSONANT', order: 11, duration: 10, difficulty: 2, estimatedTime: 10,
      characterId: 'char-ch', code: 'CONS-CH', content: JSON.stringify({ consonant: 'ch', glyph: 'Ꮇ', ipa: '103+134' }), isPublished: true
    },
    {
      id: 'lesson-cons-d', title: 'Consonant D: Father Symbol', description: 'Male symbol — Data, Daye, Dawe.',
      module: 'BEGINNER', type: 'CONSONANT', order: 12, duration: 8, difficulty: 1, estimatedTime: 8,
      characterId: 'char-d', code: 'CONS-D', content: JSON.stringify({ consonant: 'd', glyph: 'ꟼ', ipa: '104' }), isPublished: true
    },
    {
      id: 'lesson-cons-j', title: 'Consonant J: Bowing Figure', description: 'Umuja — servitude AND respect.',
      module: 'BEGINNER', type: 'CONSONANT', order: 13, duration: 8, difficulty: 2, estimatedTime: 8,
      characterId: 'char-j', code: 'CONS-J', content: JSON.stringify({ consonant: 'j', glyph: 'ꝺ', ipa: '135+137' }), isPublished: true
    },
    {
      id: 'lesson-cons-sts', title: 'Consonants S & TS: Flowing Sibilants', description: 'Continuous airflow sounds.',
      module: 'BEGINNER', type: 'CONSONANT', order: 14, duration: 12, difficulty: 1, estimatedTime: 12,
      code: 'CONS-S-TS', content: JSON.stringify({ s: { glyph: 'Ȥ', ipa: '132' }, ts: { glyph: 'Ꮆ', ipa: '103+132' } }), isPublished: true
    },
    {
      id: 'lesson-cons-sh', title: 'Consonants Sh & Shy: One Sound, One Character', description: 'Proof Umwero is needed — shy is 1 sound, not 3 letters.',
      module: 'BEGINNER', type: 'CONSONANT', order: 15, duration: 12, difficulty: 2, estimatedTime: 12,
      code: 'CONS-SH-SHY', content: JSON.stringify({ sh: { glyph: 'Ꮎ' }, shy: { glyph: 'Ꮏ', ipa: '138' } }), isPublished: true
    },
    {
      id: 'lesson-cons-mfpf', title: 'Consonants MF & PF: Life & Death', description: 'MF=Imfura(noble) and PF=gupfa(death).',
      module: 'INTERMEDIATE', type: 'CONSONANT', order: 16, duration: 15, difficulty: 3, estimatedTime: 15,
      code: 'CONS-MF-PF', content: JSON.stringify({ mf: { glyph: 'Ꮛ' }, pf: { glyph: 'Ꝋ' } }), isPublished: true
    },
    {
      id: 'lesson-cons-rest', title: 'Remaining Consonants: F, G, H, P, V, W, Y, Z, Ny', description: 'Complete your consonant knowledge.',
      module: 'BEGINNER', type: 'CONSONANT', order: 17, duration: 20, difficulty: 1, estimatedTime: 20,
      code: 'CONS-REST', content: JSON.stringify({ chars: ['F', 'G', 'H', 'P', 'V', 'W', 'Y', 'Z', 'Ny'] }), isPublished: true
    },
    // Ligature lessons
    {
      id: 'lesson-lig-intro', title: 'Ibihekane: The Compound System', description: 'Learn how W and Y modifiers create compound characters.',
      module: 'INTERMEDIATE', type: 'CONSONANT', order: 18, duration: 15, difficulty: 2, estimatedTime: 15,
      code: 'LIG-INTRO', content: JSON.stringify({ system: 'base+W=labial, base+Y=palatal, N+base=prenasalized' }), isPublished: true
    },
    {
      id: 'lesson-lig-prenasalized', title: 'Prenasalized Consonants', description: 'Nd, Ng, Nj, Nz, NK, Ns, Nsh, NT — the N+ family.',
      module: 'INTERMEDIATE', type: 'CONSONANT', order: 19, duration: 20, difficulty: 2, estimatedTime: 20,
      code: 'LIG-PRENASAL', content: JSON.stringify({ type: 'prenasalized', chars: ['Nd', 'Ng', 'Nj', 'Nz', 'NK', 'Ns', 'NSH', 'NT'] }), isPublished: true
    },
    // Culture lessons
    {
      id: 'lesson-culture-history', title: 'History of Writing Systems', description: 'From Cuneiform to Umwero — why new scripts are born.',
      module: 'BEGINNER', type: 'CULTURE', order: 20, duration: 15, difficulty: 1, estimatedTime: 15,
      code: 'CULTURE-HIST', content: JSON.stringify({ topics: ['Cuneiform', 'Hieroglyphs', 'Alphabet origin', 'Colonial impact', 'Bamum', 'N\'Ko', 'Adlam', 'Umwero'] }), isPublished: true
    },
    {
      id: 'lesson-culture-numbers', title: 'Umwero Numbers: No Zero', description: 'Numbers from 1-9, no zero. Based on Rwandan counting culture.',
      module: 'INTERMEDIATE', type: 'CULTURE', order: 21, duration: 15, difficulty: 2, estimatedTime: 15,
      code: 'CULTURE-NUM', content: JSON.stringify({ philosophy: 'No zero. Ubusa cannot be counted.', numbers: 9 }), isPublished: true
    },
    {
      id: 'lesson-culture-system', title: 'The Umwero Writing System', description: 'RTL direction, 8-unit measurement, joint at position 3.',
      module: 'BEGINNER', type: 'CULTURE', order: 22, duration: 10, difficulty: 1, estimatedTime: 10,
      code: 'CULTURE-SYS', content: JSON.stringify({ direction: 'RTL', measurement: 8, joint: 3, pctKinyarwanda: 80 }), isPublished: true
    },
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
    { code: 'first-steps', name: 'Intambwe ya Mbere', description: 'Complete your first lesson', icon: '🎯', category: 'LESSON_COMPLETION', requirement: JSON.stringify({ lessonsCompleted: 1 }), points: 10 },
    { code: 'vowel-master', name: 'Umuhanga w\'Inyajwi', description: 'Complete all 5 vowel lessons', icon: '🏆', category: 'LESSON_COMPLETION', requirement: JSON.stringify({ vowelsCompleted: 5 }), points: 50 },
    { code: 'consonant-explorer', name: 'Umushakashatsi w\'Ingombajwi', description: 'Complete 5 consonant lessons', icon: '📚', category: 'LESSON_COMPLETION', requirement: JSON.stringify({ consonantsCompleted: 5 }), points: 40 },
    { code: 'cultural-seeker', name: 'Umushakisha w\'Umuco', description: 'Complete all cultural lessons', icon: '🌍', category: 'CULTURAL_KNOWLEDGE', requirement: JSON.stringify({ cultureLessonsCompleted: 3 }), points: 60 },
    { code: 'dedicated-learner', name: 'Umunyeshuri w\'Indahemuka', description: 'Practice for 1 hour total', icon: '⏰', category: 'PRACTICE_MASTERY', requirement: JSON.stringify({ totalMinutes: 60 }), points: 30 },
    { code: 'perfect-score', name: 'Amanota Yuzuye', description: 'Get 100% on any lesson', icon: '⭐', category: 'PRACTICE_MASTERY', requirement: JSON.stringify({ perfectScore: true }), points: 40 },
    { code: 'week-streak', name: 'Iminsi 7', description: 'Learn 7 days in a row', icon: '🔥', category: 'STREAK', requirement: JSON.stringify({ streakDays: 7 }), points: 70 },
    { code: 'month-streak', name: 'Ukwezi Kuzuye', description: 'Learn 30 days in a row', icon: '💎', category: 'STREAK', requirement: JSON.stringify({ streakDays: 30 }), points: 200 },
    { code: 'artist', name: 'Umuhanga mu Gushushanya', description: 'Practice canvas writing 10 times', icon: '🎨', category: 'PRACTICE_MASTERY', requirement: JSON.stringify({ drawingsCount: 10 }), points: 25 },
    { code: 'inyambo-scholar', name: 'Umuhanga w\'Inyambo', description: 'Master all cultural characters', icon: '🐄', category: 'CULTURAL_KNOWLEDGE', requirement: JSON.stringify({ culturalMastered: true }), points: 100 },
    { code: 'compound-master', name: 'Umuhanga w\'Ibihekane', description: 'Learn all ligature characters', icon: '🧩', category: 'LESSON_COMPLETION', requirement: JSON.stringify({ ligaturesLearned: true }), points: 150 },
    { code: 'number-sage', name: 'Umuhanga w\'Imibare', description: 'Master the Umwero number system', icon: '🔢', category: 'CULTURAL_KNOWLEDGE', requirement: JSON.stringify({ numbersMastered: true }), points: 80 },
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
    { email: 'teacher@uruziga.com', username: 'teacher', password: 'teach123', fullName: 'Umwero Teacher', role: 'TEACHER', country: 'Rwanda', countryCode: 'RW', preferredLanguage: 'en', bio: 'Teacher account.', emailVerified: true, provider: 'EMAIL' },
  ];
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    // Explicitly casting data to match Prisma inputs if necessary
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
    const icon = u.role === 'ADMIN' ? '👑' : u.role === 'TEACHER' ? '👨🏫' : '👤';
    console.log(`  ${icon} ${u.fullName} (${u.role}) — ${u.email} / ${u.password}`);
  }
  console.log(`✅ ${users.length} users\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 SEED COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🌐 Languages:    ${langs.length}`);
  console.log(`  ✏️  Characters:   ${allChars.length} (${vowels.length}V + ${consonants.length}C + ${ligatures.length}L + ${specials.length}S)`);
  console.log(`  📚 Lessons:      ${allLessons.length}`);
  console.log(`  🏆 Achievements: ${achievements.length}`);
  console.log(`  👥 Users:        ${users.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📖 i18n MAPPING: character.latinEquivalent → t(`characters.${latinEquivalent}.name`)');
  console.log('🔤 FONT RENDER:  character.umweroGlyph → displayed using Umwero font');
  console.log('➡️  DIRECTION:    Umwero script is written RIGHT TO LEFT (RTL)');
  console.log('📏 GRID:         8-unit measurement (umunani), joint at position 3\n');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error('❌ Error:', e); await prisma.$disconnect(); process.exit(1); });
