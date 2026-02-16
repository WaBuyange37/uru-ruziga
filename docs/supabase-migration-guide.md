# Supabase Migration Guide for Umwero (Uruziga)

## 🎯 Overview

This guide will help you migrate your Umwero learning platform database from local PostgreSQL to Supabase, including setting up the required storage buckets for images and media files.

---

## 📋 Prerequisites

### Required Accounts & Tools
- [ ] Supabase account (https://supabase.com)
- [ ] Node.js 18+ installed
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] Git repository access

### Before You Start
- [ ] Backup your current database
- [ ] Note down any custom configurations
- [ ] Ensure you have admin access to your current database

---

## 🚀 Step 1: Create Supabase Project

### 1.1 Sign Up & Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google
4. Click "New Project"
5. Select your organization
6. Configure project:
   ```
   Project Name: uruziga-umuero
   Database Password: [Generate strong password]
   Region: Choose closest to your users (建议: East Africa - af-south-1)
   ```

### 1.2 Get Connection Details
Once created, navigate to:
- **Settings → Database** → Connection string
- **Settings → API** → Project URL and anon/public keys

Save these securely:
```bash
# Add to your .env.local
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

---

## 📦 Step 2: Set Up Storage Buckets

### 2.1 Required Buckets for Umwero

Create these buckets in Supabase Storage:

#### **A. Character Images Bucket**
```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'character-images',
  'character-images',
  true, -- Public access
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
);
```

#### **B. User Drawings Bucket**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-drawings',
  'user-drawings',
  false, -- Private access
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);
```

#### **C. Audio Files Bucket**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  true, -- Public access
  10485760, -- 10MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
);
```

#### **D. Video Files Bucket**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-files',
  'video-files',
  true, -- Public access
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg']
);
```

#### **E. Profile Pictures Bucket**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true, -- Public access
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);
```

### 2.2 Set Up Storage Policies

#### **Public Bucket Policies**
```sql
-- Enable public access for character images
CREATE POLICY "Public Access Character Images" ON storage.objects
FOR SELECT USING (bucket_id = 'character-images');

-- Enable public access for audio files
CREATE POLICY "Public Access Audio Files" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-files');

-- Enable public access for video files
CREATE POLICY "Public Access Video Files" ON storage.objects
FOR SELECT USING (bucket_id = 'video-files');

-- Enable public access for profile pictures
CREATE POLICY "Public Access Profile Pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');
```

#### **Private Bucket Policies-----**
```sql
-- Users can only access their own drawings
CREATE POLICY "Users can upload own drawings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-drawings' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can view own drawings" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-drawings' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()
);
```

---

## 🗄️ Step 3: Database Schema Migration

### 3.1 Initialize Supabase Locally
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Start local development
supabase start
```

### 3.2 Generate Initial Migration
```bash
# Generate migration from your current schema
supabase db push
```

### 3.3 Create Migration File
Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Your existing schema from prisma/schema.prisma
-- Copy all your existing tables here...

-- Add Supabase-specific extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid()::text = id);

-- User attempts policies
CREATE POLICY "Users can view own attempts" ON user_attempts
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own attempts" ON user_attempts
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Community posts policies
CREATE POLICY "Anyone can view public posts" ON community_posts
FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own posts" ON community_posts
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own posts" ON community_posts
FOR UPDATE USING (auth.uid()::text = user_id);
```

### 3.4 Push Schema to Supabase
```bash
# Apply migrations
supabase db push

# Or if you have existing data
supabase migration up
```

---

## 🔧 Step 4: Update Prisma Configuration

### 4.1 Update .env
```bash
# Replace your DATABASE_URL
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Add Supabase specific URLs
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"
```

### 4.2 Update Prisma Schema
Add Supabase extensions to `prisma/schema.prisma`:

```prisma
// Add at the top
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add these for Supabase
  directUrl = env("DIRECT_URL") // Optional for connection pooling
}

// Your existing models remain the same...
// Just ensure they work with Supabase's PostgreSQL version
```

### 4.3 Regenerate Prisma Client
```bash
npx prisma generate
npx prisma db push
```

---

## 📤 Step 5: Data Migration

### 5.1 Export Current Data
```bash
# From your current database
pg_dump -h localhost -U postgres -d uruziga_db > uruziga_backup.sql
```

### 5.2 Import to Supabase
```bash
# Import to Supabase
psql -h db.[project-ref].supabase.co -U postgres -d postgres -f uruziga_backup.sql
```

### 5.3 Alternative: Use Prisma Seed Script
Create `prisma/seed-supabase.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function seedSupabase() {
  try {
    // Migrate users
    const usersData = JSON.parse(fs.readFileSync('users.json', 'utf-8'))
    for (const user of usersData) {
      await prisma.user.create({ data: user })
    }

    // Migrate characters
    const charactersData = JSON.parse(fs.readFileSync('characters.json', 'utf-8'))
    for (const character of charactersData) {
      await prisma.character.create({ data: character })
    }

    // Continue with other tables...
    console.log('✅ Data migration completed')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSupabase()
```

---

## 🔐 Step 6: Authentication Setup

### 6.1 Configure Auth Providers
In Supabase Dashboard → Authentication → Providers:

#### **Email Provider**
```json
{
  "enabled": true,
  "double_confirm_changes": false,
  "enable_signup": true
}
```

#### **Google Provider** (Optional)
```json
{
  "enabled": true,
  "client_id": "your-google-client-id",
  "client_secret": "your-google-client-secret",
  "redirect_uri": "https://[project-ref].supabase.co/auth/v1/callback"
}
```

### 6.2 Update Auth Context
Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Update your existing auth context to use Supabase:

```typescript
// In app/contexts/AuthContext.tsx
import { supabase } from '@/lib/supabase'

// Update login function
const login = async (identifier: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password
  })
  
  if (error) throw error
  return data.user
}
```

---

## 🖼️ Step 7: File Storage Integration

### 7.1 Update Image Upload Logic
Create `lib/storage.ts`:

```typescript
import { supabase } from './supabase'

export async function uploadCharacterImage(
  file: File, 
  characterId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${characterId}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('character-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('character-images')
    .getPublicUrl(fileName)

  return publicUrl
}

export async function uploadUserDrawing(
  file: File, 
  userId: string, 
  attemptId: string
): Promise<string> {
  const fileName = `${userId}/${attemptId}.png`
  
  const { data, error } = await supabase.storage
    .from('user-drawings')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('user-drawings')
    .getPublicUrl(fileName)

  return publicUrl
}
```

### 7.2 Update API Routes
Update your drawing API to use Supabase storage:

```typescript
// In app/api/drawings/upload/route.ts
import { uploadUserDrawing } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const attemptId = formData.get('attemptId') as string

    const imageUrl = await uploadUserDrawing(file, userId, attemptId)

    // Save to database
    await prisma.userAttempt.update({
      where: { id: attemptId },
      data: { uploadedImageUrl: imageUrl }
    })

    return Response.json({ success: true, imageUrl })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

---

## 🔄 Step 8: Environment Configuration

### 8.1 Update .env.local
```bash
# Database
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"

# Storage
SUPABASE_STORAGE_URL="https://[project-ref].supabase.co/storage/v1"

# Existing keys remain the same
JWT_SECRET="[your-existing-jwt-secret]"
ANTHROPIC_API_KEY="[your-existing-api-key]"
```

### 8.2 Update package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset",
    "db:studio": "supabase db studio",
    "storage:clean": "supabase storage rm --recursive --bucket user-drawings"
  }
}
```

---

## 🧪 Step 9: Testing & Verification

### 9.1 Database Connection Test
```typescript
// Create test-db-connection.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    const count = await prisma.user.count()
    console.log(`✅ Connected! Users count: ${count}`)
  } catch (error) {
    console.error('❌ Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
```

### 9.2 Storage Test
```typescript
// Create test-storage.ts
import { supabase } from '@/lib/supabase'

async function testStorage() {
  try {
    const { data, error } = await supabase.storage
      .from('character-images')
      .list()
    
    if (error) throw error
    console.log('✅ Storage connected!', data)
  } catch (error) {
    console.error('❌ Storage failed:', error)
  }
}

testStorage()
```

### 9.3 Run Tests
```bash
# Test database connection
npx ts-node test-db-connection.ts

# Test storage
npx ts-node test-storage.ts

# Test full application
npm run dev
```

---

## 🚨 Step 10: Production Deployment

### 10.1 Environment Variables for Production
```bash
# In Vercel/Netlify/your hosting platform
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"
```

### 10.2 Deploy
```bash
# Build and deploy
npm run build
npm run start

# Or use your hosting platform's CLI
vercel --prod
# or
netlify deploy --prod
```

---

## 📊 Monitoring & Maintenance

### 10.1 Supabase Dashboard Monitoring
- **Database**: Monitor query performance and connections
- **Storage**: Monitor bucket usage and bandwidth
- **Auth**: Monitor user authentication and security
- **Functions**: Monitor edge function performance

### 10.2 Regular Tasks
```bash
# Backup database
supabase db dump > backup-$(date +%Y%m%d).sql

# Clean old user drawings (older than 90 days)
supabase storage rm --recursive --bucket user-drawings --older-than 90d

# Update schema
supabase db push
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### **Connection Issues**
```bash
# Check connection string format
# Should be: postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
```

#### **Storage Permission Errors**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'storage.objects';

-- Fix missing policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

#### **Migration Failures**
```bash
# Reset and retry
supabase db reset
supabase db push
```

#### **File Upload Issues**
```typescript
// Check file size limits
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large')
}
```

---

## 📞 Support Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/with-prisma)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

### Emergency Contacts
- Supabase Support: support@supabase.com
- Project Dashboard: https://app.supabase.com

---

## ✅ Migration Checklist

- [ ] Supabase project created
- [ ] Storage buckets configured
- [ ] Database schema migrated
- [ ] Data imported successfully
- [ ] Authentication configured
- [ ] File storage integrated
- [ ] Environment variables updated
- [ ] Application tested locally
- [ ] Production deployment completed
- [ ] Monitoring set up
- [ ] Backup procedures documented

---

**🎉 Congratulations! Your Umwero platform is now running on Supabase!**

This migration provides you with:
- ✅ Managed PostgreSQL database
- ✅ Scalable file storage
- ✅ Built-in authentication
- ✅ Real-time capabilities
- ✅ Edge functions
- ✅ Automatic backups
- ✅ Global CDN

Your Umwero learning platform is now ready to scale and serve learners worldwide!
