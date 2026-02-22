# Photo Upload for Dataset Building

## Overview
After completing digital canvas practice, users can optionally upload photos of their real pen-written characters. This builds a diverse, multi-style handwriting dataset for training better OCR models.

## Why This Matters

### Real-World Handwriting Diversity
- Different pen types (ballpoint, fountain, marker)
- Various paper textures
- Natural lighting conditions
- Individual writing styles
- Pressure variations
- Real-world imperfections

### Dataset Quality
This is how professional OCR datasets are built:
1. Collect diverse samples
2. Label with ground truth
3. Train on real variations
4. Achieve better accuracy

## User Flow

### Step 1: Complete Canvas Practice
```
User draws character → AI evaluates → Shows score
```

### Step 2: Photo Upload Prompt
```
┌─────────────────────────────────────┐
│ 📸 Help Build Better AI             │
│                                     │
│ Upload a photo of your pen-written │
│ version to contribute to our        │
│ training dataset!                   │
│                                     │
│ [Upload Real Handwriting]           │
└─────────────────────────────────────┘
```

### Step 3: Photo Capture/Upload
```
┌──────────────┬──────────────┐
│  📷 Take     │  📁 Upload   │
│   Photo      │   Photo      │
└──────────────┴──────────────┘
```

### Step 4: Preview & Submit
```
┌─────────────────────────┐
│  [Preview Image]        │
│                         │
│  ✓ Good lighting        │
│  ✓ Clear character      │
│  ✓ White/light paper    │
│                         │
│  [Upload & Contribute]  │
└─────────────────────────┘
```

### Step 5: Thank You
```
✅ Thank You!
Your handwriting sample helps improve our AI model
```

## Implementation

### Frontend Component

```tsx
<PhotoUploadModal
  isOpen={showPhotoUpload}
  onClose={() => setShowPhotoUpload(false)}
  onUpload={handlePhotoUpload}
  characterName="a"
/>
```

### Upload Handler

```typescript
const handlePhotoUpload = async (imageFile: File) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('lessonId', lesson.id)
  formData.append('characterId', character.id)
  formData.append('relatedAttemptId', currentAttemptId) // Links to canvas attempt

  const response = await fetch('/api/drawings/upload-photo', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  })
}
```

### API Endpoint

```typescript
POST /api/drawings/upload-photo

Content-Type: multipart/form-data

Fields:
- image: File (required)
- lessonId: string
- characterId: string
- stepId: string
- relatedAttemptId: string (links to canvas attempt)

Response:
{
  "success": true,
  "attemptId": "attempt-id",
  "imageUrl": "https://...supabase.co/storage/...",
  "message": "Thank you for contributing to the Umwero dataset!"
}
```

## Database Storage

### UserAttempt Record

```typescript
{
  id: "attempt-id",
  userId: "user-id",
  characterId: "char-id",
  attemptType: "PHOTO_UPLOAD", // Different from DRAWING
  drawingData: "https://...supabase.co/storage/.../photo-123.jpg",
  answer: { relatedAttemptId: "canvas-attempt-id" }, // Links to canvas
  feedback: "Thank you for contributing real handwriting data!",
  isCorrect: true, // All contributions are valuable
  createdAt: "2024-..."
}
```

### TrainingData Record

```typescript
{
  id: "training-id",
  userId: "user-id",
  sourceType: "DRAWING_FEEDBACK",
  sourceId: "attempt-id",
  latinText: "a",
  umweroText: "", // To be filled by admin
  context: "Photo upload for character: a",
  language: "rw",
  quality: null, // To be reviewed by admin
  verified: false, // Pending verification
  metadata: {
    attemptId: "attempt-id",
    imageUrl: "https://...",
    uploadType: "photo",
    relatedAttemptId: "canvas-attempt-id"
  }
}
```

## Storage Structure

```
user-drawings/
├── {userId}/
│   ├── {characterId}/
│   │   ├── 1234567890.png          # Canvas drawing
│   │   ├── photo-1234567891.jpg    # Photo upload
│   │   ├── photo-1234567892.jpg    # Another photo
│   │   └── ...
```

## Quality Guidelines

### Good Photos
✅ Clear, focused image
✅ Good lighting (no shadows)
✅ White or light-colored paper
✅ Character fills most of frame
✅ Minimal background clutter
✅ Straight-on angle (not tilted)

### Poor Photos
❌ Blurry or out of focus
❌ Dark or shadowy
❌ Colored/patterned paper
❌ Character too small
❌ Cluttered background
❌ Extreme angles

## Admin Review Interface

### Pending Review Queue

```typescript
// Fetch unverified training data
const pendingPhotos = await prisma.trainingData.findMany({
  where: {
    sourceType: 'DRAWING_FEEDBACK',
    verified: false,
    metadata: { path: ['uploadType'], equals: 'photo' }
  },
  include: {
    user: { select: { fullName: true, username: true } }
  },
  orderBy: { createdAt: 'desc' }
})
```

### Review Actions

```typescript
// Approve photo
await prisma.trainingData.update({
  where: { id: photoId },
  data: {
    verified: true,
    quality: 5, // 1-5 rating
    umweroText: 'verified-umwero-character'
  }
})

// Reject photo
await prisma.trainingData.update({
  where: { id: photoId },
  data: {
    verified: false,
    quality: 1,
    metadata: {
      ...existingMetadata,
      rejectionReason: 'Poor lighting'
    }
  }
})
```

## Dataset Export

### Export for Training

```typescript
// Export verified photos for ML training
const trainingSet = await prisma.trainingData.findMany({
  where: {
    sourceType: 'DRAWING_FEEDBACK',
    verified: true,
    quality: { gte: 3 }
  },
  select: {
    latinText: true,
    umweroText: true,
    metadata: true
  }
})

// Generate CSV
const csv = trainingSet.map(item => {
  const meta = JSON.parse(item.metadata)
  return `${meta.imageUrl},${item.latinText},${item.umweroText},${item.quality}`
}).join('\n')

// Download images
for (const item of trainingSet) {
  const meta = JSON.parse(item.metadata)
  await downloadImage(meta.imageUrl, `dataset/${item.latinText}_${item.id}.jpg`)
}
```

### Dataset Structure

```
umwero-dataset/
├── images/
│   ├── a_001.jpg
│   ├── a_002.jpg
│   ├── e_001.jpg
│   └── ...
├── labels.csv
└── metadata.json
```

### labels.csv Format

```csv
filename,latin_char,umwero_char,quality,user_id,timestamp
a_001.jpg,a,",5,user-123,2024-01-15T10:30:00Z
a_002.jpg,a,",4,user-456,2024-01-15T11:45:00Z
e_001.jpg,e,|,5,user-789,2024-01-15T12:00:00Z
```

## Analytics & Insights

### Contribution Metrics

```typescript
// Total contributions
const totalPhotos = await prisma.userAttempt.count({
  where: { attemptType: 'PHOTO_UPLOAD' }
})

// By character
const byCharacter = await prisma.userAttempt.groupBy({
  by: ['characterId'],
  where: { attemptType: 'PHOTO_UPLOAD' },
  _count: true
})

// Top contributors
const topContributors = await prisma.userAttempt.groupBy({
  by: ['userId'],
  where: { attemptType: 'PHOTO_UPLOAD' },
  _count: true,
  orderBy: { _count: { userId: 'desc' } },
  take: 10
})
```

### Quality Distribution

```typescript
const qualityDist = await prisma.trainingData.groupBy({
  by: ['quality'],
  where: {
    sourceType: 'DRAWING_FEEDBACK',
    verified: true
  },
  _count: true
})
```

## Gamification

### Contribution Badges

```typescript
// Bronze: 10 photos
// Silver: 50 photos
// Gold: 100 photos
// Platinum: 500 photos

const userPhotoCount = await prisma.userAttempt.count({
  where: {
    userId,
    attemptType: 'PHOTO_UPLOAD'
  }
})

if (userPhotoCount >= 500) return 'platinum'
if (userPhotoCount >= 100) return 'gold'
if (userPhotoCount >= 50) return 'silver'
if (userPhotoCount >= 10) return 'bronze'
```

### Leaderboard

```typescript
const leaderboard = await prisma.userAttempt.groupBy({
  by: ['userId'],
  where: { attemptType: 'PHOTO_UPLOAD' },
  _count: true,
  orderBy: { _count: { userId: 'desc' } },
  take: 100
})
```

## Privacy & Ethics

### User Consent
- Clear explanation of how data is used
- Opt-in only (never required)
- Can delete contributions anytime
- Anonymous dataset option

### Data Usage
- Educational purposes only
- No commercial use without permission
- Proper attribution in research
- Secure storage and access control

### Deletion Rights

```typescript
// User requests deletion
await prisma.userAttempt.deleteMany({
  where: {
    userId,
    attemptType: 'PHOTO_UPLOAD'
  }
})

// Delete from Supabase Storage
const photos = await listUserDrawings(userId)
for (const photoUrl of photos) {
  if (photoUrl.includes('photo-')) {
    await deleteDrawing(photoUrl)
  }
}
```

## Future Enhancements

### Phase 1: Quality Feedback
- [ ] Show quality tips before upload
- [ ] Real-time quality check (blur detection)
- [ ] Suggest retake if quality is poor

### Phase 2: Augmentation
- [ ] Auto-crop to character
- [ ] Brightness/contrast adjustment
- [ ] Perspective correction
- [ ] Background removal

### Phase 3: Crowdsourcing
- [ ] Public contribution page
- [ ] Community verification
- [ ] Contribution challenges
- [ ] Rewards program

### Phase 4: ML Integration
- [ ] Train custom OCR model
- [ ] Real-time handwriting recognition
- [ ] Style transfer (digital → handwritten)
- [ ] Personalized feedback

## Success Metrics

### Dataset Growth
- Target: 1,000 photos per character
- Current: Track in dashboard
- Quality: >80% verified

### User Engagement
- Contribution rate: % of users who upload
- Average photos per user
- Retention: Users who contribute multiple times

### Model Performance
- OCR accuracy improvement
- Character recognition rate
- Style generalization

## Conclusion

The photo upload feature transforms users into active contributors to AI development. By collecting diverse, real-world handwriting samples, we build a robust dataset that improves recognition accuracy for everyone.

This is a win-win:
- Users feel valued and engaged
- Platform builds valuable training data
- AI models become more accurate
- Umwero script preservation benefits

**Every photo uploaded is a step toward better handwriting recognition for Umwero script!**
