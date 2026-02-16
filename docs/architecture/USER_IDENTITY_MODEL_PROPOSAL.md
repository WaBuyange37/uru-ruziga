# User Identity Model for Uruziga
## A 10-Year Cultural Infrastructure Design

**Date:** February 9, 2026  
**Purpose:** Define a user identity schema that supports cultural evolution, data integrity, and reversibility

---

## Executive Summary

This proposal outlines a user identity model designed for **longevity, cultural sensitivity, and adaptability**. It addresses:

1. **Identity persistence** across authentication methods
2. **Cultural data evolution** as Umwero scholarship advances
3. **Reversibility** of all identity decisions
4. **Privacy and dignity** for learners worldwide

---

## Core Principles

### 1. Separation of Concerns
**Identity ≠ Authentication ≠ Profile**

```
User (Core Identity)
  ├── AuthMethods (How they log in - can change)
  ├── Profile (What they share - can evolve)
  └── LearningData (What they've learned - immutable append-only)
```

### 2. Cultural Neutrality in Core Schema
The identity model must not assume:
- Western naming conventions
- Single-language preference
- Fixed geographic location
- Permanent contact methods

### 3. Append-Only Learning History
Learning progress is **never deleted**, only superseded. This preserves:
- Cultural knowledge evolution
- User achievement history
- Research data integrity

---

## Proposed Schema Evolution

### Current Issues in Existing Schema

```prisma
model User {
  email          String?           // ❌ Assumes email access
  mobileNumber   String?  @unique  // ❌ Can't change phone numbers
  password       String?           // ❌ Mixed with identity
  fullName       String?           // ❌ Western naming assumption
  username       String?  @unique  // ❌ Can't evolve identity
  birthday       DateTime?         // ❌ Not culturally universal
  countryCode    String?  @default("RW") // ✅ Good default
  language       String   @default("en")  // ❌ Single language assumption
}
```

**Problems:**
1. Authentication mixed with identity
2. Unique constraints prevent evolution
3. Single-value fields assume static identity
4. No audit trail for changes

---

## Recommended Schema

### Core Identity (Immutable)

```prisma
model User {
  // === IMMUTABLE CORE ===
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  
  // === CURRENT STATE (Mutable via versioning) ===
  currentProfileId String?  @unique
  currentProfile   UserProfile? @relation("CurrentProfile", fields: [currentProfileId], references: [id])
  
  // === RELATIONSHIPS ===
  profiles         UserProfile[]    @relation("ProfileHistory")
  authMethods      AuthMethod[]
  learningProgress LessonProgress[]
  culturalData     CulturalProfile[]
  
  // === METADATA ===
  status           UserStatus  @default(ACTIVE)
  statusChangedAt  DateTime    @default(now())
  
  @@index([status])
  @@index([createdAt])
  @@map("users")
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DEACTIVATED
  ARCHIVED
}
```

**Why this works for 10 years:**
- `id` is the only permanent identifier
- All mutable data lives in versioned relations
- Status changes are tracked, not deleted
- No assumptions about contact methods

---

### Authentication (Separate & Evolvable)

```prisma
model AuthMethod {
  id              String       @id @default(cuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // === METHOD DETAILS ===
  provider        AuthProvider
  providerUserId  String?      // External provider ID
  
  // === CREDENTIALS (for EMAIL/PHONE) ===
  identifier      String?      // email or phone number
  passwordHash    String?
  
  // === VERIFICATION ===
  verified        Boolean      @default(false)
  verifiedAt      DateTime?
  verificationToken String?
  verificationExpiry DateTime?
  
  // === LIFECYCLE ===
  isPrimary       Boolean      @default(false)
  isActive        Boolean      @default(true)
  createdAt       DateTime     @default(now())
  lastUsedAt      DateTime?
  deactivatedAt   DateTime?
  
  @@unique([provider, identifier])
  @@index([userId])
  @@index([provider])
  @@index([identifier])
  @@index([verificationToken])
  @@map("auth_methods")
}

enum AuthProvider {
  EMAIL
  PHONE
  GOOGLE
  FACEBOOK
  TWITTER
  APPLE
  // Future: PASSKEY, WEBAUTHN, etc.
}
```

**Why this works for 10 years:**
- Users can have multiple auth methods
- Methods can be added/removed without losing identity
- Phone numbers and emails can change
- New providers can be added without schema changes
- Verification is per-method, not per-user

---

### Profile (Versioned & Cultural)

```prisma
model UserProfile {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation("ProfileHistory", fields: [userId], references: [id], onDelete: Cascade)
  
  // === DISPLAY IDENTITY ===
  displayName    String?   // How they want to be called
  preferredName  String?   // Cultural/personal preference
  
  // === CONTACT (Non-unique, can duplicate) ===
  contactEmail   String?
  contactPhone   String?
  
  // === CULTURAL CONTEXT ===
  primaryLanguage   String?  // ISO 639-1 code
  learningLanguages String[] // Array of language codes
  countryOfOrigin   String?  // ISO 3166-1 alpha-2
  currentCountry    String?  // Can differ from origin
  timezone          String?  // IANA timezone
  
  // === OPTIONAL DEMOGRAPHICS ===
  birthYear      Int?      // Year only, not full date
  gender         String?   // Free text, not enum
  
  // === PREFERENCES ===
  bio            String?
  avatar         String?
  isPublic       Boolean   @default(true)
  
  // === VERSIONING ===
  validFrom      DateTime  @default(now())
  validUntil     DateTime? // NULL = current version
  createdAt      DateTime  @default(now())
  
  @@index([userId])
  @@index([validFrom])
  @@index([validUntil])
  @@map("user_profiles")
}
```

**Why this works for 10 years:**
- Versioned: all changes create new records
- No unique constraints on contact info
- Multiple languages supported natively
- Cultural context separated from identity
- Demographics are optional and flexible
- Full audit trail of profile evolution

---

### Cultural Learning Profile

```prisma
model CulturalProfile {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // === LEARNING CONTEXT ===
  learningGoal       String?   // Why they're learning Umwero
  connectionToRwanda String?   // Diaspora, heritage, academic, etc.
  nativeLanguages    String[]  // Languages they speak
  
  // === UMWERO PROFICIENCY ===
  umweroLevel        UmweroLevel @default(BEGINNER)
  kinyarwandaLevel   KinyarwandaLevel?
  
  // === TEACHING PREFERENCES ===
  preferredScript    ScriptPreference @default(BOTH)
  audioEnabled       Boolean   @default(true)
  visualLearner      Boolean   @default(true)
  
  // === CULTURAL ENGAGEMENT ===
  interestedInHistory Boolean  @default(false)
  interestedInArt     Boolean  @default(false)
  interestedInMusic   Boolean  @default(false)
  
  // === VERSIONING ===
  validFrom      DateTime  @default(now())
  validUntil     DateTime?
  createdAt      DateTime  @default(now())
  
  @@index([userId])
  @@index([umweroLevel])
  @@map("cultural_profiles")
}

enum UmweroLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  FLUENT
}

enum KinyarwandaLevel {
  NONE
  BASIC
  CONVERSATIONAL
  FLUENT
  NATIVE
}

enum ScriptPreference {
  UMWERO_ONLY
  LATIN_ONLY
  BOTH
}
```

**Why this works for 10 years:**
- Separates cultural learning from identity
- Versioned to track learning journey
- Flexible enough for diverse learners
- Respects different learning paths
- Can evolve as Umwero pedagogy advances

---

## Migration Strategy

### Phase 1: Add New Tables (Non-Breaking)
```sql
-- Create new tables alongside existing User table
-- No data migration yet
```

### Phase 2: Dual-Write Period
```typescript
// Write to both old and new schemas
// Read from old schema
// Validate consistency
```

### Phase 3: Backfill Historical Data
```typescript
// Migrate existing users to new schema
// Create initial AuthMethod records
// Create initial UserProfile records
// Preserve all timestamps
```

### Phase 4: Switch Read Path
```typescript
// Read from new schema
// Keep writing to both
// Monitor for issues
```

### Phase 5: Deprecate Old Schema
```typescript
// Stop writing to old User fields
// Mark fields as deprecated
// Plan removal for next major version
```

---

## Data Integrity Guarantees

### 1. No Data Loss
- All changes create new records
- Old records marked invalid, never deleted
- Soft deletes with `validUntil` timestamps

### 2. Reversibility
```typescript
// Restore previous profile version
async function restoreProfile(userId: string, timestamp: Date) {
  const historicalProfile = await prisma.userProfile.findFirst({
    where: {
      userId,
      validFrom: { lte: timestamp },
      OR: [
        { validUntil: null },
        { validUntil: { gte: timestamp } }
      ]
    }
  });
  
  // Create new current profile from historical data
  // Mark current as historical
}
```

### 3. Audit Trail
Every change includes:
- Who made it (system or user)
- When it was made
- What was changed
- Why it was changed (optional metadata)

---

## Cultural Evolution Support

### Scenario 1: Umwero Orthography Changes
If Umwero spelling conventions evolve:

```prisma
model OrthographyVersion {
  id          String   @id @default(cuid())
  version     String   @unique // "1.0", "1.1", etc.
  description String
  effectiveDate DateTime
  isActive    Boolean  @default(false)
  
  // Learning content can reference version
  lessons     Lesson[]
  
  @@map("orthography_versions")
}

// Add to Lesson model:
model Lesson {
  orthographyVersion String? // NULL = current standard
  // ...
}
```

Users' historical progress remains valid under the version they learned.

### Scenario 2: New Cultural Regions
If new Kinyarwanda-speaking regions adopt Umwero:

```prisma
// UserProfile.currentCountry is flexible
// CulturalProfile.connectionToRwanda is free text
// No schema change needed
```

### Scenario 3: Diaspora Identity Evolution
A user's relationship to Rwanda may change over time:

```prisma
// CulturalProfile is versioned
// Each version captures their context at that time
// Historical versions preserved for research
```

---

## Privacy & Dignity

### 1. Minimal Required Data
Only `User.id` and `User.createdAt` are required.
Everything else is optional.

### 2. Right to be Forgotten
```typescript
async function anonymizeUser(userId: string) {
  // Keep learning data for research
  // Remove all PII from profiles
  await prisma.userProfile.updateMany({
    where: { userId },
    data: {
      displayName: null,
      preferredName: null,
      contactEmail: null,
      contactPhone: null,
      bio: null,
      avatar: null,
    }
  });
  
  // Deactivate auth methods
  await prisma.authMethod.updateMany({
    where: { userId },
    data: {
      isActive: false,
      identifier: null,
      passwordHash: null,
    }
  });
  
  // Mark user as archived
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'ARCHIVED' }
  });
}
```

### 3. Data Portability
```typescript
async function exportUserData(userId: string) {
  return {
    identity: await prisma.user.findUnique({ where: { id: userId } }),
    profiles: await prisma.userProfile.findMany({ where: { userId } }),
    learning: await prisma.lessonProgress.findMany({ where: { userId } }),
    cultural: await prisma.culturalProfile.findMany({ where: { userId } }),
    // ... all user data in portable JSON format
  };
}
```

---

## Performance Considerations

### 1. Current Profile Optimization
```prisma
model User {
  currentProfileId String? @unique
  currentProfile   UserProfile? @relation("CurrentProfile")
}
```
Direct reference to current profile avoids expensive queries.

### 2. Indexes for Common Queries
```prisma
@@index([userId, validUntil]) // Find current version
@@index([userId, validFrom])  // Find historical versions
@@index([status])             // Filter active users
```

### 3. Materialized Views (Future)
For analytics, create materialized views:
```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  u.id,
  COUNT(DISTINCT lp.lessonId) as lessons_completed,
  MAX(lp.completedAt) as last_activity,
  cp.umweroLevel
FROM users u
LEFT JOIN lesson_progress lp ON lp.userId = u.id
LEFT JOIN cultural_profiles cp ON cp.userId = u.id AND cp.validUntil IS NULL
GROUP BY u.id, cp.umweroLevel;
```

---

## Trade-offs & Decisions

### Trade-off 1: Complexity vs. Flexibility
**Decision:** Accept schema complexity for long-term flexibility  
**Rationale:** Cultural infrastructure must adapt without breaking changes

### Trade-off 2: Storage vs. Auditability
**Decision:** Store all historical versions  
**Rationale:** Cultural learning data is research-valuable; storage is cheap

### Trade-off 3: Performance vs. Correctness
**Decision:** Optimize for correctness, then performance  
**Rationale:** Data integrity cannot be compromised for speed

### Trade-off 4: Privacy vs. Research
**Decision:** Anonymization preserves learning data  
**Rationale:** Aggregate learning patterns benefit future learners

---

## Implementation Checklist

- [ ] Create new schema models
- [ ] Write migration scripts with rollback
- [ ] Implement dual-write layer
- [ ] Add versioning utilities
- [ ] Create profile restoration functions
- [ ] Build anonymization tools
- [ ] Add data export functionality
- [ ] Write comprehensive tests
- [ ] Document API changes
- [ ] Train team on new patterns
- [ ] Monitor migration in staging
- [ ] Execute production migration
- [ ] Deprecate old fields
- [ ] Remove old schema (v2.0)

---

## Conclusion

This identity model prioritizes:

1. **10-Year Validity:** Versioning and separation of concerns allow evolution without breaking changes
2. **Cultural Evolution:** Flexible schemas accommodate orthographic changes, new regions, and pedagogical advances
3. **Reversibility:** All changes are append-only; nothing is truly deleted
4. **Dignity:** Minimal required data, full anonymization, complete portability

The model respects that Uruziga is **cultural infrastructure**, not a startup experiment. It's designed to serve learners for decades, adapt to scholarly advances, and preserve the integrity of Umwero education worldwide.

---

**Next Steps:**
1. Review this proposal with cultural advisors
2. Validate with Kinyarwanda language experts
3. Test migration with sample data
4. Implement in staging environment
5. Gather feedback before production deployment
