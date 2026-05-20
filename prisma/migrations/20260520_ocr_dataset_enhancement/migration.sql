-- OCR Dataset Enhancement Migration
-- Adds comprehensive fields for production-grade handwriting intelligence and dataset collection

-- ============================================================================
-- ENHANCE HandwritingAttempt Model
-- ============================================================================

-- Add stroke analysis fields
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "stroke_count" INTEGER DEFAULT 0;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "total_points" INTEGER DEFAULT 0;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "drawing_duration" INTEGER; -- milliseconds

-- Add additional image URLs
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "processed_image_url" TEXT;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "skeleton_image_url" TEXT;

-- Add detailed evaluation scores
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "ssim_score" DOUBLE PRECISION;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "contour_score" DOUBLE PRECISION;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "skeleton_score" DOUBLE PRECISION;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "confidence_score" DOUBLE PRECISION;

-- Add feedback categorization
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "feedback_type" TEXT; -- constructive, corrective, encouraging
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "practice_areas" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add feature extraction for ML
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "feature_vector" JSONB;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "quality_label" TEXT; -- excellent, good, fair, poor

-- Add dataset management fields
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "included_in_dataset" BOOLEAN DEFAULT FALSE;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "dataset_split" TEXT; -- train, val, test
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "dataset_version" TEXT;
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "lesson_id" TEXT;

-- Add updated timestamp
ALTER TABLE "handwriting_attempts" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS "handwriting_attempts_quality_label_idx" ON "handwriting_attempts"("quality_label");
CREATE INDEX IF NOT EXISTS "handwriting_attempts_included_in_dataset_idx" ON "handwriting_attempts"("included_in_dataset");
CREATE INDEX IF NOT EXISTS "handwriting_attempts_dataset_split_idx" ON "handwriting_attempts"("dataset_split");
CREATE INDEX IF NOT EXISTS "handwriting_attempts_lesson_id_idx" ON "handwriting_attempts"("lesson_id");

-- ============================================================================
-- ENHANCE CharacterReference Model
-- ============================================================================

-- Add character type and metadata
ALTER TABLE "character_references" ADD COLUMN IF NOT EXISTS "latin_equivalent" TEXT;
ALTER TABLE "character_references" ADD COLUMN IF NOT EXISTS "character_type" TEXT; -- vowel, consonant, ligature
ALTER TABLE "character_references" ADD COLUMN IF NOT EXISTS "font_image_url" TEXT;
ALTER TABLE "character_references" ADD COLUMN IF NOT EXISTS "difficulty" INTEGER DEFAULT 1;

-- Create indexes
CREATE INDEX IF NOT EXISTS "character_references_character_type_idx" ON "character_references"("character_type");
CREATE INDEX IF NOT EXISTS "character_references_latin_equivalent_idx" ON "character_references"("latin_equivalent");

-- ============================================================================
-- ENHANCE DatasetEntry Model
-- ============================================================================

-- Add character type
ALTER TABLE "dataset_entries" ADD COLUMN IF NOT EXISTS "character_type" TEXT;

-- Add processed image URL
ALTER TABLE "dataset_entries" ADD COLUMN IF NOT EXISTS "processed_image_url" TEXT;

-- Add quality label
ALTER TABLE "dataset_entries" ADD COLUMN IF NOT EXISTS "quality_label" TEXT;

-- Add feature vector
ALTER TABLE "dataset_entries" ADD COLUMN IF NOT EXISTS "feature_vector" JSONB;

-- Add quality control fields
ALTER TABLE "dataset_entries" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT FALSE;
ALTER TABLE "dataset_entries" ADD COLUMN IF NOT EXISTS "verified_by" TEXT;
ALTER TABLE "dataset_entries" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(3);

-- Create indexes
CREATE INDEX IF NOT EXISTS "dataset_entries_character_type_idx" ON "dataset_entries"("character_type");
CREATE INDEX IF NOT EXISTS "dataset_entries_quality_label_idx" ON "dataset_entries"("quality_label");
CREATE INDEX IF NOT EXISTS "dataset_entries_verified_idx" ON "dataset_entries"("verified");

-- ============================================================================
-- ENHANCE CommunityEntry Model for NLP Dataset
-- ============================================================================

-- Add script field
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "script" TEXT DEFAULT 'latin'; -- latin, umwero

-- Add NLP metadata
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "sentiment" TEXT; -- positive, neutral, negative
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "complexity" INTEGER; -- text complexity score

-- Add processing fields
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "processed" BOOLEAN DEFAULT FALSE;
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "processed_text" TEXT;
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "tokens" JSONB; -- Tokenization results
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "embedding" JSONB; -- Vector embedding

-- Add dataset management
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "included_in_dataset" BOOLEAN DEFAULT FALSE;
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "dataset_split" TEXT; -- train, val, test
ALTER TABLE "community_entries" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT FALSE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "community_entries_script_idx" ON "community_entries"("script");
CREATE INDEX IF NOT EXISTS "community_entries_included_in_dataset_idx" ON "community_entries"("included_in_dataset");
CREATE INDEX IF NOT EXISTS "community_entries_processed_idx" ON "community_entries"("processed");

-- ============================================================================
-- CREATE PerformanceMetric Model (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "performance_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metric_type" TEXT NOT NULL, -- evaluation_time, cache_hit_rate, accuracy, etc.
    "component" TEXT NOT NULL, -- evaluation_engine, font_renderer, cache, etc.
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL, -- ms, percent, score, etc.
    "character_type" TEXT, -- Optional: vowel, consonant, ligature
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "performance_metrics_metric_type_idx" ON "performance_metrics"("metric_type");
CREATE INDEX IF NOT EXISTS "performance_metrics_component_idx" ON "performance_metrics"("component");
CREATE INDEX IF NOT EXISTS "performance_metrics_created_at_idx" ON "performance_metrics"("created_at");
CREATE INDEX IF NOT EXISTS "performance_metrics_character_type_idx" ON "performance_metrics"("character_type");

-- ============================================================================
-- CREATE EvaluationSession Model (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "evaluation_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "session_type" TEXT NOT NULL, -- practice, assessment, challenge
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "total_attempts" INTEGER DEFAULT 0,
    "average_score" DOUBLE PRECISION,
    "characters_practiced" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "evaluation_sessions_user_id_idx" ON "evaluation_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "evaluation_sessions_session_type_idx" ON "evaluation_sessions"("session_type");
CREATE INDEX IF NOT EXISTS "evaluation_sessions_started_at_idx" ON "evaluation_sessions"("started_at");

-- Add foreign key constraint
ALTER TABLE "evaluation_sessions" ADD CONSTRAINT "evaluation_sessions_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- UPDATE COMMENTS
-- ============================================================================

COMMENT ON TABLE "handwriting_attempts" IS 'Stores every handwriting attempt with complete stroke data, evaluation results, and ML features for OCR dataset collection';
COMMENT ON TABLE "character_references" IS 'Font-rendered reference images for each Umwero character with canonical stroke order';
COMMENT ON TABLE "dataset_entries" IS 'Curated dataset entries ready for ML training with quality control and train/val/test splits';
COMMENT ON TABLE "community_entries" IS 'Community-generated text for NLP dataset collection with processing and embedding support';
COMMENT ON TABLE "performance_metrics" IS 'System performance metrics for monitoring evaluation engine, cache, and ML pipeline';
COMMENT ON TABLE "evaluation_sessions" IS 'User practice sessions for tracking learning progress and engagement patterns';

-- ============================================================================
-- DATA MIGRATION (if needed)
-- ============================================================================

-- Migrate existing handwriting attempts to include default values
UPDATE "handwriting_attempts" 
SET 
    "stroke_count" = 0,
    "total_points" = 0,
    "included_in_dataset" = FALSE,
    "updated_at" = CURRENT_TIMESTAMP
WHERE "stroke_count" IS NULL;

-- Migrate existing dataset entries
UPDATE "dataset_entries"
SET "verified" = FALSE
WHERE "verified" IS NULL;

-- Migrate existing community entries
UPDATE "community_entries"
SET 
    "script" = 'latin',
    "processed" = FALSE,
    "included_in_dataset" = FALSE,
    "verified" = FALSE
WHERE "script" IS NULL;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Migration completed successfully
-- All tables enhanced for production-grade OCR dataset collection
