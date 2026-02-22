// scripts/validate-progress.js
// Script to validate progress data in database

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function validateProgress() {
  try {
    console.log('🔍 Validating Progress Data...\n')

    // Get all users with progress
    const usersWithProgress = await prisma.user.findMany({
      where: {
        characterProgress: {
          some: {}
        }
      },
      include: {
        characterProgress: {
          include: {
            character: {
              select: {
                latinEquivalent: true,
                type: true
              }
            }
          }
        }
      }
    })

    console.log(`Found ${usersWithProgress.length} users with progress data\n`)

    for (const user of usersWithProgress) {
      console.log(`👤 User: ${user.email} (ID: ${user.id})`)
      
      const progress = user.characterProgress
      const learned = progress.filter(p => p.status === 'LEARNED')
      const inProgress = progress.filter(p => p.status === 'IN_PROGRESS')
      const notStarted = progress.filter(p => p.status === 'NOT_STARTED')

      console.log(`   📊 Progress Summary:`)
      console.log(`      ✅ Learned: ${learned.length}`)
      console.log(`      🔄 In Progress: ${inProgress.length}`)
      console.log(`      ⏸️  Not Started: ${notStarted.length}`)
      console.log(`      📈 Total: ${progress.length}`)

      // Show learned characters
      if (learned.length > 0) {
        console.log(`   🎯 Learned Characters:`)
        learned.forEach(p => {
          console.log(`      - ${p.character.latinEquivalent} (${p.character.type}) - Score: ${p.score}%`)
        })
      }

      // Validate data integrity
      const invalidScores = progress.filter(p => p.score < 0 || p.score > 100)
      const learnedWithLowScores = learned.filter(p => p.score < 70)
      
      if (invalidScores.length > 0) {
        console.log(`   ⚠️  Invalid scores found: ${invalidScores.length}`)
      }
      
      if (learnedWithLowScores.length > 0) {
        console.log(`   ⚠️  Learned characters with score < 70: ${learnedWithLowScores.length}`)
      }

      console.log('')
    }

    // Character type breakdown
    console.log('📈 Character Type Breakdown:')
    const characterCounts = await prisma.character.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { id: true }
    })

    for (const count of characterCounts) {
      console.log(`   ${count.type}: ${count._count.id} characters`)
    }

    console.log('\n✅ Validation Complete!')

  } catch (error) {
    console.error('❌ Validation Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run validation
validateProgress()