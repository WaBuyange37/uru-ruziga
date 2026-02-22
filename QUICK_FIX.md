# 🚨 Quick Fix - Get Correct Supabase URL

## ❌ Current Error: "Tenant or user not found"

## 🎯 The Fix - Update Your DATABASE_URL:

### Step 1: Go to Supabase Dashboard
1. https://supabase.com/dashboard
2. Click your project "ochlhxcswlhhbclzqxvb"

### Step 2: Get Connection String
1. Settings → Database
2. Scroll to "Connection string"
3. Copy "Connection string" for pooling
4. It should look like:
   ```
   postgresql://postgres.ochlhxcswlhhbclzqxvb:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Update .env File
Replace your DATABASE_URL line with the exact string from Supabase:

```bash
DATABASE_URL="postgresql://postgres.ochlhxcswlhhbclzqxvb:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

## 🔍 What's Wrong Now:
- Your password `B6GMKJb5yzGeHwG2` is incorrect
- You need the actual password from Supabase dashboard

## 🚀 After Fix:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

**The key is getting the exact connection string from your Supabase dashboard!**
