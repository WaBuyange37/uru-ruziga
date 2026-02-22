# 🆕 Fresh Supabase Setup Guide

## 🗑️ Step 1: Delete Old Project
1. Go to https://supabase.com/dashboard
2. Find your project "ochlhxcswlhhbclzqxvb"
3. Click **Settings** (gear icon)
4. Scroll to bottom → **"Delete project"**
5. Type project name to confirm → **Delete**

## 🆕 Step 2: Create New Project
1. Click **"New project"**
2. Project name: `uru-ruziga`
3. Database password: `UruzigaUmwero260` (or choose new)
4. Region: `East US (North Virginia)` (closest to you)
5. Click **"Create new project"**

## 🎯 Step 3: Get Connection Details
Once project is created:

### Database Connection:
1. Click **Settings** → **Database**
2. Copy **"Connection string"** (pooling)
3. It will look like:
   ```
   postgresql://postgres.ochlhxcswlhhbclzqxvb:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### API Keys:
1. Click **Settings** → **API**
2. Copy **Project URL** and **public anon key**
3. Copy **service_role** key (for storage)

## 📝 Step 4: Update .env File
Replace entire .env content with:

```bash
# Supabase Public
NEXT_PUBLIC_SUPABASE_URL="https://[NEW_PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[COPY_ANON_KEY_HERE]"

# Database
DATABASE_URL="postgresql://postgres.[NEW_PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[NEW_PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Storage
SUPABASE_SERVICE_ROLE_KEY="[COPY_SERVICE_ROLE_KEY_HERE]"

JWT_SECRET="8e821af423110b56792260ac9a249083b9d004bab54613a22fc14f567c5c9bf9"
```

## 🪣 Step 5: Create Storage Buckets
Run this after .env is updated:

```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

## 🚀 Step 6: Push Schema & Seed
```bash
# Push database schema
npx prisma db push

# Seed with Umwero data
npx tsx prisma/seed.ts
```

## 🎉 Benefits of Fresh Setup:
- ✅ **Clean credentials** (no old password issues)
- ✅ **Correct region** (East US)
- ✅ **Fresh buckets** (no conflicts)
- ✅ **Known passwords** (you set them)
- ✅ **Free tier** (1GB storage + 500MB database)

## 📱 Your New URLs Will Be:
```
Database: postgresql://postgres.[NEW_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
Storage: https://[NEW_REF].supabase.co/storage/v1/public
API: https://[NEW_REF].supabase.co
```

**Ready to start fresh? I'll guide you through each step!**
