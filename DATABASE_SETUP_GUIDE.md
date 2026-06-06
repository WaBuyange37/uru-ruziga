# Uruziga Database Setup Guide

## Overview

This guide covers the complete database setup for the Uruziga platform, supporting both **local PostgreSQL** and **Supabase** environments.

## Database Architecture

- **Schema**: 41 tables with complex relationships
- **Models**: 40+ Prisma models
- **Enums**: 13 custom enums
- **Seed Data**: 95 characters, 94 lessons, 4 achievements, 3 users

## Prerequisites

### Local PostgreSQL
- PostgreSQL 14+ installed
- Database user with CREATE/DROP privileges
- Database created: `uru-ruziga`

### Supabase
- Supabase project created
- Connection string from project settings
- Direct URL for migrations

## Environment Configuration

### Local Development (.env.local or .env)

```env
# Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/uru-ruziga"
DIRECT_URL="postgresql://username:password@localhost:5432/uru-ruziga"

# Seed behavior
SEED_CLEAN="true"  # Set to false to preserve existing data
NODE_ENV="development"
```

### Supabase Production (.env.production)

```env
# Supabase connection (get from Supabase Dashboard → Settings → Database)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Seed behavior
SEED_CLEAN="false"  # Never clean production data
NODE_ENV="production"
```

## Setup Commands

### 1. Initial Setup (Fresh Database)

```bash
# Validate schema
npm run prisma:generate

# Create migration
npx prisma migrate dev --name initial_schema

# Seed database
npm run prisma:seed
```

### 2. Reset Database (Development Only)

```bash
# WARNING: This deletes all data
npx prisma migrate reset
```

### 3. Apply Migrations (Production)

```bash
# Apply pending migrations without prompts
npx prisma migrate deploy
```

### 4. Seed Database

```bash
# With cleaning (development)
SEED_CLEAN=true npm run prisma:seed

# Without cleaning (production)
SEED_CLEAN=false npm run prisma:seed
```

### 5. Open Prisma Studio

```bash
npm run prisma:studio
```

## Migration Strategy

### Local PostgreSQL → Supabase

1. **Export schema from local**:
   ```bash
   npx prisma migrate dev --name baseline
   ```

2. **Apply to Supabase**:
   ```bash
   # Set Supabase DATABASE_URL in .env
   npx prisma migrate deploy
   ```

3. **Seed Supabase**:
   ```bash
   SEED_CLEAN=false npm run prisma:seed
   ```

### Supabase → Local PostgreSQL

1. **Pull schema from Supabase**:
   ```bash
   npx prisma db pull
   ```

2. **Generate migration**:
   ```bash
   npx prisma migrate dev --name from_supabase
   ```

## Seed Data Details

### Languages (3)
- English (en) - Default
- Kinyarwanda (rw)
- Umwero (um)

### Characters (95)
- **Vowels**: 5 (A, E, I, O, U)
- **Base Consonants**: 19 (B, C, D, F, G, H, J, K, L, M, N, P, R, S, T, V, W, Y, Z)
- **Compound Consonants**: 21 (MB, MF, MV, NC, ND, NG, NJ, NK, NS, NT, NZ, NY, PF, SH, NSH, TS, JY, NJY, SHY, NSHY, etc.)
- **Ligatures**: 47 (BW, BY, CW, CY, DW, FW, FY, GW, KW, MW, MY, NW, NTW, PW, PY, RW, RY, SW, SY, TW, TY, VW, VY, ZW, etc.)
- **Special**: 3 (SPACE, PERIOD, COMMA)

### Lessons (94)
- Individual lesson for each character
- 2 cultural lessons
- Organized by difficulty: BEGINNER, INTERMEDIATE, ADVANCED

### Achievements (4)
- First Steps
- Vowel Master
- Consonant Explorer
- Cultural Seeker

### Users (3)
- Admin: 37nzela@gmail.com (kwizera)
- Demo: demo@uruziga.com (demo)
- Teacher: teacher@uruziga.com (teacher)

## Seed Behavior

### Idempotent Operations
- Uses `upsert` for all records
- Safe to run multiple times
- Prevents duplicate records

### Cleaning Strategy
- **Development**: `SEED_CLEAN=true` truncates all tables
- **Production**: `SEED_CLEAN=false` preserves existing data
- Uses `TRUNCATE ... RESTART IDENTITY CASCADE`

### Error Handling
- Continues on non-critical errors
- Logs all operations
- Reports success/failure counts

## Validation Commands

### Check Schema Validity
```bash
npx prisma validate
```

### Check Migration Status
```bash
npx prisma migrate status
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Format Schema
```bash
npx prisma format
```

## Troubleshooting

### Migration Conflicts
```bash
# Reset migration history (development only)
npx prisma migrate reset

# Create new baseline
npx prisma migrate dev --name new_baseline
```

### Seed Failures
```bash
# Check database connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Verify tables exist
npx prisma db execute --stdin <<< "\\dt"

# Run seed with verbose logging
DEBUG=* npm run prisma:seed
```

### Supabase Connection Issues
- Verify connection string format
- Check if IP is whitelisted in Supabase
- Use DIRECT_URL for migrations
- Use DATABASE_URL (pooled) for application

### Permission Errors
- Ensure database user has CREATE/DROP privileges
- For Supabase, use the `postgres` user
- Check firewall rules

## Supabase-Specific Notes

### Connection Pooling
- **DATABASE_URL**: Uses pgBouncer (port 6543) - for application
- **DIRECT_URL**: Direct connection (port 5432) - for migrations

### Migration Limitations
- Some PostgreSQL features may not be available
- Row Level Security (RLS) must be configured separately
- Extensions must be enabled in Supabase dashboard

### Performance
- Use connection pooling for production
- Enable statement timeout
- Monitor query performance in Supabase dashboard

## Production Checklist

- [ ] Supabase project created
- [ ] Connection strings configured
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Seed data loaded: `SEED_CLEAN=false npm run prisma:seed`
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Environment variables set in hosting platform
- [ ] Database backups configured
- [ ] RLS policies configured (if needed)
- [ ] Connection pooling enabled
- [ ] Monitoring and alerts set up

## Maintenance

### Regular Tasks
- Monitor database size
- Review slow queries
- Update Prisma dependencies
- Backup migration history
- Document schema changes

### Schema Updates
1. Modify `prisma/schema.prisma`
2. Run `npx prisma format`
3. Run `npx prisma validate`
4. Create migration: `npx prisma migrate dev --name description`
5. Test locally
6. Apply to production: `npx prisma migrate deploy`
7. Update seed if needed

## Support

For issues or questions:
- Check Prisma docs: https://www.prisma.io/docs
- Check Supabase docs: https://supabase.com/docs
- Review migration files in `prisma/migrations/`
- Check seed logs for errors
