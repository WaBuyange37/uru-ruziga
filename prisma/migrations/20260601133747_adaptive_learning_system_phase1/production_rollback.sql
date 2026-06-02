-- =====================================================
-- Production Rollback Script
-- Adaptive Learning System - Phase 1
-- Migration: 20260601133747_adaptive_learning_system_phase1
-- =====================================================
--
-- EMERGENCY ROLLBACK ONLY
-- This script removes all schema changes added by the
-- adaptive learning system Phase 1 migration.
--
-- WARNING: This will delete all adaptive learning data
-- including mastery scores, stage progress, and journey
-- tracking. Only use in emergency situations.
--
-- Estimated execution time: < 30 seconds
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Drop learning_stages table
-- =====================================================
-- Remove the new learning stages configuration table

DROP TABLE IF EXISTS "learning_stages" CASCADE;

-- =====================================================
-- STEP 2: Remove indexes from user_character_progress
-- =====================================================
-- Drop performance indexes before removing columns

DROP INDEX IF EXISTS "user_character_progress_completionStatus_idx";
DROP INDEX IF EXISTS "user_character_progress_currentStage_idx";

-- =====================================================
-- STEP 3: Remove columns from user_character_progress
-- =====================================================
-- Remove all adaptive learning columns
-- WARNING: This deletes mastery tracking data

ALTER TABLE "user_character_progress"
  DROP COLUMN IF EXISTS "masteryScore",
  DROP COLUMN IF EXISTS "accuracyRate",
  DROP COLUMN IF EXISTS "confidenceScore",
  DROP COLUMN IF EXISTS "completionStatus",
  DROP COLUMN IF EXISTS "currentStage",
  DROP COLUMN IF EXISTS "completedStages",
  DROP COLUMN IF EXISTS "stageScores",
  DROP COLUMN IF EXISTS "stageAttempts",
  DROP COLUMN IF EXISTS "journeyPhase",
  DROP COLUMN IF EXISTS "completedPhases";

-- =====================================================
-- STEP 4: Remove indexes from user_attempts
-- =====================================================
-- Drop performance indexes before removing columns

DROP INDEX IF EXISTS "user_attempts_learningStage_idx";
DROP INDEX IF EXISTS "user_attempts_journeyPhase_idx";

-- =====================================================
-- STEP 5: Remove columns from user_attempts
-- =====================================================
-- Remove enhanced OCR metrics and feedback columns
-- WARNING: This deletes detailed feedback data

ALTER TABLE "user_attempts"
  DROP COLUMN IF EXISTS "learningStage",
  DROP COLUMN IF EXISTS "journeyPhase",
  DROP COLUMN IF EXISTS "shapeAccuracy",
  DROP COLUMN IF EXISTS "strokeOrder",
  DROP COLUMN IF EXISTS "strokeDirection",
  DROP COLUMN IF EXISTS "strokeConsistency",
  DROP COLUMN IF EXISTS "sizeBalance",
  DROP COLUMN IF EXISTS "spacing",
  DROP COLUMN IF EXISTS "feedbackType",
  DROP COLUMN IF EXISTS "visualOverlay",
  DROP COLUMN IF EXISTS "improvementSteps";

-- =====================================================
-- STEP 6: Remove indexes from lesson_progress
-- =====================================================
-- Drop performance indexes before removing columns

DROP INDEX IF EXISTS "lesson_progress_userId_currentStage_idx";
DROP INDEX IF EXISTS "lesson_progress_journeyPhase_idx";

-- =====================================================
-- STEP 7: Remove columns from lesson_progress
-- =====================================================
-- Remove journey and stage tracking columns
-- WARNING: This deletes journey progress data

ALTER TABLE "lesson_progress"
  DROP COLUMN IF EXISTS "currentStage",
  DROP COLUMN IF EXISTS "stageCompletionData",
  DROP COLUMN IF EXISTS "timeSpentPerStage",
  DROP COLUMN IF EXISTS "journeyPhase",
  DROP COLUMN IF EXISTS "journeyStartedAt",
  DROP COLUMN IF EXISTS "journeyPausedAt",
  DROP COLUMN IF EXISTS "journeyCompletedAt";

-- =====================================================
-- STEP 8: Verify rollback
-- =====================================================
-- Check that all adaptive learning columns are removed

DO $$
DECLARE
  remaining_columns TEXT[];
BEGIN
  -- Check lesson_progress columns are removed
  SELECT ARRAY_AGG(column_name) INTO remaining_columns
  FROM information_schema.columns
  WHERE table_name = 'lesson_progress'
  AND column_name IN ('currentStage', 'stageCompletionData', 'timeSpentPerStage',
                      'journeyPhase', 'journeyStartedAt', 'journeyPausedAt', 'journeyCompletedAt');

  IF array_length(remaining_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Columns still exist in lesson_progress: %', array_to_string(remaining_columns, ', ');
  END IF;

  -- Check user_character_progress columns are removed
  SELECT ARRAY_AGG(column_name) INTO remaining_columns
  FROM information_schema.columns
  WHERE table_name = 'user_character_progress'
  AND column_name IN ('masteryScore', 'accuracyRate', 'confidenceScore', 'completionStatus',
                      'currentStage', 'completedStages', 'stageScores', 'stageAttempts',
                      'journeyPhase', 'completedPhases');

  IF array_length(remaining_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Columns still exist in user_character_progress: %', array_to_string(remaining_columns, ', ');
  END IF;

  -- Check user_attempts columns are removed
  SELECT ARRAY_AGG(column_name) INTO remaining_columns
  FROM information_schema.columns
  WHERE table_name = 'user_attempts'
  AND column_name IN ('learningStage', 'journeyPhase', 'shapeAccuracy', 'strokeOrder',
                      'strokeDirection', 'strokeConsistency', 'sizeBalance', 'spacing',
                      'feedbackType', 'visualOverlay', 'improvementSteps');

  IF array_length(remaining_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Columns still exist in user_attempts: %', array_to_string(remaining_columns, ', ');
  END IF;

  -- Check learning_stages table is removed
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'learning_stages'
  ) THEN
    RAISE EXCEPTION 'Table learning_stages still exists';
  END IF;

  RAISE NOTICE 'Rollback verification successful - all adaptive learning schema changes removed';
END $$;

COMMIT;

-- =====================================================
-- Rollback Complete
-- =====================================================
-- The database schema has been reverted to the state
-- before the adaptive learning system Phase 1 migration.
--
-- Next steps:
-- 1. Redeploy previous application version
-- 2. Verify application functionality
-- 3. Investigate root cause of rollback requirement
-- =====================================================
