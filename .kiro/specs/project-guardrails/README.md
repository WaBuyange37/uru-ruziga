# Project Guardrails

**Purpose**: Protect verified infrastructure from accidental regressions.

## Overview

Uruziga has completed significant infrastructure stabilization work in commits **2ba91e4** and **69ad93a**. These guardrails document what systems are protected and prevent accidental reintroduction of fixed bugs.

## Verified Commits

- **2ba91e4** - Stabilized Phase 1 database, Supabase storage, and type safety
- **69ad93a** - Implemented seed guard against remote destructive cleanup

## Protected Systems

Six infrastructure systems are now **protected** and require maintainer approval before changes:

1. **Prisma Schema** - Stabilized for Supabase-only storage
2. **Migration History** - Must not be recreated or rewritten
3. **Seed Guard** (prisma/seed.ts) - Prevents destructive remote database operations
4. **Supabase Storage Architecture** - AWS S3 and Vercel Blob removed
5. **Database Validation Scripts** - Ensure data integrity
6. **TypeScript Configuration** - Type safety achieved

See [protected-systems.md](./protected-systems.md) for details.

## Forbidden Actions

The following actions are **absolutely forbidden** without explicit maintainer approval:

- ❌ Recreating migrations
- ❌ Forced migration reset
- ❌ Removing seed guard
- ❌ Reintroducing AWS SDK or Vercel Blob
- ❌ Modifying TypeScript stabilization fixes

See [forbidden-actions.md](./forbidden-actions.md) for complete list.

## Current Development Focus

These features can be built **without infrastructure changes**:

- ✨ **Adaptive Learning Journey** (PRIMARY FOCUS)
- OCR Integration
- Mastery Tracking
- Learning Dashboard
- Lesson Content

See [development-priorities.md](./development-priorities.md) for details.

## Verification

Run the verification script to check guardrails integrity:

```bash
.kiro/specs/project-guardrails/scripts/verify-guardrails.sh
```

The script checks:
- ✓ Seed guard exists
- ✓ No AWS SDK reintroduced
- ✓ No Vercel Blob reintroduced
- ✓ Prisma schema validates
- ✓ TypeScript compiles

## Need Infrastructure Changes?

If you genuinely need to modify protected systems:

1. **Explain why** the change is necessary
2. **List files** that will be affected
3. **Ask the maintainer** for approval before proceeding

## Documentation

- [protected-systems.md](./protected-systems.md) - What's protected and why
- [forbidden-actions.md](./forbidden-actions.md) - What not to do
- [development-priorities.md](./development-priorities.md) - Current focus areas
- [requirements.md](./requirements.md) - Full requirements specification
- [design.md](./design.md) - Technical design document
- [tasks.md](./tasks.md) - Implementation tasks

## Goal

**Protect the stabilized infrastructure so we can focus on building Adaptive Learning features.**
