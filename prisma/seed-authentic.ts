// prisma/seed-authentic.ts
// Comprehensive seed for Uruziga Lesson System with authentic Umwero data
// Based on the original vowel lessons with real cultural significance

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UMWERO_VOWELS } from '../types/lesson';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Authentic Uruziga Lesson System Seeding...');

  // ============================================
  // 1. LANGUAGES
  // ============================================
  console.log('📝 Creating languages...');
  
  const en = await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: {
      code: 'en',
      name: 'English',
      displayName: 'English',
      direction: 'ltr',
      isDefault: true,
    },
  });

  const rw = await prisma.language.upsert({
    where: { code: 'rw' },
    update: {},
    create: {
      code: 'rw',
      name: 'Ikinyarwanda',
      displayName: 'Ikinyarwanda',
      direction: 'ltr',
    },
  });

  const umw = await prisma.language.upsert({
    where: { code: 'umw' },
    update: {},
    create: {
      code: 'umw',
      name: 'Umwero',
      displayName: 'Umwero',
      direction: 'ltr',
    },
  });

  // ============================================
  // 2. AUTHENTIC VOWEL CHARACTERS
  // ============================================
  console.log('📝 Creating authentic vowel characters...');
  
  const createdCharacters = [];

  for (const [latinKey, vowelData] of Object.entries(UMWERO_VOWELS)) {
    const character = await prisma.character.upsert({
      where: { umweroGlyph: vowelData.umwero },
      update: {},
      create: {
        umweroGlyph: vowelData.umwero,
        latinEquivalent: vowelData.latin,
        type: 'VOWEL',
        difficulty: 1,
        strokeCount: 2, // Default, can be customized per character
        order: vowelData.order,
        symbolism: vowelData.meaning,
        historicalNote: vowelData.culturalNote,
        isActive: true,
      },
    });

    createdCharacters.push({ character, vowelData, latinKey });
    console.log(`  ✓ Created character: ${vowelData.umwero} (${vowelData.latin})`);
  }

  // ============================================
  // 3. CHARACTER TRANSLATIONS
  // ============================================
  console.log('🌍 Creating character translations...');
  
  for (const { character, vowelData, latinKey } of createdCharacters) {
    // English translations
    await prisma.characterTranslation.upsert({
      where: {
        characterId_languageId: {
          characterId: character.id,
          languageId: en.id,
        },
      },
      update: {},
      create: {
        characterId: character.id,
        languageId: en.id,
        name: `Vowel ${vowelData.latin.toUpperCase()}`,
        pronunciation: vowelData.pronunciation,
        meaning: vowelData.meaning,
        description: vowelData.culturalNote,
      },
    });

    // Kinyarwanda translations
    await prisma.characterTranslation.upsert({
      where: {
        characterId_languageId: {
          characterId: character.id,
          languageId: rw.id,
        },
      },
      update: {},
      create: {
        characterId: character.id,
        languageId: rw.id,
        name: `Igihango ${vowelData.latin.toUpperCase()}`,
        pronunciation: vowelData.pronunciation,
        meaning: vowelData.meaning,
        description: vowelData.culturalNote,
      },
    });
  }

  // ============================================
  // 4. STROKE DATA (Basic patterns for each vowel)
  // ============================================
  console.log('✏️ Creating stroke order data...');
  
  for (const { character, vowelData } of createdCharacters) {
    const strokePatterns = getStrokePattern(vowelData.umwero);
    
    for (let i = 0; i < strokePatterns.length; i++) {
      await prisma.strokeData.create({
        data: {
          characterId: character.id,
          strokeNumber: i + 1,
          pathData: strokePatterns[i].pathData,
          direction: strokePatterns[i].direction,
          duration: strokePatterns[i].duration,
          hint: strokePatterns[i].hint,
        },
      });
    }
  }

  // ============================================
  // 5. CULTURAL CONTEXT
  // ============================================
  console.log('🏛️ Creating cultural context...');
  
  for (const { character, vowelData } of createdCharacters) {
    const context = await prisma.culturalContext.create({
      data: {
        characterId: character.id,
        contextType: 'CULTURAL_USE',
        icon: 'record_voice_over',
        order: 1,
        isActive: true,
      },
    });

    // English context translation
    await prisma.culturalContextTranslation.create({
      data: {
        contextId: context.id,
        languageId: en.id,
        title: 'Cultural Significance',
        content: `The ${vowelData.latin.toUpperCase()} vowel (${vowelData.umwero}) ${vowelData.culturalNote.toLowerCase()}`,
        summary: `Essential for understanding ${vowelData.meaning.toLowerCase()}`,
      },
    });

    // Kinyarwanda context translation
    await prisma.culturalContextTranslation.create({
      data: {
        contextId: context.id,
        languageId: rw.id,
        title: 'Umunyarwandakazi',
        content: `Igihango ${vowelData.latin.toUpperCase()} (${vowelData.umwero}) ${vowelData.culturalNote}`,
        summary: `Ngombwa mu kumva ${vowelData.meaning}`,
      },
    });

    // Add examples
    for (let i = 0; i < vowelData.examples.length; i++) {
      const example = vowelData.examples[i];
      await prisma.contextExample.create({
        data: {
          contextId: context.id,
          wordUmwero: example.umwero,
          wordLatin: example.latin,
          wordEnglish: example.english,
          order: i + 1,
          isActive: true,
        },
      });
    }
  }

  // ============================================
  // 6. LESSONS
  // ============================================
  console.log('📚 Creating authentic lessons...');
  
  const createdLessons = [];

  for (const { character, vowelData, latinKey } of createdCharacters) {
    const lesson = await prisma.lesson.create({
      data: {
        code: `vowel-${vowelData.latin}-intro`,
        type: 'CHARACTER_INTRO',
        characterId: character.id,
        module: 'Vowels',
        difficulty: 1,
        order: vowelData.order,
        estimatedTime: 15,
        prerequisiteIds: createdLessons.slice(0, -1).map(l => l.id),
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    createdLessons.push(lesson);

    // English lesson translation
    await prisma.lessonTranslation.create({
      data: {
        lessonId: lesson.id,
        languageId: en.id,
        title: `Learn Vowel ${vowelData.latin.toUpperCase()}`,
        description: `Master the ${vowelData.latin.toUpperCase()} vowel of the Umwero script. Learn its cultural significance: ${vowelData.meaning}.`,
        objectives: [
          `Recognize the vowel ${vowelData.latin.toUpperCase()} in Umwero script`,
          `Understand the cultural significance of ${vowelData.latin.toUpperCase()}`,
          `Learn proper stroke order for writing ${vowelData.latin.toUpperCase()}`,
          `Practice drawing ${vowelData.latin.toUpperCase()} with guidance`,
        ],
      },
    });

    // Kinyarwanda lesson translation
    await prisma.lessonTranslation.create({
      data: {
        lessonId: lesson.id,
        languageId: rw.id,
        title: `Soma Igihango ${vowelData.latin.toUpperCase()}`,
        description: `Mwige igihango ${vowelData.latin.toUpperCase()} cya Umwero. Menya byinshi ku bya muco: ${vowelData.meaning}.`,
        objectives: [
          `Kumva igihango ${vowelData.latin.toUpperCase()} mu mwandiko wa Umwero`,
          `Kumenya byinshi ku bya muco bya ${vowelData.latin.toUpperCase()}`,
          `Kwiga uko kwandika neza ${vowelData.latin.toUpperCase()}`,
          `Gukora practice yo kurandura ${vowelData.latin.toUpperCase()}`,
        ],
      },
    });
  }

  // ============================================
  // 7. LESSON STEPS
  // ============================================
  console.log('👣 Creating lesson steps...');
  
  for (const lesson of createdLessons) {
    const steps = await prisma.lessonStep.createMany({
      data: [
        {
          lessonId: lesson.id,
          stepType: 'CHARACTER_OVERVIEW',
          order: 1,
          config: {
            displaySize: 'large',
            showAudio: true,
            backgroundColor: '#f8f7f6',
            decorativePattern: 'imigongo',
          },
          isRequired: true,
        },
        {
          lessonId: lesson.id,
          stepType: 'CULTURAL_CONTEXT',
          order: 2,
          config: {
            contextType: 'CULTURAL_USE',
            icon: 'record_voice_over',
          },
          isRequired: true,
        },
        {
          lessonId: lesson.id,
          stepType: 'STROKE_ORDER',
          order: 3,
          config: {
            animationSpeed: 'normal',
            showDirectionArrows: true,
          },
          isRequired: true,
        },
        {
          lessonId: lesson.id,
          stepType: 'PRACTICE_CANVAS',
          order: 4,
          config: {
            guidanceLevel: 'full',
            gridVisible: true,
            traceOpacity: 0.3,
            realTimeFeedback: true,
            tools: {
              undo: true,
              clear: true,
              guideToggle: true,
            },
          },
          isRequired: true,
          passingScore: 70,
        },
        {
          lessonId: lesson.id,
          stepType: 'AI_COMPARISON',
          order: 5,
          config: {
            showSideBySide: true,
            showMetrics: true,
          },
          isRequired: true,
        },
        {
          lessonId: lesson.id,
          stepType: 'SUCCESS_CELEBRATION',
          order: 6,
          config: {
            showConfetti: true,
            nextLessonPreview: true,
          },
          isRequired: false,
        },
      ],
    });

    // Create step translations for each step
    const createdSteps = await prisma.lessonStep.findMany({
      where: { lessonId: lesson.id },
      orderBy: { order: 'asc' },
    });

    for (const step of createdSteps) {
      // English step translations
      await prisma.stepTranslation.create({
        data: {
          stepId: step.id,
          languageId: en.id,
          title: getStepTitle(step.stepType, 'en'),
          instructions: getStepInstructions(step.stepType, 'en'),
          tips: getStepTips(step.stepType, 'en'),
        },
      });

      // Kinyarwanda step translations
      await prisma.stepTranslation.create({
        data: {
          stepId: step.id,
          languageId: rw.id,
          title: getStepTitle(step.stepType, 'rw'),
          instructions: getStepInstructions(step.stepType, 'rw'),
          tips: getStepTips(step.stepType, 'rw'),
        },
      });
    }
  }

  // ============================================
  // 8. ACHIEVEMENTS
  // ============================================
  console.log('🏆 Creating achievements...');
  
  await prisma.achievement.createMany({
    data: [
      {
        code: 'first-steps',
        category: 'LESSON_COMPLETION',
        requirement: { type: 'first_lesson_completed' },
        points: 10,
        icon: 'emoji_events',
        color: '#5e2f17',
        order: 1,
        isActive: true,
      },
      {
        code: 'vowel-master',
        category: 'LESSON_COMPLETION',
        requirement: { type: 'all_vowels_completed' },
        points: 50,
        icon: 'school',
        color: '#10b981',
        order: 2,
        isActive: true,
      },
      {
        code: 'inyambo-keeper',
        category: 'CULTURAL_KNOWLEDGE',
        requirement: { type: 'cultural_context_completed', count: 5 },
        points: 30,
        icon: 'psychology',
        color: '#8b5cf6',
        order: 3,
        isActive: true,
      },
      {
        code: 'perfect-practice',
        category: 'PRACTICE_MASTERY',
        requirement: { type: 'score_above', value: 95, count: 5 },
        points: 25,
        icon: 'workspace_premium',
        color: '#f59e0b',
        order: 4,
        isActive: true,
      },
      {
        code: 'week-streak',
        category: 'STREAK',
        requirement: { type: 'daily_streak', days: 7 },
        points: 20,
        icon: 'local_fire_department',
        color: '#ef4444',
        order: 5,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // ============================================
  // 9. DEMO USER
  // ============================================
  console.log('👤 Creating demo user...');
  
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@uruziga.rw' },
    update: {},
    create: {
      email: 'demo@uruziga.rw',
      name: 'Demo Student',
      password: hashedPassword,
      role: 'STUDENT',
      preferredLanguage: 'en',
      fullName: 'Demo Student',
      username: 'demo',
    },
  });

  console.log('✅ Authentic Seeding completed successfully!');
  console.log(`📊 Summary:
  - Languages: 3 (en, rw, umw)
  - Authentic Vowel Characters: 5 with real cultural data
  - Character Translations: 10 (English + Kinyarwanda)
  - Stroke Data: Custom patterns for each vowel
  - Cultural Context: Real examples and meanings
  - Lessons: 5 authentic vowel lessons
  - Lesson Steps: 6 steps per lesson (30 total)
  - Achievements: 5 cultural and learning achievements
  - Demo User: 1 user
  
  🌍 Cultural Authenticity:
  - Vowel A: Inyambo Cow's head with Horns - symbol of Rwandan heritage
  - Vowel U: Umugozi/umurunga - represents relationships and unity
  - Vowel O: 360 degrees - circular completeness
  - Vowel E: Basic vowel sound
  - Vowel I: Long vowel - extended sounds
  
  Each character includes authentic examples like:
  - "M"Z} (amazi) - water
  - :RGW"ND" (urwanda) - Rwanda
  - :B:NN: (ubuntu) - humanity
  `);
}

// Helper function to get stroke patterns for each vowel
function getStrokePattern(umwero: string) {
  const patterns = {
    '"': [ // Vowel A - two strokes like cow horns
      {
        pathData: 'M 50 100 L 150 100',
        direction: 'LEFT_TO_RIGHT',
        duration: 800,
        hint: 'Draw the top horizontal stroke (like horn base)'
      },
      {
        pathData: 'M 100 100 L 100 200',
        direction: 'TOP_TO_BOTTOM',
        duration: 800,
        hint: 'Draw the vertical stroke downward'
      }
    ],
    ':': [ // Vowel U - two parallel strokes
      {
        pathData: 'M 80 100 L 80 200',
        direction: 'TOP_TO_BOTTOM',
        duration: 800,
        hint: 'Draw the left vertical stroke'
      },
      {
        pathData: 'M 120 100 L 120 200',
        direction: 'TOP_TO_BOTTOM',
        duration: 800,
        hint: 'Draw the right vertical stroke'
      }
    ],
    '{': [ // Vowel O - circular stroke
      {
        pathData: 'M 100 50 C 150 50 150 150 100 150 C 50 150 50 50 100 50',
        direction: 'CLOCKWISE',
        duration: 1500,
        hint: 'Draw a complete circle clockwise'
      }
    ],
    '|': [ // Vowel E - vertical line
      {
        pathData: 'M 100 50 L 100 200',
        direction: 'TOP_TO_BOTTOM',
        duration: 1000,
        hint: 'Draw a straight vertical line'
      }
    ],
    '}': [ // Vowel I - vertical line (same as E for now)
      {
        pathData: 'M 100 50 L 100 200',
        direction: 'TOP_TO_BOTTOM',
        duration: 1000,
        hint: 'Draw a straight vertical line for long vowel'
      }
    ]
  };

  return patterns[umwero] || patterns['|']; // Default to vertical line
}

// Helper functions for step translations
function getStepTitle(stepType: string, language: string): string {
  const titles = {
    CHARACTER_OVERVIEW: {
      en: 'Meet the Character',
      rw: 'Kumenya Igihango',
    },
    CULTURAL_CONTEXT: {
      en: 'Cultural Significance',
      rw: 'Umunyarwandakazi',
    },
    STROKE_ORDER: {
      en: 'Learn to Write',
      rw: 'Kwiga Kwandika',
    },
    PRACTICE_CANVAS: {
      en: 'Practice Drawing',
      rw: 'Gukora Practice',
    },
    AI_COMPARISON: {
      en: 'Review Your Work',
      rw: 'Kugenzura Akazi',
    },
    SUCCESS_CELEBRATION: {
      en: 'Congratulations!',
      rw: 'Murakoze!',
    },
  };
  return titles[stepType]?.[language] || stepType;
}

function getStepInstructions(stepType: string, language: string): string {
  const instructions = {
    CHARACTER_OVERVIEW: {
      en: 'Observe the character carefully. Listen to its pronunciation and understand its meaning in Rwandan culture.',
      rw: 'Kureba neza igihango. Wumve ijwi ryacyo kandi menya akamaro kawo mu muco wa Rwanda.',
    },
    CULTURAL_CONTEXT: {
      en: 'Learn about the cultural significance and historical context of this character.',
      rw: 'Menya byinshi ku bya muco n\'urwego rwa mbere ry\'iki gihango.',
    },
    STROKE_ORDER: {
      en: 'Watch the animation carefully. Practice the stroke order in the correct sequence.',
      rw: 'Kureba neza animation. Kora practice y\'urukiko rwo kwandika mu murongo wihariye.',
    },
    PRACTICE_CANVAS: {
      en: 'Draw the character on the canvas. Use the guide overlay if you need help.',
      rw: 'Andika igihango kuri canvas. Koresha ibufasha niba ukeneye.',
    },
    AI_COMPARISON: {
      en: 'Review your drawing compared to the correct form. Read the feedback to improve.',
      rw: 'Kureba ibyo wanditse ukurikije ihuriro ryukuri. Soma ibufasha kugira ngo ukore neza.',
    },
    SUCCESS_CELEBRATION: {
      en: 'Excellent work! You have completed this lesson and helped preserve Umwero culture.',
      rw: 'Akazi keza! Wakunze iyi lesson kandi wafashe uruhare mu kubungabunga umuco wa Umwero.',
    },
  };
  return instructions[stepType]?.[language] || '';
}

function getStepTips(stepType: string, language: string): string[] {
  const tips = {
    CHARACTER_OVERVIEW: {
      en: [
        'Pay attention to the pronunciation',
        'Notice the character\'s unique shape',
        'Think about its cultural meaning',
        'This character represents important Rwandan heritage',
      ],
      rw: [
        'Tegereza ijwi',
        'Reba imiterere yihariye yigihango',
        'Ugerageze kumvikana akamaro kawo mu muco',
        'Iki gihango gitwanga umuco w\'u Rwanda w\'ingenzi',
      ],
    },
    PRACTICE_CANVAS: {
      en: [
        'Start with light strokes',
        'Follow the guide overlay',
        'Take your time to get it right',
        'Remember the cultural significance as you draw',
      ],
      rw: [
        'Tangira amabwiriza meza',
        'Kurikiza ibufasha',
        'Fata igihe kugira ngo ukore neza',
        'ibuka akamaro gaharanira mu gukora',
      ],
    },
    AI_COMPARISON: {
      en: [
        'Compare stroke by stroke',
        'Note the feedback suggestions',
        'Practice makes perfect',
        'Each attempt helps preserve this cultural script',
      ],
      rw: [
        'Ugereranye buri mbwiriza',
        'Wibuke ibufasha',
        'Practice ihora yiza',
        'Buri gerageza ufasha kubungabunga iyi mwandiko ya muco',
      ],
    },
  };
  return tips[stepType]?.[language] || [];
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
