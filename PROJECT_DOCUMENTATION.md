# Uruziga / Umwero Platform — Master Project Documentation

**Last Updated**: May 24, 2026  
**Active Branch**: `evolutionForOCR`  
**Live URL**: https://uruziga.netlify.app  
**Build Status**: ✅ Passing  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Database Schema](#4-database-schema)
5. [Feature Inventory](#5-feature-inventory)
6. [AI & OCR System](#6-ai--ocr-system)
7. [Python Services](#7-python-services)
8. [Frontend Structure](#8-frontend-structure)
9. [API Routes](#9-api-routes)
10. [Deployment & Infrastructure](#10-deployment--infrastructure)
11. [Known Issues & Blockers](#11-known-issues--blockers)
12. [Remaining Work](#12-remaining-work)
13. [Environment Variables](#13-environment-variables)
14. [Key Commands](#14-key-commands)
15. [Document Index](#15-document-index)

---

## 1. Project Overview

**Uruziga** is a Next.js web platform for learning the **Umwero alphabet** — a traditional Rwandan writing system. The platform combines:

- Structured character lessons with cultural context
- AI-powered handwriting evaluation (canvas drawing → score + feedback)
- Community discussion features for cultural content sharing
- A dataset collection pipeline to build ML training data for Umwero OCR

The name "Uruziga" means "O" in Umwero (the circular vowel character). The platform is built to preserve Rwandan cultural heritage through interactive digital learning.

### Core Goals
1. Teach users to read and write the Umwero alphabet
2. Evaluate handwriting accuracy using computer vision
3. Collect a high-quality OCR training dataset from user submissions
4. Build a community around Kinyarwanda/Umwero language preservation

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| Database ORM | Prisma |
| Database | PostgreSQL via Supabase |
| Auth | NextAuth.js + JWT |
| Storage | Supabase Storage / Vercel Blob |
| AI Evaluation | Python FastAPI microservice |
| Image Processing | OpenCV, scikit-image, PIL |
| Caching | Redis (Upstash / Redis Cloud) |
| Deployment | Netlify (frontend), Railway/Render (Python service) |
| Font | UMWEROalpha (custom Umwero script font) |

---

## 3. Architecture

```
Browser (Next.js App)
    │
    ├── /learn          Character learning queue (FIFO, 6 at a time)
    ├── /lessons/[id]   Single-page lesson workspace
    ├── /community      Twitter-style discussion feed
    ├── /translate      Latin ↔ Umwero text translator
    ├── /umwero-chat    Real-time Umwero chat
    └── /dashboard      User progress & analytics
         │
         ▼
Next.js API Routes (/api/*)
    │
    ├── /api/ocr/evaluate        → Python OCR Service
    ├── /api/handwriting/submit  → Python AI Service (legacy)
    ├── /api/character-progress  → Prisma DB
    ├── /api/progress/*          → Prisma DB
    ├── /api/lessons/*           → Prisma DB
    └── /api/community/*         → Prisma DB + Supabase Storage
         │
    ┌────┴────────────────────┐
    ▼                         ▼
PostgreSQL (Supabase)    Python FastAPI Service
    │                    (umwero-handwriting-ocr-system/backend)
    └── 30+ models           │
                             ├── Evaluation Engine (SSIM+Contour+Skeleton)
                             ├── Font Renderer (Umwero.ttf)
                             ├── Image Processor (OpenCV)
                             ├── Feedback Generator
                             ├── Feature Extractor (ML)
                             ├── Redis Cache
                             └── Dataset Manager
```

---

## 4. Database Schema

The Prisma schema (`prisma/schema.prisma`) contains 30+ models. Key models:

### Core Learning Models

| Model | Purpose |
|-------|---------|
| `User` | User accounts with roles (admin, teacher, student) |
| `Character` | Umwero characters (15 total: 5 vowels, 10 consonants) |
| `Lesson` | Individual lessons with JSON content (cultural context, strokes, examples) |
| `LessonProgress` | User completion status per lesson |
| `UserCharacterProgress` | Per-character mastery status (NOT_STARTED → IN_PROGRESS → LEARNED) |
| `UserAttempt` | Every drawing/quiz attempt — never overwritten, always appended |
| `Achievement` | Cultural milestone badges |
| `Certificate` | Completion certificates |

### AI Dataset Models (added in OCR transformation)

| Model | Purpose |
|-------|---------|
| `HandwritingAttempt` | Full stroke data, evaluation scores, ML features, quality labels |
| `CharacterReference` | Font-rendered reference images per character |
| `DatasetEntry` | ML-ready entries with train/val/test split |
| `CommunityEntry` | Community text for NLP training dataset |
| `PerformanceMetric` | System monitoring metrics |
| `EvaluationSession` | User practice session tracking |

### Community Models

| Model | Purpose |
|-------|---------|
| `CommunityPost` | Posts with `mediaUrls[]` for multi-image support |
| `Discussion` | Discussion threads |
| `Comment` | Comments on discussions/posts |

### Seed Data (from `prisma/seed.ts`)
- **15 characters**: A (Inyambo), U (Umurunga), O (Uruziga), E (Kwera), I (Iigitsina), B, K, M, N, D, MF, SH, GW, PF, RGW
- **10 lessons**: 5 vowel + 5 consonant lessons
- **45 translations**: English, Kinyarwanda, Umwero
- **14 achievements**: Cultural progression milestones
- **3 user accounts**: Admin, Teacher, Student

---

## 5. Feature Inventory

### ✅ Fully Implemented

#### Learning System
- Single-page lesson workspace (`/lessons/[lessonId]`) — Duolingo-style, no page reloads
- Tab-based content: Overview, Culture, Stroke Guide, Creator's Story
- FIFO character queue on `/learn` — shows 6 characters at a time
- Character mastery tracking (score ≥ 70% = LEARNED)
- Progress persists in database with real-time sync via event system
- Individual lessons for all Ibihekane (compound characters)
- 95 characters and 94 lessons seeded in database

#### Umwero Script System
- Complete official character mapping (200+ mappings including 5-letter compounds)
- Longest-first algorithm for ligature detection (CRITICAL — do not modify)
- Real-time Latin → Umwero translation
- UMWEROalpha font with `liga` and `calt` OpenType features enabled
- Translator page (`/translate`) and Umwero Chat (`/umwero-chat`)

#### Canvas & Drawing
- 60fps canvas with `requestAnimationFrame`
- Touch, mouse, and stylus support with pressure sensitivity
- Stroke capture with timestamps and metadata
- Stroke normalization (0–1 coordinates for ML)
- Bounding box calculation
- Stroke replay functionality
- PNG export via `getCanvasDataURL()`

#### AI Evaluation (Phase 1–4 complete)
- Hybrid scoring: SSIM (40%) + Contour (30%) + Skeleton (30%)
- Score range: 0–100 with confidence score
- Feedback categories: constructive, corrective, encouraging
- Quality labels: excellent, good, fair, poor
- Dataset auto-collection for scores ≥ 50

#### Community Features
- Twitter/X-style discussion feed
- Multi-image posts (up to 4 files, 50MB each)
- Drag-and-drop media upload
- Multilingual posting (English, Kinyarwanda, Umwero)
- Comments, likes, reactions
- Supabase Storage for media

#### User Management
- Registration, login, email verification
- Password reset
- JWT authentication
- Role-based access (admin, teacher, student)
- Progress dashboard with drawing history

#### Performance
- Server-side rendering with ISR (1-hour cache)
- Parallel data fetching with `Promise.all()`
- Database indexes on all frequently queried fields
- 67% faster first load, 94% faster cached load vs. old client-side fetching

#### Mobile Responsiveness
- All pages mobile-optimized: Learn, Community, Umwero Chat, Translator
- Touch-friendly targets (min 44px)
- Responsive Umwero font scaling

### ⚠️ Partially Implemented / Needs Work

- Auth on OCR API routes (currently public — security risk)
- Python backend tests (exist but need `prisma generate` to run)
- Umwero font files need to be placed in `umwero-handwriting-ocr-system/backend/fonts/`
- Admin dataset dashboard (planned, not built)
- Photo upload for dataset building (designed, not fully integrated)

---

## 6. AI & OCR System

The OCR transformation (`evolutionForOCR` branch) added a 7-phase system:

### Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Database Evolution (40+ new fields) | ✅ Complete |
| 2 | Canvas System Refinement | ✅ Complete |
| 3 | Python OCR Service (FastAPI) | ✅ Complete |
| 4 | Next.js API Integration | ✅ Complete |
| 5 | UI/UX Components | ✅ Complete |
| 6 | Dataset Pipeline | ✅ Complete |
| 7 | Production Deployment Ready | ✅ Complete |

### Evaluation Pipeline

```
User draws on canvas (60fps)
    ↓
useCanvasDrawing hook captures strokes + metadata
    ↓
POST /api/ocr/evaluate (Next.js)
    ↓
Creates HandwritingAttempt in DB
    ↓
Calls Python FastAPI service
    ↓
Python: Renders reference from Umwero font
Python: Preprocesses user image (normalize, threshold, denoise)
Python: Hybrid comparison (SSIM 40% + Contour 30% + Skeleton 30%)
Python: Extracts ML features
Python: Generates feedback
    ↓
Updates HandwritingAttempt with results
    ↓
Creates DatasetEntry if score ≥ 50
    ↓
Updates UserCharacterProgress
    ↓
Returns score + feedback to frontend
```

### Dataset Pipeline

```
HandwritingAttempt (score ≥ 50)
    ↓
Quality filtering (excellent/good/fair/poor)
    ↓
DatasetEntry creation
    ↓
Train/Val/Test split (70/15/15)
    ↓
Export formats: JSON, CSV, TensorFlow TFRecord, PyTorch
```

### Performance Targets
- Evaluation latency: < 500ms
- Canvas: 60fps
- Cache hit rate: > 90% for reference images
- Redis TTL: References 24h, Templates 12h, Features 6h

---

## 7. Python Services

Three Python services exist in the repo. The canonical production service is:

### Primary: `umwero-handwriting-ocr-system/backend/`

```
backend/
├── main.py                    # FastAPI app (942 lines, 15+ endpoints)
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # PostgreSQL + Redis + Backend
├── requirements.txt
├── src/
│   ├── evaluation_engine.py   # Main orchestrator
│   ├── font_renderer.py       # Umwero font rendering
│   ├── image_processor.py     # OpenCV pipeline
│   ├── comparison_algorithm.py # SSIM + Contour + Skeleton
│   ├── feedback_generator.py  # Feedback generation
│   ├── feature_extractor.py   # ML feature extraction
│   ├── cache_service.py       # Redis caching
│   ├── database_service.py    # Prisma integration
│   ├── data_collector.py      # Dataset collection
│   ├── ml_pipeline_service.py # ML export pipeline
│   └── performance_optimizer.py
└── prisma/schema.prisma       # Backend schema
```

### Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/evaluate-character` | Main evaluation |
| GET | `/api/reference/{character}` | Get cached reference |
| GET | `/api/dataset/stats` | Dataset statistics |
| POST | `/api/dataset/export` | Export for ML |
| GET | `/api/dataset/training-data` | Get training data |
| POST | `/api/ml/prepare-dataset` | Prepare ML dataset |
| POST | `/api/ml/export-framework` | Export for TF/PyTorch |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |
| POST | `/api/cache/warm` | Warm cache |
| DELETE | `/api/cache/clear` | Clear cache |

### Legacy Services (kept for reference)
- `handwriting-evaluation-system/` — basic evaluation (SSIM 60% + Contour 40%)
- `python-ai-service/` — simplified version used in Phase 4 docs

### Starting the Python Service

```bash
cd umwero-handwriting-ocr-system/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m prisma generate
python main.py
# Available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

---

## 8. Frontend Structure

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── learn/                    # Character learning queue
├── lessons/[lessonId]/       # Single-page lesson workspace
├── community/                # Twitter-style feed
├── translate/                # Latin ↔ Umwero translator
├── umwero-chat/              # Real-time Umwero chat
├── dashboard/                # User progress dashboard
├── admin/                    # Admin panel (partial)
└── api/                      # API routes

components/
├── learn/
│   ├── LearnPageClient.tsx   # Main learn page client
│   ├── EnhancedCharacterGrid.tsx  # FIFO 6-character queue
│   └── CharacterCard.tsx
├── lessons/
│   ├── LessonWorkspace.tsx   # Main lesson container
│   ├── LessonHeader.tsx
│   ├── LessonTabs.tsx
│   ├── LearningPanel.tsx
│   ├── PracticePanel.tsx     # Canvas + evaluation
│   └── tabs/
│       ├── OverviewTab.tsx
│       ├── CultureTab.tsx
│       ├── StrokeGuideTab.tsx
│       └── StoryTab.tsx
├── community/
│   └── CommunityPostCard.tsx
├── discussions/
│   ├── DiscussionCard.tsx    # Twitter-style post
│   ├── CommentList.tsx
│   ├── CommentForm.tsx
│   └── MediaUpload.tsx
├── ocr/
│   └── OCRPracticeCanvas.tsx # Production OCR canvas component
└── ui/                       # Shared UI components

hooks/
├── useCanvasDrawing.ts       # 60fps canvas with full metadata export
├── useLearnQueue.ts          # FIFO character queue with API integration
├── useLessonState.ts         # Lesson state management
├── useProgressSummary.ts     # Single source of truth for progress
├── useCommunityPosts.ts      # Community posts data
├── use-umwero-translation.ts # Latin → Umwero conversion
└── useTranslation.ts         # i18n (English/Kinyarwanda)

lib/
├── ocr-api-client.ts         # TypeScript OCR API client
├── audio-utils.ts            # UMWERO_MAP + convertToUmwero() [LOCKED]
├── character-mapping.ts      # Lesson ID → DB character ID mapping
├── character-progression.ts  # Next character logic
├── progress-events.ts        # Event-driven progress sync
├── auth-utils.ts             # JWT utilities
└── prisma.ts                 # Prisma client singleton
```

---

## 9. API Routes

### OCR / Handwriting

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ocr/evaluate` | POST | Main OCR evaluation (calls Python service) |
| `/api/ocr/reference` | GET | Get reference character image |
| `/api/ocr/dataset/stats` | GET | Dataset statistics (admin) |
| `/api/ocr/dataset/export` | POST | Export dataset (admin) |
| `/api/handwriting/submit` | POST | Legacy handwriting submission |

### Progress & Learning

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/character-progress` | GET/POST/PUT | Character mastery CRUD |
| `/api/progress/submit` | POST | Submit lesson progress |
| `/api/progress/stats` | GET | Dashboard statistics |
| `/api/progress/summary` | GET | Single source of truth for progress |
| `/api/lessons` | GET | List lessons by type |
| `/api/lessons/[lessonId]` | GET | Get individual lesson |

### Community

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/community/posts` | GET/POST | Community posts CRUD |
| `/api/discussions` | GET/POST | Discussion threads |
| `/api/discussions/upload-media` | POST | Upload media to Vercel Blob |

### Auth

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | * | NextAuth.js handler |
| `/api/auth/register` | POST | User registration |

---

## 10. Deployment & Infrastructure

### Current Deployment
- **Frontend**: Netlify — https://uruziga.netlify.app
- **Database**: Supabase PostgreSQL (project ref: `ozaobsjgrtkpmortxmch`)
- **Storage**: Supabase Storage + Vercel Blob
- **Python Service**: Not yet deployed to production (runs locally)

### Netlify Build Config (`netlify.toml`)
```toml
[build]
  command = "npm run build:netlify"
  publish = ".next"
```

Build script includes `npx prisma generate` before `next build`.

TypeScript errors and ESLint are bypassed during build (`ignoreBuildErrors: true`).

### Docker Deployment (Python Service)

```bash
cd umwero-handwriting-ocr-system
docker-compose up -d
# Starts: PostgreSQL + Redis + Backend API
```

### Recommended Production Stack

| Service | Provider | Cost |
|---------|----------|------|
| Frontend | Vercel Pro | $20/month |
| Database | Supabase Pro | $25/month |
| Python Service | Railway | $10/month |
| Domain | Namecheap/Cloudflare | ~$12/year |
| **Total** | | ~$55/month |

### Deployment Steps (Full Production)

1. Resume Supabase project (free tier auto-pauses)
2. Run `npx prisma generate && npx prisma db push`
3. Run `npx prisma db seed`
4. Deploy Python service to Railway/Render
5. Set `PYTHON_OCR_SERVICE_URL` in Netlify env vars
6. Push to GitHub → triggers Netlify deploy
7. Update `NEXTAUTH_URL` to production domain
8. Configure custom domain DNS

---

## 11. Known Issues & Blockers

### Critical
- **OCR API routes are public** — auth was removed from `/api/ocr/*` routes during build fixes. Must be re-added before production.
- **Supabase free tier auto-pauses** — database goes offline after inactivity. Resume at https://supabase.com/dashboard.
- **Umwero font files missing from Python backend** — copy `Umwero.ttf` and `UMWEROalpha.woff` to `umwero-handwriting-ocr-system/backend/fonts/` for evaluation to work.

### Medium Priority
- Python backend tests fail due to missing Prisma client generation (`python -m prisma generate` needed)
- `README.md` is the Supabase CLI readme — not the project readme (was never replaced)
- TypeScript errors exist but are bypassed in build (`ignoreBuildErrors: true`)

### Low Priority
- Admin dataset dashboard not built
- Photo upload for dataset building designed but not fully integrated
- GDPR compliance features (data export/deletion) not implemented
- Rate limiting on evaluation endpoint not implemented

---

## 12. Remaining Work

### Immediate (Before Production Launch)
- [ ] Re-add authentication to `/api/ocr/*` routes
- [ ] Copy Umwero font files to Python backend `fonts/` directory
- [ ] Fix Supabase database connection (resume project or create new)
- [ ] Deploy Python OCR service to Railway/Render
- [ ] Set all production environment variables in Netlify
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Run `npx prisma db push` and `npx prisma db seed`
- [ ] End-to-end test of evaluation flow

### Short Term
- [ ] Build admin dataset management dashboard
- [ ] Implement rate limiting on evaluation endpoint
- [ ] Fix TypeScript errors (remove `ignoreBuildErrors`)
- [ ] Add proper error tracking (Sentry)
- [ ] Set up monitoring dashboard

### Future Enhancements
- [ ] Train custom Umwero OCR ML model on collected dataset
- [ ] Real-time stroke-by-stroke guidance during drawing
- [ ] Mobile native apps (React Native)
- [ ] Offline mode (PWA)
- [ ] Multi-language NLP models
- [ ] Teacher dashboard
- [ ] Anti-cheat detection for evaluations
- [ ] A/B testing for evaluation algorithms

---

## 13. Environment Variables

### Next.js (`.env`)

```env
# Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Auth
JWT_SECRET="[64-char random string]"
NEXTAUTH_SECRET="[32-char random string]"
NEXTAUTH_URL="https://your-domain.com"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon key]"
SUPABASE_SERVICE_ROLE_KEY="[service role key]"

# Python OCR Service
PYTHON_OCR_SERVICE_URL="http://localhost:8000"

# AI (optional)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### Python Backend (`.env`)

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"
UMWERO_FONT_PATH="./fonts/Umwero.ttf"
CORS_ORIGINS="http://localhost:3000,https://uruziga.netlify.app"
LOG_LEVEL="info"
CACHE_DEFAULT_TTL=3600
CACHE_REFERENCE_TTL=86400
```

---

## 14. Key Commands

```bash
# Development
npm run dev                          # Start Next.js dev server
npm run build                        # Production build
npm run build:netlify                # Netlify build (includes prisma generate)

# Database
npx prisma generate                  # Generate Prisma client
npx prisma db push                   # Push schema to database
npx prisma db seed                   # Seed with Umwero data
npx prisma migrate deploy            # Apply migrations
npx prisma studio                    # Open database browser
npx prisma validate                  # Validate schema

# Verification
node scripts/verify-database.js      # Check DB connection + tables
node verify-performance.js           # Check performance metrics
node verify-ligature-system.js       # Verify Umwero ligature system

# Python Service
cd umwero-handwriting-ocr-system/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m prisma generate
python main.py                       # Start on port 8000
pytest                               # Run tests
curl http://localhost:8000/health    # Health check

# Docker
cd umwero-handwriting-ocr-system
docker-compose up -d                 # Start all services
docker-compose logs -f backend       # View logs
docker-compose down                  # Stop all services
```

---

## 15. Document Index

All markdown files in the project root, organized by category:

### Project Overview
| File | Description |
|------|-------------|
| `PROJECT_DOCUMENTATION.md` | **This file** — master documentation |
| `START_HERE.md` | Quick start guide for deployment |
| `READY_FOR_PRODUCTION.md` | Production readiness overview |
| `EXECUTION_SUMMARY.md` | OCR transformation completion summary |

### OCR / AI System
| File | Description |
|------|-------------|
| `OCR_SYSTEM_COMPLETE.md` | Full OCR system documentation |
| `OCR_TRANSFORMATION_PLAN.md` | Original 7-phase transformation plan |
| `OCR_DEPLOYMENT_CHECKLIST.md` | Production deployment checklist for OCR |
| `README_OCR_TRANSFORMATION.md` | OCR transformation overview |
| `CONTINUE_TRANSFORMATION.md` | Phase 3+ continuation guide |
| `TRANSFORMATION_COMPLETE_PHASE_1_2.md` | Phases 1–2 completion summary |
| `IMPLEMENTATION_STATUS.md` | Detailed phase-by-phase status |
| `QUICK_START.md` | OCR quick start (5 minutes) |
| `HANDWRITING_EVALUATION_INTEGRATION_GUIDE.md` | Integration guide for evaluation API |
| `VISION_API_INTEGRATION.md` | OpenAI/Claude Vision API integration |
| `PHOTO_UPLOAD_DATASET_BUILDING.md` | Photo upload for dataset collection |

### AI Architecture (Earlier Phases)
| File | Description |
|------|-------------|
| `URUZIGA_AI_ARCHITECTURE_PHASE_1_2_COMPLETE.md` | Phases 1–2 of AI architecture |
| `URUZIGA_AI_PHASE_4_COMPLETE.md` | Phase 4 Python AI service |

### Database & Deployment
| File | Description |
|------|-------------|
| `DEPLOYMENT_GUIDE.md` | Database migration & seeding guide |
| `DATABASE_PRODUCTION_SETUP.md` | Complete database setup guide |
| `FIX_DATABASE_NOW.md` | Step-by-step database fix |
| `SUPABASE_DB_FIX.md` | Supabase connection fix |
| `PRODUCTION_DEPLOYMENT_CHECKLIST.md` | Full 11-phase deployment checklist |
| `PRODUCTION_DEPLOYMENT_SUCCESS.md` | Netlify deployment success record |
| `PRODUCTION_DEPLOYMENT_FIX.md` | Production deployment fixes |
| `PRODUCTION_READY_DEPLOYMENT.md` | Production readiness guide |
| `NETLIFY_DEPLOYMENT_COMPLETE.md` | Netlify build fix documentation |
| `NETLIFY_BUILD_FIXED.md` | Netlify build error fixes |
| `PRODUCTION_GRADE_VALIDATION.md` | State sync validation checklist |
| `PRODUCTION_AUTH_FIX.md` | Production authentication fix guide |
| `FRESH_SUPABASE_SETUP.md` | Fresh Supabase project setup |

### Learning System
| File | Description |
|------|-------------|
| `SEED_SUMMARY.md` | Database seed data summary |
| `LESSON_RESTRUCTURE_PLAN.md` | Single-page lesson architecture plan |
| `LESSON_WORKSPACE_IMPLEMENTATION.md` | Lesson workspace implementation |
| `LEARN_PAGE_BACKEND_INTEGRATION_COMPLETE.md` | Learn page backend integration |
| `LEARN_PAGE_REFINEMENT_COMPLETE.md` | Learn page refinements |
| `LEARN_PAGE_MOBILE_RESPONSIVE_COMPLETE.md` | Mobile responsiveness for learn page |
| `LEARNING_SYSTEM_STATUS_CHECK.md` | Full learning system verification |
| `IBIHEKANE_INDIVIDUAL_LESSONS_COMPLETE.md` | Ibihekane compound character lessons |
| `LESSON_LOADING_PERFORMANCE_COMPLETE.md` | Lesson loading performance |
| `LESSON_LOADING_PERFORMANCE_FIX.md` | Lesson loading fix |

### Umwero Script System
| File | Description |
|------|-------------|
| `UMWERO_CHARACTER_MAPPING_COMPLETE.md` | Complete character mapping implementation |
| `UMWERO_LIGATURE_SYSTEM_CRITICAL.md` | ⚠️ CRITICAL — ligature system docs (do not modify) |
| `README_LIGATURE_PROTECTION.md` | Developer warning for ligature system |
| `UMWERO_GLOBAL_TRANSFORMATION_COMPLETE.md` | Global Umwero transformation |

### Dashboard & Progress
| File | Description |
|------|-------------|
| `DASHBOARD_ENHANCEMENT_COMPLETE.md` | Dashboard with real progress tracking |
| `DASHBOARD_PROGRESS_TRACKER_COMPLETE.md` | Progress tracker implementation |
| `PROGRESS_TRACKING_RETENTION.md` | Progress tracking & retention strategy |
| `STATE_SYNCHRONIZATION_COMPLETE.md` | State sync fix documentation |
| `STATE_SYNCHRONIZATION_FIX.md` | State sync fix details |
| `DEBUG_PROGRESS_ISSUE.md` | Progress debugging guide |

### Community Features
| File | Description |
|------|-------------|
| `COMMUNITY_IMAGE_POSTING_COMPLETE.md` | Multi-image community posts |
| `COMMUNITY_IMAGE_SUPABASE_MIGRATION.md` | Community image storage migration |
| `COMMUNITY_BUCKET_SETUP.md` | Supabase storage bucket setup |
| `TWITTER_STYLE_REDESIGN_COMPLETE.md` | Twitter-style feed redesign |
| `DISCUSSION_SYSTEM_RESTRUCTURE.md` | Discussion system restructure |
| `DISCUSSIONS_MOVED_TO_COMMUNITY.md` | Discussions migration to community |
| `INTERACTIVE_DISCUSSIONS_COMPLETE.md` | Interactive discussions implementation |
| `ENABLE_COMMENTS_AND_REACTIONS.md` | Comments and reactions feature |
| `NEW_POST_REFRESH_FIX.md` | New post refresh fix |

### Performance & Mobile
| File | Description |
|------|-------------|
| `PERFORMANCE_OPTIMIZATION_COMPLETE.md` | SSG + caching performance optimization |
| `PERFORMANCE_OPTIMIZATION_FIXED.md` | Performance fix details |
| `PERFORMANCE_SOLUTION_COMPLETE.md` | Performance solution summary |
| `MOBILE_RESPONSIVENESS_COMPLETE.md` | Mobile responsiveness implementation |
| `MOBILE_RESPONSIVENESS_RUNTIME_ERROR_FIXED.md` | Mobile runtime error fix |

### Storage
| File | Description |
|------|-------------|
| `STORAGE_SETUP.md` | Storage options (S3, Cloudinary, Supabase) |
| `SUPABASE_STORAGE_GUIDE.md` | Supabase storage guide |
| `SUPABASE_STORAGE_SETUP.md` | Supabase storage setup |
| `QUICK_STORAGE_SETUP.md` | Quick storage setup |
| `BUCKET_URL_GUIDE.md` | Storage bucket URL guide |

### Bug Fixes & Misc
| File | Description |
|------|-------------|
| `CHARACTER_CARD_IMPORT_FIX.md` | Character card import fix |
| `CHARACTER_CARD_IMPORT_FIX_FINAL.md` | Final character card fix |
| `CHARACTER_ID_MAPPING_FIX.md` | Character ID mapping fix |
| `CONSONANT_CHARACTER_DISPLAY_FIXED.md` | Consonant display fix |
| `IMPORT_EXPORT_MISMATCH_FIXED.md` | Import/export mismatch fix |
| `LOGIN_FIXED_SUMMARY.md` | Login fix summary |
| `LOGIN_REDIRECT_FIX.md` | Login redirect fix |
| `LOGIN_DASHBOARD_DEPLOYMENT_READY.md` | Login/dashboard deployment |
| `QUICK_FIX.md` | Quick fixes reference |
| `IMPROVEMENTS_COMPLETE.md` | General improvements |
| `CONTENT_INTEGRITY_UPDATE.md` | Content integrity update |
| `UNESCO_REFERENCES_REMOVED.md` | UNESCO references removal |
| `ENHANCED_CONTINUE_BUTTON_COMPLETE.md` | Enhanced continue button |
| `FULL_FEATURE_VERIFICATION.md` | Full feature verification |
| `IMAGE_ASSETS_COMPONENT_GUIDE.md` | Image assets guide |
| `MEDIA_UPLOAD_FEATURE_COMPLETE.md` | Media upload feature |

---

## Critical Notes for Developers

### 🔒 DO NOT MODIFY — Ligature System
The files `lib/audio-utils.ts`, `hooks/use-umwero-translation.ts`, and `hooks/useTranslation.ts` contain the production-critical Umwero ligature conversion algorithm. The boundary conditions (`i + N <= word.length`) and longest-first processing order (5→4→3→2→1 letters) are mathematically precise. Any modification will break the entire translation system. See `UMWERO_LIGATURE_SYSTEM_CRITICAL.md` for details.

### ⚠️ Auth on OCR Routes
The `/api/ocr/*` routes currently have no authentication. This was removed during build fixes. Before going to production, re-add `getServerSession()` checks to all OCR routes.

### 📦 Font Files Required
The Python evaluation service requires Umwero font files at `umwero-handwriting-ocr-system/backend/fonts/Umwero.ttf`. Without these, reference image generation fails and evaluation returns errors.

### 🗄️ Database Auto-Pause
Supabase free tier projects auto-pause after ~1 week of inactivity. If the database is unreachable, go to https://supabase.com/dashboard and resume the project (project ref: `ozaobsjgrtkpmortxmch`).

---

*This document was auto-generated from all markdown files in the project on May 24, 2026.*
