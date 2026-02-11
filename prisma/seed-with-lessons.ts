// Seed with users and basic lessons
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed with lessons...')

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

  // Create Basic Lessons (5 consonants as mentioned)
  const lessons = [
    {
      code: 'consonant-b',
      type: 'CHARACTER_INTRO',
      difficulty: 1,
      order: 1,
      module: 'Consonants',
      estimatedTime: 15,
      isPublished: true
    },
    {
      code: 'consonant-k',
      type: 'CHARACTER_INTRO',
      difficulty: 1,
      order: 2,
      module: 'Consonants',
      estimatedTime: 15,
      isPublished: true
    },
    {
      code: 'consonant-m',
      type: 'CHARACTER_INTRO',
      difficulty: 1,
      order: 3,
      module: 'Consonants',
      estimatedTime: 15,
      isPublished: true
    },
    {
      code: 'consonant-n',
      type: 'CHARACTER_INTRO',
      difficulty: 1,
      order: 4,
      module: 'Consonants',
      estimatedTime: 15,
      isPublished: true
    },
    {
      code: 'consonant-r',
      type: 'CHARACTER_INTRO',
      difficulty: 1,
      order: 5,
      module: 'Consonants',
      estimatedTime: 15,
      isPublished: true
    }
  ]

  for (const lessonData of lessons) {
    const lesson = await prisma.lesson.create({
      data: lessonData
    })
    console.log(`✓ Created lesson: ${lesson.code}`)
  }

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📋 Summary:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Users: 3 (1 admin, 1 teacher, 1 student)`)
  console.log(`Lessons: ${lessons.length} (all published)`)
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
