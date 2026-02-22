// Copy and paste this into your browser console to test the API directly
// This version avoids variable conflicts

(async function testProgressAPI() {
  console.log('🧪 Testing Progress API from Browser Console...')

  // Test 1: Check if token exists
  const authToken = localStorage.getItem('token')
  console.log('Token exists:', !!authToken)
  console.log('Token length:', authToken?.length)

  if (!authToken) {
    console.error('❌ No token found. Please login first.')
    return
  }

  try {
    // Test 2: Test authentication
    console.log('🔑 Testing authentication...')
    const authResponse = await fetch('/api/debug/auth', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Auth response status:', authResponse.status)
    const authData = await authResponse.json()
    console.log('✅ Auth test result:', authData)
    
    if (!authData.success) {
      console.error('❌ Authentication failed:', authData)
      return
    }
    
    // Test 3: Test progress submission
    console.log('📊 Testing progress submission...')
    const progressResponse = await fetch('/api/progress/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        characterId: 'char-a',
        score: 85,
        timeSpent: 0
      })
    })
    
    console.log('Progress response status:', progressResponse.status)
    const progressData = await progressResponse.json()
    console.log('✅ Progress test result:', progressData)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
})();