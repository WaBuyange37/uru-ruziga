const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLessons() {
  try {
    console.log('🔍 Checking lessons in database...\n');
    
    const vowels = await prisma.lesson.findMany({
      where: { type: 'VOWEL' },
      select: { id: true, title: true, type: true, isPublished: true }
    });
    
    const consonants = await prisma.lesson.findMany({
      where: { type: 'CONSONANT' },
      select: { id: true, title: true, type: true, isPublished: true }
    });
    
    const ligatures = await prisma.lesson.findMany({
      where: { type: 'LIGATURE' },
      select: { id: true, title: true, type: true, isPublished: true }
    });
    
    console.log(`📊 LESSON COUNT:`);
    console.log(`Vowels: ${vowels.length}`);
    console.log(`Consonants: ${consonants.length}`);
    console.log(`Ligatures: ${ligatures.length}`);
    console.log(`Total: ${vowels.length + consonants.length + ligatures.length}\n`);
    
    if (vowels.length > 0) {
      console.log('📝 Sample Vowels:');
      vowels.slice(0, 3).forEach(v => console.log(`  - ${v.title} (${v.type})`));
    }
    
    if (consonants.length > 0) {
      console.log('📝 Sample Consonants:');
      consonants.slice(0, 3).forEach(c => console.log(`  - ${c.title} (${c.type})`));
    }
    
    if (ligatures.length > 0) {
      console.log('📝 Sample Ligatures:');
      ligatures.slice(0, 3).forEach(l => console.log(`  - ${l.title} (${l.type})`));
    }
    
    if (vowels.length === 0 && consonants.length === 0 && ligatures.length === 0) {
      console.log('❌ NO LESSONS FOUND - Database needs to be seeded!');
      console.log('Run: npx prisma db seed');
    }
    
  } catch (error) {
    console.error('❌ Error checking lessons:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLessons();