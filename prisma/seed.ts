// prisma/seed.ts
// Fresh seed for clean Neon database
// Creates 3 users: Kwizera (admin), Demo student, Test teacher

import { PrismaClient, LessonModule, LessonType, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

// ============================================
// VOWEL LESSONS
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
      meaning: 'Represents Umugozi/umurunga ',
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
  }
]

// ============================================
// CONSONANT LESSONS
// ============================================

const CONSONANT_LESSONS = [
  {
    id: 'consonant-basic',
    title: 'Consonants: Basic',
    description: 'Learn the basic Umwero consonants and practice syllables',
    module: LessonModule.BEGINNER,
    type: LessonType.CONSONANT,
    order: 1,
    duration: 20,
    content: JSON.stringify({
      title: "Basic Consonants",
      characters: [
        { umwero: 'M', latin: 'm', pronunciation: '/m/', examples: ['M"M" (mama)', ':M:C{ (umuco)'] },
        { umwero: 'N', latin: 'n', pronunciation: '/n/', examples: ['N}N} (nini)', 'N" (na)'] },
        { umwero: 'B', latin: 'b', pronunciation: '/b/', examples: ['A"A" (baba)', 'A}A} (bibi)'] },
        { umwero: 'K', latin: 'k', pronunciation: '/k/', examples: ['K}" (kua)', 'K} (ki)'] },
      ],
      exercises: ['Match consonants to examples', 'Write simple syllables'],
    }),
    prerequisites: [],
    isPublished: true,
  }
]

// ============================================
// ACHIEVEMENTS
// ============================================

const ACHIEVEMENTS = [
  {
    name: 'First Steps',
    description: 'Complete your first vowel lesson',
    icon: '🎯',
    category: 'completion',
    requirement: JSON.stringify({ lessonsCompleted: 1 }),
    points: 10,
  },
  {
    name: 'Vowel Master',
    description: 'Complete all 5 vowel lessons',
    icon: '🏆',
    category: 'completion',
    requirement: JSON.stringify({ vowelsCompleted: 5 }),
    points: 50,
  },
  {
    name: 'Dedicated Learner',
    description: 'Practice for 1 hour total',
    icon: '⏰',
    category: 'time',
    requirement: JSON.stringify({ totalMinutes: 60 }),
    points: 30,
  },
  {
    name: 'Perfect Score',
    description: 'Get 100% on any lesson',
    icon: '⭐',
    category: 'mastery',
    requirement: JSON.stringify({ perfectScore: true }),
    points: 40,
  },
  {
    name: 'Week Streak',
    description: 'Learn 7 days in a row',
    icon: '🔥',
    category: 'streak',
    requirement: JSON.stringify({ streakDays: 7 }),
    points: 70,
  },
  {
    name: 'Artist',
    description: 'Practice canvas writing 10 times',
    icon: '🎨',
    category: 'practice',
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
    role: UserRole.ADMIN,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    country: 'Rwanda',
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       language: 'en',
    bio: 'Creator of Umwero alphabet. Passionate about preserving Kinyarwanda language and culture.',
  },
  {
    email: 'demo@uruziga.com',
    username: 'demo',
    password: 'demo123',
    fullName: 'Demo Student',
    role: UserRole.USER,
    country: 'Rwanda',
    language: 'en',
    bio: 'Demo account for testing the platform.',
  },
  {
    email: 'teacher@uruziga.com',
    username: 'teacher',
    password: 'teach123',
    fullName: 'Umwero Teacher',
    role: UserRole.TEACHER,
    country: 'Rwanda',
    language: 'en',
    bio: 'Test teacher account for managing students and lessons.',
  },
]

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting fresh Uruziga database seed...\n')

  // Clear existing data first
  console.log('🧹 Cleaning existing data...')
  await prisma.userAchievement.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.userDrawing.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.discussion.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.order.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Database cleaned\n')

  // Seed Lessons
  console.log('📚 Seeding vowel lessons...')
  for (const lessonData of VOWEL_LESSONS) {
    const lesson = await prisma.lesson.create({
      data: lessonData,
    })
    console.log(`  ✓ ${lesson.title}`)
  }
  console.log(`✅ ${VOWEL_LESSONS.length} vowel lessons created\n`)

  // Seed Consonant Lessons
  console.log('� Seeding consonant lessons...')
  for (const lessonData of CONSONANT_LESSONS) {
    const lesson = await prisma.lesson.create({ data: lessonData })
    console.log(`  ✓ ${lesson.title}`)
  }
  console.log(`✅ ${CONSONANT_LESSONS.length} consonant lessons created\n`)

  // Seed Achievements
  console.log('🏆 Seeding achievements...')
  for (const achievementData of ACHIEVEMENTS) {
    const achievement = await prisma.achievement.create({
      data: achievementData,
    })
    console.log(`  ✓ ${achievement.name}`)
  }
  console.log(`✅ ${ACHIEVEMENTS.length} achievements created\n`)

  // Seed Users
  console.log('👥 Creating users...')
  for (const userData of USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    })
    
    const roleEmoji = user.role === 'ADMIN' ? '👑' : user.role === 'TEACHER' ? '👨‍🏫' : '👤'
    console.log(`  ${roleEmoji} ${user.fullName} (${user.role})`)
    console.log(`     Email: ${user.email}`)
    console.log(`     Password: ${userData.password}`)
  }
  console.log(`✅ ${USERS.length} users created\n`)

  // Summary
  console.log('✨ Database seed completed successfully!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('� SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  📚 Vowel Lessons:     ${VOWEL_LESSONS.length}`)
  console.log(`  📚 Consonant Lessons: ${CONSONANT_LESSONS.length}`)
  console.log(`  🏆 Achievements:      ${ACHIEVEMENTS.length}`)
  console.log(`  👥 Users:             ${USERS.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('🚀 Your Neon database is ready!\n')
  console.log('📝 LOGIN CREDENTIALS:\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👑 ADMIN (Platform Owner - Full Control)')
  console.log('   Email:    37nzela@gmail.com')
  console.log('   Username: kwizera')
  console.log('   Password: Mugix260')
  console.log('   Role:     ADMIN')
  console.log('   Powers:   - Manage all users & roles')
  console.log('             - Delete accounts')
  console.log('             - Control funds & donations')
  console.log('             - Manage advertisements')
  console.log('             - Full platform control\n')
  console.log('👨‍🏫 TEACHER (Can Create Lessons)')
  console.log('   Email:    teacher@uruziga.com')
  console.log('   Username: teacher')
  console.log('   Password: teach123')
  console.log('   Role:     TEACHER')
  console.log('   Powers:   - Create & edit lessons')
  console.log('             - View student progress')
  console.log('             - Manage quizzes\n')
  console.log('👤 STUDENT (Learner)')
  console.log('   Email:    demo@uruziga.com')
  console.log('   Username: demo')
  console.log('   Password: demo123')
  console.log('   Role:     USER')
  console.log('   Powers:   - Take lessons')
  console.log('             - Track progress')
  console.log('             - Earn achievements')
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