# Requirements Document

## Introduction

The Uruziga Learning Platform has completed significant infrastructure stabilization work documented in commits 2ba91e4 and 69ad93a. This feature establishes guardrails to prevent accidental infrastructure regressions by documenting the current verified state and enforcing approval requirements for changes to protected systems.

The guardrails system ensures that developers and AI agents understand what systems are protected, what actions are forbidden, and what processes must be followed before modifying stable infrastructure.

## Glossary

- **Guardrails_System**: The infrastructure protection and documentation system defined in this specification
- **Protected_System**: Any infrastructure component or configuration that has been verified and stabilized
- **Verification_Record**: Documentation of completed stabilization work with commit references
- **Approval_Gate**: A required checkpoint before modifying protected systems
- **Infrastructure_Change**: Any modification to protected systems including schema, migrations, configurations, or validation scripts
- **Regression**: An unintended reintroduction of a previously fixed bug or instability
- **Seed_Guard**: The safety mechanism in prisma/seed.ts that prevents destructive remote operations
- **Development_Priority**: Current feature work areas that do not require infrastructure changes

## Requirements

### Requirement 1: Document Verified Commits

**User Story:** As a developer, I want to see which commits contain verified stabilization work, so that I understand the baseline stable state of the infrastructure.

#### Acceptance Criteria

1. THE Guardrails_System SHALL document commit 2ba91e4 with description "stabilize phase 1 database, supabase storage, and type safety"
2. THE Guardrails_System SHALL document commit 69ad93a with description "guard seed against remote destructive cleanup"
3. THE Guardrails_System SHALL provide commit references that are verifiable in the git history
4. THE Guardrails_System SHALL associate each commit with the specific systems it stabilized

### Requirement 2: Identify Protected Systems

**User Story:** As a developer, I want to know which systems are protected from modification, so that I do not accidentally introduce regressions.

#### Acceptance Criteria

1. THE Guardrails_System SHALL mark the Prisma schema as a Protected_System
2. THE Guardrails_System SHALL mark migration history as a Protected_System
3. THE Guardrails_System SHALL mark prisma/seed.ts as a Protected_System
4. THE Guardrails_System SHALL mark Supabase storage architecture as a Protected_System
5. THE Guardrails_System SHALL mark database validation scripts as a Protected_System
6. THE Guardrails_System SHALL mark TypeScript stabilization fixes as a Protected_System
7. THE Guardrails_System SHALL mark the remote-safe seed guard as a Protected_System

### Requirement 3: Document Completed Work

**User Story:** As a developer, I want to see what infrastructure work has been completed and verified, so that I know what is stable and should not be redone.

#### Acceptance Criteria

1. THE Guardrails_System SHALL document that Supabase-only storage implementation is complete
2. THE Guardrails_System SHALL document that AWS S3 and Vercel Blob have been removed
3. THE Guardrails_System SHALL document that TypeScript validation passes with "npx tsc --noEmit"
4. THE Guardrails_System SHALL document that Prisma validation passes with "npx prisma validate"
5. THE Guardrails_System SHALL document that Prisma migrate status passes with "npx prisma migrate status"
6. THE Guardrails_System SHALL document that database validation passes with "npm run db:validate"
7. THE Guardrails_System SHALL document that seed preflight mode has been implemented
8. THE Guardrails_System SHALL document that fake Supabase preflight testing has passed
9. THE Guardrails_System SHALL document that seed guard testing has passed

### Requirement 4: Enforce Forbidden Actions

**User Story:** As a developer, I want to understand what actions are absolutely forbidden without approval, so that I do not accidentally break stable infrastructure.

#### Acceptance Criteria

1. THE Guardrails_System SHALL forbid recreating migrations without explicit approval
2. THE Guardrails_System SHALL forbid rewriting migration history without explicit approval
3. THE Guardrails_System SHALL forbid reintroducing AWS S3 storage without explicit approval
4. THE Guardrails_System SHALL forbid reintroducing Vercel Blob storage without explicit approval
5. THE Guardrails_System SHALL forbid removing the Seed_Guard without explicit approval
6. THE Guardrails_System SHALL forbid destructive remote seed operations without explicit approval
7. THE Guardrails_System SHALL forbid automatic deployment to production without explicit approval
8. THE Guardrails_System SHALL forbid modifying TypeScript stabilization fixes without explicit approval

### Requirement 5: Define Current Development Priorities

**User Story:** As a developer, I want to know which areas are the current development focus, so that I can direct my efforts appropriately without needing infrastructure changes.

#### Acceptance Criteria

1. THE Guardrails_System SHALL identify Adaptive Learning Journey as a Development_Priority
2. THE Guardrails_System SHALL identify OCR Integration as a Development_Priority
3. THE Guardrails_System SHALL identify Mastery Tracking as a Development_Priority
4. THE Guardrails_System SHALL identify Learning Dashboard as a Development_Priority
5. THE Guardrails_System SHALL identify Lesson Content as a Development_Priority

### Requirement 6: Require Approval for Infrastructure Changes

**User Story:** As a project maintainer, I want to enforce an approval gate for infrastructure changes, so that no protected system is modified without review.

#### Acceptance Criteria

1. WHEN an Infrastructure_Change is proposed, THE Guardrails_System SHALL require an explanation of why the change is necessary
2. WHEN an Infrastructure_Change is proposed, THE Guardrails_System SHALL require a list of files affected
3. WHEN an Infrastructure_Change is proposed, THE Guardrails_System SHALL require explicit approval from the project maintainer
4. IF an Infrastructure_Change affects a Protected_System, THEN THE Approval_Gate SHALL block the change until approval is granted

### Requirement 7: Provide Guardrails Verification

**User Story:** As a developer, I want to verify that guardrails are active and protecting the infrastructure, so that I have confidence the system is working.

#### Acceptance Criteria

1. THE Guardrails_System SHALL provide a verification command that checks protected system status
2. WHEN the verification command runs, THE Guardrails_System SHALL confirm the Seed_Guard is present in prisma/seed.ts
3. WHEN the verification command runs, THE Guardrails_System SHALL confirm TypeScript validation passes
4. WHEN the verification command runs, THE Guardrails_System SHALL confirm Prisma validation passes
5. WHEN the verification command runs, THE Guardrails_System SHALL report any violations of protected system integrity

### Requirement 8: Document Approval Process

**User Story:** As a developer, I want to understand the approval process for infrastructure changes, so that I know how to request necessary changes properly.

#### Acceptance Criteria

1. THE Guardrails_System SHALL document the required steps to request infrastructure change approval
2. THE Guardrails_System SHALL specify who has authority to grant approval
3. THE Guardrails_System SHALL provide a template for infrastructure change requests
4. THE Guardrails_System SHALL document the response time expectation for approval requests

### Requirement 9: Prevent Regression Introduction

**User Story:** As a project maintainer, I want to prevent regressions in previously fixed issues, so that stabilization work is not lost.

#### Acceptance Criteria

1. WHEN a change is proposed that affects a Protected_System, THE Guardrails_System SHALL check if the change reintroduces a fixed issue
2. IF a change would recreate migrations, THEN THE Guardrails_System SHALL block the change as a potential Regression
3. IF a change would remove the Seed_Guard, THEN THE Guardrails_System SHALL block the change as a potential Regression
4. IF a change would reintroduce AWS S3 or Vercel Blob dependencies, THEN THE Guardrails_System SHALL block the change as a potential Regression

### Requirement 10: Maintain Guardrails Documentation

**User Story:** As a developer, I want guardrails documentation to remain current, so that I always have accurate information about protected systems.

#### Acceptance Criteria

1. WHEN a Protected_System is added, THE Guardrails_System SHALL update the documentation with the new protection
2. WHEN a Verification_Record is added, THE Guardrails_System SHALL update the completed work documentation
3. WHEN a forbidden action is identified, THE Guardrails_System SHALL update the forbidden actions list
4. THE Guardrails_System SHALL document the date of the last guardrails documentation update
