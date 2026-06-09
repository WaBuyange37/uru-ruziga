# Forbidden Actions

**Last Updated**: 2024-06-03

This document lists actions that are **absolutely forbidden** without explicit maintainer approval. These actions could cause data loss, reintroduce fixed bugs, or break production.

---

## Critical Severity 🔴

These actions could cause data loss or break production:

### 1. Recreating Migrations

```bash
# ❌ FORBIDDEN
rm -rf prisma/migrations
npx prisma migrate dev --name recreate-all
```

**Why Forbidden**: Breaks migration history, causes production database sync issues, prevents rollbacks.

**Impact**: Production database becomes unsynchronized, deployment failures, potential data loss.

**Alternative**: Create new migrations only. Never delete existing migration history.

---

### 2. Forced Migration Reset

```bash
# ❌ FORBIDDEN
npx prisma migrate reset --force
```

**Why Forbidden**: Destroys all data in the database, breaks production completely.

**Impact**: Catastrophic data loss, production outage, user data destroyed.

**Alternative**: Use local database resets only (`NODE_ENV=development`). Never run on remote databases.

---

### 3. Removing Seed Guard

```typescript
// ❌ FORBIDDEN - Removing or bypassing this check:
const cleanAllowed = process.env.SEED_CLEAN === 'true' 
  && process.env.NODE_ENV === 'development'
  && !isSupabaseDatabase(databaseUrl);

if (!cleanAllowed) {
  console.log('Skipping destructive cleanup on remote database');
  return;
}
```

**Why Forbidden**: Allows destructive operations on production database, risks data loss.

**Impact**: Could wipe production data, destroy user accounts, cause business continuity failure.

**Alternative**: Never remove. Only add more safety checks if needed.

---

### 4. Automatic Production Deployment

```bash
# ❌ FORBIDDEN
git push production main --force
git push --force
```

**Why Forbidden**: Could deploy untested changes to live system, bypass CI/CD checks.

**Impact**: Production outage, untested code in production, broken user experience.

**Alternative**: Use staging environment, manual deployment with review, proper CI/CD pipeline.

---

## High Severity 🟠

These actions could reintroduce fixed bugs:

### 5. Reintroducing AWS S3 Storage

```bash
# ❌ FORBIDDEN
npm install aws-sdk
npm install @aws-sdk/client-s3
```

**Why Forbidden**: Storage has been consolidated to Supabase. AWS S3 was removed in commit 2ba91e4.

**Impact**: Fragments storage, breaks existing uploads, increases infrastructure complexity.

**Alternative**: Use Supabase storage APIs for all file operations.

---

### 6. Reintroducing Vercel Blob Storage

```bash
# ❌ FORBIDDEN
npm install @vercel/blob
```

**Why Forbidden**: Storage has been consolidated to Supabase. Vercel Blob was removed in commit 2ba91e4.

**Impact**: Fragments storage, increases costs, complicates file management.

**Alternative**: Use Supabase storage APIs for all file operations.

---

### 7. Modifying TypeScript Stabilization Fixes

```typescript
// ❌ FORBIDDEN - Removing type definitions that fixed compilation:
// @ts-ignore
// @ts-expect-error

// ❌ FORBIDDEN - Introducing 'any' where proper types exist:
const data: any = fetchUserData();
```

**Why Forbidden**: Reintroduces type safety issues that were fixed in commit 2ba91e4.

**Impact**: TypeScript compilation errors, runtime type errors, reduced code quality.

**Alternative**: Add proper type definitions. Use generics. Extend existing types correctly.

---

## Medium Severity 🟡

These actions require careful review:

### 8. Schema Breaking Changes

```prisma
// ⚠️ REQUIRES APPROVAL
model User {
  email String // Don't rename to userEmail without approval
  // Don't remove fields without migration
  // Don't change field types without approval
}
```

**Why Careful**: Could break existing queries, frontend code, API contracts.

**Impact**: Application errors, broken features, frontend crashes.

**Alternative**: Add new fields, deprecate old ones gradually. Create proper migrations.

---

### 9. Changing Database Validation Scripts

```typescript
// ⚠️ REQUIRES APPROVAL
// Don't modify scripts/validate-database.ts without review
// Don't remove existing validation checks
```

**Why Careful**: Validation scripts ensure data integrity.

**Impact**: Undetected data corruption, schema mismatches, production issues.

**Alternative**: Add new validations. Don't remove existing ones. Strengthen rules, don't weaken.

---

## How to Request Exceptions

If you have a **legitimate need** to perform a forbidden action:

### Step 1: Document the Need

Write down:
- **Why** is this change necessary? (Business requirement, technical debt, bug fix)
- **What alternatives** were considered?
- **Why** don't the alternatives work?

### Step 2: Assess the Risk

Document:
- **What could go wrong** if this change is made?
- **What is the impact** on users, data, production?
- **How will you mitigate** the risks?

### Step 3: Create a Rollback Plan

Document:
- **How will you undo** this change if it causes problems?
- **What is the rollback time**? (Seconds, minutes, hours?)
- **What data might be lost** in a rollback?

### Step 4: Request Approval

Contact the project maintainer with:
1. Your documentation from Steps 1-3
2. A list of files you will modify
3. Your proposed timeline

### Step 5: Wait for Approval

**Do not proceed** until you receive explicit written approval from the maintainer.

---

## Violation Consequences

### Automated Detection

The verification script (`.kiro/specs/project-guardrails/scripts/verify-guardrails.sh`) will catch violations:
- Missing seed guard
- Reintroduced AWS SDK or Vercel Blob
- TypeScript compilation failures
- Prisma schema validation failures

### Review Requirements

Pull requests with violations will:
- ❌ Fail CI/CD checks (when integrated)
- ⚠️ Require additional maintainer review
- 📝 Need justification before merge

### Rollback

Unapproved changes that violate guardrails will be:
- 🔄 Rolled back immediately
- 📋 Documented for team learning
- 🔍 Reviewed to prevent future occurrences

---

## Remember

**Most features can be built without infrastructure changes.**

Before requesting an exception, check:
- [development-priorities.md](./development-priorities.md) - Current focus areas (no infrastructure changes needed)
- [protected-systems.md](./protected-systems.md) - What you CAN do with protected systems

**Goal**: Protect stabilized infrastructure so we can focus on building Adaptive Learning features.
