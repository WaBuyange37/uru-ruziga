-- AlterTable
ALTER TABLE "lesson_progress" ADD COLUMN     "currentStage" TEXT,
ADD COLUMN     "journeyCompletedAt" TIMESTAMP(3),
ADD COLUMN     "journeyPausedAt" TIMESTAMP(3),
ADD COLUMN     "journeyPhase" TEXT,
ADD COLUMN     "journeyStartedAt" TIMESTAMP(3),
ADD COLUMN     "stageCompletionData" JSONB,
ADD COLUMN     "timeSpentPerStage" JSONB;

-- AlterTable
ALTER TABLE "user_attempts" ADD COLUMN     "feedbackType" TEXT,
ADD COLUMN     "improvementSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "journeyPhase" TEXT,
ADD COLUMN     "learningStage" TEXT,
ADD COLUMN     "shapeAccuracy" DOUBLE PRECISION,
ADD COLUMN     "sizeBalance" DOUBLE PRECISION,
ADD COLUMN     "spacing" DOUBLE PRECISION,
ADD COLUMN     "strokeConsistency" DOUBLE PRECISION,
ADD COLUMN     "strokeDirection" DOUBLE PRECISION,
ADD COLUMN     "strokeOrder" DOUBLE PRECISION,
ADD COLUMN     "visualOverlay" JSONB;

-- AlterTable
ALTER TABLE "user_character_progress" ADD COLUMN     "accuracyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "completedPhases" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "completedStages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "completionStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currentStage" TEXT,
ADD COLUMN     "journeyPhase" TEXT,
ADD COLUMN     "masteryScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stageAttempts" JSONB,
ADD COLUMN     "stageScores" JSONB;

-- CreateTable
CREATE TABLE "learning_stages" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_stages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "learning_stages_name_key" ON "learning_stages"("name");

-- CreateIndex
CREATE INDEX "learning_stages_order_idx" ON "learning_stages"("order");

-- CreateIndex
CREATE INDEX "learning_stages_isActive_idx" ON "learning_stages"("isActive");

-- CreateIndex
CREATE INDEX "lesson_progress_userId_currentStage_idx" ON "lesson_progress"("userId", "currentStage");

-- CreateIndex
CREATE INDEX "lesson_progress_journeyPhase_idx" ON "lesson_progress"("journeyPhase");

-- CreateIndex
CREATE INDEX "user_attempts_learningStage_idx" ON "user_attempts"("learningStage");

-- CreateIndex
CREATE INDEX "user_attempts_journeyPhase_idx" ON "user_attempts"("journeyPhase");

-- CreateIndex
CREATE INDEX "user_character_progress_completionStatus_idx" ON "user_character_progress"("completionStatus");

-- CreateIndex
CREATE INDEX "user_character_progress_currentStage_idx" ON "user_character_progress"("currentStage");
