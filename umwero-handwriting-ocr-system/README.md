# Umwero Handwriting Evaluation + OCR Dataset System

## Phase 1: Core Handwriting Evaluation Engine

A production-grade handwriting evaluation system for the Umwero Alphabet Learning Platform.

### Architecture

- **Frontend**: React/TypeScript canvas capture system
- **Backend**: FastAPI evaluation engine with professional font rendering
- **Evaluation**: Hybrid algorithm combining SSIM, contour matching, and skeletonization

### Quick Start

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### API Endpoints

- `POST /api/evaluate-character` - Evaluate handwriting
- `GET /health` - Health check

### Expected Workflow

1. User draws character on frontend canvas
2. Canvas exports drawing as base64 PNG
3. Backend processes image and compares against font reference
4. System returns accurate score (0-100) with feedback

### Phase 1 Goals

Prove that handwriting evaluation is accurate, stable, and reliable before proceeding to Phase 2 (dataset management, admin tools, etc.).