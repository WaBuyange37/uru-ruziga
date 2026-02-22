// scripts/test-progress-api.js
// Test the progress submission API directly

const jwt = require('jsonwebtoken')

async function testProgressAPI() {
  try {
    console.log('🧪 Testing Progress Submission API...\n')

    // Check if we have JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not found in environment')
      return
    }

    // Create a test JWT token (using real user ID from database)
    const testUserId = 'cmlwhh9w1000810rf28vaxsoa' // Demo Student user ID
    const testToken = jwt.sign({ userId: testUserId }, process.env.JWT_SECRET)
    
    console.log('🔑 Generated test token for user:', testUserId)

    // Test authentication endpoint
    console.log('🔍 Testing authentication...')
    const authResponse = await fetch('http://localhost:3000/api/debug/auth', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (authResponse.ok) {
      const authData = await authResponse.json()
      console.log('✅ Auth test passed:', authData)
    } else {
      const authError = await authResponse.text()
      console.error('❌ Auth test failed:', authError)
      return
    }

    // Test progress submission
    console.log('\n📊 Testing progress submission...')
    const progressResponse = await fetch('http://localhost:3000/api/progress/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        characterId: 'char-a',
        score: 85,
        timeSpent: 0
      })
    })

    if (progressResponse.ok) {
      const progressData = await progressResponse.json()
      console.log('✅ Progress submission successful:', progressData)
    } else {
      const progressError = await progressResponse.text()
      console.error('❌ Progress submission failed:', {
        status: progressResponse.status,
        statusText: progressResponse.statusText,
        error: progressError
      })
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run test
testProgressAPI()