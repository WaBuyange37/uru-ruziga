# Adaptive Learning System - Migration Guide

## Overview

This guide provides comprehensive instructions for deploying the Adaptive Learning System Phase 1 database migrations to production environments.

**Migration ID**: `20260601133747_adaptive_learning_system_phase1`  
**Status**: ✅ Tested and verified on development  
**Risk Level**: Low (non-breaking changes only)  
**Estimated Downtime**: None (zero-downtime deployment)

## Pre-Migration Checklist

Before deploying to production, ensure:

- [ ] All team members are notified of the deployment
- [ ] Database backup is created and verified
- [ ] Staging environment has been tested successfully
- [ ] Application code is ready to deploy (compatible with new schema)
- [ ] Rollback procedure is documented and understood
- [ ] Monitoring and alerting are configured
- [ ] Database maintenance window is scheduled (if required)

## Migration Files

The migration includes the following files:

```
prisma/migrations/20260601133747_adaptive_learning_system_phase1/
├── migration.sql                  # Prisma-generated migration
├── production_migration.sql       # Production-ready SQL with verification
├── production_rollback.sql        # Emergency rollback script
└── README.md                      # Detailed migration documentation
```

## Deployment Steps

### Step 1: Create Database Backup

**Critical**: Always create a backup before applying migrations.

```bash
# PostgreSQL backup
pg_dump -h <host> -U <user> -d uru-ruziga -F c -f backup_before_adaptive_learning_$(date +%Y%m%d_%H%M%S).dump

# Verify backup
pg_restore --list backup_before_adaptive_learning_*.dump | head -20

# Store backup in secure location
aws s3 cp backup_before_adaptive_learning_*.dump s3://your-backup-bucket/database-backups/
```

### Step 2: Test Migration on Staging

```bash
# 1. Restore production snapshot to staging
pg_restore -h staging-host -U user -d uru-ruziga-staging backup_before_adaptive_learning_*.dump

# 2. Apply migration to staging
cd /path/to/uru-ruziga
npx prisma migrate deploy

# 3. Verify migration
npx tsx scripts/verify-adaptive-learning-migration.ts

# 4. Run smoke tests
npm run test:smoke

# 5. Test rollback procedure
psql -h staging-host -U user -d uru-ruziga-staging -f prisma/migrations/20260601133747_adaptive_learning_system_phase1/production_rollback.sql

# 6. Re-apply migration
npx prisma migrate deploy
```

### Step 3: Deploy to Production

#### Option A: Using Prisma Migrate (Recommended)

```bash
# 1. Set production environment variables
export DATABASE_URL="postgresql://user:password@prod-host:5432/uru-ruziga"
export DIRECT_URL="postgresql://user:password@prod-host:5432/uru-ruziga"

# 2. Check migration status
npx prisma migrate status

# 3. Apply migration
npx prisma migrate deploy

# 4. Verify migration
npx tsx scripts/verify-adaptive-learning-migration.ts

# 5. Generate Prisma Client
npx prisma generate
```

#### Option B: Using Manual SQL Script

```bash
# 1. Connect to production database
psql -h prod-host -U user -d uru-ruziga

# 2. Apply migration script
\i prisma/migrations/20260601133747_adaptive_learning_system_phase1/production_migration.sql

# 3. Verify migration (within psql)
\d lesson_progress
\d user_character_progress
\d user_attempts
\d learning_stages

# 4. Exit psql
\q

# 5. Verify with script
npx tsx scripts/verify-adaptive-learning-migration.ts
```

### Step 4: Deploy Application Code

```bash
# 1. Build application with new schema
npm run build

# 2. Deploy to production
# (Follow your deployment process - Vercel, Netlify, Docker, etc.)

# 3. Verify application starts successfully
curl https://your-app.com/api/health

# 4. Monitor logs for errors
# (Check your logging service - CloudWatch, Datadog, etc.)
```

### Step 5: Run Seed Script

```bash
# Populate learning_stages table with 8 stages
npm run db:seed:stages

# Verify stages were created
npx prisma studio
# Navigate to learning_stages table and verify 8 records exist
```

### Step 6: Post-Deployment Verification

```bash
# 1. Run full verification
npx tsx scripts/verify-adaptive-learning-migration.ts

# 2. Check database performance
# Monitor query execution times
# Check index usage statistics

# 3. Test key user flows
# - User login
# - Lesson access
# - Character progress tracking
# - Attempt submission

# 4. Monitor error rates
# Check application logs for database errors
# Monitor Sentry/error tracking service
```

## Rollback Procedure

### When to Rollback

Rollback if you encounter:

- Critical application errors related to database schema
- Data corruption or integrity issues
- Severe performance degradation
- Inability to complete migration

### Rollback Steps

**WARNING**: Rollback will delete all adaptive learning data collected since migration.

```bash
# 1. Create backup of current state
pg_dump -h prod-host -U user -d uru-ruziga -F c -f backup_before_rollback_$(date +%Y%m%d_%H%M%S).dump

# 2. Notify team of rollback
# Send alert to team channels

# 3. Execute rollback script
psql -h prod-host -U user -d uru-ruziga -f prisma/migrations/20260601133747_adaptive_learning_system_phase1/production_rollback.sql

# 4. Verify rollback
npx prisma migrate status

# 5. Redeploy previous application version
# (Follow your deployment process)

# 6. Verify application functionality
curl https://your-app.com/api/health

# 7. Monitor for stability
# Check logs and error rates

# 8. Document rollback reason
# Create incident report
```

## Monitoring and Alerts

### Key Metrics to Monitor

After deployment, monitor:

1. **Database Performance**
   - Query execution times (p50, p95, p99)
   - Connection pool usage
   - Index hit rates
   - Table sizes

2. **Application Performance**
   - API response times
   - Error rates
   - User session duration
   - Feature usage

3. **Data Integrity**
   - Record counts in new tables
   - NULL value percentages in new columns
   - Data consistency checks

### Recommended Alerts

Set up alerts for:

- Database connection failures
- Query execution time > 1 second
- Error rate > 1%
- Disk space usage > 80%
- Connection pool exhaustion

## Troubleshooting

### Migration Fails to Apply

**Symptom**: Migration command fails with error

**Solutions**:

```bash
# Check for database locks
psql -h prod-host -U user -d uru-ruziga -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Check for conflicting migrations
npx prisma migrate status

# Resolve migration manually
npx prisma migrate resolve --applied 20260601133747_adaptive_learning_system_phase1

# Force migration (use with caution)
npx prisma migrate deploy --force
```

### Application Fails to Start

**Symptom**: Application crashes on startup with database errors

**Solutions**:

```bash
# Regenerate Prisma Client
npx prisma generate

# Verify schema matches database
npx prisma db pull
npx prisma format

# Check environment variables
echo $DATABASE_URL

# Test database connection
npx prisma db execute --stdin <<< "SELECT 1;"
```

### Performance Degradation

**Symptom**: Slow query execution after migration

**Solutions**:

```bash
# Analyze tables
psql -h prod-host -U user -d uru-ruziga -c "ANALYZE lesson_progress;"
psql -h prod-host -U user -d uru-ruziga -c "ANALYZE user_character_progress;"
psql -h prod-host -U user -d uru-ruziga -c "ANALYZE user_attempts;"

# Check index usage
psql -h prod-host -U user -d uru-ruziga -c "
  SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
"

# Vacuum tables
psql -h prod-host -U user -d uru-ruziga -c "VACUUM ANALYZE;"
```

### Data Integrity Issues

**Symptom**: Unexpected NULL values or missing data

**Solutions**:

```bash
# Check for NULL values in new columns
psql -h prod-host -U user -d uru-ruziga -c "
  SELECT 
    COUNT(*) as total,
    COUNT(currentStage) as with_stage,
    COUNT(*) - COUNT(currentStage) as null_stage
  FROM lesson_progress;
"

# Verify default values
psql -h prod-host -U user -d uru-ruziga -c "
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE masteryScore = 0) as default_mastery,
    COUNT(*) FILTER (WHERE completionStatus = 'NOT_STARTED') as not_started
  FROM user_character_progress;
"

# Run data migration script if needed
npm run db:migrate:user-progress
```

## Testing Checklist

### Pre-Deployment Testing

- [ ] Migration applies successfully on development
- [ ] Migration applies successfully on staging
- [ ] Verification script passes on all environments
- [ ] Rollback script tested on staging
- [ ] Application starts with new schema
- [ ] Key user flows work correctly
- [ ] Performance benchmarks meet requirements

### Post-Deployment Testing

- [ ] Verification script passes on production
- [ ] Application health check passes
- [ ] User login works
- [ ] Lesson access works
- [ ] Character progress tracking works
- [ ] Attempt submission works
- [ ] No increase in error rates
- [ ] Query performance is acceptable

## Success Criteria

The migration is considered successful when:

1. ✅ All schema changes applied without errors
2. ✅ Verification script passes (37/37 checks)
3. ✅ Application starts and serves traffic
4. ✅ No increase in error rates (< 0.1%)
5. ✅ Query performance within acceptable limits (p95 < 200ms)
6. ✅ No data loss or corruption
7. ✅ User flows work as expected
8. ✅ Monitoring shows healthy metrics

## Next Steps

After successful migration:

1. **Run Seed Script**
   ```bash
   npm run db:seed:stages
   ```

2. **Run Data Migration** (Optional)
   ```bash
   npm run db:migrate:user-progress
   ```

3. **Enable Adaptive Learning Features**
   - Update feature flags
   - Enable new UI components
   - Announce new features to users

4. **Monitor and Optimize**
   - Track feature usage
   - Collect user feedback
   - Optimize query performance
   - Plan for Phase 2 features

## Support and Escalation

### Contact Information

- **Development Team**: [your-team-email]
- **Database Admin**: [dba-email]
- **DevOps Team**: [devops-email]
- **On-Call Engineer**: [on-call-phone]

### Escalation Path

1. **Level 1**: Development team attempts resolution
2. **Level 2**: Database admin reviews and assists
3. **Level 3**: Execute rollback procedure
4. **Level 4**: Restore from backup

### Documentation

- **Requirements**: `.kiro/specs/adaptive-didactic-learning-system/requirements.md`
- **Design**: `.kiro/specs/adaptive-didactic-learning-system/design.md`
- **Tasks**: `.kiro/specs/adaptive-didactic-learning-system/tasks.md`
- **Migration README**: `prisma/migrations/20260601133747_adaptive_learning_system_phase1/README.md`

## Appendix

### Database Schema Changes Summary

| Table | New Columns | Indexes | Breaking Changes |
|-------|-------------|---------|------------------|
| `lesson_progress` | 7 | 2 | None |
| `user_character_progress` | 10 | 2 | None |
| `user_attempts` | 11 | 2 | None |
| `learning_stages` | New table | 3 | None |

### Migration Timeline

- **Development**: Tested and verified ✅
- **Staging**: Pending
- **Production**: Pending

### Version Compatibility

- **Prisma**: 5.22.0+
- **PostgreSQL**: 12+
- **Node.js**: 18+
- **Next.js**: 14+

---

**Last Updated**: 2026-06-01  
**Document Version**: 1.0  
**Migration Status**: Ready for deployment
