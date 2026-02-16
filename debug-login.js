// Debug script to test login functionality
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function debugLogin() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. Found ${userCount} users.`);
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        password: true
      }
    });
    
    console.log('\n📋 All users in database:');
    users.forEach(user => {
      console.log(`  • ${user.fullName} (${user.username}) - ${user.email}`);
      console.log(`    Password hash: ${user.password ? 'EXISTS' : 'MISSING'}`);
    });
    
    // Test login with demo user
    console.log('\n🔐 Testing login with demo user...');
    const testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'demo' },
          { email: 'demo@uruziga.com' }
        ]
      }
    });
    
    if (!testUser) {
      console.log('❌ Demo user not found!');
      return;
    }
    
    console.log(`✅ Found user: ${testUser.fullName}`);
    
    // Test password verification
    if (!testUser.password) {
      console.log('❌ User has no password!');
      return;
    }
    
    const isValidPassword = await bcrypt.compare('demo123', testUser.password);
    console.log(`🔑 Password verification: ${isValidPassword ? 'SUCCESS' : 'FAILED'}`);
    
    if (!isValidPassword) {
      // Try to hash the password and compare
      const hashedPassword = await bcrypt.hash('demo123', 10);
      console.log(`🔧 New hash for 'demo123': ${hashedPassword}`);
      
      // Update the user with correct password
      await prisma.user.update({
        where: { id: testUser.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Updated demo user password');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();