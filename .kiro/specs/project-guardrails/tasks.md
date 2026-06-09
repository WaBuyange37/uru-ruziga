# Implementation Plan: Project Guardrails System (Lightweight MVP)

## Overview

This is a **lightweight MVP** that creates essential documentation to protect the stabilized infrastructure. The goal is to quickly document what's protected and provide a simple verification script, then move back to building Adaptive Learning features.

**Implementation Language**: Bash (for one verification script), Markdown (for documentation)

**Key Principles**:
- Keep it simple - documentation only
- No heavy JSON registries or approval workflows
- No application code, database, or Prisma changes
- Get back to feature development quickly

## Tasks

- [ ] 1. Create README.md for project guardrails
  - Explain purpose: protect verified infrastructure (commits 2ba91e4, 69ad93a)
  - List protected systems (Prisma schema, migrations, seed guard, Supabase storage, TypeScript config)
  - Explain that infrastructure changes require maintainer approval
  - Link to other documentation files
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1-2.7_

- [ ] 2. Create protected-systems.md
  - Document 6 protected systems with rationales:
    - Prisma schema (stabilized for Supabase-only storage)
    - Migration history (must not be recreated)
    - Seed guard in prisma/seed.ts (prevents destructive remote operations)
    - Supabase storage architecture (AWS/Vercel removed)
    - Database validation scripts
    - TypeScript configuration (type safety achieved)
  - Reference verified commits (2ba91e4, 69ad93a)
  - Include "What You Can Do" section (feature development)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1-3.9_

- [ ] 3. Create forbidden-actions.md
  - List critical forbidden actions with examples:
    - Recreating migrations
    - Forced migration reset
    - Removing seed guard
    - Reintroducing AWS SDK or Vercel Blob
    - Modifying TypeScript stabilization fixes
  - Explain why each is forbidden
  - State: "Need to change infrastructure? Ask the maintainer first."
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 4. Create development-priorities.md
  - List current focus areas (no infrastructure changes needed):
    - Adaptive Learning Journey (PRIMARY)
    - OCR Integration
    - Mastery Tracking
    - Learning Dashboard
    - Lesson Content
  - State infrastructure change freeze
  - Explain these features use existing schema/infrastructure
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5. Create scripts/verify-guardrails.sh
  - Create `.kiro/specs/project-guardrails/scripts/` directory
  - Implement simple verification script that checks:
    - Seed guard exists: `grep -q 'cleanAllowed' prisma/seed.ts`
    - No AWS SDK: `! grep -q 'aws-sdk\|@aws-sdk' package.json`
    - No Vercel Blob: `! grep -q '@vercel/blob' package.json`
    - Prisma validates: `npx prisma validate`
    - TypeScript validates: `npx tsc --noEmit`
  - Add colored output (green ✓ pass, red ✗ fail)
  - Make script executable (chmod +x)
  - Keep it under 50 lines of code
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.2, 9.3_

- [ ] 6. Checkpoint - Lightweight guardrails complete
  - Verify all 5 files are created
  - Run the verification script to confirm it works
  - Ready to return to Adaptive Learning feature development

## Notes

- **This is intentionally minimal** - just enough to protect infrastructure
- No JSON registries, no approval logs, no complex workflows
- Total implementation time: <30 minutes
- No database, Prisma schema, or application code changes
- After completion, return to building Adaptive Learning features
- Each task references requirements for traceability

## File Structure

```
.kiro/specs/project-guardrails/
├── README.md                    # Overview and purpose
├── protected-systems.md         # What's protected and why
├── forbidden-actions.md         # What not to do
├── development-priorities.md    # Current focus areas
└── scripts/
    └── verify-guardrails.sh     # Simple verification script
```
