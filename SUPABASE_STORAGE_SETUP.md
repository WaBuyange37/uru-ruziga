# Supabase Storage Setup for User Drawings

## Overview
User drawings are now stored in Supabase Storage instead of the database, providing better performance, scalability, and cost efficiency.

## Architecture

### Storage Flow
```
Canvas → PNG → Blob → Supabase Storage → URL → Database
```

### Storage Structure
```
user-drawings/
├── {userId}/
│   ├── {characterId}/
│   │   ├── 1234567890.png
│   │   ├── 1234567891.png
│   │   └── ...
│   └── {anotherCharacterId}/
│       └── ...
└── {anotherUserId}/
    └── ...
```

## Supabase Setup

### Step 1: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Bucket name: `user-drawings`
4. Public bucket: ✅ Yes (for easy access)
5. File size limit: 5MB (adjust as needed)
6. Allowed MIME types: `image/png`

### Step 2: Set Storage Policies

```sql
-- Allow authenticated users to upload their own drawings
CREATE POLICY "Users can upload their own drawings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-drawings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own drawings
CREATE POLICY "Users can view their own drawings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-drawings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own drawings
CREATE POLICY "Users can delete their own drawings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-drawings' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (if bucket is public)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-drawings');
```

### Step 3: Configure Environment Variables

```bash
# .env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from: Supabase Dashboard → Settings → API

## Implementation Details

### 1. Upload Drawing

```typescript
// Convert canvas to blob
const dataURL = canvas.toDataURL('image/png')
const blob = dataURLtoBlob(dataURL)

// Upload to Supabase
const imageUrl = await uploadDrawing(userId, characterId, blob)

// Save URL to database
await prisma.userAttempt.create({
  data: {
    userId,
    characterId,
    drawingData: imageUrl, // Store URL, not base64
    aiScore: 85,
    feedback: 'Great work!'
  }
})
```

### 2. Helper Functions

```typescript
// lib/supabase.ts

// Upload drawing
export async function uploadDrawing(
  userId: string,
  characterId: string,
  imageBlob: Blob
): Promise<string>

// Delete drawing
export async function deleteDrawing(imageUrl: string): Promise<void>

// Convert data URL to Blob
export function dataURLtoBlob(dataUrl: string): Blob

// List user drawings
export async function listUserDrawings(
  userId: string,
  characterId?: string
): Promise<string[]>
```

### 3. API Endpoint

```typescript
POST /api/drawings/upload

Request:
{
  "drawingData": "data:image/png;base64,...",
  "lessonId": "lesson-id",
  "characterId": "character-id",
  "stepId": "practice-canvas",
  "aiScore": 85,
  "aiMetrics": { ... },
  "feedback": "Great work!",
  "isCorrect": true,
  "timeSpent": 120
}

Response:
{
  "success": true,
  "attemptId": "attempt-id",
  "imageUrl": "https://...supabase.co/storage/v1/object/public/user-drawings/..."
}
```

## Database Schema Update

### Before (Storing Base64)
```prisma
model UserAttempt {
  drawingData String? @db.Text // Large base64 string
}
```

### After (Storing URL)
```prisma
model UserAttempt {
  drawingData String? @db.Text // Supabase URL (much smaller)
}
```

No schema migration needed - same field, different content!

## Benefits

### 1. Performance
- ✅ Smaller database size
- ✅ Faster queries
- ✅ Reduced bandwidth
- ✅ Better caching

### 2. Scalability
- ✅ Unlimited storage (Supabase handles it)
- ✅ CDN distribution
- ✅ Automatic image optimization
- ✅ Easy to add image transformations

### 3. Cost Efficiency
- ✅ Storage is cheaper than database
- ✅ Pay only for what you use
- ✅ Free tier: 1GB storage + 2GB bandwidth

### 4. Features
- ✅ Direct image URLs
- ✅ Public/private access control
- ✅ Automatic backups
- ✅ Image transformations (resize, crop, etc.)

## Usage Examples

### Upload Drawing After Evaluation

```typescript
const handleEvaluate = async () => {
  const drawingData = canvas.toDataURL('image/png')
  
  // 1. Evaluate with Vision API
  const evaluation = await evaluateDrawing(drawingData)
  
  // 2. Upload to Supabase
  const response = await fetch('/api/drawings/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      drawingData,
      lessonId,
      characterId,
      aiScore: evaluation.score,
      feedback: evaluation.feedback,
      isCorrect: evaluation.passed
    })
  })
  
  const { imageUrl } = await response.json()
  console.log('Drawing saved:', imageUrl)
}
```

### Display User's Past Drawings

```typescript
// Fetch user attempts
const attempts = await prisma.userAttempt.findMany({
  where: { userId, characterId },
  orderBy: { createdAt: 'desc' }
})

// Display images
{attempts.map(attempt => (
  <img 
    src={attempt.drawingData} // Supabase URL
    alt="User drawing"
  />
))}
```

### Delete Old Drawings

```typescript
// Delete from Supabase
await deleteDrawing(attempt.drawingData)

// Delete from database
await prisma.userAttempt.delete({
  where: { id: attempt.id }
})
```

## Migration from Neon to Supabase

When switching from Neon to Supabase:

### Step 1: Export Data from Neon
```bash
pg_dump $NEON_DATABASE_URL > backup.sql
```

### Step 2: Import to Supabase
```bash
psql $SUPABASE_DATABASE_URL < backup.sql
```

### Step 3: Migrate Existing Base64 Images

```typescript
// Migration script
const attempts = await prisma.userAttempt.findMany({
  where: {
    drawingData: { startsWith: 'data:image' } // Base64 data URLs
  }
})

for (const attempt of attempts) {
  // Convert to blob
  const blob = dataURLtoBlob(attempt.drawingData)
  
  // Upload to Supabase
  const imageUrl = await uploadDrawing(
    attempt.userId,
    attempt.characterId || 'legacy',
    blob
  )
  
  // Update database
  await prisma.userAttempt.update({
    where: { id: attempt.id },
    data: { drawingData: imageUrl }
  })
}
```

### Step 4: Update Environment Variables
```bash
# Replace Neon URL with Supabase URL
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

## Storage Limits & Pricing

### Supabase Free Tier
- Storage: 1GB
- Bandwidth: 2GB/month
- Requests: Unlimited

### Pro Tier ($25/month)
- Storage: 100GB
- Bandwidth: 200GB/month
- Additional: $0.021/GB storage, $0.09/GB bandwidth

### Estimated Usage
- Average drawing: ~50KB
- 1GB = ~20,000 drawings
- 2GB bandwidth = ~40,000 views/month

## Monitoring

### Check Storage Usage

```typescript
// Get bucket size
const { data, error } = await supabase
  .storage
  .from('user-drawings')
  .list()

const totalSize = data.reduce((sum, file) => sum + file.metadata.size, 0)
console.log(`Total storage: ${totalSize / 1024 / 1024} MB`)
```

### Track Upload Success Rate

```typescript
// Log uploads
console.log('Upload attempt:', {
  userId,
  characterId,
  size: blob.size,
  timestamp: new Date()
})

// Monitor errors
if (error) {
  console.error('Upload failed:', {
    error: error.message,
    userId,
    characterId
  })
}
```

## Troubleshooting

### Issue: Upload fails with 401
**Solution**: Check Supabase anon key and storage policies

### Issue: Images not loading
**Solution**: Verify bucket is public or user has access

### Issue: Slow uploads
**Solution**: Compress images before upload or use smaller canvas size

### Issue: Storage quota exceeded
**Solution**: Implement cleanup policy for old drawings

## Best Practices

1. **Compress images**: Reduce canvas size before upload
2. **Set expiry**: Auto-delete drawings older than 90 days
3. **Rate limiting**: Limit uploads per user per day
4. **Error handling**: Always have fallback for upload failures
5. **Monitoring**: Track storage usage and costs

## Conclusion

Supabase Storage provides a robust, scalable solution for storing user drawings:
- ✅ Better performance than database storage
- ✅ Easy migration from Neon
- ✅ Cost-effective at scale
- ✅ Built-in CDN and caching
- ✅ Simple API and good DX

The system is now ready for production use and future migration to Supabase!
