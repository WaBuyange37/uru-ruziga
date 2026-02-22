// 🔒 STATIC LESSON DATA - INSTANT LOADING 🔒
// This file provides instant lesson data without Supabase calls
// Based on the protected UMWERO_MAP character mappings
// Last verified: February 2026

export interface StaticLessonData {
  id: string
  title: string
  description: string
  type: 'VOWEL' | 'CONSONANT' | 'LIGATURE'
  character: string
  umwero: string
  order: number
  duration: number
  difficulty: number
  pronunciation: string
  meaning: string
  culturalNote: string
  examples: string[]
  imageUrl: string
  audioUrl: string
}

// 🔒 VOWEL LESSONS - Based on UMWERO_MAP
export const STATIC_VOWEL_LESSONS: StaticLessonData[] = [
  {
    id: 'vowel-a',
    title: 'Vowel A - The Foundation',
    description: 'Learn the first vowel of Umwero alphabet',
    type: 'VOWEL',
    character: 'A',
    umwero: '"',
    order: 1,
    duration: 15,
    difficulty: 1,
    pronunciation: 'ah',
    meaning: 'Beginning, foundation',
    culturalNote: 'The vowel A represents the beginning of all knowledge in Rwandan culture.',
    examples: ['Aba (father)', 'Ama (water)', 'Aka (small)'],
    imageUrl: '/UmweroLetaByLeta/a/A-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/Vowel/a.mp3'
  },
  {
    id: 'vowel-e',
    title: 'Vowel E - The Bridge',
    description: 'Master the second vowel character',
    type: 'VOWEL',
    character: 'E',
    umwero: '|',
    order: 2,
    duration: 15,
    difficulty: 1,
    pronunciation: 'eh',
    meaning: 'Connection, bridge',
    culturalNote: 'E connects ideas and concepts, representing unity in diversity.',
    examples: ['Ese (father)', 'Ejo (yesterday)', 'Eka (home)'],
    imageUrl: '/UmweroLetaByLeta/e/E-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/Vowel/E.mp3'
  },
  {
    id: 'vowel-i',
    title: 'Vowel I - The Light',
    description: 'Discover the third vowel and its significance',
    type: 'VOWEL',
    character: 'I',
    umwero: '}',
    order: 3,
    duration: 15,
    difficulty: 1,
    pronunciation: 'ee',
    meaning: 'Light, illumination',
    culturalNote: 'I represents enlightenment and the pursuit of knowledge.',
    examples: ['Iki (what)', 'Ino (this)', 'Iza (come)'],
    imageUrl: '/UmweroLetaByLeta/i/I-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/Vowel/I.mp3'
  },
  {
    id: 'vowel-o',
    title: 'Vowel O - The Circle',
    description: 'Learn the fourth vowel representing completeness',
    type: 'VOWEL',
    character: 'O',
    umwero: '{',
    order: 4,
    duration: 15,
    difficulty: 1,
    pronunciation: 'oh',
    meaning: 'Completeness, wholeness',
    culturalNote: 'O symbolizes the cycle of life and the completeness of creation.',
    examples: ['Oya (that)', 'Oko (there)', 'Ose (all)'],
    imageUrl: '/UmweroLetaByLeta/o/O-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/Vowel/O.mp3'
  },
  {
    id: 'vowel-u',
    title: 'Vowel U - The Unity',
    description: 'Master the final vowel representing unity',
    type: 'VOWEL',
    character: 'U',
    umwero: ':',
    order: 5,
    duration: 15,
    difficulty: 1,
    pronunciation: 'oo',
    meaning: 'Unity, togetherness',
    culturalNote: 'U represents the unity of all people and the strength found in community.',
    examples: ['Ubu (now)', 'Uko (there)', 'Uyu (this)'],
    imageUrl: '/UmweroLetaByLeta/u/U-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/Vowel/U.mp3'
  }
]

// 🔒 CONSONANT LESSONS - Based on UMWERO_MAP (First 10 for instant loading)
export const STATIC_CONSONANT_LESSONS: StaticLessonData[] = [
  {
    id: 'consonant-b',
    title: 'Consonant B - Ba',
    description: 'Learn the consonant B and its pronunciation',
    type: 'CONSONANT',
    character: 'B',
    umwero: 'B',
    order: 1,
    duration: 20,
    difficulty: 2,
    pronunciation: 'ba',
    meaning: 'Being, existence',
    culturalNote: 'B represents the beginning of being and existence in Rwandan philosophy.',
    examples: ['Baba (father)', 'Bana (children)', 'Bose (all)'],
    imageUrl: '/UmweroLetaByLeta/b/B-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/B.mp3'
  },
  {
    id: 'consonant-c',
    title: 'Consonant C - Ca',
    description: 'Master the consonant C',
    type: 'CONSONANT',
    character: 'C',
    umwero: 'C',
    order: 2,
    duration: 20,
    difficulty: 2,
    pronunciation: 'ca',
    meaning: 'Cutting, precision',
    culturalNote: 'C represents precision and the ability to make clear distinctions.',
    examples: ['Cane (four)', 'Cumi (ten)', 'Cyane (very)'],
    imageUrl: '/UmweroLetaByLeta/c/C-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/C.mp3'
  },
  {
    id: 'consonant-d',
    title: 'Consonant D - Da',
    description: 'Discover the consonant D',
    type: 'CONSONANT',
    character: 'D',
    umwero: 'D',
    order: 3,
    duration: 20,
    difficulty: 2,
    pronunciation: 'da',
    meaning: 'Giving, generosity',
    culturalNote: 'D embodies the spirit of giving and generosity central to Rwandan values.',
    examples: ['Dada (sister)', 'Dore (where)', 'Duca (return)'],
    imageUrl: '/UmweroLetaByLeta/d/D-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/D.mp3'
  },
  {
    id: 'consonant-f',
    title: 'Consonant F - Fa',
    description: 'Learn the consonant F',
    type: 'CONSONANT',
    character: 'F',
    umwero: 'F',
    order: 4,
    duration: 20,
    difficulty: 2,
    pronunciation: 'fa',
    meaning: 'Fire, energy',
    culturalNote: 'F represents the transformative power of fire and energy.',
    examples: ['Fata (take)', 'Fite (fight)', 'Funga (close)'],
    imageUrl: '/UmweroLetaByLeta/f/F-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/F.mp3'
  },
  {
    id: 'consonant-g',
    title: 'Consonant G - Ga',
    description: 'Master the consonant G',
    type: 'CONSONANT',
    character: 'G',
    umwero: 'G',
    order: 5,
    duration: 20,
    difficulty: 2,
    pronunciation: 'ga',
    meaning: 'Growth, expansion',
    culturalNote: 'G symbolizes growth and the expansion of knowledge and wisdom.',
    examples: ['Gana (find)', 'Gira (have)', 'Guca (buy)'],
    imageUrl: '/UmweroLetaByLeta/g/G-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/G.mp3'
  }
]

// 🔒 LIGATURE LESSONS - Based on UMWERO_MAP (First 10 for instant loading)
export const STATIC_LIGATURE_LESSONS: StaticLessonData[] = [
  {
    id: 'ligature-rw',
    title: 'Ligature RW - Rwanda',
    description: 'Learn the iconic RW ligature representing Rwanda',
    type: 'LIGATURE',
    character: 'RW',
    umwero: 'RGW',
    order: 1,
    duration: 25,
    difficulty: 3,
    pronunciation: 'rwa',
    meaning: 'Rwanda, our homeland',
    culturalNote: 'RW is the most important ligature, representing Rwanda itself and our national identity.',
    examples: ['Rwanda (our country)', 'Rwego (level)', 'Rwose (all of us)'],
    imageUrl: '/UmweroLetaByLeta/rw/RW-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/RW.mp3'
  },
  {
    id: 'ligature-mb',
    title: 'Ligature MB - Mba',
    description: 'Master the MB compound character',
    type: 'LIGATURE',
    character: 'MB',
    umwero: 'A',
    order: 2,
    duration: 25,
    difficulty: 3,
    pronunciation: 'mba',
    meaning: 'Strength, power',
    culturalNote: 'MB represents strength and the power that comes from unity.',
    examples: ['Mbega (dog)', 'Mbere (first)', 'Mbona (why)'],
    imageUrl: '/UmweroLetaByLeta/mb/MB-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/MB.mp3'
  },
  {
    id: 'ligature-sh',
    title: 'Ligature SH - Sha',
    description: 'Learn the SH compound character',
    type: 'LIGATURE',
    character: 'SH',
    umwero: 'HH',
    order: 3,
    duration: 25,
    difficulty: 3,
    pronunciation: 'sha',
    meaning: 'Sharing, community',
    culturalNote: 'SH embodies the spirit of sharing and community cooperation.',
    examples: ['Shaka (maybe)', 'Shema (listen)', 'Shyira (put)'],
    imageUrl: '/UmweroLetaByLeta/sh/SH-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/SH.mp3'
  },
  {
    id: 'ligature-jy',
    title: 'Ligature JY - Jya',
    description: 'Discover the JY compound character',
    type: 'LIGATURE',
    character: 'JY',
    umwero: 'L',
    order: 4,
    duration: 25,
    difficulty: 3,
    pronunciation: 'jya',
    meaning: 'Going, movement',
    culturalNote: 'JY represents movement and the journey of life and learning.',
    examples: ['Jya (go)', 'Jyewe (we)', 'Jyenda (walking)'],
    imageUrl: '/UmweroLetaByLeta/jy/JY-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/JY.mp3'
  },
  {
    id: 'ligature-nk',
    title: 'Ligature NK - Nka',
    description: 'Master the NK compound character',
    type: 'LIGATURE',
    character: 'NK',
    umwero: 'E',
    order: 5,
    duration: 25,
    difficulty: 3,
    pronunciation: 'nka',
    meaning: 'Like, similarity',
    culturalNote: 'NK represents similarity and the connections between all things.',
    examples: ['Nka (like)', 'Nkana (small)', 'Nkuru (big)'],
    imageUrl: '/UmweroLetaByLeta/nk/NK-ways.png',
    audioUrl: '/UmweroLetaByLeta/Voice/consonants/NK.mp3'
  }
]

// 🔒 HELPER FUNCTIONS
export function getAllStaticLessons(): StaticLessonData[] {
  return [
    ...STATIC_VOWEL_LESSONS,
    ...STATIC_CONSONANT_LESSONS,
    ...STATIC_LIGATURE_LESSONS
  ]
}

export function getStaticLessonsByType(type: 'VOWEL' | 'CONSONANT' | 'LIGATURE'): StaticLessonData[] {
  switch (type) {
    case 'VOWEL':
      return STATIC_VOWEL_LESSONS
    case 'CONSONANT':
      return STATIC_CONSONANT_LESSONS
    case 'LIGATURE':
      return STATIC_LIGATURE_LESSONS
    default:
      return []
  }
}

export function getStaticLessonById(id: string): StaticLessonData | null {
  const allLessons = getAllStaticLessons()
  return allLessons.find(lesson => lesson.id === id) || null
}

// 🔒 STATIC PROGRESS CALCULATION
export function calculateStaticProgress(): number {
  // DEPRECATED: This function should not be used in production
  // Use useProgressSummary hook instead for real progress data
  console.warn('getStaticLessonProgress is deprecated. Use useProgressSummary hook instead.')
  return 0
}

export function markLessonCompleted(lessonId: string): void {
  // DEPRECATED: This function should not be used in production
  // Progress is now managed through the database via /api/progress/submit
  console.warn('markLessonCompleted is deprecated. Use /api/progress/submit instead.')
}

export function isLessonCompleted(lessonId: string): boolean {
  // DEPRECATED: This function should not be used in production
  // Use useProgressSummary hook to check completion status
  console.warn('isLessonCompleted is deprecated. Use useProgressSummary hook instead.')
  return false
}