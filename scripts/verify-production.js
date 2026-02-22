#!/usr/bin/env node

// scripts/verify-production.js
// Verify production deployment is working

const https = require('https')
const http = require('http')

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const success = res.statusCode >= 200 && res.statusCode < 400
        console.log(`${success ? '✅' : '❌'} ${description}: ${res.statusCode}`)
        if (!success) {
          console.log(`   Response: ${data.substring(0, 200)}...`)
        }
        resolve(success)
      })
    })
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`)
      resolve(false)
    })
    
    req.setTimeout(10000, () => {
      console.log(`❌ ${description}: Timeout`)
      req.destroy()
      resolve(false)
    })
  })
}

async function verifyProduction() {
  console.log('🔍 PRODUCTION DEPLOYMENT VERIFICATION')
  console.log('====================================')
  
  // Get production URL from user
  const productionUrl = process.argv[2] || 'https://your-site.netlify.app'
  
  if (productionUrl === 'https://your-site.netlify.app') {
    console.log('❌ Please provide your production URL:')
    console.log('   node scripts/verify-production.js https://your-actual-site.com')
    return
  }
  
  console.log(`🎯 Testing: ${productionUrl}`)
  console.log('')
  
  const tests = [
    [`${productionUrl}`, 'Homepage loads'],
    [`${productionUrl}/learn`, 'Learn page loads'],
    [`${productionUrl}/api/debug/auth`, 'Debug auth endpoint'],
    [`${productionUrl}/api/progress/summary`, 'Progress summary API'],
    [`${productionUrl}/login`, 'Login page loads'],
    [`${productionUrl}/dashboard`, 'Dashboard loads']
  ]
  
  let passed = 0
  let total = tests.length
  
  for (const [url, description] of tests) {
    const success = await testEndpoint(url, description)
    if (success) passed++
    await new Promise(resolve => setTimeout(resolve, 500)) // Rate limiting
  }
  
  console.log('')
  console.log('📊 RESULTS')
  console.log('==========')
  console.log(`Passed: ${passed}/${total}`)
  console.log(`Success Rate: ${Math.round((passed/total) * 100)}%`)
  
  if (passed === total) {
    console.log('')
    console.log('🎉 ALL TESTS PASSED!')
    console.log('Production deployment is working correctly.')
  } else {
    console.log('')
    console.log('🚨 SOME TESTS FAILED')
    console.log('Check deployment logs and environment variables.')
    console.log('')
    console.log('Common fixes:')
    console.log('1. Redeploy with cache cleared')
    console.log('2. Verify all environment variables are set')
    console.log('3. Check database connection')
    console.log('4. Run database migrations')
  }
}

verifyProduction().catch(console.error)