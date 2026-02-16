# 🎉 Supabase Storage Setup - FREE & Easy!

## ✅ Why Supabase is Better:
- ✅ **FREE storage buckets** (up to 1GB)
- ✅ **No AWS setup** needed
- ✅ **Built-in CDN** for fast loading
- ✅ **Simple API** (no complex AWS SDK)
- ✅ **Already configured** in your project

## 🎯 Quick Setup (2 Steps):

### Step 1: Get Supabase Service Role Key
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click **Settings** → **API**
3. Find **"service_role"** key
4. Copy the full key (starts with `eyJ...`)

### Step 2: Update .env File
Replace the placeholder in your .env:

```bash
# Find this line:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Replace with your actual service role key:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🪣 Create Storage Buckets

Run this to create your buckets:

```bash
npx tsx -e "
import { supabase } from './lib/supabase-storage';

async function createBuckets() {
  const buckets = ['characters', 'user-drawings', 'avatars', 'audio'];
  
  for (const bucket of buckets) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      allowedMimeTypes: ['image/*', 'audio/*']
    });
    
    if (error && !error.message.includes('already exists')) {
      console.error('❌ Bucket error:', bucket, error);
    } else {
      console.log('✅ Bucket ready:', bucket);
    }
  }
}

createBuckets();
"
```

## 📱 Use Your Storage:

```typescript
// Import the functions
import { 
  uploadCharacterGlyph, 
  uploadUserDrawing, 
  uploadUserAvatar,
  getFileUrl 
} from '@/lib/supabase-storage'

// Upload character image
const imageUrl = await uploadCharacterGlyph('vowel-a', imageBuffer)

// Upload user drawing
const drawingUrl = await uploadUserDrawing('user123', 'lesson-1', drawingBuffer)

// Upload avatar
const avatarUrl = await uploadUserAvatar('user123', avatarBuffer)

// Get file URL
const url = getFileUrl('characters', 'vowel-a.png')
```

## 🎯 Your File URLs Will Be:
```
Character images: https://ochlhxcswlhhbclzqxvb.supabase.co/storage/v1/public/characters/vowel-a.png
User drawings: https://ochlhxcswlhhbclzqxvb.supabase.co/storage/v1/public/user-drawings/user123/lesson1/123456789.png
Avatars: https://ochlhxcswlhhbclzqxvb.supabase.co/storage/v1/public/avatars/user123.png
Audio files: https://ochlhxcswlhhbclzqxvb.supabase.co/storage/v1/public/audio/vowel-a.mp3
```

## 🚀 Test It Works:

```bash
# Test upload
npx tsx -e "
import { uploadCharacterGlyph } from './lib/supabase-storage';
uploadCharacterGlyph('test', Buffer.from('test image data')).then(url => {
  console.log('✅ Storage works! URL:', url);
});
"
```

## 💡 Benefits vs AWS:
- **FREE** vs paid ($$$)
- **Simple** vs complex setup
- **Fast** CDN included
- **Secure** with built-in policies
- **No extra configuration** needed

**Ready to set up your FREE Supabase storage?**
