// Seed script using direct URL to bypass connection pooling issues
const { execSync } = require('child_process');
const fs = require('fs');

// Read the current .env file
const envContent = fs.readFileSync('.env', 'utf8');

// Extract DIRECT_URL
const directUrlMatch = envContent.match(/DIRECT_URL="([^"]+)"/);
if (!directUrlMatch) {
  console.error('❌ DIRECT_URL not found in .env file');
  process.exit(1);
}

const directUrl = directUrlMatch[1];
console.log('🔍 Using DIRECT_URL for seeding...');

// Set DATABASE_URL to DIRECT_URL and run seed
process.env.DATABASE_URL = directUrl;

try {
  console.log('🌱 Starting seed with direct connection...');
  execSync('npx prisma db seed', { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: directUrl }
  });
  console.log('✅ Seeding completed successfully!');
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}