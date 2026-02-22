#!/usr/bin/env node

// scripts/debug-production-auth.js
// Debug authentication issues on production site

console.log('🔍 PRODUCTION AUTHENTICATION DEBUG')
console.log('==================================')

const PRODUCTION_URL = 'https://uruziga.netlify.app'

async function testAuthEndpoints() {
  console.log('\n1️⃣ Testing Registration Endpoint...')
  
  try {
    const testUser = {
      fullName: 'Test User',
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'testpass123'
    }

    const registerResponse = await fetch(`${PRODUCTION_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    })

    console.log('Register Response Status:', registerResponse.status)
    console.log('Register Response Headers:', Object.fromEntries(registerResponse.headers.entries()))
    
    const registerText = await registerResponse.text()
    console.log('Register Response Body:', registerText)

    if (registerResponse.ok) {
      const registerData = JSON.parse(registerText)
      console.log('✅ Registration successful!')
      
      // Test login with the same credentials
      console.log('\n2️⃣ Testing Login Endpoint...')
      
      const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: testUser.email,
          password: testUser.password
        })
      })

      console.log('Login Response Status:', loginResponse.status)
      const loginText = await loginResponse.text()
      console.log('Login Response Body:', loginText)

      if (loginResponse.ok) {
        console.log('✅ Login successful!')
      } else {
        console.log('❌ Login failed!')
      }
    } else {
      console.log('❌ Registration failed!')
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message)
  }
}

async function testDatabaseConnection() {
  console.log('\n3️⃣ Testing Database Connection...')
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/debug/auth`, {
      method: 'GET'
    })

    console.log('DB Test Response Status:', response.status)
    const text = await response.text()
    console.log('DB Test Response:', text)

  } catch (error) {
    console.error('❌ Database test error:', error.message)
  }
}

async function testEnvironmentVariables() {
  console.log('\n4️⃣ Testing Environment Variables...')
  
  // Test if API routes are accessible
  try {
    const response = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    })

    if (response.status === 400) {
      console.log('✅ API route accessible (expected 400 for empty body)')
    } else if (response.status === 500) {
      console.log('❌ Server error - likely environment variable issue')
      const text = await response.text()
      console.log('Error details:', text)
    } else {
      console.log('⚠️ Unexpected status:', response.status)
    }

  } catch (error) {
    console.error('❌ API route test error:', error.message)
  }
}

async function runDiagnostics() {
  console.log(`\n🎯 Testing production site: ${PRODUCTION_URL}`)
  
  await testEnvironmentVariables()
  await testDatabaseConnection()
  await testAuthEndpoints()
  
  console.log('\n📋 COMMON PRODUCTION AUTH ISSUES:')
  console.log('1. Missing environment variables in Netlify')
  console.log('2. Database connection string incorrect')
  console.log('3. JWT_SECRET not set')
  console.log('4. CORS issues with API routes')
  console.log('5. Prisma client not generated properly')
  
  console.log('\n🔧 NEXT STEPS:')
  console.log('1. Check Netlify environment variables')
  console.log('2. Verify DATABASE_URL is correct')
  console.log('3. Check Netlify function logs')
  console.log('4. Test API routes directly')
}

runDiagnostics().catch(console.error)