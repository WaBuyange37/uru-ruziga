const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserProgress() {
  try {
    console.log('🔍 Debugging User Progress Data...\n');
    
    // Check if we can connect to database
    console.log('1. Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. Found ${userCount} users.\n`);
    
    // Check for any user drawings
    console.log('2. Checking user drawings...');
    const drawings = await prisma.userDrawing.findMany({
      select: {
        id: true,
        userId: true,
        vowel: true,
        umweroChar: true,
        aiScore: true,
        isCorrect: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`Found ${drawings.length} drawings:`);
    drawings.forEach((drawing, idx) => {
      console.log(`  ${idx + 1}. ${drawing.user.fullName}: ${drawing.vowel} (${drawing.umweroChar}) - Score: ${drawing.aiScore}% - ${drawing.createdAt.toLocaleDateString()}`);
    });
    console.log('');
    
    // Check lesson progress
    console.log('3. Checking lesson progress...');
    const lessonProgress = await prisma.lessonProgress.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        lesson: {
          select: {
            title: true,
            type: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });
    
    console.log(`Found ${lessonProgress.length} lesson progress records:`);
    lessonProgress.forEach((progress, idx) => {
      console.log(`  ${idx + 1}. ${progress.user.fullName}: ${progress.lesson.title} - Completed: ${progress.completed} - Score: ${progress.score}%`);
    });
    console.log('');
    
    // Check for lessons in database
    console.log('4. Checking available lessons...');
    const lessons = await prisma.lesson.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        type: true
      },
      orderBy: { order: 'asc' },
      take: 10
    });
    
    console.log(`Found ${lessons.length} published lessons:`);
    lessons.forEach((lesson, idx) => {
      console.log(`  ${idx + 1}. ${lesson.title} (${lesson.type})`);
    });
    console.log('');
    
    // If no data, suggest solutions
    if (drawings.length === 0 && lessonProgress.length === 0) {
      console.log('❌ NO PROGRESS DATA FOUND');
      console.log('Possible solutions:');
      console.log('1. User hasn\'t completed any drawing exercises yet');
      console.log('2. Drawing save API is not working properly');
      console.log('3. Authentication issues preventing data save');
      console.log('4. Database connection issues during lesson completion');
    } else {
      console.log('✅ Progress data exists - checking API response...');
    }
    
  } catch (error) {
    console.error('❌ Error debugging progress:', error.message);
    
    if (error.message.includes('Can\'t reach database')) {
      console.log('\n🔧 DATABASE CONNECTION ISSUE:');
      console.log('1. Check if Supabase is running');
      console.log('2. Verify DATABASE_URL in .env file');
      console.log('3. Check network connectivity');
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugUserProgress();