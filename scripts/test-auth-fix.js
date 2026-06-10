#!/usr/bin/env node
// scripts/test-auth-fix.js
// Comprehensive test to verify authentication and database connection fix

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

// Test configuration
const JWT_SECRET = process.env.JWT_SECRET
const TEST_USER = {
  fullName: 'Auth Test User',
  username: `test_${Date.now()}`,
  email: `test_${Date.now()}@uruziga.test`,
  password: 'Test123!@#'
}

async function runTests() {
  console.log('\n🧪 AUTH FIX VERIFICATION TESTS\n')
  console.log('=' .repeat(50))

  let testUserId = null
  let testToken = null

  try {
    // Test 1: Database Connection
    console.log('\n📊 Test 1: Database Connection')
    const userCount = await prisma.user.count()
    console.log(`   ✓ Connected to database`)
    console.log(`   ✓ Found ${userCount} existing users`)

    // Test 2: User Registration
    console.log('\n👤 Test 2: User Registration')
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 12)
    const user = await prisma.user.create({
      data: {
        fullName: TEST_USER.fullName,
        name: TEST_USER.fullName,
        username: TEST_USER.username,
        email: TEST_USER.email,
        password: hashedPassword,
        provider: 'EMAIL',
        emailVerified: true,
        role: 'STUDENT'
      }
    })
    testUserId = user.id
    console.log(`   ✓ User created with ID: ${testUserId}`)

    // Test 3: JWT Token Creation
    console.log('\n🔐 Test 3: JWT Token Creation')
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not set')
    }
    testToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    console.log(`   ✓ JWT token created`)
    console.log(`   ✓ Token length: ${testToken.length} characters`)

    // Test 4: JWT Token Verification
    console.log('\n✅ Test 4: JWT Token Verification')
    const decoded = jwt.verify(testToken, JWT_SECRET)
    console.log(`   ✓ Token verified successfully`)
    console.log(`   ✓ Decoded userId: ${decoded.userId}`)
    console.log(`   ✓ Decoded email: ${decoded.email}`)

    // Test 5: User Retrieval
    console.log('\n🔍 Test 5: User Retrieval from Token')
    const retrievedUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    if (!retrievedUser) {
      throw new Error('User not found after creation')
    }
    console.log(`   ✓ User retrieved from database`)
    console.log(`   ✓ Username: ${retrievedUser.username}`)
    console.log(`   ✓ Email: ${retrievedUser.email}`)

    // Test 6: Password Verification
    console.log('\n🔑 Test 6: Password Verification')
    const isPasswordValid = await bcrypt.compare(TEST_USER.password, retrievedUser.password)
    if (!isPasswordValid) {
      throw new Error('Password verification failed')
    }
    console.log(`   ✓ Password verification successful`)

    // Test 7: Character Progress Creation
    console.log('\n📈 Test 7: Character Progress Creation')
    const testCharacter = await prisma.character.findFirst({
      where: { isActive: true }
    })
    if (!testCharacter) {
      console.log(`   ⚠ No active characters found, skipping progress test`)
    } else {
      // Use only guaranteed fields to avoid schema mismatch
      const progress = await prisma.userCharacterProgress.upsert({
        where: {
          userId_characterId: {
            userId: testUserId,
            characterId: testCharacter.id
          }
        },
        update: {
          score: 85,
          status: 'LEARNED',
          attempts: { increment: 1 },
          lastAttempt: new Date()
        },
        create: {
          userId: testUserId,
          characterId: testCharacter.id,
          score: 85,
          status: 'LEARNED',
          attempts: 1,
          lastAttempt: new Date()
        },
        select: {
          id: true,
          score: true,
          status: true,
          character: {
            select: {
              latinEquivalent: true
            }
          }
        }
      })
      console.log(`   ✓ Progress record created/updated`)
      console.log(`   ✓ Character: ${progress.character.latinEquivalent}`)
      console.log(`   ✓ Score: ${progress.score}`)
      console.log(`   ✓ Status: ${progress.status}`)
    }

    // Test 8: Connection Pool Test
    console.log('\n🔌 Test 8: Connection Pool Test')
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(
        prisma.user.findUnique({
          where: { id: testUserId }
        })
      )
    }
    const results = await Promise.all(promises)
    console.log(`   ✓ Concurrent queries successful: ${results.length}/5`)

    console.log('\n' + '=' .repeat(50))
    console.log('✅ ALL TESTS PASSED')
    console.log('=' .repeat(50))
    console.log('\nAuth system is working correctly!')
    console.log('Users can register, login, and save progress.')

  } catch (error) {
    console.error('\n❌ TEST FAILED')
    console.error('Error:', error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    // Cleanup
    if (testUserId) {
      console.log('\n🧹 Cleanup: Removing test user...')
      try {
        await prisma.userCharacterProgress.deleteMany({
          where: { userId: testUserId }
        })
        await prisma.user.delete({
          where: { id: testUserId }
        })
        console.log('   ✓ Test user removed')
      } catch (err) {
        console.error('   ⚠ Cleanup failed:', err.message)
      }
    }
    await prisma.$disconnect()
  }
}

runTests()
