// /lib/lessons/lesson-data.ts
// Complete Umwero Lesson Content Database
// Based on actual Umwero alphabet structure

export interface UmweroCharacter {
  umwero: string
  latin: string
  pronunciation: string
  meaning?: string
  culturalNote?: string
  strokeOrder: string[]
  exampleWords: { umwero: string; latin: string; meaning: string }[]
}

export interface LessonContent {
  id: string
  title: string
  module: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  order: number
  duration: number // minutes
  objectives: string[]
  prerequisites: string[]
  theory: {
    introduction: string
    keyPoints: string[]
    culturalContext?: string
  }
  characters: UmweroCharacter[]
  examples: {
    title: string
    content: { umwero: string; latin: string; meaning: string }[]
  }[]
  exercises: {
    id: string
    type: 'TRACING' | 'RECOGNITION' | 'WRITING' | 'TRANSCRIPTION'
    instruction: string
    content: any
  }[]
  quiz: {
    questions: {
      question: string
      type: 'MULTIPLE_CHOICE' | 'CHARACTER_RECOGNITION'
      options?: string[]
      correct: string | number
      explanation: string
    }[]
  }
}

// ============================================================================
// LESSON 1: VOWELS (INYAJWI)
// ============================================================================

export const LESSON_01_VOWELS: LessonContent = {
  id: 'umw-lesson-001',
  title: 'Inyajwi - The Five Sacred Vowels',
  module: 'BEGINNER',
  order: 1,
  duration: 20,
  objectives: [
    'Recognize all five Umwero vowel characters',
    'Understand the pronunciation of each vowel',
    'Write basic vowel characters',
    'Learn the cultural significance of vowels in Kinyarwanda',
  ],
  prerequisites: [],
  theory: {
    introduction: `In the Umwero alphabet, vowels (Inyajwi) are the foundation of all words. 
    Just as in Kinyarwanda, there are five primary vowels: A, E, I, O, U. 
    Each vowel in Umwero is represented by a unique character that reflects its sound and cultural meaning.`,
    
    keyPoints: [
      'Umwero has exactly 5 vowels, matching Kinyarwanda phonetics',
      'Vowels can stand alone or combine with consonants',
      'Each vowel character has a specific stroke order',
      'Vowels are always pronounced clearly and distinctly',
    ],
    
    culturalContext: `In Rwandan tradition, the five vowels represent the five elements of life: 
    earth (a), water (i), fire (u), air (e), and spirit (o). Learning these vowels connects you 
    to the philosophical foundations of Kinyarwanda wisdom.`,
  },
  
  characters: [
    {
      umwero: '"',  // Actual Umwero character for 'a'
      latin: 'a',
      pronunciation: '/a/ as in "father"',
      meaning: 'Represents earth and foundation',
      culturalNote: 'The character for "a" symbolizes the grounding force of earth',
      strokeOrder: [
        'Start from the center',
        'Draw circular motion outward',
        'Complete the form with connecting line',
      ],
      exampleWords: [
        { umwero: '"M"Z}', latin: 'amazi', meaning: 'water' },
        { umwero: '"A"', latin: 'aba', meaning: 'these' },
        { umwero: '"R{', latin: 'aho', meaning: 'there' },
      ],
    },
    {
      umwero: '|',  // Character for 'e'
      latin: 'e',
      pronunciation: '/e/ as in "bed"',
      meaning: 'Represents air and breath',
      culturalNote: 'Air is the breath of life in Rwandan philosophy',
      strokeOrder: [
        'Start with vertical line',
        'Add horizontal connector',
        'Complete the form',
      ],
      exampleWords: [
        { umwero: '|M|', latin: 'eme', meaning: 'stand' },
        { umwero: 'N|', latin: 'ne', meaning: 'and' },
      ],
    },
    {
      umwero: '}',  // Character for 'i'
      latin: 'i',
      pronunciation: '/i/ as in "machine"',
      meaning: 'Represents water and flow',
      culturalNote: 'Water symbolizes adaptability and life force',
      strokeOrder: [
        'Begin with curved stroke',
        'Add vertical element',
        'Close the character',
      ],
      exampleWords: [
        { umwero: '}A}', latin: 'ibi', meaning: 'these things' },
        { umwero: '}N}', latin: 'ini', meaning: 'liver' },
      ],
    },
    {
      umwero: '{',  // Character for 'o'
      latin: 'o',
      pronunciation: '/o/ as in "note"',
      meaning: 'Represents spirit and wholeness',
      culturalNote: 'The circle represents unity and completeness',
      strokeOrder: [
        'Start with circular motion',
        'Complete the loop',
        'Add finishing stroke',
      ],
      exampleWords: [
        { umwero: 'K{S{', latin: 'koko', meaning: 'chicken' },
        { umwero: 'G{S{', latin: 'goko', meaning: 'arm' },
      ],
    },
    {
      umwero: ':',  // Character for 'u'
      latin: 'u',
      pronunciation: '/u/ as in "rude"',
      meaning: 'Represents fire and energy',
      culturalNote: 'Fire is the transformative element in creation',
      strokeOrder: [
        'Create two vertical strokes',
        'Connect with horizontal line',
      ],
      exampleWords: [
        { umwero: ':M:G:', latin: 'umuco', meaning: 'culture' },
        { umwero: ':A:T:', latin: 'ubuntu', meaning: 'humanity' },
      ],
    },
  ],
  
  examples: [
    {
      title: 'Common Kinyarwanda Greetings with Vowels',
      content: [
        { umwero: 'MW"|', latin: 'mwahe', meaning: 'hello (plural)' },
        { umwero: ':R"K{Z|', latin: 'urakoze', meaning: 'thank you' },
      ],
    },
    {
      title: 'Vowel Combinations in Words',
      content: [
        { umwero: '"M"Z}', latin: 'amazi', meaning: 'water' },
        { umwero: ':{', latin: 'uko', meaning: 'how/that way' },
      ],
    },
  ],
  
  exercises: [
    {
      id: 'ex-001-01',
      type: 'RECOGNITION',
      instruction: 'Identify the correct Umwero character for the vowel "a"',
      content: {
        question: 'Which character represents the vowel "a"?',
        options: ['"', '|', '}', '{', ':'],
        correct: 0,
      },
    },
    {
      id: 'ex-001-02',
      type: 'TRACING',
      instruction: 'Trace the Umwero character for "a" (ሰ)',
      content: {
        character: '"',
        strokeOrder: ['center-out', 'circular', 'connect'],
      },
    },
    {
      id: 'ex-001-03',
      type: 'TRANSCRIPTION',
      instruction: 'Write the following Kinyarwanda words in Umwero script',
      content: {
        words: ['aba', 'ebe', 'ibi', 'oko', 'ubu'],
      },
    },
  ],
  
  quiz: {
    questions: [
      {
        question: 'How many vowels are there in the Umwero alphabet?',
        type: 'MULTIPLE_CHOICE',
        options: ['3', '5', '7', '10'],
        correct: 1,
        explanation: 'Umwero has 5 vowels, matching the Kinyarwanda phonetic system: a, e, i, o, u',
      },
      {
        question: 'Which vowel represents "water and flow" in Rwandan philosophy?',
        type: 'MULTIPLE_CHOICE',
        options: ['a', 'e', 'i', 'o'],
        correct: 2,
        explanation: 'The vowel "i" (}) represents water and flow in Umwero symbolism',
      },
      {
        question: 'Identify the Umwero character for the vowel "u"',
        type: 'CHARACTER_RECOGNITION',
        options: ['"', '|', '}', ':'],
        correct: 3,
        explanation: 'The character ":" represents the vowel "u" in Umwero',
      },
    ],
  },
}

// ============================================================================
// LESSON 2: BASIC CONSONANTS (INGOMBAJWI Z'IBANZE)
// ============================================================================

export const LESSON_02_CONSONANTS: LessonContent = {
  id: 'umw-lesson-002',
  title: 'Ingombajwi z\'Ibanze - Basic Consonants',
  module: 'BEGINNER',
  order: 2,
  duration: 30,
  objectives: [
    'Learn 10 fundamental Umwero consonants',
    'Understand consonant-vowel combinations',
    'Practice writing basic syllables',
    'Form simple two-letter words',
  ],
  prerequisites: ['umw-lesson-001'],
  theory: {
    introduction: `Consonants (Ingombajwi) in Umwero combine with vowels to form syllables. 
    In this lesson, we'll learn the most common consonants used in everyday Kinyarwanda words.`,
    
    keyPoints: [
      'Consonants must combine with vowels to form complete syllables',
      'Some consonants have multiple forms depending on position',
      'Stroke order is crucial for proper character formation',
      'Practice makes perfect - consistency in writing is key',
    ],
    
    culturalContext: `Many Umwero consonants are inspired by traditional Rwandan symbols. 
    For example, the character for "M" resembles the shape of traditional basket weaving patterns (Agaseke).`,
  },
  
  characters: [
    {
      umwero: 'M',
      latin: 'm',
      pronunciation: '/m/ as in "mother"',
      strokeOrder: ['vertical line', 'curved connector', 'complete form'],
      exampleWords: [
        { umwero: 'M"M"', latin: 'mama', meaning: 'mother' },
        { umwero: ':M:G{', latin: 'umuco', meaning: 'culture' },
      ],
    },
    {
      umwero: 'N',
      latin: 'n',
      pronunciation: '/n/ as in "night"',
      strokeOrder: ['start vertical', 'add angle', 'finish'],
      exampleWords: [
        { umwero: 'NK:ND"', latin: 'nkunda', meaning: 'I love' },
        { umwero: 'N}N}', latin: 'nini', meaning: 'big' },
      ],
    },
    {
      umwero: 'B',
      latin: 'b',
      pronunciation: '/b/ as in "baby"',
      strokeOrder: ['vertical base', 'add curves', 'complete'],
      exampleWords: [
        { umwero: 'A"A"', latin: 'baba', meaning: 'father' },
        { umwero: 'A}A}', latin: 'bibi', meaning: 'bad' },
      ],
    },
    {
      umwero: 'K',
      latin: 'k',
      pronunciation: '/k/ as in "king"',
      strokeOrder: ['vertical line', 'angular connectors'],
      exampleWords: [
        { umwero: 'K:"', latin: 'kua', meaning: 'to grow' },
        { umwero: 'K}', latin: 'ki', meaning: 'what' },
      ],
    },
    {
      umwero: 'G',
      latin: 'g',
      pronunciation: '/g/ as in "go"',
      strokeOrder: ['curved start', 'complete form'],
      exampleWords: [
        { umwero: 'G:G"', latin: 'guca', meaning: 'to buy' },
        { umwero: 'G:S:M"', latin: 'gusoma', meaning: 'to read' },
      ],
    },
    {
      umwero: 'R',
      latin: 'r',
      pronunciation: '/r/ rolled r',
      strokeOrder: ['curved base', 'vertical element'],
      exampleWords: [
        { umwero: 'R:"ND"', latin: 'Rwanda', meaning: 'Rwanda' },
        { umwero: ':R"K{Z|', latin: 'urakoze', meaning: 'thank you' },
      ],
    },
    {
      umwero: 'S',
      latin: 's',
      pronunciation: '/s/ as in "sun"',
      strokeOrder: ['S-curve', 'smooth flow'],
      exampleWords: [
        { umwero: 'S"', latin: 'sa', meaning: 'give' },
        { umwero: 'S}', latin: 'si', meaning: 'not' },
      ],
    },
    {
      umwero: 'T',
      latin: 't',
      pronunciation: '/t/ as in "top"',
      strokeOrder: ['horizontal top', 'vertical down'],
      exampleWords: [
        { umwero: 'T"T"', latin: 'tata', meaning: 'father' },
        { umwero: 'T:|R"', latin: 'tera', meaning: 'do' },
      ],
    },
    {
      umwero: 'Z',
      latin: 'z',
      pronunciation: '/z/ as in "zoo"',
      strokeOrder: ['zigzag pattern'],
      exampleWords: [
        { umwero: 'Z{', latin: 'zo', meaning: 'all' },
        { umwero: 'Z:S"', latin: 'zuba', meaning: 'sun' },
      ],
    },
    {
      umwero: 'Y',
      latin: 'y',
      pronunciation: '/y/ as in "yes"',
      strokeOrder: ['Y-shaped form'],
      exampleWords: [
        { umwero: 'Y"|G{', latin: 'yego', meaning: 'yes' },
        { umwero: 'Y"', latin: 'ya', meaning: 'of' },
      ],
    },
  ],
  
  examples: [
    {
      title: 'Simple Syllables',
      content: [
        { umwero: 'M"', latin: 'ma', meaning: 'syllable: ma' },
        { umwero: 'N}', latin: 'ni', meaning: 'syllable: ni' },
        { umwero: 'K{', latin: 'ko', meaning: 'syllable: ko' },
      ],
    },
    {
      title: 'Two-Letter Words',
      content: [
        { umwero: 'N"', latin: 'na', meaning: 'with/and' },
        { umwero: 'K}', latin: 'ki', meaning: 'what' },
        { umwero: 'M:{', latin: 'mwo', meaning: 'in there' },
      ],
    },
  ],
  
  exercises: [
    {
      id: 'ex-002-01',
      type: 'RECOGNITION',
      instruction: 'Match the Latin consonant to its Umwero character',
      content: {
        pairs: [
          { latin: 'm', umwero: 'M' },
          { latin: 'k', umwero: 'K' },
          { latin: 's', umwero: 'S' },
        ],
      },
    },
    {
      id: 'ex-002-02',
      type: 'WRITING',
      instruction: 'Write the following syllables in Umwero',
      content: {
        syllables: ['ma', 'ni', 'ko', 'bu', 'ta'],
      },
    },
  ],
  
  quiz: {
    questions: [
      {
        question: 'How do you write "mama" (mother) in Umwero?',
        type: 'MULTIPLE_CHOICE',
        options: ['M"M"', 'M}M}', 'N"N"', 'A"A"'],
        correct: 0,
        explanation: 'M" = ma, so M"M" = mama',
      },
      {
        question: 'Which consonant must combine with a vowel to form a syllable?',
        type: 'MULTIPLE_CHOICE',
        options: ['All consonants', 'Only M', 'Only N', 'None'],
        correct: 0,
        explanation: 'In Umwero, all consonants must combine with vowels to form complete syllables',
      },
    ],
  },
}

// ============================================================================
// LESSON DATA EXPORT
// ============================================================================

export const ALL_LESSONS: LessonContent[] = [
  LESSON_01_VOWELS,
  LESSON_02_CONSONANTS,
  // Additional lessons will be added progressively
]

export function getLessonById(id: string): LessonContent | undefined {
  return ALL_LESSONS.find(lesson => lesson.id === id)
}

export function getLessonsByModule(module: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): LessonContent[] {
  return ALL_LESSONS.filter(lesson => lesson.module === module)
}

export function getNextLesson(currentLessonId: string): LessonContent | undefined {
  const currentIndex = ALL_LESSONS.findIndex(l => l.id === currentLessonId)
  return ALL_LESSONS[currentIndex + 1]
}