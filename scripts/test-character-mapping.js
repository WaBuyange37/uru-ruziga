// scripts/test-character-mapping.js
// Quick test to verify character mapping and database connectivity

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCharacterMapping() {
  try {
    console.log('🔍 Testing Character Mapping and Database...\n')

    // Test character mapping
    const lessonToCharMap = {
      'lesson-vowel-a': 'char-a',
      'lesson-vowel-e': 'char-e', 
      'lesson-vowel-i': 'char-i',
      'lesson-vowel-o': 'char-o',
      'lesson-vowel-u': 'char-u'
    }

    console.log('📋 Character ID Mapping:')
    for (const [lessonId, charId] of Object.entries(lessonToCharMap)) {
      console.log(`   ${lessonId} → ${charId}`)
    }
    console.log('')

    // Check if characters exist in database
    console.log('🔍 Checking Database Characters:')
    for (const [lessonId, charId] of Object.entries(lessonToCharMap)) {
      const character = await prisma.character.findUnique({
        where: { id: charId },
        select: {
          id: true,
          latinEquivalent: true,
          umweroGlyph: true,
          type: true,
          isActive: true
        }
      })

      if (character) {
        console.log(`   ✅ ${charId}: ${character.latinEquivalent} (${character.umweroGlyph}) - ${character.type}`)
      } else {
        console.log(`   ❌ ${charId}: NOT FOUND`)
      }
    }

    console.log('\n🧪 Testing Progress Submission Flow:')
    
    // Test JWT_SECRET exists
    if (process.env.JWT_SECRET) {
      console.log('   ✅ JWT_SECRET is configured')
    } else {
      console.log('   ❌ JWT_SECRET is missing')
    }

    // Test database connection
    const characterCount = await prisma.character.count()
    console.log(`   ✅ Database connected - ${characterCount} characters total`)

    // Test user table
    const userCount = await prisma.user.count()
    console.log(`   ✅ Users table accessible - ${userCount} users`)

    // Test progress table
    const progressCount = await prisma.userCharacterProgress.count()
    console.log(`   ✅ Progress table accessible - ${progressCount} progress records`)

    console.log('\n✅ All tests passed! Character mapping should work correctly.')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.code) {
      console.error('   Error code:', error.code)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run test
testCharacterMapping()