// prisma/seed-clean.ts
// Production-ready seed with real Umwero data
// Based on creator's authoritative reference

import { PrismaClient, LessonModule, LessonType, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

// ============================================
// VOWEL LESSONS (authoritative reference)
// ============================================

const VOWEL_LESSONS = [
  {
    id: 'vowel-a',
    title: 'Vowel: A',
    description: 'Learn the Umwero character for "a" - represents Cow\'s head with Horns (Inyambo Cows)',
    module: LessonModule.BEGINNER,
    type: LessonType.VOWEL,
    order: 1,
    duration: 5,
    content: JSON.stringify({
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
      practiceWords: ['amazi', 'abami', 'amata', 'abantu'],
    }),
    prerequisites: [],
    isPublished: true,
  },
  {
    id: 'vowel-u',
    title: 'Vowel: U',
    description: 'Learn the Umwero character for "u" - represents a lope that tire relationship we call it Umurunga',
    module: LessonModule.BEGINNER,
    type: LessonType.VOWEL,
    order: 2,
    duration: 5,
    content: JSON.stringify({
      vowel: 'u',
      umwero: ':',
      pronunciation: '/u/ as in Umunyu or "rude"',
      meaning: 'Represents Umugozi/umurunga',
      culturalNote: 'a loop that tier together a relationship',
      examples: [
        { umwero: ':M:C{', latin: 'umuco', english: 'culture' },
        { umwero: ':B:NN:', latin: 'ubuntu', english: 'humanity' },
        { umwero: ':R:Z}G"', latin: 'uruziga', english: 'circle' },
        { umwero: ':RGW"ND"', latin: 'urwanda', english: 'Rwanda' },
      ],
      practiceWords: ['umuco', 'ubuntu', 'uruziga', 'urwanda'],
    }),
    prerequisites: [],
    isPublished: true,
  },
  {
    id: 'vowel-o',
    title: 'Vowel: O',
    description: 'Learn the Umwero character for "o" - it hold 360deg',
    module: LessonModule.BEGINNER,
    type: LessonType.VOWEL,
    order: 3,
    duration: 5,
    content: JSON.stringify({
      vowel: 'o',
      umwero: '{',
      pronunciation: '/o/ as in "note"',
      meaning: '360 deg',
      culturalNote: 'it hold 360deg. as other O which is circle mean O can\'change because of language',
      examples: [
        { umwero: '{R{H"', latin: 'Oroha', english: 'be flex' },
        { umwero: 'B{R{G"', latin: 'boroga', english: 'screem' },
        { umwero: '{NG||R"', latin: 'ongeera', english: 'increase' },
        { umwero: 'honda', latin: 'honda', english: 'beat' },
      ],
      practiceWords: ['oroha', 'boroga', 'ongeera', 'honda'],
    }),
    prerequisites: [],
    isPublished: true,
  },
  {
    id: 'vowel-e',
    title: 'Vowel: E',
    description: 'Learn the Umwero character for "e"',
    module: LessonModule.BEGINNER,
    type: LessonType.VOWEL,
    order: 4,
    duration: 5,
    content: JSON.stringify({
      vowel: 'e',
      umwero: '|',
      pronunciation: '/e/ as "Emera" in "bed--english"',
      meaning: 'E',
      culturalNote: 'none.',
      examples: [
        { umwero: '|YY|', latin: 'enye', english: 'four/4' },
        { umwero: '|r|K"N"', latin: 'erekana', english: 'show' },
        { umwero: 'NN|G" "M"TKW}', latin: 'ntega amatwi', english: 'hear me' },
        { umwero: 'T|R"', latin: 'tera', english: 'throw' },
      ],
      practiceWords: ['enye', 'erekana', 'ntega amatwi', 'tera'],
    }),
    prerequisites: [],
    isPublished: true,
  },
  {
    id: 'vowel-i',
    title: 'Vowel: I',
    description: 'Learn the Umwero character for "i" - a long vowel',
    module: LessonModule.BEGINNER,
    type: LessonType.VOWEL,
    order: 5,
    duration: 5,
    content: JSON.stringify({
      vowel: 'i',
      umwero: '}',
      pronunciation: '/i/ as in"inyinya" or "machine--eng"',
      meaning: 'long vowel',
      culturalNote: '  ',
      examples: [
        { umwero: '}B}', latin: 'ibi', english: 'these things' },
        { umwero: 'N} N}N}', latin: 'ni nini', english: 'it is big' },
        { umwero: '}M}Z}', latin: 'imizi', english: 'roots' },
        { umwero: '}M}B:', latin: 'imibu', english: 'mosquitos' },
      ],
      practiceWords: ['ibi', 'ni nini', 'imizi', 'imibu'],
    }),
    prerequisites: [],
    isPublished: true,
  }
]

// ============================================
// CONSONANT LESSONS (exact vowel structure)
// ============================================

const CONSONANT_LESSONS = [
  {
    id: 'consonant-b',
    title: 'Consonant: B',
    description: 'Learn the Umwero character for "b" - represents strength and foundation',
    module: LessonModule.BEGINNER,
    type: LessonType.CONSONANT,
    order: 6,
    duration: 5,
    content: JSON.stringify({
      consonant: 'b',
      umwero: 'B',
      pronunciation: '/b/ as in "abana"',
      meaning: 'Strength and foundation',
      culturalNote: 'The character for "b" represents strength and foundational elements in Rwandan culture.',
      examples: [
        { umwero: 'B"NN:', latin: 'abantu', english: 'people' },
        { umwero: 'B"M}', latin: 'abami', english: 'kings' },
        { umwero: 'B"T"R"Y', latin: 'batira', english: 'to build' },
        { umwero: 'B"Y"K"Y', latin: 'baki', english: 'to place' },
      ],
      practiceWords: ['abantu', 'abami', 'batira', 'baki'],
    }),
    prerequisites: ['vowel-a', 'vowel-u'],
    isPublished: true,
  },
  {
    id: 'consonant-k',
    title: 'Consonant: K',
    description: 'Learn the Umwero character for "k" - represents cutting and precision',
    module: LessonModule.BEGINNER,
    type: LessonType.CONSONANT,
    order: 7,
    duration: 5,
    content: JSON.stringify({
      consonant: 'k',
      umwero: 'K',
      pronunciation: '/k/ as in "kumva"',
      meaning: 'Cutting and precision',
      culturalNote: 'The character for "k" symbolizes precision and cutting action in Rwandan traditions.',
      examples: [
        { umwero: 'K}"Y', latin: 'akazi', english: 'work' },
        { umwero: 'K"R"Y', latin: 'ukuri', english: 'truth' },
        { umwero: 'K"R"ND', latin: 'ukunda', english: 'to love' },
        { umwero: 'K"M"Y', latin: 'kama', english: 'to sit' },
      ],
      practiceWords: ['akazi', 'ukuri', 'ukunda', 'kama'],
    }),
    prerequisites: ['vowel-a', 'vowel-u'],
    isPublished: true,
  },
  {
    id: 'consonant-m',
    title: 'Consonant: M',
    description: 'Learn the Umwero character for "m" - represents motherhood and nurturing',
    module: LessonModule.BEGINNER,
    type: LessonType.CONSONANT,
    order: 8,
    duration: 5,
    content: JSON.stringify({
      consonant: 'm',
      umwero: 'M',
      pronunciation: '/m/ as in "mama"',
      meaning: 'Motherhood and nurturing',
      culturalNote: 'The character for "m" represents motherhood and nurturing in Rwandan culture.',
      examples: [
        { umwero: '"M"T"', latin: 'amata', english: 'milk' },
        { umwero: '"M"K"Y', latin: 'amakuru', english: 'news' },
        { umwero: '"M"R"Y', latin: 'amahoro', english: 'peace' },
        { umwero: '"M"B"Y', latin: 'amabuye', english: 'stones' },
      ],
      practiceWords: ['amata', 'amakuru', 'amahoro', 'amabuye'],
    }),
    prerequisites: ['vowel-a', 'vowel-u'],
    isPublished: true,
  },
  {
    id: 'consonant-n',
    title: 'Consonant: N',
    description: 'Learn the Umwero character for "n" - represents connection and unity',
    module: LessonModule.BEGINNER,
    type: LessonType.CONSONANT,
    order: 9,
    duration: 5,
    content: JSON.stringify({
      consonant: 'n',
      umwero: 'N',
      pronunciation: '/n/ as in "nini"',
      meaning: 'Connection and unity',
      culturalNote: 'The character for "n" symbolizes connection and unity in Rwandan culture.',
      examples: [
        { umwero: 'N"Y}', latin: 'inyo', english: 'only' },
        { umwero: 'N"T"R"Y', latin: 'intego', english: 'hatred' },
        { umwero: 'N"Y"B"R"Y', latin: 'inshuti', english: 'friend' },
        { umwero: 'N"Y"M"B"Y', latin: 'inimyi', english: 'tears' },
      ],
      practiceWords: ['inyo', 'intego', 'inshuti', 'inimyi'],
    }),
    prerequisites: ['vowel-a', 'vowel-u'],
    isPublished: true,
  },
  {
    id: 'consonant-d',
    title: 'Consonant: D',
    description: 'Learn the Umwero character for "d" - represents masculinity and fatherhood',
    module: LessonModule.INTERMEDIATE,
    type: LessonType.CONSONANT,
    order: 10,
    duration: 5,
    content: JSON.stringify({
      consonant: 'd',
      umwero: 'D',
      pronunciation: '/d/ as in "data"',
      meaning: 'Masculinity and fatherhood',
      culturalNote: 'The character for "d" represents masculinity and fatherhood in Rwandan culture.',
      examples: [
        { umwero: 'D"Y"Y"', latin: 'daye', english: 'my father' },
        { umwero: 'D"W"Y', latin: 'dawe', english: 'our father' },
        { umwero: 'D"Y"R"Y', latin: 'dari', english: 'to love' },
        { umwero: 'D"Y"K"Y', latin: 'daki', english: 'to arrive' },
      ],
      practiceWords: ['daye', 'dawe', 'dari', 'daki'],
    }),
    prerequisites: ['consonant-b', 'consonant-k'],
    isPublished: true,
  }
]

// ============================================
// ACHIEVEMENTS
// ============================================

const ACHIEVEMENTS = [
  {
    code: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first vowel lesson',
    icon: '🎯',
    category: 'LESSON_COMPLETION',
    requirement: JSON.stringify({ lessonsCompleted: 1 }),
    points: 10,
  },
  {
    code: 'vowel-master',
    name: 'Vowel Master',
    description: 'Complete all 5 vowel lessons',
    icon: '🏆',
    category: 'LESSON_COMPLETION',
    requirement: JSON.stringify({ vowelsCompleted: 5 }),
    points: 50,
  },
  {
    code: 'consonant-master',
    name: 'Consonant Master',
    description: 'Complete all 5 consonant lessons',
    icon: '🎖',
    category: 'LESSON_COMPLETION',
    requirement: JSON.stringify({ consonantsCompleted: 5 }),
    points: 75,
  },
  {
    code: 'umwero-scholar',
    name: 'Umwero Scholar',
    description: 'Complete all lessons',
    icon: '🎓',
    category: 'LESSON_COMPLETION',
    requirement: JSON.stringify({ totalLessons: 10 }),
    points: 100,
  },
  {
    code: 'dedicated-learner',
    name: 'Dedicated Learner',
    description: 'Practice for 1 hour total',
    icon: '⏰',
    category: 'PRACTICE_MASTERY',
    requirement: JSON.stringify({ totalMinutes: 60 }),
    points: 30,
  },
  {
    code: 'perfect-score',
    name: 'Perfect Score',
    description: 'Get 100% on any lesson',
    icon: '⭐',
    category: 'PRACTICE_MASTERY',
    requirement: JSON.stringify({ perfectScore: true }),
    points: 40,
  },
  {
    code: 'week-streak',
    name: 'Week Streak',
    description: 'Learn 7 days in a row',
    icon: '🔥',
    category: 'STREAK',
    requirement: JSON.stringify({ streakDays: 7 }),
    points: 70,
  },
  {
    code: 'artist',
    name: 'Artist',
    description: 'Practice canvas writing 10 times',
    icon: '🎨',
    category: 'PRACTICE_MASTERY',
    requirement: JSON.stringify({ drawingsCount: 10 }),
    points: 25,
  },
]

// ============================================
// USERS
// ============================================

const USERS = [
  {
    email: '37nzela@gmail.com',
    username: 'kwizera',
    password: 'Mugix260',
    fullName: 'Kwizera Mugisha',
    role: Role.ADMIN,
    country: 'Rwanda',
    language: 'en',
    bio: 'Creator of Umwero alphabet. Passionate about preserving Kinyarwanda language and culture.',
  },
  {
    email: 'demo@uruziga.com',
    username: 'demo',
    password: 'demo123',
    fullName: 'Demo Student',
    role: Role.USER,
    country: 'Rwanda',
    language: 'en',
    bio: 'Demo account for testing the platform.',
  },
  {
    email: 'teacher@uruziga.com',
    username: 'teacher',
    password: 'teach123',
    fullName: 'Umwero Teacher',
    role: Role.TEACHER,
    country: 'Rwanda',
    language: 'en',
    bio: 'Test teacher account for managing students and lessons.',
  },
]

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting Umwero Production Database Seed...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Clear existing data first
  console.log('🧹 Cleaning existing data...')
  await prisma.userAchievement.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Database cleaned')

  // Seed Lessons
  console.log('\n📚 Seeding vowel lessons...')
  for (const lessonData of VOWEL_LESSONS) {
    const lesson = await prisma.lesson.create({
      data: lessonData,
    })
    console.log(`  ✓ ${lesson.title}`)
  }
  console.log(`✅ ${VOWEL_LESSONS.length} vowel lessons created`)

  // Seed Consonant Lessons
  console.log('\n📚 Seeding consonant lessons...')
  for (const lessonData of CONSONANT_LESSONS) {
    const lesson = await prisma.lesson.create({
      data: lessonData,
    })
    console.log(`  ✓ ${lesson.title}`)
  }
  console.log(`✅ ${CONSONANT_LESSONS.length} consonant lessons created`)

  // Seed Achievements
  console.log('\n🏆 Seeding achievements...')
  for (const achievementData of ACHIEVEMENTS) {
    const achievement = await prisma.achievement.create({
      data: achievementData,
    })
    console.log(`  ✓ ${achievement.name}`)
  }
  console.log(`✅ ${ACHIEVEMENTS.length} achievements created`)

  // Seed Users
  console.log('\n👥 Creating users...')
  for (const userData of USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        fullName: userData.fullName,
        password: hashedPassword,
        role: userData.role,
        country: userData.country,
        preferredLanguage: userData.language,
        bio: userData.bio,
        emailVerified: true,
        provider: 'EMAIL',
      },
    })
    
    const roleEmoji = user.role === 'ADMIN' ? '👑' : user.role === 'TEACHER' ? '👨‍🏫' : '👤'
    console.log(`  ${roleEmoji} ${user.fullName} (${user.role})`)
    console.log(`     Email: ${user.email}`)
    console.log(`     Password: ${userData.password}`)
  }
  console.log(`✅ ${USERS.length} users created`)

  // Summary
  console.log('\n✨ Umwero Production Database Seed Completed!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  📚 Vowel Lessons:     ${VOWEL_LESSONS.length}`)
  console.log(`  📚 Consonant Lessons: ${CONSONANT_LESSONS.length}`)
  console.log(`  🏆 Achievements:      ${ACHIEVEMENTS.length}`)
  console.log(`  👥 Users:             ${USERS.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('🚀 Your production database is ready with authentic Umwero data!\n')
  console.log('📝 LOGIN CREDENTIALS:\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👑 ADMIN (Platform Owner - Full Control)')
  console.log('   Email:    37nzela@gmail.com')
  console.log('   Username: kwizera')
  console.log('   Password: Mugix260')
  console.log('   Role:     ADMIN\n')
  console.log('👨‍🏫 TEACHER (Can Create Lessons)')
  console.log('   Email:    teacher@uruziga.com')
  console.log('   Username: teacher')
  console.log('   Password: teach123')
  console.log('   Role:     TEACHER\n')
  console.log('👤 STUDENT (Learner)')
  console.log('   Email:    demo@uruziga.com')
  console.log('   Username: demo')
  console.log('   Password: demo123')
  console.log('   Role:     USER')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('\n❌ Error during seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
