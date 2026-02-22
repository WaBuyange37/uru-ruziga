const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    console.log('🔍 Verifying Seed Data...');
    try {
        const userCount = await prisma.user.count();
        const lessonCount = await prisma.lesson.count();
        const characterCount = await prisma.character.count();
        const languageCount = await prisma.language.count();

        console.log(`✅ Users: ${userCount}`);
        console.log(`✅ Lessons: ${lessonCount}`);
        console.log(`✅ Characters: ${characterCount}`);
        console.log(`✅ Languages: ${languageCount}`);

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
