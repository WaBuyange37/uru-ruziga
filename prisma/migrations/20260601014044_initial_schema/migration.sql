-- CreateEnum
CREATE TYPE "CharacterType" AS ENUM ('VOWEL', 'CONSONANT', 'LIGATURE', 'COMPOUND', 'SPECIAL');

-- CreateEnum
CREATE TYPE "StrokeDirection" AS ENUM ('TOP_TO_BOTTOM', 'BOTTOM_TO_TOP', 'LEFT_TO_RIGHT', 'RIGHT_TO_LEFT', 'CLOCKWISE', 'COUNTERCLOCKWISE', 'DIAGONAL');

-- CreateEnum
CREATE TYPE "ContextType" AS ENUM ('ETYMOLOGY', 'CULTURAL_USE', 'PRESERVATION', 'MEANING', 'HISTORY');

-- CreateEnum
CREATE TYPE "LessonModule" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VOWEL', 'CONSONANT', 'WORD', 'SENTENCE', 'GRAMMAR', 'CULTURE', 'CHARACTER_INTRO', 'PRACTICE', 'REVIEW', 'ASSESSMENT', 'CULTURAL_DEEP_DIVE', 'LIGATURE');

-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('CHARACTER_OVERVIEW', 'CULTURAL_CONTEXT', 'PRONUNCIATION_GUIDE', 'STROKE_ORDER', 'PRACTICE_CANVAS', 'AI_COMPARISON', 'QUIZ', 'REVIEW', 'SUCCESS_CELEBRATION');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED');

-- CreateEnum
CREATE TYPE "CharacterProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'LEARNED');

-- CreateEnum
CREATE TYPE "AttemptType" AS ENUM ('DRAWING', 'QUIZ', 'PRONUNCIATION', 'WRITING');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('LESSON_COMPLETION', 'PRACTICE_MASTERY', 'STREAK', 'CULTURAL_KNOWLEDGE', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'FACEBOOK', 'TWITTER', 'GOOGLE');

-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('CHAT_MESSAGE', 'COMMUNITY_POST', 'POST_COMMENT', 'LESSON_CONTENT', 'USER_TRANSLATION', 'DRAWING_FEEDBACK', 'QUIZ_ANSWER');

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'ltr',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "umweroGlyph" TEXT NOT NULL,
    "latinEquivalent" TEXT NOT NULL,
    "type" "CharacterType" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "strokeCount" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "glyphImageUrl" TEXT,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "symbolism" TEXT,
    "historicalNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_translations" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pronunciation" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stroke_data" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "strokeNumber" INTEGER NOT NULL,
    "pathData" TEXT NOT NULL,
    "direction" "StrokeDirection" NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 1000,
    "easing" TEXT NOT NULL DEFAULT 'ease-in-out',
    "hint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stroke_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultural_contexts" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "contextType" "ContextType" NOT NULL,
    "icon" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cultural_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultural_context_translations" (
    "id" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cultural_context_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "context_examples" (
    "id" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "wordUmwero" TEXT NOT NULL,
    "wordLatin" TEXT NOT NULL,
    "wordEnglish" TEXT NOT NULL,
    "audioUrl" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "context_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "module" "LessonModule" NOT NULL DEFAULT 'BEGINNER',
    "type" "LessonType" NOT NULL DEFAULT 'VOWEL',
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "prerequisites" TEXT[],
    "code" TEXT,
    "characterId" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "estimatedTime" INTEGER,
    "prerequisiteIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_translations" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectives" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_steps" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "stepType" "StepType" NOT NULL,
    "order" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "passingScore" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_translations" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "tips" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentStepId" TEXT,
    "completedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "characterId" TEXT,
    "attemptType" "AttemptType" NOT NULL,
    "drawingData" TEXT,
    "answer" JSONB,
    "aiScore" INTEGER,
    "aiMetrics" JSONB,
    "feedback" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "evaluationType" TEXT,
    "uploadedImageUrl" TEXT,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "requirement" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#5e2f17',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "mobileNumber" TEXT,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "birthday" TIMESTAMP(3),
    "countryCode" TEXT DEFAULT 'RW',
    "phoneNumber" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "country" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationTokenExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "providerId" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_character_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "status" "CharacterProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_character_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handwriting_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "lessonId" TEXT,
    "strokes" JSONB NOT NULL,
    "strokeCount" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "drawingDuration" INTEGER,
    "imageUrl" TEXT,
    "processedImageUrl" TEXT,
    "skeletonImageUrl" TEXT,
    "heatmapUrl" TEXT,
    "score" DOUBLE PRECISION,
    "ssimScore" DOUBLE PRECISION,
    "contourScore" DOUBLE PRECISION,
    "skeletonScore" DOUBLE PRECISION,
    "confidenceScore" DOUBLE PRECISION,
    "feedback" JSONB,
    "feedbackType" TEXT,
    "practiceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featureVector" JSONB,
    "qualityLabel" TEXT,
    "metadata" JSONB NOT NULL,
    "processingTime" INTEGER,
    "includedInDataset" BOOLEAN NOT NULL DEFAULT false,
    "datasetSplit" TEXT,
    "datasetVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handwriting_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_references" (
    "id" TEXT NOT NULL,
    "umweroChar" TEXT NOT NULL,
    "latinEquivalent" TEXT,
    "unicodeMapping" TEXT,
    "characterType" TEXT,
    "imageFontPath" TEXT NOT NULL,
    "fontImageUrl" TEXT,
    "strokeOrder" JSONB,
    "metadata" JSONB NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "script" TEXT NOT NULL DEFAULT 'latin',
    "category" TEXT,
    "sentiment" TEXT,
    "complexity" INTEGER,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedText" TEXT,
    "tokens" JSONB,
    "embedding" JSONB,
    "includedInDataset" BOOLEAN NOT NULL DEFAULT false,
    "datasetSplit" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_entries" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "characterType" TEXT,
    "strokesData" JSONB NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "processedImageUrl" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "qualityLabel" TEXT,
    "featureVector" JSONB,
    "timeTaken" INTEGER NOT NULL,
    "userMetadata" JSONB NOT NULL,
    "split" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dataset_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateUrl" TEXT,
    "verificationCode" TEXT NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "script" TEXT NOT NULL DEFAULT 'latin',
    "category" TEXT,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "script" TEXT NOT NULL DEFAULT 'latin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "items" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_drawings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT,
    "vowel" TEXT NOT NULL,
    "umweroChar" TEXT NOT NULL,
    "drawingData" TEXT NOT NULL,
    "aiScore" INTEGER,
    "feedback" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_drawings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "latinText" TEXT,
    "umweroText" TEXT,
    "imageUrl" TEXT,
    "isChallenge" BOOLEAN NOT NULL DEFAULT false,
    "challengeType" TEXT,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "sharesCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mediaUrls" TEXT[],

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "latinText" TEXT,
    "umweroText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latinText" TEXT NOT NULL,
    "umweroText" TEXT NOT NULL,
    "imageUrl" TEXT,
    "fontSize" INTEGER NOT NULL DEFAULT 24,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sourceType" "DataSourceType" NOT NULL,
    "sourceId" TEXT,
    "latinText" TEXT NOT NULL,
    "umweroText" TEXT,
    "translatedText" TEXT,
    "context" TEXT,
    "language" TEXT NOT NULL DEFAULT 'rw',
    "targetLanguage" TEXT,
    "quality" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questions" TEXT NOT NULL,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "timeLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "characterType" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "charactersPracticed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_code_idx" ON "languages"("code");

-- CreateIndex
CREATE INDEX "languages_isActive_isDefault_idx" ON "languages"("isActive", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "characters_umweroGlyph_key" ON "characters"("umweroGlyph");

-- CreateIndex
CREATE INDEX "characters_type_order_idx" ON "characters"("type", "order");

-- CreateIndex
CREATE INDEX "characters_latinEquivalent_idx" ON "characters"("latinEquivalent");

-- CreateIndex
CREATE INDEX "characters_isActive_idx" ON "characters"("isActive");

-- CreateIndex
CREATE INDEX "character_translations_characterId_idx" ON "character_translations"("characterId");

-- CreateIndex
CREATE INDEX "character_translations_languageId_idx" ON "character_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "character_translations_characterId_languageId_key" ON "character_translations"("characterId", "languageId");

-- CreateIndex
CREATE INDEX "stroke_data_characterId_strokeNumber_idx" ON "stroke_data"("characterId", "strokeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "stroke_data_characterId_strokeNumber_key" ON "stroke_data"("characterId", "strokeNumber");

-- CreateIndex
CREATE INDEX "cultural_contexts_characterId_contextType_idx" ON "cultural_contexts"("characterId", "contextType");

-- CreateIndex
CREATE INDEX "cultural_contexts_isActive_idx" ON "cultural_contexts"("isActive");

-- CreateIndex
CREATE INDEX "cultural_context_translations_contextId_idx" ON "cultural_context_translations"("contextId");

-- CreateIndex
CREATE INDEX "cultural_context_translations_languageId_idx" ON "cultural_context_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "cultural_context_translations_contextId_languageId_key" ON "cultural_context_translations"("contextId", "languageId");

-- CreateIndex
CREATE INDEX "context_examples_contextId_order_idx" ON "context_examples"("contextId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_code_key" ON "lessons"("code");

-- CreateIndex
CREATE INDEX "lessons_type_module_order_idx" ON "lessons"("type", "module", "order");

-- CreateIndex
CREATE INDEX "lessons_module_order_idx" ON "lessons"("module", "order");

-- CreateIndex
CREATE INDEX "lessons_characterId_idx" ON "lessons"("characterId");

-- CreateIndex
CREATE INDEX "lessons_isPublished_idx" ON "lessons"("isPublished");

-- CreateIndex
CREATE INDEX "lesson_translations_lessonId_idx" ON "lesson_translations"("lessonId");

-- CreateIndex
CREATE INDEX "lesson_translations_languageId_idx" ON "lesson_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_translations_lessonId_languageId_key" ON "lesson_translations"("lessonId", "languageId");

-- CreateIndex
CREATE INDEX "lesson_steps_lessonId_order_idx" ON "lesson_steps"("lessonId", "order");

-- CreateIndex
CREATE INDEX "lesson_steps_stepType_idx" ON "lesson_steps"("stepType");

-- CreateIndex
CREATE INDEX "step_translations_stepId_idx" ON "step_translations"("stepId");

-- CreateIndex
CREATE INDEX "step_translations_languageId_idx" ON "step_translations"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "step_translations_stepId_languageId_key" ON "step_translations"("stepId", "languageId");

-- CreateIndex
CREATE INDEX "lesson_progress_userId_status_idx" ON "lesson_progress"("userId", "status");

-- CreateIndex
CREATE INDEX "lesson_progress_userId_completed_idx" ON "lesson_progress"("userId", "completed");

-- CreateIndex
CREATE INDEX "lesson_progress_lessonId_idx" ON "lesson_progress"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_userId_lessonId_key" ON "lesson_progress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "user_attempts_userId_createdAt_idx" ON "user_attempts"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_attempts_stepId_idx" ON "user_attempts"("stepId");

-- CreateIndex
CREATE INDEX "user_attempts_characterId_idx" ON "user_attempts"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "achievements_category_order_idx" ON "achievements"("category", "order");

-- CreateIndex
CREATE INDEX "achievements_isActive_idx" ON "achievements"("isActive");

-- CreateIndex
CREATE INDEX "user_achievements_userId_isUnlocked_idx" ON "user_achievements"("userId", "isUnlocked");

-- CreateIndex
CREATE INDEX "user_achievements_achievementId_idx" ON "user_achievements"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobileNumber_key" ON "users"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_mobileNumber_idx" ON "users"("mobileNumber");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_countryCode_idx" ON "users"("countryCode");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_provider_idx" ON "users"("provider");

-- CreateIndex
CREATE INDEX "users_verificationToken_idx" ON "users"("verificationToken");

-- CreateIndex
CREATE INDEX "user_character_progress_userId_idx" ON "user_character_progress"("userId");

-- CreateIndex
CREATE INDEX "user_character_progress_characterId_idx" ON "user_character_progress"("characterId");

-- CreateIndex
CREATE INDEX "user_character_progress_status_idx" ON "user_character_progress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_character_progress_userId_characterId_key" ON "user_character_progress"("userId", "characterId");

-- CreateIndex
CREATE INDEX "handwriting_attempts_userId_characterId_idx" ON "handwriting_attempts"("userId", "characterId");

-- CreateIndex
CREATE INDEX "handwriting_attempts_createdAt_idx" ON "handwriting_attempts"("createdAt");

-- CreateIndex
CREATE INDEX "handwriting_attempts_score_idx" ON "handwriting_attempts"("score");

-- CreateIndex
CREATE INDEX "handwriting_attempts_qualityLabel_idx" ON "handwriting_attempts"("qualityLabel");

-- CreateIndex
CREATE INDEX "handwriting_attempts_includedInDataset_idx" ON "handwriting_attempts"("includedInDataset");

-- CreateIndex
CREATE INDEX "handwriting_attempts_lessonId_idx" ON "handwriting_attempts"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "character_references_umweroChar_key" ON "character_references"("umweroChar");

-- CreateIndex
CREATE INDEX "character_references_umweroChar_idx" ON "character_references"("umweroChar");

-- CreateIndex
CREATE INDEX "character_references_characterType_idx" ON "character_references"("characterType");

-- CreateIndex
CREATE INDEX "character_references_latinEquivalent_idx" ON "character_references"("latinEquivalent");

-- CreateIndex
CREATE INDEX "community_entries_userId_idx" ON "community_entries"("userId");

-- CreateIndex
CREATE INDEX "community_entries_createdAt_idx" ON "community_entries"("createdAt");

-- CreateIndex
CREATE INDEX "community_entries_language_idx" ON "community_entries"("language");

-- CreateIndex
CREATE INDEX "community_entries_script_idx" ON "community_entries"("script");

-- CreateIndex
CREATE INDEX "community_entries_includedInDataset_idx" ON "community_entries"("includedInDataset");

-- CreateIndex
CREATE INDEX "community_entries_processed_idx" ON "community_entries"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "dataset_entries_attemptId_key" ON "dataset_entries"("attemptId");

-- CreateIndex
CREATE INDEX "dataset_entries_characterId_idx" ON "dataset_entries"("characterId");

-- CreateIndex
CREATE INDEX "dataset_entries_characterType_idx" ON "dataset_entries"("characterType");

-- CreateIndex
CREATE INDEX "dataset_entries_split_idx" ON "dataset_entries"("split");

-- CreateIndex
CREATE INDEX "dataset_entries_qualityLabel_idx" ON "dataset_entries"("qualityLabel");

-- CreateIndex
CREATE INDEX "dataset_entries_verified_idx" ON "dataset_entries"("verified");

-- CreateIndex
CREATE INDEX "dataset_entries_createdAt_idx" ON "dataset_entries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verificationCode_key" ON "certificates"("verificationCode");

-- CreateIndex
CREATE INDEX "certificates_userId_idx" ON "certificates"("userId");

-- CreateIndex
CREATE INDEX "certificates_verificationCode_idx" ON "certificates"("verificationCode");

-- CreateIndex
CREATE INDEX "discussions_userId_idx" ON "discussions"("userId");

-- CreateIndex
CREATE INDEX "discussions_category_idx" ON "discussions"("category");

-- CreateIndex
CREATE INDEX "discussions_createdAt_idx" ON "discussions"("createdAt");

-- CreateIndex
CREATE INDEX "discussions_script_idx" ON "discussions"("script");

-- CreateIndex
CREATE INDEX "discussion_likes_userId_idx" ON "discussion_likes"("userId");

-- CreateIndex
CREATE INDEX "discussion_likes_discussionId_idx" ON "discussion_likes"("discussionId");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_likes_userId_discussionId_key" ON "discussion_likes"("userId", "discussionId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "comments_discussionId_idx" ON "comments"("discussionId");

-- CreateIndex
CREATE INDEX "comments_script_idx" ON "comments"("script");

-- CreateIndex
CREATE UNIQUE INDEX "carts_userId_key" ON "carts"("userId");

-- CreateIndex
CREATE INDEX "carts_userId_idx" ON "carts"("userId");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE INDEX "cart_items_productId_idx" ON "cart_items"("productId");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "donations_userId_idx" ON "donations"("userId");

-- CreateIndex
CREATE INDEX "donations_createdAt_idx" ON "donations"("createdAt");

-- CreateIndex
CREATE INDEX "user_drawings_userId_idx" ON "user_drawings"("userId");

-- CreateIndex
CREATE INDEX "user_drawings_lessonId_idx" ON "user_drawings"("lessonId");

-- CreateIndex
CREATE INDEX "user_drawings_vowel_idx" ON "user_drawings"("vowel");

-- CreateIndex
CREATE INDEX "user_drawings_createdAt_idx" ON "user_drawings"("createdAt");

-- CreateIndex
CREATE INDEX "community_posts_userId_idx" ON "community_posts"("userId");

-- CreateIndex
CREATE INDEX "community_posts_createdAt_idx" ON "community_posts"("createdAt");

-- CreateIndex
CREATE INDEX "community_posts_isChallenge_idx" ON "community_posts"("isChallenge");

-- CreateIndex
CREATE INDEX "community_posts_isPinned_idx" ON "community_posts"("isPinned");

-- CreateIndex
CREATE INDEX "community_posts_language_idx" ON "community_posts"("language");

-- CreateIndex
CREATE INDEX "post_likes_userId_idx" ON "post_likes"("userId");

-- CreateIndex
CREATE INDEX "post_likes_postId_idx" ON "post_likes"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_userId_postId_key" ON "post_likes"("userId", "postId");

-- CreateIndex
CREATE INDEX "post_comments_userId_idx" ON "post_comments"("userId");

-- CreateIndex
CREATE INDEX "post_comments_postId_idx" ON "post_comments"("postId");

-- CreateIndex
CREATE INDEX "post_comments_createdAt_idx" ON "post_comments"("createdAt");

-- CreateIndex
CREATE INDEX "post_comments_language_idx" ON "post_comments"("language");

-- CreateIndex
CREATE INDEX "chat_messages_userId_idx" ON "chat_messages"("userId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX "training_data_userId_idx" ON "training_data"("userId");

-- CreateIndex
CREATE INDEX "training_data_sourceType_idx" ON "training_data"("sourceType");

-- CreateIndex
CREATE INDEX "training_data_language_idx" ON "training_data"("language");

-- CreateIndex
CREATE INDEX "training_data_verified_idx" ON "training_data"("verified");

-- CreateIndex
CREATE INDEX "training_data_createdAt_idx" ON "training_data"("createdAt");

-- CreateIndex
CREATE INDEX "quizzes_lessonId_idx" ON "quizzes"("lessonId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempts_quizId_idx" ON "quiz_attempts"("quizId");

-- CreateIndex
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "performance_metrics_metricType_idx" ON "performance_metrics"("metricType");

-- CreateIndex
CREATE INDEX "performance_metrics_component_idx" ON "performance_metrics"("component");

-- CreateIndex
CREATE INDEX "performance_metrics_createdAt_idx" ON "performance_metrics"("createdAt");

-- CreateIndex
CREATE INDEX "performance_metrics_characterType_idx" ON "performance_metrics"("characterType");

-- CreateIndex
CREATE INDEX "evaluation_sessions_userId_idx" ON "evaluation_sessions"("userId");

-- CreateIndex
CREATE INDEX "evaluation_sessions_sessionType_idx" ON "evaluation_sessions"("sessionType");

-- CreateIndex
CREATE INDEX "evaluation_sessions_startedAt_idx" ON "evaluation_sessions"("startedAt");

-- AddForeignKey
ALTER TABLE "character_translations" ADD CONSTRAINT "character_translations_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_translations" ADD CONSTRAINT "character_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stroke_data" ADD CONSTRAINT "stroke_data_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultural_contexts" ADD CONSTRAINT "cultural_contexts_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultural_context_translations" ADD CONSTRAINT "cultural_context_translations_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "cultural_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultural_context_translations" ADD CONSTRAINT "cultural_context_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_examples" ADD CONSTRAINT "context_examples_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "cultural_contexts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_translations" ADD CONSTRAINT "lesson_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_translations" ADD CONSTRAINT "lesson_translations_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_steps" ADD CONSTRAINT "lesson_steps_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_translations" ADD CONSTRAINT "step_translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_translations" ADD CONSTRAINT "step_translations_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "lesson_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_attempts" ADD CONSTRAINT "user_attempts_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_attempts" ADD CONSTRAINT "user_attempts_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "lesson_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_attempts" ADD CONSTRAINT "user_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_character_progress" ADD CONSTRAINT "user_character_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_character_progress" ADD CONSTRAINT "user_character_progress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handwriting_attempts" ADD CONSTRAINT "handwriting_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handwriting_attempts" ADD CONSTRAINT "handwriting_attempts_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character_references"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_entries" ADD CONSTRAINT "community_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_entries" ADD CONSTRAINT "dataset_entries_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "handwriting_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_drawings" ADD CONSTRAINT "user_drawings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_data" ADD CONSTRAINT "training_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_sessions" ADD CONSTRAINT "evaluation_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
