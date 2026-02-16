# 📡 URUZIGA API INTEGRATION GUIDE

Complete reference for all API endpoints with examples.

---

## 🔐 AUTHENTICATION

All authenticated endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

Get token from login/register response and store in localStorage.

---

## 📚 NEW ENDPOINTS (ADDED TODAY)

### 1. **File Upload for Lessons**

**Endpoint**: `POST /api/lessons/upload`

**Purpose**: Teachers upload videos, PDFs, images, audio for lessons

**Authentication**: Required (TEACHER or ADMIN)

**Request**:
```typescript
// FormData
const formData = new FormData()
formData.append('file', fileBlob)
formData.append('type', 'video') // 'video' | 'pdf' | 'image' | 'audio'
formData.append('lessonId', 'lesson-id-here') // optional

fetch('/api/lessons/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

**Response**:
```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/...",
  "filename": "lesson-video.mp4",
  "size": 15728640,
  "type": "video/mp4",
  "message": "File uploaded successfully"
}
```

**File Limits**:
- Video: 100MB (.mp4, .webm, .mov)
- PDF: 10MB (.pdf)
- Image: 5MB (.jpg, .png, .webp)
- Audio: 20MB (.mp3, .wav)

**Rate Limit**: 60 requests/minute

---

### 2. **Generate Umwero Image**

**Endpoint**: `POST /api/umwero/generate-image`

**Purpose**: Convert Umwero text to shareable PNG/SVG image

**Authentication**: Optional (but rate limited)

**Request**:
```typescript
fetch('/api/umwero/generate-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: ':M:C{ (umuco)',
    fontSize: 32,
    fontFamily: 'Umwero',
    backgroundColor: '#F3E5AB',
    textColor: '#8B4513',
    width: 800,
    height: 400
  })
})
```

**Response**:
```json
{
  "success": true,
  "imageUrl": "https://blob.vercel-storage.com/umwero-1234.svg",
  "width": 800,
  "height": 400,
  "format": "svg",
  "message": "Image generated successfully"
}
```

**Parameters**:
- `text` (required): Umwero text to render
- `fontSize`: 12-72 (default: 24)
- `fontFamily`: Font name (default: 'Umwero')
- `backgroundColor`: Hex color (default: '#FFFFFF')
- `textColor`: Hex color (default: '#000000')
- `width`: 100-2000 (default: 800)
- `height`: 100-2000 (default: 400)

**Rate Limit**: 50 requests/hour

---

### 3. **Training Data Management**

**Endpoint**: `GET /api/admin/training-data`

**Purpose**: Admin dashboard for ML training data

**Authentication**: Required (ADMIN only)

**Get Statistics**:
```typescript
fetch('/api/admin/training-data?action=stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Response**:
```json
{
  "stats": {
    "total": 15234,
    "verified": 8901,
    "bySourceType": {
      "COMMUNITY_POST": 5000,
      "CHAT_MESSAGE": 4000,
      "USER_TRANSLATION": 3000,
      "LESSON_CONTENT": 2000,
      "POST_COMMENT": 1234
    },
    "byLanguage": {
      "rw": 12000,
      "en": 2000,
      "um": 1234
    },
    "byQuality": {
      "5": 2000,
      "4": 5000,
      "3": 7000,
      "2": 1000,
      "1": 234
    }
  }
}
```

**Export Data**:
```typescript
// JSON format
fetch('/api/admin/training-data?action=export&verified=true&minQuality=4', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// CSV format
fetch('/api/admin/training-data?action=export&format=csv&verified=true', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Query Parameters**:
- `action`: 'stats' | 'export'
- `verified`: true | false
- `minQuality`: 1-5
- `sourceType`: COMMUNITY_POST | CHAT_MESSAGE | etc.
- `language`: en | rw | um
- `startDate`: ISO date string
- `endDate`: ISO date string
- `format`: json | csv (for export)

**Verify Entry**:
```typescript
fetch('/api/admin/training-data', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 'training-data-id',
    verified: true,
    quality: 5
  })
})
```

**Delete Entry**:
```typescript
fetch('/api/admin/training-data?id=training-data-id', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Rate Limit**: 30 requests/minute

---

## 📝 EXISTING ENDPOINTS (REFERENCE)

### **Authentication**

#### Register
```typescript
POST /api/auth/register
{
  "fullName": "Jean Kwizera",
  "username": "jkwizera",
  "email": "jean@example.com",
  "mobileNumber": "+250788123456",
  "password": "securepass123",
  "birthday": "1995-01-15",
  "countryCode": "RW"
}
```

#### Login
```typescript
POST /api/auth/login
{
  "email": "jean@example.com",
  "password": "securepass123"
}
```

#### Verify OTP
```typescript
POST /api/auth/verify-otp
{
  "email": "jean@example.com",
  "otp": "123456"
}
```

### **Lessons**

#### Get All Lessons
```typescript
GET /api/lessons
```

#### Create Lesson (Teacher/Admin)
```typescript
POST /api/lessons
{
  "title": "Vowel: A",
  "description": "Learn the Umwero character for 'a'",
  "content": "{...}",
  "module": "BEGINNER",
  "type": "VOWEL",
  "order": 1,
  "duration": 5,
  "videoUrl": "https://...",
  "thumbnailUrl": "https://..."
}
```

### **Community**

#### Create Post
```typescript
POST /api/community/posts
{
  "content": "Learning Umwero is amazing!",
  "language": "en",
  "latinText": "Learning Umwero is amazing!",
  "umweroText": "R|"RNN}NG :M:C{ N} :Z:Z}G"!"
}
```

#### Like Post
```typescript
POST /api/community/posts/[postId]/like
```

#### Comment on Post
```typescript
POST /api/community/posts/[postId]/comments
{
  "content": "Great post!",
  "language": "en"
}
```

### **Chat**

#### Send Message
```typescript
POST /api/chat/messages
{
  "latinText": "Muraho",
  "umweroText": "M:R"H{",
  "fontSize": 24
}
```

### **Progress**

#### Get User Stats
```typescript
GET /api/progress/stats
```

#### Update Lesson Progress
```typescript
POST /api/progress
{
  "lessonId": "vowel-a",
  "completed": true,
  "score": 95,
  "timeSpent": 300
}
```

### **Drawings**

#### Save Drawing
```typescript
POST /api/drawings/save
{
  "lessonId": "vowel-a",
  "vowel": "a",
  "umweroChar": "\"",
  "drawingData": "data:image/png;base64,...",
  "timeSpent": 120
}
```

#### Compare Drawing with AI
```typescript
POST /api/drawings/ai-compare
{
  "userDrawing": "data:image/png;base64,...",
  "referenceChar": "\""
}
```

### **Admin**

#### Get All Users
```typescript
GET /api/admin/users
```

#### Delete User
```typescript
DELETE /api/admin/users/[userId]
```

#### Change User Role
```typescript
PATCH /api/admin/users/[userId]/role
{
  "role": "TEACHER"
}
```

#### Get Donations
```typescript
GET /api/admin/donations
```

---

## 🚦 RATE LIMITS

All endpoints are rate limited to prevent abuse:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Login | 5 requests | 1 minute |
| Register | 3 requests | 1 minute |
| Verify OTP | 10 requests | 1 minute |
| Create Post | 10 requests | 1 hour |
| Create Comment | 30 requests | 1 hour |
| Like Post | 60 requests | 1 minute |
| Chat Message | 20 requests | 1 minute |
| Translation | 100 requests | 1 hour |
| Image Generation | 50 requests | 1 hour |
| File Upload | 60 requests | 1 minute |
| Admin Actions | 30 requests | 1 minute |
| General API | 60 requests | 1 minute |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1707523200000
Retry-After: 60
```

**429 Response**:
```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "limit": 60,
  "remaining": 0,
  "reset": "2026-02-09T12:00:00.000Z"
}
```

---

## 🔒 ERROR RESPONSES

All endpoints return consistent error format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Additional error details (optional)"
}
```

**Common Status Codes**:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 📊 TRAINING DATA COLLECTION

Training data is automatically collected from:

1. **Community Posts** - When users create posts
2. **Post Comments** - When users comment
3. **Chat Messages** - When users send Umwero chat
4. **Translations** - When users use translation tool
5. **Lesson Content** - From curated lessons
6. **Drawing Feedback** - From practice sessions
7. **Quiz Answers** - From quiz submissions

**Privacy**:
- User IDs are anonymized (hashed or removed)
- GDPR-compliant
- Admin must verify before using in ML training
- Users can request data deletion

**Quality Scores**:
- 5: Curated content (lessons)
- 4: Direct translations (chat, verified)
- 3: User-generated (posts, comments)
- 2: Incorrect quiz answers
- 1: Low-quality submissions

---

## 🧪 TESTING ENDPOINTS

### **Development**
```bash
# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/lessons
```

### **Production**
```bash
# Test with curl
curl https://uruziga.com/api/lessons

# Test with Postman
# Import collection from /docs/postman-collection.json
```

### **Rate Limit Testing**
```bash
# Test rate limit
for i in {1..10}; do
  curl -X POST https://uruziga.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
done
```

---

## 📱 CLIENT INTEGRATION EXAMPLES

### **React/Next.js**

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export async function uploadLessonFile(
  file: File,
  type: 'video' | 'pdf' | 'image' | 'audio',
  lessonId?: string
) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  if (lessonId) formData.append('lessonId', lessonId)

  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE}/api/lessons/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}

export async function generateUmweroImage(options: {
  text: string
  fontSize?: number
  backgroundColor?: string
  textColor?: string
}) {
  const response = await fetch(`${API_BASE}/api/umwero/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(options)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}

export async function getTrainingDataStats() {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE}/api/admin/training-data?action=stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}
```

### **Usage in Component**

```typescript
// components/LessonUpload.tsx
import { useState } from 'react'
import { uploadLessonFile } from '@/lib/api'

export function LessonUpload({ lessonId }: { lessonId: string }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await uploadLessonFile(file, 'video', lessonId)
      alert(`Uploaded: ${result.url}`)
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
```

---

## 🔧 TROUBLESHOOTING

### **401 Unauthorized**
- Check token is valid and not expired
- Verify token is in Authorization header
- Re-login to get new token

### **403 Forbidden**
- Check user has correct role (TEACHER/ADMIN)
- Verify permissions in database
- Contact admin to update role

### **429 Too Many Requests**
- Wait for rate limit window to reset
- Check Retry-After header
- Implement exponential backoff

### **500 Internal Server Error**
- Check server logs in Vercel dashboard
- Verify database connection
- Check environment variables

---

## 📞 SUPPORT

**Technical Issues**: tech@uruziga.com  
**API Questions**: api@uruziga.com  
**Documentation**: https://uruziga.com/docs

---

**Last Updated**: February 9, 2026  
**API Version**: 1.0  
**Status**: Production Ready
