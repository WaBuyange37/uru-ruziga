// Test login API directly
async function testLogin() {
  try {
    console.log('🧪 Testing login API...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'demo',
        password: 'demo123'
      }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📄 Response data:', data);

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('🎫 Token:', data.token ? 'EXISTS' : 'MISSING');
      console.log('👤 User:', data.user);
    } else {
      console.log('❌ Login failed:', data.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testLogin();