// Copy and paste this into your browser console to test the API directly

console.log('🧪 Testing Progress API from Browser Console...')

// Test 1: Check if token exists
const token = localStorage.getItem('token')
console.log('Token exists:', !!token)
console.log('Token length:', token?.length)

if (!token) {
  console.error('❌ No token found. Please login first.')
} else {
  // Test 2: Test authentication
  console.log('🔑 Testing authentication...')
  fetch('/api/debug/auth', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Auth response status:', response.status)
    return response.json()
  })
  .then(data => {
    console.log('✅ Auth test result:', data)
    
    if (data.success) {
      // Test 3: Test progress submission
      console.log('📊 Testing progress submission...')
      return fetch('/api/progress/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          characterId: 'char-a',
          score: 85,
          timeSpent: 0
        })
      })
    } else {
      throw new Error('Authentication failed')
    }
  })
  .then(response => {
    console.log('Progress response status:', response.status)
    return response.json()
  })
  .then(data => {
    console.log('✅ Progress test result:', data)
  })
  .catch(error => {
    console.error('❌ Test failed:', error)
  })
}