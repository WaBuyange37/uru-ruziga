// Verify connection string format
require('dotenv').config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL;
console.log('Database URL:', dbUrl);

// Parse the connection string
if (dbUrl) {
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (match) {
    const [, user, password, host, port, database] = match;
    console.log('User:', user);
    console.log('Password:', password ? '[SET]' : '[MISSING]');
    console.log('Host:', host);
    console.log('Port:', port);
    console.log('Database:', database);
    
    // Check if password is placeholder
    if (password.includes('[YOUR-PASSWORD]') || password === 'undefined') {
      console.log('❌ ERROR: Password is not set correctly!');
    } else {
      console.log('✅ Connection string format looks correct');
    }
  } else {
    console.log('❌ ERROR: Invalid connection string format');
  }
} else {
  console.log('❌ ERROR: DATABASE_URL not found');
}
