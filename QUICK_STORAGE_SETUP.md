# 🚀 Quick Storage Setup - 3 Easy Steps

## ✅ What's Already Done:
- ✅ AWS SDK installed
- ✅ Storage functions created in `lib/storage.ts`
- ✅ .env file updated with placeholders

## 🎯 Now Just Do These 3 Steps:

### Step 1: Create AWS Account & Get Keys
1. Go to https://aws.amazon.com/
2. Create free account (if you don't have one)
3. Go to "IAM" → "Users" → "Create user"
4. Give user "S3FullAccess" permission
5. Copy **Access Key ID** and **Secret Access Key**

### Step 2: Create S3 Bucket
1. Go to AWS S3 console
2. Click "Create bucket"
3. Bucket name: `uru-ruziga-storage`
4. Region: `us-east-1`
5. Leave other settings default
6. Click "Create bucket"

### Step 3: Update .env File
Replace the placeholders in your .env file:

```bash
# Find these lines in .env:
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Replace with your actual AWS keys:
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## 🎉 That's It! Your Storage is Ready

### How to Use:

```typescript
// Upload character image
import { uploadCharacterGlyph } from '@/lib/storage'

const imageBuffer = Buffer.from(imageData)
await uploadCharacterGlyph('vowel-a', imageBuffer)

// Upload user drawing
await uploadUserDrawing('user123', 'lesson-1', drawingBuffer)

// Get file URL
import { getFileUrl } from '@/lib/storage'
const imageUrl = await getFileUrl('characters/vowel-a.png')
```

## 📱 What You Can Store:
- ✅ Character glyph images
- ✅ User drawing attempts  
- ✅ Profile avatars
- ✅ Audio files (pronunciation)
- ✅ Lesson videos

## 🔧 Test It Works:
```bash
# Create a simple test file
node -e "
const { uploadFile } = require('./lib/storage.ts');
uploadFile(Buffer.from('test'), 'test.txt').then(() => console.log('✅ Storage works!'))
"
```

**Need help with any step? Just ask!**
