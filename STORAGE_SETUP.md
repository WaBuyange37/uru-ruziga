# Storage Setup for Neon Database

## 🎯 The Issue
Neon = PostgreSQL only (no built-in storage)
Supabase = PostgreSQL + Storage + Auth + Functions

## 🗂️ Recommended Solutions

### Option 1: AWS S3 (Most Flexible)
```bash
# Install AWS SDK
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-request-presigner

# Add to .env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=uru-ruziga-storage
```

### Option 2: Cloudinary (Images Only)
```bash
npm install cloudinary

# Add to .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Option 3: Hybrid Neon + Supabase Storage
```bash
# Keep Neon for database
# Use Supabase just for storage buckets

# Add to .env
DATABASE_URL=postgresql://... (Neon)
NEXT_PUBLIC_SUPABASE_URL=https://... (Supabase)
SUPABASE_SERVICE_ROLE_KEY=... (Supabase)
```

## 📁 What Needs Storage:

### 1. Character Images
- High-resolution PNG/SVG of Umwero glyphs
- Stroke order animations
- Cultural context images

### 2. User Content
- Drawing attempts (canvas images)
- Profile avatars
- Community post images

### 3. Media Files
- Pronunciation audio files
- Lesson videos
- Tutorial content

## 🚀 Quick Implementation (AWS S3)

### 1. Create S3 Bucket
```bash
aws s3 mb s3://uru-ruziga-storage
aws s3api put-bucket-cors --bucket uru-ruziga-storage --cors-configuration file://cors.json
```

### 2. Create Upload Service
```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

export async function uploadFile(file: Buffer, key: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: 'image/png'
  })
  
  return await s3Client.send(command)
}
```

## 💡 Recommendation

**For Production**: Use AWS S3 (most scalable)
**For Development**: Use Cloudinary (easier setup)
**For Hybrid**: Neon + Supabase Storage (keep existing Supabase setup)

## 🔗 Update Your App

Replace any Supabase storage calls with your chosen storage solution:

```typescript
// Old (Supabase)
const { data, error } = supabase.storage
  .from('characters')
  .upload('glyph-a.png', file)

// New (AWS S3)
const result = await uploadFile(file, 'characters/glyph-a.png')
```

Would you like me to set up one of these storage solutions for you?
