# Current Development Priorities

**Last Updated**: 2024-06-03

## Active Development Areas

The following features are the **current development focus**. These can be implemented **without infrastructure changes** using the existing stabilized schema and architecture.

---

## 1. Adaptive Learning Journey ✨ PRIMARY FOCUS

**Status**: 🔄 In Progress

**Spec Location**: `.kiro/specs/adaptive-didactic-learning-system/`

**Infrastructure Needs**: ✅ None (uses existing schema extensions)

**Description**: 
Eight-stage scaffolding system that guides learners from recognition through mastery:
- Recognition → Identification → Tracing
- Guided Writing → Independent Writing
- Word Formation → Sentence Formation → Cultural Application

**What's Being Built**:
- Stage progression tracking
- Competency-based mastery scoring
- Immediate feedback with OCR integration
- Learning journey UI transformation

**Why No Infrastructure Changes**:
- Uses existing `LessonProgress`, `UserCharacterProgress`, and `UserAttempt` models
- Schema extensions already approved and migrated
- Leverages existing Python OCR service
- Works with current Supabase storage

---

## 2. OCR Integration

**Status**: 📋 Planned

**Infrastructure Needs**: ✅ None (uses existing `UserAttempt` model)

**Description**:
Enhanced handwriting evaluation with detailed educational feedback:
- Shape accuracy analysis
- Stroke order and direction evaluation
- Size balance and spacing checks
- Visual correction overlays
- Actionable improvement suggestions

**Why No Infrastructure Changes**:
- Uses existing OCR service infrastructure
- Stores evaluation data in existing `UserAttempt` fields
- Leverages Supabase storage for handwriting images

---

## 3. Mastery Tracking

**Status**: 🔄 In Progress

**Infrastructure Needs**: ✅ None (uses existing `UserCharacterProgress` model)

**Description**:
Competency-based progress metrics:
- Mastery score calculation (0-100)
- Accuracy rate tracking
- Confidence score based on consistency
- Completion status (NOT_STARTED → IN_PROGRESS → LEARNED → MASTERED)
- Historical mastery data analytics

**Why No Infrastructure Changes**:
- Uses existing `UserCharacterProgress` model
- Works with current database schema
- Reads from existing progress tables

---

## 4. Learning Dashboard

**Status**: 📋 Planned

**Infrastructure Needs**: ✅ None (reads existing progress data)

**Description**:
Visual progress tracking and insights:
- Mastery map showing completion status
- Progress path through stages
- Weak characters requiring practice
- Spaced review schedule
- Time spent and accuracy trends
- XP, levels, and achievements

**Why No Infrastructure Changes**:
- Reads from existing `UserCharacterProgress` and `LessonProgress` tables
- Displays data from existing gamification fields
- No new database tables required

---

## 5. Lesson Content

**Status**: 🔄 Ongoing

**Infrastructure Needs**: ✅ None (uses existing `Lesson` and `Character` models)

**Description**:
Cultural context and educational content:
- Rwandan proverbs and stories
- Historical events and traditional practices
- Cultural values associated with characters
- Community contributions (with moderation)
- Multi-language support (English, Kinyarwanda, Umwero)

**Why No Infrastructure Changes**:
- Uses existing `Lesson`, `Character`, and content models
- Works with current database structure
- Leverages Supabase storage for media

---

## Infrastructure Change Freeze

The following systems are **frozen** and require maintainer approval for changes:

### ❌ Cannot Modify Without Approval

- Prisma schema (breaking changes)
- Database migrations (recreation or deletion)
- Seed guard logic (safety mechanisms)
- Storage architecture (Supabase-only)
- TypeScript configuration (type safety)
- Database validation scripts

### ✅ Can Use Freely

- Existing database models and fields
- Existing Supabase storage APIs
- Existing OCR service endpoints
- Existing authentication system
- Existing Next.js App Router
- Existing API routes

---

## When You Need Infrastructure Changes

### Ask These Questions First

1. **Can I use existing models?**
   - Check `prisma/schema.prisma` for available fields
   - Review existing relationships and indexes

2. **Can I add optional fields instead of required ones?**
   - Optional fields are non-breaking
   - Can be added with simple migrations

3. **Can I use JSON fields for flexible data?**
   - Many models have `metadata` or JSON fields
   - Store structured data without schema changes

4. **Can I create a new model instead of modifying existing ones?**
   - New models are less risky than changing existing ones
   - Easier to roll back if needed

### If You Still Need Infrastructure Changes

1. Read `.kiro/specs/project-guardrails/protected-systems.md`
2. Review `.kiro/specs/project-guardrails/forbidden-actions.md`
3. Document why the change is necessary
4. List all files that will be affected
5. **Ask the maintainer** for approval before proceeding

---

## Priority Workflow

### 1. Check Current Priorities

Review this document to ensure your work aligns with:
- Adaptive Learning Journey (PRIMARY)
- OCR Integration
- Mastery Tracking
- Learning Dashboard
- Lesson Content

### 2. Use Existing Infrastructure

Leverage:
- ✅ Existing Prisma models
- ✅ Existing Supabase storage
- ✅ Existing OCR service
- ✅ Existing authentication
- ✅ Existing API routes

### 3. Build Features

Focus on:
- 🎯 User-facing features
- 📊 Learning analytics
- 🎨 UI/UX improvements
- 🧪 Testing and quality
- 📖 Documentation

### 4. Avoid Infrastructure Work

Unless absolutely necessary:
- ⛔ Don't modify schema
- ⛔ Don't recreate migrations
- ⛔ Don't change storage
- ⛔ Don't modify seed logic
- ⛔ Don't weaken type safety

---

## Questions?

### "Can I add a new field to the User model?"

**Maybe.** Is it:
- Optional? → Likely okay (create migration)
- Required? → Needs approval (breaking change)
- Could use `metadata` JSON field? → Better alternative

### "Can I create a new database model?"

**Probably.** New models are less risky than modifying existing ones. Document:
- Purpose of the model
- Relationships to existing models
- Migration plan

### "Can I modify the seed script?"

**Be careful.** You can:
- ✅ Add new seed data
- ✅ Improve seed logic
- ❌ Remove seed guard safety checks
- ❌ Allow destructive operations on remote databases

### "Can I change TypeScript config?"

**Rarely.** You can:
- ✅ Add new type definitions
- ✅ Fix type errors
- ❌ Weaken strictness settings
- ❌ Remove existing type definitions

---

## Goal

**Build Adaptive Learning features using the stabilized infrastructure.**

The infrastructure is stable. Focus on:
- 🎓 Educational features
- 📈 Learning analytics
- 🎨 User experience
- 🧪 Testing and quality
- 📖 Documentation

Let's build something amazing! 🚀
