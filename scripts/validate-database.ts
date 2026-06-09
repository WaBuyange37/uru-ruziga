#!/usr/bin/env tsx
/**
 * Database Validation Script
 *
 * Validates the complete database setup:
 * - Connection
 * - Schema integrity
 * - Seed data
 * - Relationships
 * - Indexes
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

async function validate() {
  console.log('🔍 Uruziga Database Validation\n');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[1] || 'unknown');
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CONNECTION TEST
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('1️⃣  Testing database connection...');
  try {
    await prisma.$connect();
    results.push({
      name: 'Database Connection',
      passed: true,
      message: 'Successfully connected to database'
    });
    console.log('   ✅ Connected\n');
  } catch (e: any) {
    results.push({
      name: 'Database Connection',
      passed: false,
      message: `Failed to connect: ${e.message}`
    });
    console.log('   ❌ Connection failed\n');
    await printResults();
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. TABLE EXISTENCE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('2️⃣  Checking table existence...');
  const expectedTables = [
    'languages', 'characters', 'character_translations', 'stroke_data',
    'cultural_contexts', 'cultural_context_translations', 'context_examples',
    'lessons', 'lesson_translations', 'lesson_steps', 'step_translations',
    'lesson_progress', 'user_attempts', 'achievements', 'user_achievements',
    'users', 'user_character_progress', 'handwriting_attempts', 'character_references',
    'community_entries', 'dataset_entries', 'certificates', 'discussions',
    'discussion_likes', 'comments', 'carts', 'cart_items', 'orders', 'donations',
    'user_drawings', 'community_posts', 'post_likes', 'post_comments',
    'chat_messages', 'training_data', 'quizzes', 'quiz_attempts',
    'activity_logs', 'performance_metrics', 'evaluation_sessions'
  ];

  try {
    const tableCheck = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `;
    const existingTables = tableCheck.map(t => t.tablename);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      results.push({
        name: 'Table Existence',
        passed: true,
        message: `All ${expectedTables.length} tables exist`,
        details: { total: expectedTables.length }
      });
      console.log(`   ✅ All ${expectedTables.length} tables exist\n`);
    } else {
      results.push({
        name: 'Table Existence',
        passed: false,
        message: `Missing ${missingTables.length} tables`,
        details: { missing: missingTables }
      });
      console.log(`   ❌ Missing tables: ${missingTables.join(', ')}\n`);
    }
  } catch (e: any) {
    results.push({
      name: 'Table Existence',
      passed: false,
      message: `Failed to check tables: ${e.message}`
    });
    console.log('   ❌ Failed to check tables\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SEED DATA VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('3️⃣  Validating seed data...');

  try {
    const [languageCount, characterCount, lessonCount, achievementCount, userCount] = await Promise.all([
      prisma.language.count(),
      prisma.character.count(),
      prisma.lesson.count(),
      prisma.achievement.count(),
      prisma.user.count()
    ]);

    const seedValidation = {
      languages: { expected: 3, actual: languageCount, passed: languageCount >= 3 },
      characters: { expected: 95, actual: characterCount, passed: characterCount >= 95 },
      lessons: { expected: 94, actual: lessonCount, passed: lessonCount >= 94 },
      achievements: { expected: 4, actual: achievementCount, passed: achievementCount >= 4 },
      users: { expected: 3, actual: userCount, passed: userCount >= 3 }
    };

    const allPassed = Object.values(seedValidation).every(v => v.passed);

    results.push({
      name: 'Seed Data',
      passed: allPassed,
      message: allPassed ? 'All seed data present' : 'Some seed data missing',
      details: seedValidation
    });

    console.log(`   Languages:    ${languageCount} ${seedValidation.languages.passed ? '✅' : '❌'}`);
    console.log(`   Characters:   ${characterCount} ${seedValidation.characters.passed ? '✅' : '❌'}`);
    console.log(`   Lessons:      ${lessonCount} ${seedValidation.lessons.passed ? '✅' : '❌'}`);
    console.log(`   Achievements: ${achievementCount} ${seedValidation.achievements.passed ? '✅' : '❌'}`);
    console.log(`   Users:        ${userCount} ${seedValidation.users.passed ? '✅' : '❌'}\n`);
  } catch (e: any) {
    results.push({
      name: 'Seed Data',
      passed: false,
      message: `Failed to validate seed data: ${e.message}`
    });
    console.log('   ❌ Failed to validate seed data\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. RELATIONSHIP INTEGRITY
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('4️⃣  Checking relationship integrity...');

  try {
    // Check if characters have translations
    const charactersWithTranslations = await prisma.character.findMany({
      include: { translations: true },
      take: 5
    });

    // Check if lessons have characters
    const lessonsWithCharacters = await prisma.lesson.findMany({
      where: { characterId: { not: null } },
      take: 5
    });

    // Check if users exist for progress tracking
    const usersWithProgress = await prisma.user.findMany({
      include: { progress: true },
      take: 3
    });

    const relationshipChecks = {
      characterTranslations: charactersWithTranslations.length > 0,
      lessonCharacters: lessonsWithCharacters.length > 0,
      userProgress: usersWithProgress.length > 0
    };

    const allPassed = Object.values(relationshipChecks).every(v => v);

    results.push({
      name: 'Relationship Integrity',
      passed: allPassed,
      message: allPassed ? 'All relationships valid' : 'Some relationships missing',
      details: relationshipChecks
    });

    console.log(`   Character Translations: ${relationshipChecks.characterTranslations ? '✅' : '❌'}`);
    console.log(`   Lesson Characters:      ${relationshipChecks.lessonCharacters ? '✅' : '❌'}`);
    console.log(`   User Progress:          ${relationshipChecks.userProgress ? '✅' : '❌'}\n`);
  } catch (e: any) {
    results.push({
      name: 'Relationship Integrity',
      passed: false,
      message: `Failed to check relationships: ${e.message}`
    });
    console.log('   ❌ Failed to check relationships\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. INDEX VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('5️⃣  Checking indexes...');

  try {
    const indexes = await prisma.$queryRaw<Array<{ indexname: string, tablename: string }>>`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;

    const indexCount = indexes.length;
    const uniqueIndexes = indexes.filter(i => i.indexname.includes('_key'));
    const regularIndexes = indexes.filter(i => !i.indexname.includes('_key') && !i.indexname.includes('_pkey'));

    results.push({
      name: 'Index Validation',
      passed: indexCount > 0,
      message: `Found ${indexCount} indexes`,
      details: {
        total: indexCount,
        unique: uniqueIndexes.length,
        regular: regularIndexes.length
      }
    });

    console.log(`   Total Indexes:  ${indexCount} ✅`);
    console.log(`   Unique Indexes: ${uniqueIndexes.length}`);
    console.log(`   Regular Indexes: ${regularIndexes.length}\n`);
  } catch (e: any) {
    results.push({
      name: 'Index Validation',
      passed: false,
      message: `Failed to check indexes: ${e.message}`
    });
    console.log('   ❌ Failed to check indexes\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. ENUM VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('6️⃣  Checking enums...');

  try {
    const enums = await prisma.$queryRaw<Array<{ typname: string }>>`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
      ORDER BY typname;
    `;

    const expectedEnums = [
      'AchievementCategory', 'AttemptType', 'AuthProvider', 'CharacterProgressStatus',
      'CharacterType', 'ContextType', 'DataSourceType', 'LessonModule', 'LessonType',
      'ProgressStatus', 'Role', 'StepType', 'StrokeDirection'
    ];

    const existingEnums = enums.map(e => e.typname);
    const missingEnums = expectedEnums.filter(e => !existingEnums.includes(e));

    results.push({
      name: 'Enum Validation',
      passed: missingEnums.length === 0,
      message: missingEnums.length === 0 ? `All ${expectedEnums.length} enums exist` : `Missing ${missingEnums.length} enums`,
      details: { expected: expectedEnums.length, actual: existingEnums.length, missing: missingEnums }
    });

    console.log(`   Total Enums: ${existingEnums.length}/${expectedEnums.length} ${missingEnums.length === 0 ? '✅' : '❌'}`);
    if (missingEnums.length > 0) {
      console.log(`   Missing: ${missingEnums.join(', ')}`);
    }
    console.log('');
  } catch (e: any) {
    results.push({
      name: 'Enum Validation',
      passed: false,
      message: `Failed to check enums: ${e.message}`
    });
    console.log('   ❌ Failed to check enums\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRINT RESULTS
  // ═══════════════════════════════════════════════════════════════════════════
  await printResults();
}

async function printResults() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 VALIDATION RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2));
    }
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`SUMMARY: ${passed}/${total} checks passed, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) {
    console.log('❌ Database validation failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('✅ Database validation passed! Your database is ready to use.');
    process.exit(0);
  }
}

validate()
  .catch((e) => {
    console.error('❌ Validation error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
