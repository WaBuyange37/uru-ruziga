// Seed with users and rich lesson content
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ============================================
// VOWEL LESSONS WITH RICH CONTENT
// ============================================
const VOWEL_LESSONS = [
  {
    code: 'vowel-a',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 1,
    module: 'Vowels',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
  {
    code: 'vowel-u',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 2,
    module: 'Vowels',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
  {
    code: 'vowel-o',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 3,
    module: 'Vowels',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
  {
    code: 'vowel-e',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 4,
    module: 'Vowels',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
  {
    code: 'vowel-i',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 5,
    module: 'Vowels',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
]

// ============================================
// CONSONANT LESSONS
// ============================================
const CONSONANT_LESSONS = [
  {
    code: 'consonant-b',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 6,
    module: 'Consonants',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
  {
    code: 'consonant-k',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 7,
    module: 'Consonants',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
  {
    code: 'consonant-m',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 8,
    module: 'Consonants',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
  {
    code: 'consonant-n',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 9,
    module: 'Consonants',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
  {
    code: 'consonant-r',
    type: 'CHARACTER_INTRO' as const,
    difficulty: 1,
    order: 10,
    module: 'Consonants',
    estimatedTime: 5,
    isPublished: true,
    prerequisiteIds: [],
  },
]

async function main() {
  console.log('🌱 Starting database seed with rich lesson content...')

  // Clear existing data
  await prisma.lesson.deleteMany()
  await prisma.user.deleteMany()
  console.log('✓ Cleared existing data')

  // Hash passwords
  const adminPassword = await bcrypt.hash('Mugix260', 12)
  const teacherPassword = await bcrypt.hash('teach123', 12)
  const studentPassword = await bcrypt.hash('demo123', 12)

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: '37nzela@gmail.com',
      name: 'Kwizera Admin',
      fullName: 'Kwizera Admin',
      username: 'kwizera',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      provider: 'EMAIL',
      countryCode: 'RW',
    }
  })
  console.log('✓ Created admin user:', admin.username)

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@uruziga.com',
      name: 'Teacher Account',
      fullName: 'Teacher Account',
      username: 'teacher',
      password: teacherPassword,
      role: 'TEACHER',
      emailVerified: true,
      provider: 'EMAIL',
      countryCode: 'RW',
    }
  })
  console.log('✓ Created teacher user:', teacher.username)

  const student = await prisma.user.create({
    data: {
      email: 'demo@uruziga.com',
      name: 'Demo Student',
      fullName: 'Demo Student',
      username: 'demo',
      password: studentPassword,
      role: 'STUDENT',
      emailVerified: true,
      provider: 'EMAIL',
      countryCode: 'RW',
    }
  })
  console.log('✓ Created student user:', student.username)

  // Create Vowel Lessons
  console.log('\n📚 Creating vowel lessons...')
  for (const lessonData of VOWEL_LESSONS) {
    const lesson = await prisma.lesson.create({
      data: lessonData
    })
    console.log(`  ✓ ${lesson.code}`)
  }

  // Create Consonant Lessons
  console.log('\n📝 Creating consonant lessons...')
  for (const lessonData of CONSONANT_LESSONS) {
    const lesson = await prisma.lesson.create({
      data: lessonData
    })
    console.log(`  ✓ ${lesson.code}`)
  }

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📋 Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Users: 3 (1 admin, 1 teacher, 1 student)`)
  console.log(`Vowel Lessons: ${VOWEL_LESSONS.length}`)
  console.log(`Consonant Lessons: ${CONSONANT_LESSONS.length}`)
  console.log(`Total Lessons: ${VOWEL_LESSONS.length + CONSONANT_LESSONS.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n👥 Test Accounts:')
  console.log('Admin: kwizera / Mugix260')
  console.log('Teacher: teacher / teach123')
  console.log('Student: demo / demo123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
