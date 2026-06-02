-- =====================================================
-- Production Migration Script
-- Adaptive Learning System - Phase 1
-- Migration: 20260601133747_adaptive_learning_system_phase1
-- =====================================================
--
-- This script adds non-breaking schema changes for the
-- Adaptive Didactic Learning System Phase 1 MVP.
-- All new columns are nullable or have default values
-- to ensure zero downtime deployment.
--
-- Estimated execution time: < 30 seconds
-- Rollback script: production_rollback.sql
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: Extend lesson_progress table
-- =====================================================
-- Add journey and stage tracking fields
-- All fields are nullable for backward compatibility

ALTER TABLE "lesson_progress"
  ADD COLUMN IF NOT EXISTS "currentStage" TEXT,
  ADD COLUMN IF NOT EXISTS "stageCompletionData" JSONB,
  ADD COLUMN IF NOT EXISTS "timeSpentPerStage" JSONB,
  ADD COLUMN IF NOT EXISTS "journeyPhase" TEXT,
  ADD COLUMN IF NOT EXISTS "journeyStartedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "journeyPausedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "journeyCompletedAt" TIMESTAMP(3);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS "lesson_progress_userId_currentStage_idx"
  ON "lesson_progress"("userId", "currentStage");

CREATE INDEX IF NOT EXISTS "lesson_progress_journeyPhase_idx"
  ON "lesson_progress"("journeyPhase");

-- =====================================================
-- STEP 2: Extend user_character_progress table
-- =====================================================
-- Add mastery tracking and stage progression fields
-- Using NOT NULL with defaults for metrics

ALTER TABLE "user_character_progress"
  ADD COLUMN IF NOT EXISTS "masteryScore" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "accuracyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "completionStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  ADD COLUMN IF NOT EXISTS "currentStage" TEXT,
  ADD COLUMN IF NOT EXISTS "completedStages" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "stageScores" JSONB,
  ADD COLUMN IF NOT EXISTS "stageAttempts" JSONB,
  ADD COLUMN IF NOT EXISTS "journeyPhase" TEXT,
  ADD COLUMN IF NOT EXISTS "completedPhases" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add performance indexes
CREATE INDEX IF NOT EXISTS "user_character_progress_completionStatus_idx"
  ON "user_character_progress"("completionStatus");

CREATE INDEX IF NOT EXISTS "user_character_progress_currentStage_idx"
  ON "user_character_progress"("currentStage");

-- =====================================================
-- STEP 3: Extend user_attempts table
-- =====================================================
-- Add enhanced OCR metrics and feedback fields
-- All fields are nullable as they apply to new attempts only

ALTER TABLE "user_attempts"
  ADD COLUMN IF NOT EXISTS "learningStage" TEXT,
  ADD COLUMN IF NOT EXISTS "journeyPhase" TEXT,
  ADD COLUMN IF NOT EXISTS "shapeAccuracy" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "strokeOrder" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "strokeDirection" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "strokeConsistency" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "sizeBalance" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "spacing" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "feedbackType" TEXT,
  ADD COLUMN IF NOT EXISTS "visualOverlay" JSONB,
  ADD COLUMN IF NOT EXISTS "improvementSteps" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add performance indexes
CREATE INDEX IF NOT EXISTS "user_attempts_learningStage_idx"
  ON "user_attempts"("learningStage");

CREATE INDEX IF NOT EXISTS "user_attempts_journeyPhase_idx"
  ON "user_attempts"("journeyPhase");

-- =====================================================
-- STEP 4: Create learning_stages table
-- =====================================================
-- New table for stage configuration
-- No foreign keys to ensure independent deployment

CREATE TABLE IF NOT EXISTS "learning_stages" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "masteryThreshold" INTEGER NOT NULL DEFAULT 80,
  "minAttempts" INTEGER NOT NULL DEFAULT 3,
  "requiredAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
  "estimatedMinutes" INTEGER NOT NULL DEFAULT 5,
  "interactionType" TEXT NOT NULL,
  "validationRules" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "learning_stages_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "learning_stages_name_key"
  ON "learning_stages"("name");

CREATE INDEX IF NOT EXISTS "learning_stages_order_idx"
  ON "learning_stages"("order");

CREATE INDEX IF NOT EXISTS "learning_stages_isActive_idx"
  ON "learning_stages"("isActive");

-- =====================================================
-- STEP 5: Verify migration
-- =====================================================
-- Check that all new columns exist

DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  -- Check lesson_progress columns
  SELECT ARRAY_AGG(column_name) INTO missing_columns
  FROM (
    SELECT unnest(ARRAY['currentStage', 'stageCompletionData', 'timeSpentPerStage',
                         'journeyPhase', 'journeyStartedAt', 'journeyPausedAt', 'journeyCompletedAt']) AS column_name
  ) expected
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_progress'
    AND column_name = expected.column_name
  );

  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Missing columns in lesson_progress: %', array_to_string(missing_columns, ', ');
  END IF;

  -- Check user_character_progress columns
  SELECT ARRAY_AGG(column_name) INTO missing_columns
  FROM (
    SELECT unnest(ARRAY['masteryScore', 'accuracyRate', 'confidenceScore', 'completionStatus',
                         'currentStage', 'completedStages', 'stageScores', 'stageAttempts',
                         'journeyPhase', 'completedPhases']) AS column_name
  ) expected
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_character_progress'
    AND column_name = expected.column_name
  );

  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Missing columns in user_character_progress: %', array_to_string(missing_columns, ', ');
  END IF;

  -- Check user_attempts columns
  SELECT ARRAY_AGG(column_name) INTO missing_columns
  FROM (
    SELECT unnest(ARRAY['learningStage', 'journeyPhase', 'shapeAccuracy', 'strokeOrder',
                         'strokeDirection', 'strokeConsistency', 'sizeBalance', 'spacing',
                         'feedbackType', 'visualOverlay', 'improvementSteps']) AS column_name
  ) expected
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_attempts'
    AND column_name = expected.column_name
  );

  IF array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Missing columns in user_attempts: %', array_to_string(missing_columns, ', ');
  END IF;

  -- Check learning_stages table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'learning_stages'
  ) THEN
    RAISE EXCEPTION 'Table learning_stages does not exist';
  END IF;

  RAISE NOTICE 'Migration verification successful - all schema changes applied';
END $$;

COMMIT;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next steps:
-- 1. Run seed script to populate learning_stages table
-- 2. Run data migration script to initialize existing user progress
-- 3. Deploy application code with adaptive learning features
-- =====================================================
