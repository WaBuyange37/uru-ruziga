# 🔧 Fix Supabase Database Connection

## ❌ Current Issue:
Database connection to Supabase is failing

## 🎯 Get Correct Supabase Database Credentials:

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project: "ochlhxcswlhhbclzqxvb"

### Step 2: Get Database URL
1. Click **Settings** (gear icon)
2. Click **Database**
3. Scroll down to **"Connection string"**
4. Copy the **"Connection pooling"** URL
5. It should look like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Update Your .env File
Replace the DATABASE_URL line in your .env:

```bash
# Find this line:
DATABASE_URL="postgresql://postgres:B6GMKJb5yzGeHwG2@db.ochlhxcswlhhbclzqxvb.supabase.co:5432/postgres"

# Replace with your actual connection string:
DATABASE_URL="postgresql://postgres.ochlhxcswlhhbclzqxvb:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### Step 4: Test Connection
```bash
npx prisma db push
```

## 🔍 Alternative: Use Direct Connection
If pooling doesn't work, try the direct connection:

1. In Supabase Settings → Database
2. Find **"Direct connection string"**
3. Copy and use that URL instead

## 🚀 Once Connected:
```bash
# Push schema
npx prisma db push

# Seed data
npx tsx prisma/seed.ts
```

## 💡 Tips:
- Make sure your Supabase project is **active** (not paused)
- Check if you have the correct **project password**
- The URL should end with `.pooler.supabase.com:6543` (not `:5432`)

**Need help finding your connection string?** I can guide you step by step!
