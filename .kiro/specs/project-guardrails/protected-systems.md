# Protected Systems

**Last Updated**: 2024-06-03

This document lists all infrastructure systems that are protected from modification without maintainer approval.

## Why Protected Systems?

Uruziga has completed significant infrastructure stabilization work documented in:
- **Commit 2ba91e4**: Stabilized Phase 1 database, Supabase storage, and type safety
- **Commit 69ad93a**: Implemented seed guard against remote destructive cleanup

These systems are now **frozen** to prevent accidental regressions. Changes require explicit approval.

---

## 1. Prisma Schema

**Files**: `prisma/schema.prisma`

**Status**: ✅ Stabilized in commit 2ba91e4

**Why Protected**: Schema has been stabilized for Supabase-only storage architecture. Breaking changes could affect database migrations and frontend queries.

**Verification**: `npx prisma validate`

**What You Can Do**:
- ✅ Add new models (additive changes)
- ✅ Add new optional fields to existing models
- ✅ Create new migrations for approved changes

**What's Forbidden**:
- ❌ Renaming existing models or fields
- ❌ Removing fields without migration
- ❌ Changing field types without approval

---

## 2. Migration History

**Files**: `prisma/migrations/**`

**Status**: ✅ Stabilized in commit 2ba91e4

**Why Protected**: Migration history must remain intact. Recreating migrations breaks production database synchronization and causes deployment failures.

**Verification**: `npx prisma migrate status`

**What You Can Do**:
- ✅ Create new migrations for schema changes
- ✅ Review migration history

**What's Forbidden**:
- ❌ Deleting migration folders
- ❌ Recreating all migrations from scratch
- ❌ Modifying existing migration files
- ❌ Running `prisma migrate reset --force` on remote databases

---

## 3. Seed Guard

**Files**: `prisma/seed.ts`

**Status**: ✅ Implemented in commit 69ad93a

**Why Protected**: The seed guard prevents destructive database operations on remote (Supabase) databases. Removing it could cause catastrophic data loss in production.

**Key Safety Mechanisms**:
- `cleanAllowed` flag - Must be true for destructive operations
- `isSupabaseDatabase()` - Detects remote databases
- Destructive operations blocked unless `NODE_ENV=development` AND `SEED_CLEAN=true` AND local database

**Verification**: `grep -q 'cleanAllowed' prisma/seed.ts`

**What You Can Do**:
- ✅ Add new seed data
- ✅ Improve seed logic
- ✅ Add more safety checks

**What's Forbidden**:
- ❌ Removing `cleanAllowed` check
- ❌ Removing `isSupabaseDatabase()` check
- ❌ Bypassing seed guard safety mechanisms
- ❌ Allowing destructive operations on remote databases

---

## 4. Supabase Storage Architecture

**Files**: `lib/supabase.ts`, `lib/storage-utils.ts`, related storage code

**Status**: ✅ Consolidated in commit 2ba91e4

**Why Protected**: Storage has been consolidated to Supabase only. AWS S3 and Vercel Blob have been removed. Reintroducing them would fragment storage and break existing uploads.

**Verification**: `! grep -q 'aws-sdk\\|@aws-sdk\\|@vercel/blob' package.json`

**What You Can Do**:
- ✅ Use Supabase storage APIs
- ✅ Improve Supabase storage utilities
- ✅ Add new storage buckets in Supabase

**What's Forbidden**:
- ❌ Installing `aws-sdk` or `@aws-sdk/*` packages
- ❌ Installing `@vercel/blob` package
- ❌ Creating AWS S3 buckets
- ❌ Using Vercel Blob storage

---

## 5. Database Validation Scripts

**Files**: `scripts/validate-database.ts`, `npm run db:validate`

**Status**: ✅ Stabilized in commit 2ba91e4

**Why Protected**: Validation scripts ensure database integrity and catch schema/data mismatches before they cause production issues.

**Verification**: `npm run db:validate`

**What You Can Do**:
- ✅ Add new validations
- ✅ Improve validation logic
- ✅ Fix validation bugs

**What's Forbidden**:
- ❌ Removing existing validations
- ❌ Weakening validation rules
- ❌ Disabling validation checks

---

## 6. TypeScript Configuration

**Files**: `tsconfig.json`, `lib/types/**`, type definitions

**Status**: ✅ Stabilized in commit 2ba91e4

**Why Protected**: TypeScript stabilization achieved strict type safety. All compilation errors have been fixed. Removing type definitions would reintroduce type safety issues.

**Verification**: `npx tsc --noEmit`

**What You Can Do**:
- ✅ Add new type definitions
- ✅ Improve existing types
- ✅ Fix type errors in new code

**What's Forbidden**:
- ❌ Removing type definitions that fixed previous errors
- ❌ Using `@ts-ignore` or `@ts-expect-error` without justification
- ❌ Weakening TypeScript strictness settings
- ❌ Introducing `any` types where proper types exist

---

## Quick Reference

| System | Status | Commit | Verification Command |
|--------|--------|--------|---------------------|
| Prisma Schema | ✅ Stable | 2ba91e4 | `npx prisma validate` |
| Migration History | ✅ Stable | 2ba91e4 | `npx prisma migrate status` |
| Seed Guard | ✅ Active | 69ad93a | `grep -q 'cleanAllowed' prisma/seed.ts` |
| Supabase Storage | ✅ Consolidated | 2ba91e4 | `! grep -q 'aws-sdk' package.json` |
| Validation Scripts | ✅ Stable | 2ba91e4 | `npm run db:validate` |
| TypeScript Config | ✅ Stable | 2ba91e4 | `npx tsc --noEmit` |

---

## Need to Modify a Protected System?

If you have a legitimate need to change a protected system:

1. **Document why** the change is necessary (business need or technical requirement)
2. **List all files** that will be affected
3. **Explain the risk** and provide a mitigation plan
4. **Ask the maintainer** for approval before proceeding

**Remember**: Most features can be built without infrastructure changes. Check [development-priorities.md](./development-priorities.md) for current focus areas that don't require infrastructure modifications.
