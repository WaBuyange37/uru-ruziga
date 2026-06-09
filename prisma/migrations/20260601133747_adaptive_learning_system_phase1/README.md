# Adaptive Learning System Phase 1 - Database Migration

## Overview

This migration adds database schema changes for the **Adaptive Didactic Learning System Phase 1 MVP**. It implements support for:

- **Eight-Stage Scaffolding System** (Requirement 1)
- **Competency-Based Mastery Tracking** (Requirement 2)
- **Immediate Feedback Loop with OCR Integration** (Requirement 3)
- **Learning Journey UI Transformation** (Requirement 14)

## Migration Details

**Migration ID**: `20260601133747_adaptive_learning_system_phase1`
**Type**: Non-breaking schema additions
**Estimated Execution Time**: < 30 seconds
**Downtime Required**: None (zero-downtime deployment)

## Schema Changes

### 1. `lesson_progress` Table Extensions

New columns for journey and stage tracking:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `currentStage` | TEXT | Yes | NULL | Current learning stage (e.g., RECOGNITION, TRACING) |
| `stageCompletionData` | JSONB | Yes | NULL | Stage-by-stage completion details |
| `timeSpentPerStage` | JSONB | Yes | NULL | Time tracking per stage in seconds |
| `journeyPhase` | TEXT | Yes | NULL | Current journey phase (INTRODUCTION, OBSERVE, etc.) |
| `journeyStartedAt` | TIMESTAMP | Yes | NULL | When the learning journey started |
| `journeyPausedAt` | TIMESTAMP | Yes | NULL | When the journey was paused |
| `journeyCompletedAt` | TIMESTAMP | Yes | NULL | When the journey was completed |

**New Indexes**:
- `lesson_progress_userId_currentStage_idx` - Composite index for user + stage queries
- `lesson_progress_journeyPhase_idx` - Index for journey phase filtering

### 2. `user_character_progress` Table Extensions

New columns for mastery tracking and stage progression:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `masteryScore` | INTEGER | No | 0 | Composite mastery score (0-100) |
| `accuracyRate` | DOUBLE PRECISION | No | 0 | Percentage of correct attempts (0-1) |
| `confidenceScore` | DOUBLE PRECISION | No | 0 | Consistency metric (0-100) |
| `completionStatus` | TEXT | No | 'NOT_STARTED' | NOT_STARTED \| IN_PROGRESS \| LEARNED \| MASTERED |
| `currentStage` | TEXT | Yes | NULL | Current learning stage |
| `completedStages` | TEXT[] | No | [] | Array of completed stage names |
| `stageScores` | JSONB | Yes | NULL | Scores per stage |
| `stageAttempts` | JSONB | Yes | NULL | Attempts per stage |
| `journeyPhase` | TEXT | Yes | NULL | Current journey phase |
| `completedPhases` | TEXT[] | No | [] | Completed journey phases |

**New Indexes**:
- `user_character_progress_completionStatus_idx` - Index for status filtering
- `user_character_progress_currentStage_idx` - Index for stage filtering

### 3. `user_attempts` Table Extensions

New columns for enhanced OCR metrics and feedback:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `learningStage` | TEXT | Yes | NULL | Which stage this attempt belongs to |
| `journeyPhase` | TEXT | Yes | NULL | Which journey phase |
| `shapeAccuracy` | DOUBLE PRECISION | Yes | NULL | Structural similarity score (0-100) |
| `strokeOrder` | DOUBLE PRECISION | Yes | NULL | Stroke order correctness (0-100) |
| `strokeDirection` | DOUBLE PRECISION | Yes | NULL | Stroke direction correctness (0-100) |
| `strokeConsistency` | DOUBLE PRECISION | Yes | NULL | Consistency across strokes (0-100) |
| `sizeBalance` | DOUBLE PRECISION | Yes | NULL | Character proportion balance (0-100) |
| `spacing` | DOUBLE PRECISION | Yes | NULL | Spacing for multi-stroke characters (0-100) |
| `feedbackType` | TEXT | Yes | NULL | 'corrective' \| 'constructive' \| 'encouraging' |
| `visualOverlay` | JSONB | Yes | NULL | Overlay data for visual feedback |
| `improvementSteps` | TEXT[] | No | [] | Specific improvement suggestions |

**New Indexes**:
- `user_attempts_learningStage_idx` - Index for stage filtering
- `user_attempts_journeyPhase_idx` - Index for journey phase filtering

### 4. New `learning_stages` Table

Configuration table for the 8 learning stages:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | TEXT | No | - | Primary key (CUID) |
| `name` | TEXT | No | - | Stage name (unique) |
| `displayName` | TEXT | No | - | Human-readable name |
| `description` | TEXT | No | - | Stage description |
| `order` | INTEGER | No | - | Stage order (1-8) |
| `masteryThreshold` | INTEGER | No | 80 | Required mastery score to complete |
| `minAttempts` | INTEGER | No | 3 | Minimum attempts required |
| `requiredAccuracy` | DOUBLE PRECISION | No | 0.8 | Required accuracy rate |
| `estimatedMinutes` | INTEGER | No | 5 | Estimated completion time |
| `interactionType` | TEXT | No | - | Type of interaction (click, drag, draw, text, audio) |
| `validationRules` | JSONB | No | - | Validation rules for the stage |
| `isActive` | BOOLEAN | No | true | Whether the stage is active |
| `createdAt` | TIMESTAMP | No | NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | No | NOW() | Last update timestamp |

**Indexes**:
- `learning_stages_name_key` - Unique constraint on name
- `learning_stages_order_idx` - Index for ordering
- `learning_stages_isActive_idx` - Index for active filtering

## Deployment Instructions

### Development Environment

```bash
# Apply migration to development database
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Run seed script (after migration)
npm run db:seed
```

### Production Environment

#### Step 1: Backup Database

```bash
# Create backup before migration
pg_dump -h <host> -U <user> -d uru-ruziga -F c -f backup_before_adaptive_learning_$(date +%Y%m%d_%H%M%S).dump
```

#### Step 2: Apply Migration

```bash
# Option A: Using Prisma Migrate (recommended)
npx prisma migrate deploy

# Option B: Using manual SQL script
psql -h <host> -U <user> -d uru-ruziga -f prisma/migrations/20260601133747_adaptive_learning_system_phase1/production_migration.sql
```

#### Step 3: Verify Migration

```bash
# Check migration status
npx prisma migrate status

# Verify schema changes
psql -h <host> -U <user> -d uru-ruziga -c "\d lesson_progress"
psql -h <host> -U <user> -d uru-ruziga -c "\d user_character_progress"
psql -h <host> -U <user> -d uru-ruziga -c "\d user_attempts"
psql -h <host> -U <user> -d uru-ruziga -c "\d learning_stages"
```

#### Step 4: Run Seed Script

```bash
# Populate learning_stages table
npm run db:seed:stages
```

#### Step 5: Run Data Migration (Optional)

```bash
# Initialize existing user progress with new fields
npm run db:migrate:user-progress
```

## Rollback Instructions

### Emergency Rollback

**WARNING**: Rollback will delete all adaptive learning data including mastery scores, stage progress, and journey tracking.

```bash
# Step 1: Backup current state
pg_dump -h <host> -U <user> -d uru-ruziga -F c -f backup_before_rollback_$(date +%Y%m%d_%H%M%S).dump

# Step 2: Execute rollback script
psql -h <host> -U <user> -d uru-ruziga -f prisma/migrations/20260601133747_adaptive_learning_system_phase1/production_rollback.sql

# Step 3: Redeploy previous application version
# (Follow your deployment process)

# Step 4: Verify rollback
npx prisma migrate status
```

## Testing Instructions

### Test on Development Database

```bash
# 1. Apply migration
npx prisma migrate dev

# 2. Run seed script
npm run db:seed

# 3. Run integration tests
npm run test:integration

# 4. Test rollback
psql -d uru-ruziga -f prisma/migrations/20260601133747_adaptive_learning_system_phase1/production_rollback.sql

# 5. Verify rollback
npx prisma migrate status

# 6. Re-apply migration
npx prisma migrate dev
```

### Test on Staging Database

```bash
# 1. Create staging database snapshot
# 2. Apply migration to staging
# 3. Run smoke tests
# 4. Verify data integrity
# 5. Test rollback procedure
# 6. Re-apply migration
```

## Verification Checklist

After applying the migration, verify:

- [ ] All new columns exist in `lesson_progress` table
- [ ] All new columns exist in `user_character_progress` table
- [ ] All new columns exist in `user_attempts` table
- [ ] `learning_stages` table exists with correct schema
- [ ] All indexes are created successfully
- [ ] Existing data is preserved (no data loss)
- [ ] Application can connect to database
- [ ] Prisma Client is regenerated
- [ ] Seed script runs successfully
- [ ] No performance degradation on existing queries

## Performance Impact

### Expected Impact

- **Migration execution**: < 30 seconds
- **Downtime**: None (all changes are non-breaking)
- **Storage increase**: Minimal (~5-10% for new columns)
- **Query performance**: Improved (new indexes added)

### Monitoring

Monitor these metrics after deployment:

- Database connection pool usage
- Query execution times for user progress queries
- Index usage statistics
- Table sizes and growth rates

## Troubleshooting

### Migration Fails

```bash
# Check migration status
npx prisma migrate status

# Check database connection
psql -h <host> -U <user> -d uru-ruziga -c "SELECT version();"

# Check for locks
psql -h <host> -U <user> -d uru-ruziga -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Resolve migration
npx prisma migrate resolve --applied <migration_name>
```

### Rollback Fails

```bash
# Check for dependent objects
psql -h <host> -U <user> -d uru-ruziga -c "\d+ learning_stages"

# Force drop with CASCADE (use with caution)
# Edit rollback script to add CASCADE to DROP statements
```

### Performance Issues

```bash
# Analyze tables after migration
psql -h <host> -U <user> -d uru-ruziga -c "ANALYZE lesson_progress;"
psql -h <host> -U <user> -d uru-ruziga -c "ANALYZE user_character_progress;"
psql -h <host> -U <user> -d uru-ruziga -c "ANALYZE user_attempts;"

# Check index usage
psql -h <host> -U <user> -d uru-ruziga -c "SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';"
```

## Next Steps

After successful migration:

1. ✅ Run seed script to populate `learning_stages` table
2. ✅ Run data migration script to initialize existing user progress
3. ✅ Deploy application code with adaptive learning features
4. ✅ Monitor application logs and database performance
5. ✅ Collect user feedback on new features

## Support

For issues or questions:

- Check migration logs: `prisma/migrations/migration_log.txt`
- Review Prisma documentation: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Contact development team: [your-team-email]

## References

- **Requirements Document**: `.kiro/specs/adaptive-didactic-learning-system/requirements.md`
- **Design Document**: `.kiro/specs/adaptive-didactic-learning-system/design.md`
- **Tasks Document**: `.kiro/specs/adaptive-didactic-learning-system/tasks.md`
- **Prisma Schema**: `prisma/schema.prisma`
