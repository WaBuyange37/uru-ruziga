// prisma/seed.ts
// Fresh seed for clean Neon database
// Creates 3 users: Kwizera (admin), Demo student, Test teacher

import { PrismaClient } from '@prisma/client'
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
    module: 'BEGINNER',
    type: 'VOWEL',
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
        { umwero: '"A"', latin: 'aba', english: 'these' },
        { umwero: '"M"T"', latin: 'amata', english: 'milk' },
        { umwero: '"A"NTU', latin: 'abantu', english: 'people' },
      ],
      practiceWords: ['amazi', 'aba', 'amata', 'abantu'],
    }),
    prerequisites: [],
    isPublished: true,
  },
  {
    id: 'vowel-e',
    title: 'Vowel: E',
    description: 'Learn the Umwero character for "e" - represents air and breath',
    module: 'BEGINNER',
    type: 'VOWEL',
    order: 2,
    duration: 5,
    content: JSON.stringify({
      vowel: 'e',
      umwero: '|',
      pronunciation: '/e/ as in "bed"',
      meaning: 'Represents air and breath',
      culturalNote: 'Air is the breath of life. This simple vertical line represents the invisible but essential force that gives life to all things.',
      examples: [
        { umwero: '|M|', latin: 'eme', english: 'stand' },
        { umwero: 'N|', latin: 'ne', english: 'and' },
        { umwero: '|Z|', latin: 'eze', english: 'king' },
        { umwero: 'T|R|', latin: 'tere', english: 'five' },
      ],
      practiceWords: ['eme', 'ne', 'eze', 'tere'],
    }),
    prerequisites: [],
    isPublished: true,
  },
  {
    id: 'vowel-i',
    title: 'Vowel: I',
    description: 'Learn the Umwero character for "i" - represents water and flow',
    module: 'BEGINNER',
    type: 'VOWEL',
    order: 3,
    duration: 5,
    content: JSON.stringify({
      vowel: 'i',
      umwero: '}',
      pronunciation: '/i/ as in "machine"',
      meaning: 'Represents water and flow',
      culturalNote: 'Water flows and adapts. Like water that flows around obstacles, this vowel teaches us flexibility and continuous movement.',
      examples: [
        { umwero: '}A}', latin: 'ibi', english: 'these things' },
        { umwero: '}N}', latin: 'ini', english: 'liver' },
        { umwero: '}M}G}R{', latin: 'imigiro', english: 'roots' },
        { umwero: '}NT}M}', latin: 'intimi', english: 'friend' },
      ],
      practiceWords: ['ibi', 'ini', 'imigiro', 'intimi'],
    }),
    prerequisites: [],
    isPublished: true,
  },
  {
    id: 'vowel-o',
    title: 'Vowel: O',
    description: 'Learn the Umwero character for "o" - represents spirit and wholeness',
    module: 'BEGINNER',
    type: 'VOWEL',
    order: 4,
    duration: 5,
    content: JSON.stringify({
      vowel: 'o',
      umwero: '{',
      pronunciation: '/o/ as in "note"',
      meaning: 'Represents spirit and wholeness',
      culturalNote: 'The circular form represents unity and completeness. The circle symbolizes eternity and the interconnectedness of all things.',
      examples: [
        { umwero: 'K{K{', latin: 'koko', english: 'chicken' },
        { umwero: 'G{K{', latin: 'goko', english: 'arm' },
        { umwero: '{M{R{', latin: 'omoro', english: 'fire' },
        { umwero: 'A{K{', latin: 'aboko', english: 'arms' },
      ],
      practiceWords: ['koko', 'goko', 'omoro', 'aboko'],
    }),
    prerequisites: [],
    isPublished: true,
  },
  {
    id: 'vowel-u',
    title: 'Vowel: U',
    description: 'Learn the Umwero character for "u" - represents fire and energy',
    module: 'BEGINNER',
    type: 'VOWEL',
    order: 5,
    duration: 5,
    content: JSON.stringify({
      vowel: 'u',
      umwero: ':',
      pronunciation: '/u/ as in "rude"',
      meaning: 'Represents fire and energy',
      culturalNote: 'Fire transforms. It represents the energy and passion needed to achieve great things and bring about positive change.',
      examples: [
        { umwero: ':M:G{', latin: 'umuco', english: 'culture' },
        { umwero: ':A:NT:', latin: 'ubuntu', english: 'humanity' },
        { umwero: ':M:Z}G"', latin: 'umuziga', english: 'circle' },
        { umwero: ':R:W"NT"', latin: 'urwanda', english: 'Rwanda' },
      ],
      practiceWords: ['umuco', 'ubuntu', 'umuziga', 'urwanda'],
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
    password: 'Mugix260',
    fullName: 'Kwizera Mugisha',
    role: 'ADMIN',
    country: 'Rwanda',
    language: 'en',
    bio: 'Creator of Umwero alphabet. Passionate about preserving Kinyarwanda language and culture.',
  },
  {
    email: 'demo@uruziga.com',
    password: 'demo123',
    fullName: 'Demo Student',
    role: 'USER',
    country: 'Rwanda',
    language: 'en',
    bio: 'Demo account for testing the platform.',
  },
  {
    email: 'teacher@uruziga.com',
    password: 'teach123',
    fullName: 'Umwero Teacher',
    role: 'TEACHER',
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

  // Seed Lessons
  console.log('📚 Seeding vowel lessons...')
  for (const lessonData of VOWEL_LESSONS) {
    const lesson = await prisma.lesson.create({
      data: lessonData,
    })
    console.log(`  ✓ ${lesson.title}`)
  }
  console.log(`✅ ${VOWEL_LESSONS.length} lessons created\n`)

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
  console.log('📊 SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  📚 Lessons:      ${VOWEL_LESSONS.length}`)
  console.log(`  🏆 Achievements: ${ACHIEVEMENTS.length}`)
  console.log(`  👥 Users:        ${USERS.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('🚀 Your Neon database is ready!\n')
  console.log('📝 LOGIN CREDENTIALS:\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👑 ADMIN (Platform Owner)')
  console.log('   Email:    37nzela@gmail.com')
  console.log('   Password: Mugix260')
  console.log('   Role:     ADMIN\n')
  console.log('👤 DEMO STUDENT')
  console.log('   Email:    demo@uruziga.com')
  console.log('   Password: demo123')
  console.log('   Role:     USER\n')
  console.log('👨‍🏫 TEST TEACHER')
  console.log('   Email:    teacher@uruziga.com')
  console.log('   Password: teach123')
  console.log('   Role:     TEACHER')
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