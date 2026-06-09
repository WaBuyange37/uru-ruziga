/**
 * Verification Script for Adaptive Learning System Migration
 * 
 * This script verifies that all schema changes for the adaptive learning
 * system have been applied correctly to the database.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  check: string;
  passed: boolean;
  details?: string;
}

async function verifyMigration(): Promise<void> {
  const results: VerificationResult[] = [];

  console.log('🔍 Verifying Adaptive Learning System Migration...\n');

  try {
    // Check 1: Verify learning_stages table exists
    console.log('1️⃣  Checking learning_stages table...');
    try {
      const stagesCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'learning_stages'
      `;
      const exists = Number(stagesCount[0].count) > 0;
      results.push({
        check: 'learning_stages table exists',
        passed: exists,
        details: exists ? 'Table found' : 'Table not found'
      });
    } catch (error) {
      results.push({
        check: 'learning_stages table exists',
        passed: false,
        details: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    }

    // Check 2: Verify lesson_progress columns
    console.log('2️⃣  Checking lesson_progress columns...');
    const lessonProgressColumns = [
      'currentStage',
      'stageCompletionData',
      'timeSpentPerStage',
      'journeyPhase',
      'journeyStartedAt',
      'journeyPausedAt',
      'journeyCompletedAt'
    ];

    for (const column of lessonProgressColumns) {
      try {
        const columnExists = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM information_schema.columns 
          WHERE table_name = 'lesson_progress' AND column_name = ${column}
        `;
        const exists = Number(columnExists[0].count) > 0;
        results.push({
          check: `lesson_progress.${column}`,
          passed: exists,
          details: exists ? 'Column found' : 'Column not found'
        });
      } catch (error) {
        results.push({
          check: `lesson_progress.${column}`,
          passed: false,
          details: `Error: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    // Check 3: Verify user_character_progress columns
    console.log('3️⃣  Checking user_character_progress columns...');
    const userCharProgressColumns = [
      'masteryScore',
      'accuracyRate',
      'confidenceScore',
      'completionStatus',
      'currentStage',
      'completedStages',
      'stageScores',
      'stageAttempts',
      'journeyPhase',
      'completedPhases'
    ];

    for (const column of userCharProgressColumns) {
      try {
        const columnExists = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM information_schema.columns 
          WHERE table_name = 'user_character_progress' AND column_name = ${column}
        `;
        const exists = Number(columnExists[0].count) > 0;
        results.push({
          check: `user_character_progress.${column}`,
          passed: exists,
          details: exists ? 'Column found' : 'Column not found'
        });
      } catch (error) {
        results.push({
          check: `user_character_progress.${column}`,
          passed: false,
          details: `Error: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    // Check 4: Verify user_attempts columns
    console.log('4️⃣  Checking user_attempts columns...');
    const userAttemptsColumns = [
      'learningStage',
      'journeyPhase',
      'shapeAccuracy',
      'strokeOrder',
      'strokeDirection',
      'strokeConsistency',
      'sizeBalance',
      'spacing',
      'feedbackType',
      'visualOverlay',
      'improvementSteps'
    ];

    for (const column of userAttemptsColumns) {
      try {
        const columnExists = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM information_schema.columns 
          WHERE table_name = 'user_attempts' AND column_name = ${column}
        `;
        const exists = Number(columnExists[0].count) > 0;
        results.push({
          check: `user_attempts.${column}`,
          passed: exists,
          details: exists ? 'Column found' : 'Column not found'
        });
      } catch (error) {
        results.push({
          check: `user_attempts.${column}`,
          passed: false,
          details: `Error: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    // Check 5: Verify indexes
    console.log('5️⃣  Checking indexes...');
    const indexes = [
      { table: 'lesson_progress', index: 'lesson_progress_userId_currentStage_idx' },
      { table: 'lesson_progress', index: 'lesson_progress_journeyPhase_idx' },
      { table: 'user_character_progress', index: 'user_character_progress_completionStatus_idx' },
      { table: 'user_character_progress', index: 'user_character_progress_currentStage_idx' },
      { table: 'user_attempts', index: 'user_attempts_learningStage_idx' },
      { table: 'user_attempts', index: 'user_attempts_journeyPhase_idx' },
      { table: 'learning_stages', index: 'learning_stages_order_idx' },
      { table: 'learning_stages', index: 'learning_stages_isActive_idx' }
    ];

    for (const { table, index } of indexes) {
      try {
        const indexExists = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count FROM pg_indexes 
          WHERE tablename = ${table} AND indexname = ${index}
        `;
        const exists = Number(indexExists[0].count) > 0;
        results.push({
          check: `Index: ${index}`,
          passed: exists,
          details: exists ? 'Index found' : 'Index not found'
        });
      } catch (error) {
        results.push({
          check: `Index: ${index}`,
          passed: false,
          details: `Error: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    // Print results
    console.log('\n📊 Verification Results:\n');
    console.log('═'.repeat(80));
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.check}`);
      if (result.details && !result.passed) {
        console.log(`   └─ ${result.details}`);
      }
    });

    console.log('═'.repeat(80));
    console.log(`\n📈 Summary: ${passed}/${total} checks passed (${failed} failed)\n`);

    if (failed === 0) {
      console.log('✨ All verification checks passed! Migration successful.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some verification checks failed. Please review the migration.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Verification failed with error:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyMigration().catch((error) => {
  console.error('Fatal error during verification:');
  console.error(error);
  process.exit(1);
});
