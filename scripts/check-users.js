// scripts/check-users.js
// Check what users exist in the database

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('👥 Checking Users in Database...\n')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      },
      take: 10 // Limit to first 10 users
    })

    if (users.length === 0) {
      console.log('❌ No users found in database')
      return
    }

    console.log(`✅ Found ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.fullName})`)
      console.log(`      ID: ${user.id}`)
      console.log(`      Role: ${user.role}`)
      console.log(`      Created: ${user.createdAt.toISOString().split('T')[0]}`)
      console.log('')
    })

    // Check if any users have progress records
    console.log('📊 Checking existing progress records...')
    const progressRecords = await prisma.userCharacterProgress.findMany({
      include: {
        user: {
          select: { email: true }
        },
        character: {
          select: { latinEquivalent: true, type: true }
        }
      },
      take: 5
    })

    if (progressRecords.length > 0) {
      console.log(`✅ Found ${progressRecords.length} progress records:`)
      progressRecords.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.user.email} - ${record.character.latinEquivalent} (${record.character.type})`)
        console.log(`      Status: ${record.status}, Score: ${record.score}%`)
      })
    } else {
      console.log('❌ No progress records found')
    }

  } catch (error) {
    console.error('❌ Error checking users:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run check
checkUsers()