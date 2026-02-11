// Simple seed for authentication testing
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing users
  await prisma.user.deleteMany()
  console.log('✓ Cleared existing users')

  // Hash passwords
  const adminPassword = await bcrypt.hash('Mugix260', 12)
  const teacherPassword = await bcrypt.hash('teach123', 12)
  const studentPassword = await bcrypt.hash('demo123', 12)

  // Create Admin User
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

  // Create Teacher User
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

  // Create Student User
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

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:')
  console.log('  Username: kwizera')
  console.log('  Email: 37nzela@gmail.com')
  console.log('  Password: Mugix260')
  console.log('  Role: ADMIN')
  console.log('')
  console.log('Teacher:')
  console.log('  Username: teacher')
  console.log('  Email: teacher@uruziga.com')
  console.log('  Password: teach123')
  console.log('  Role: TEACHER')
  console.log('')
  console.log('Student:')
  console.log('  Username: demo')
  console.log('  Email: demo@uruziga.com')
  console.log('  Password: demo123')
  console.log('  Role: STUDENT')
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
