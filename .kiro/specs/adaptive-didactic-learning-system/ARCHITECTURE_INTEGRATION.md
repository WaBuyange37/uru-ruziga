# Architecture Integration Diagram
## How Phase 1 MVP Integrates with Existing Uruziga

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         URUZIGA PLATFORM                             │
│                    (Existing + Phase 1 MVP)                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  EXISTING        │  │  EXTENDED        │  │  NEW             │ │
│  │  (Reuse)         │  │  (Refactor)      │  │  (Create)        │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤ │
│  │ • LessonHeader   │  │ • LessonWorkspace│  │ • JourneyStore   │ │
│  │ • LessonTabs     │  │ • PracticePanel  │  │ • MasteryStore   │ │
│  │ • LearningPanel  │  │                  │  │ • StageStore     │ │
│  │ • AuthContext    │  │                  │  │ • FeedbackStore  │ │
│  │ • LanguageContext│  │                  │  │                  │ │
│  │                  │  │                  │  │ • 9 Journey      │ │
│  │                  │  │                  │  │   Phases         │ │
│  │                  │  │                  │  │ • 8 Stage        │ │
│  │                  │  │                  │  │   Components     │ │
│  │                  │  │                  │  │ • DrawingCanvas  │ │
│  │                  │  │                  │  │ • FeedbackDisplay│ │
│  │                  │  │                  │  │ • ProgressTracker│ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  EXISTING        │  │  EXTENDED        │  │  NEW             │ │
│  │  (Reuse)         │  │  (Enhance)       │  │  (Create)        │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤ │
│  │ /api/lessons/    │  │ /api/ocr/        │  │ /api/learning/   │ │
│  │   [lessonId]     │  │   evaluate       │  │   character/     │ │
│  │                  │  │                  │  │   :id/stage      │ │
│  │ /api/auth/*      │  │ /api/handwriting/│  │                  │ │
│  │                  │  │   submit         │  │ /api/learning/   │ │
│  │ /api/health      │  │                  │  │   stage/complete │ │
│  │                  │  │ /api/character-  │  │                  │ │
│  │                  │  │   progress       │  │ /api/learning/   │ │
│  │                  │  │                  │  │   mastery/:id    │ │
│  │                  │  │                  │  │                  │ │
│  │                  │  │                  │  │ /api/learning/   │ │
│  │                  │  │                  │  │   attempt        │ │
│  │                  │  │                  │  │                  │ │
│  │                  │  │                  │  │ /api/learning/   │ │
│  │                  │  │                  │  │   journey/:id    │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  EXISTING        │  │  EXTENDED        │  │  NEW             │ │
│  │  (Reuse)         │  │  (Add Fields)    │  │  (Create)        │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤ │
│  │ • Character      │  │ • LessonProgress │  │ • LearningStage  │ │
│  │ • User           │  │   +7 fields      │  │                  │ │
│  │ • Lesson         │  │                  │  │                  │ │
│  │ • HandwritingAttempt│ • UserCharacter  │  │                  │ │
│  │                  │  │   Progress       │  │                  │ │
│  │                  │  │   +10 fields     │  │                  │ │
│  │                  │  │                  │  │                  │ │
│  │                  │  │ • UserAttempt    │  │                  │ │
│  │                  │  │   +11 fields     │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐                        │
│  │  EXISTING        │  │  EXTENDED        │                        │
│  │  (Reuse)         │  │  (Enhance)       │                        │
│  ├──────────────────┤  ├──────────────────┤                        │
│  │ • Python OCR     │  │ • 6-Dimension    │                        │
│  │   Service        │  │   Evaluation     │                        │
│  │                  │  │                  │                        │
│  │ • Supabase       │  │ • Feedback       │                        │
│  │   Storage        │  │   Generation     │                        │
│  │                  │  │                  │                        │
│  │ • PostgreSQL     │  │ • Visual Overlay │                        │
│  │   Database       │  │   Generation     │                        │
│  └──────────────────┘  └──────────────────┘                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Learning Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LEARNER STARTS CHARACTER LESSON                   │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  LessonWorkspace      │ ◄─── EXTENDED
                    │  (Journey Phase Logic)│
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  GET /api/learning/   │ ◄─── NEW
                    │  character/:id/stage  │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Query Database:      │
                    │  • LessonProgress     │ ◄─── EXTENDED
                    │  • UserCharacterProgress│
                    │  • LearningStage      │ ◄─── NEW
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Return Current Stage │
                    │  • Stage name         │
                    │  • Progress %         │
                    │  • Unlock status      │
                    │  • Mastery score      │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Render Journey Phase │ ◄─── NEW
                    │  (e.g., TracePhase)   │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Render Stage Component│ ◄─── NEW
                    │  (e.g., TracingStage) │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Learner Draws        │
                    │  on Canvas            │ ◄─── NEW
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  POST /api/learning/  │ ◄─── NEW
                    │  attempt              │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Call Python OCR      │ ◄─── EXTENDED
                    │  • 6-dimension eval   │
                    │  • Feedback generation│
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Store Attempt:       │
                    │  • UserAttempt        │ ◄─── EXTENDED
                    │  • HandwritingAttempt │ ◄─── EXISTING
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Update Mastery:      │
                    │  • Calculate score    │ ◄─── NEW
                    │  • Update progress    │
                    │  • Check unlock       │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Return Feedback:     │
                    │  • Visual overlay     │ ◄─── NEW
                    │  • Textual guidance   │
                    │  • Improvement steps  │
                    │  • Next stage status  │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Display Feedback     │ ◄─── NEW
                    │  (FeedbackDisplay)    │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Update Progress      │
                    │  Tracker              │ ◄─── NEW
                    └───────────────────────┘
```

---

## Component Integration Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LessonWorkspace (EXTENDED)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              LessonHeader (EXISTING - Reuse)                 │   │
│  │  • Character display                                         │   │
│  │  • Progress indicator                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              LessonTabs (EXISTING - Reuse)                   │   │
│  │  • Tab navigation                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐   │
│  │  LearningPanel           │  │  PracticePanel (EXTENDED)    │   │
│  │  (EXISTING - Reuse)      │  │                              │   │
│  │                          │  │  ┌────────────────────────┐ │   │
│  │  • Character info        │  │  │  Journey Phase Logic   │ │   │
│  │  • Cultural context      │  │  │  (NEW)                 │ │   │
│  │  • Pronunciation         │  │  └────────┬───────────────┘ │   │
│  │  • Stroke order          │  │           │                  │   │
│  │                          │  │           ▼                  │   │
│  │                          │  │  ┌────────────────────────┐ │   │
│  │                          │  │  │  Stage Component       │ │   │
│  │                          │  │  │  (NEW)                 │ │   │
│  │                          │  │  │                        │ │   │
│  │                          │  │  │  • RecognitionStage    │ │   │
│  │                          │  │  │  • IdentificationStage │ │   │
│  │                          │  │  │  • TracingStage        │ │   │
│  │                          │  │  │  • GuidedWritingStage  │ │   │
│  │                          │  │  │  • IndependentWriting  │ │   │
│  │                          │  │  │  • WordFormation       │ │   │
│  │                          │  │  │  • SentenceFormation   │ │   │
│  │                          │  │  │  • CulturalApplication │ │   │
│  │                          │  │  └────────┬───────────────┘ │   │
│  │                          │  │           │                  │   │
│  │                          │  │           ▼                  │   │
│  │                          │  │  ┌────────────────────────┐ │   │
│  │                          │  │  │  DrawingCanvas (NEW)   │ │   │
│  │                          │  │  │  • Touch support       │ │   │
│  │                          │  │  │  • Stroke tracking     │ │   │
│  │                          │  │  └────────────────────────┘ │   │
│  └──────────────────────────┘  └──────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              FeedbackDisplay (NEW)                           │   │
│  │  • Visual overlay                                            │   │
│  │  • Textual guidance                                          │   │
│  │  • Improvement steps                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              ProgressTracker (NEW)                           │   │
│  │  • Mastery score                                             │   │
│  │  • Stage completion                                          │   │
│  │  • Journey progress                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## State Management Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐   │
│  │  EXISTING (React Context)│  │  NEW (Zustand Stores)        │   │
│  ├──────────────────────────┤  ├──────────────────────────────┤   │
│  │                          │  │                              │   │
│  │  • AuthContext           │  │  • JourneyStore              │   │
│  │    - User auth state     │  │    - Current phase           │   │
│  │    - JWT token           │  │    - Completed phases        │   │
│  │    - Login/logout        │  │    - Phase progress          │   │
│  │                          │  │    - Pause/resume            │   │
│  │  • LanguageContext       │  │                              │   │
│  │    - Preferred language  │  │  • MasteryStore              │   │
│  │    - Translation         │  │    - Mastery score           │   │
│  │                          │  │    - Accuracy rate           │   │
│  │  • CartContext           │  │    - Confidence score        │   │
│  │    - Shopping cart       │  │    - Completion status       │   │
│  │                          │  │                              │   │
│  │                          │  │  • StageStore                │   │
│  │                          │  │    - Current stage           │   │
│  │                          │  │    - Completed stages        │   │
│  │                          │  │    - Stage progress          │   │
│  │                          │  │                              │   │
│  │                          │  │  • FeedbackStore             │   │
│  │                          │  │    - Current feedback        │   │
│  │                          │  │    - Feedback history        │   │
│  │                          │  │    - Loading state           │   │
│  │                          │  │                              │   │
│  └──────────────────────────┘  └──────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              COEXISTENCE STRATEGY                            │   │
│  │  • React Context for global app state (auth, language)      │   │
│  │  • Zustand for learning-specific state (journey, mastery)   │   │
│  │  • No conflicts - separate concerns                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Character (EXISTING - Reuse)                                 │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  id, umweroGlyph, latinEquivalent, type, difficulty,   │  │  │
│  │  │  strokeCount, order, glyphImageUrl, audioUrl, ...      │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  LessonProgress (EXTENDED - Add 7 fields)                    │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  EXISTING: id, userId, lessonId, completed, score,     │  │  │
│  │  │            timeSpent, attempts, status, ...            │  │  │
│  │  │  ─────────────────────────────────────────────────────  │  │  │
│  │  │  NEW:      currentStage, stageCompletionData,          │  │  │
│  │  │            timeSpentPerStage, journeyPhase,            │  │  │
│  │  │            journeyStartedAt, journeyPausedAt,          │  │  │
│  │  │            journeyCompletedAt                          │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UserCharacterProgress (EXTENDED - Add 10 fields)            │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  EXISTING: id, userId, characterId, status, score,     │  │  │
│  │  │            timeSpent, attempts, lastAttempt            │  │  │
│  │  │  ─────────────────────────────────────────────────────  │  │  │
│  │  │  NEW:      masteryScore, accuracyRate, confidenceScore,│  │  │
│  │  │            completionStatus, currentStage,             │  │  │
│  │  │            completedStages, stageScores, stageAttempts,│  │  │
│  │  │            journeyPhase, completedPhases               │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UserAttempt (EXTENDED - Add 11 fields)                      │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  EXISTING: id, userId, stepId, characterId, attemptType│  │  │
│  │  │            drawingData, answer, aiScore, aiMetrics, ...│  │  │
│  │  │  ─────────────────────────────────────────────────────  │  │  │
│  │  │  NEW:      learningStage, journeyPhase, shapeAccuracy, │  │  │
│  │  │            strokeOrder, strokeDirection,               │  │  │
│  │  │            strokeConsistency, sizeBalance, spacing,    │  │  │
│  │  │            feedbackType, visualOverlay, improvementSteps│ │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  LearningStage (NEW - Create)                                │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  id, name, displayName, description, order,            │  │  │
│  │  │  masteryThreshold, minAttempts, requiredAccuracy,      │  │  │
│  │  │  estimatedMinutes, interactionType, validationRules,   │  │  │
│  │  │  isActive, createdAt, updatedAt                        │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  HandwritingAttempt (EXISTING - Reuse)                       │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  id, userId, characterId, strokes, score, ssimScore,   │  │  │
│  │  │  contourScore, skeletonScore, feedback, heatmapUrl, ...│  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Migration Timeline

```
Week 1: Database Foundation
├── Day 1-2: Create Prisma migrations
├── Day 3: Seed learning stages
├── Day 4: Test migrations on staging
└── Day 5: Deploy to production

Week 2-3: Backend APIs
├── Week 2: Extend existing APIs
│   ├── /api/ocr/evaluate
│   ├── /api/handwriting/submit
│   └── /api/character-progress
└── Week 3: Create new learning endpoints
    ├── /api/learning/character/:id/stage
    ├── /api/learning/stage/complete
    ├── /api/learning/mastery/:id
    ├── /api/learning/attempt
    └── /api/learning/journey/:id

Week 3: OCR Enhancement
├── Day 1-2: Extend Python OCR service
├── Day 3: Add 6-dimension evaluation
├── Day 4: Add feedback generation
└── Day 5: Test performance (<500ms)

Week 4: State Management
├── Day 1: Create JourneyStore
├── Day 2: Create MasteryStore
├── Day 3: Create StageStore
├── Day 4: Create FeedbackStore
└── Day 5: Create API hooks

Week 5-6: UI Components
├── Week 5: Journey phase components
│   ├── IntroductionPhase
│   ├── ObservePhase
│   ├── RecognizePhase
│   ├── TracePhase
│   └── PracticePhase
└── Week 6: Stage components
    ├── RecognitionStage
    ├── IdentificationStage
    ├── TracingStage
    ├── GuidedWritingStage
    ├── IndependentWritingStage
    ├── WordFormationStage
    ├── SentenceFormationStage
    └── CulturalApplicationStage

Week 7: Integration Testing
├── Day 1-2: E2E testing
├── Day 3: Performance testing
├── Day 4: Cross-browser testing
└── Day 5: Accessibility testing

Week 8: Deployment
├── Day 1-2: Deploy to production
├── Day 3: Enable for 10% of users
├── Day 4: Enable for 50% of users
└── Day 5: Enable for 100% of users
```

---

## Key Integration Points

### 1. Authentication Flow
```
EXISTING AuthContext → JWT Token → API Authorization
                                         ↓
                                    NEW Learning APIs
```

### 2. Lesson Loading
```
EXISTING /api/lessons/[lessonId] → Lesson Data
                                         ↓
                                    NEW Journey Phase Logic
```

### 3. Progress Tracking
```
EXISTING UserCharacterProgress → EXTENDED with Mastery Metrics
                                         ↓
                                    NEW Mastery Calculation
```

### 4. OCR Evaluation
```
EXISTING Python OCR Service → EXTENDED with 6 Dimensions
                                         ↓
                                    NEW Feedback Generation
```

### 5. Canvas Drawing
```
EXISTING Drawing Logic → NEW DrawingCanvas Component
                                         ↓
                                    NEW Stage-Specific Validation
```

---

## Summary

**✅ Seamless Integration Achieved**

- **Existing components** remain functional
- **New features** extend existing architecture
- **No breaking changes** to current functionality
- **Backward compatibility** maintained throughout
- **Gradual rollout** ensures stability

**Ready for Implementation** ✅
