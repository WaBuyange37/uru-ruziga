# 🔧 Fix Database Connection - Step by Step

## Problem

Your database connection is failing with error:
```
Can't reach database server at aws-1-us-east-1.pooler.supabase.com
```

This means either:
1. **Supabase project is paused** (most likely - free tier auto-pauses)
2. **Database credentials are incorrect**
3. **Network/firewall issue**

---

## Solution: Follow These Steps Exactly

### Step 1: Check Supabase Project Status (2 minutes)

1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Look for your project: **ozaobsjgrtkpmortxmch**
4. Check the status:
   - If it says **"PAUSED"** → Click **"Resume"** or **"Restore"**
   - If it says **"ACTIVE"** → Continue to Step 2

**Wait 1-2 minutes** after resuming for the database to start.

---

### Step 2: Get Fresh Database Credentials (3 minutes)

1. In Supabase Dashboard, click on your project
2. Go to **Settings** (gear icon in sidebar)
3. Click **Database** in the left menu
4. Scroll down to **Connection string**
5. Select **URI** format
6. Copy the connection string

You'll see something like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

---

### Step 3: Update Your .env File (2 minutes)

Open your `.env` file and update these lines:

```bash
# Replace with your actual connection strings
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

**Important**: 
- Replace `[YOUR-PROJECT-REF]` with your actual project reference
- Replace `[YOUR-PASSWORD]` with your actual database password
- Keep the `?pgbouncer=true` at the end of DATABASE_URL
- Port 6543 for DATABASE_URL (pooler)
- Port 5432 for DIRECT_URL (direct connection)

---

### Step 4: Test Connection (1 minute)

```bash
# Test if connection works
node scripts/verify-database.js
```

If you see:
- ✅ **"Database connection successful"** → Great! Continue to Step 5
- ❌ **"Database connection failed"** → Go back to Step 2 and double-check credentials

---

### Step 5: Create Missing Tables (2 minutes)

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Verify everything is created
node scripts/verify-database.js
```

You should see:
```
✅ PASS - Connection
✅ PASS - Tables
✅ PASS - Data Integrity
✅ PASS - Indexes

✅ DATABASE IS READY FOR PRODUCTION DEPLOYMENT
```

---

### Step 6: Verify AI Dataset Tables (1 minute)

Run this command to check if the AI dataset tables were created:

```bash
npx prisma studio
```

This opens a web interface. Check for these tables:
- ✅ handwriting_attempts
- ✅ character_references
- ✅ community_entries
- ✅ dataset_entries

---

## Alternative: Create New Supabase Project

If your current project has persistent issues, create a fresh one:

### 1. Create New Project (5 minutes)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: uruziga-production
   - **Database Password**: (click generate or create strong password - SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., US East)
   - **Plan**: Free (you can upgrade later)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to be ready

### 2. Get New Connection Strings (2 minutes)

1. Once project is ready, go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. You'll get something like:
   ```
   postgresql://postgres.[NEW-REF]:[NEW-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
   ```

### 3. Update .env with New Credentials (2 minutes)

```bash
# Database
DATABASE_URL="postgresql://postgres.[NEW-REF]:[NEW-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[NEW-REF]:[NEW-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[NEW-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[NEW-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[NEW-SERVICE-KEY]"
```

Get the Supabase keys from **Settings** → **API**

### 4. Initialize New Database (3 minutes)

```bash
# Generate Prisma Client
npx prisma generate

# Create all tables
npx prisma db push

# Seed initial data
npx prisma db seed

# Verify
node scripts/verify-database.js
```

---

## What Gets Created

When you run `npx prisma db push`, these AI dataset tables are created:

### 1. handwriting_attempts
Stores every handwriting attempt with:
- User ID
- Character ID
- Stroke data (JSON array)
- AI evaluation score
- Feedback
- Processing time
- Metadata

### 2. character_references
Stores reference character data:
- Umwero character
- Unicode mapping
- Font image path
- Canonical stroke order
- Metadata

### 3. community_entries
Stores cultural/language data for NLP:
- User ID
- Text content
- Language (Kinyarwanda/English)
- Category
- Metadata

### 4. dataset_entries
ML-ready dataset entries:
- Linked to handwriting attempt
- User ID (anonymized)
- Character ID
- Complete stroke data
- Image URL
- Score
- Time taken
- User metadata
- Train/val/test split

---

## Verification Checklist

After completing the steps, verify:

- [ ] Supabase project is **ACTIVE** (not paused)
- [ ] Database connection test passes
- [ ] All 34+ tables exist
- [ ] handwriting_attempts table exists
- [ ] character_references table exists
- [ ] community_entries table exists
- [ ] dataset_entries table exists
- [ ] Indexes are created
- [ ] Can query users table
- [ ] Can query characters table

---

## Quick Test Commands

```bash
# Test connection
node scripts/verify-database.js

# View database in browser
npx prisma studio

# Check table count
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# List all tables
npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```

---

## Common Errors & Solutions

### Error: "Can't reach database server"
**Solution**: Supabase project is paused. Resume it in dashboard.

### Error: "Authentication failed"
**Solution**: Database password is wrong. Get fresh credentials from Supabase.

### Error: "Connection timeout"
**Solution**: Check your internet connection or firewall settings.

### Error: "Database does not exist"
**Solution**: Use the correct database name (usually "postgres").

### Error: "Too many connections"
**Solution**: Use the pooler connection (port 6543) with `?pgbouncer=true`.

---

## After Database is Fixed

Once your database is working, you can:

1. **Deploy Python AI Service**:
   ```bash
   cd python-ai-service
   railway up  # or your chosen platform
   ```

2. **Deploy Next.js App**:
   ```bash
   git push origin main  # Triggers Vercel deployment
   ```

3. **Purchase Domain**:
   - Buy from Namecheap, Google Domains, or Cloudflare
   - Configure DNS in Vercel
   - Wait for propagation (5-60 minutes)

4. **Go Live**! 🚀

---

## Need Help?

If you're still stuck after following these steps:

1. Check the error message carefully
2. Review `DATABASE_PRODUCTION_SETUP.md`
3. Check Supabase status page: https://status.supabase.com
4. Try creating a new Supabase project (fresh start)

---

## Summary

**Most Common Issue**: Supabase free tier projects auto-pause after inactivity.

**Quick Fix**:
1. Go to Supabase dashboard
2. Resume your project
3. Wait 1-2 minutes
4. Run: `npx prisma db push`
5. Run: `node scripts/verify-database.js`

**Total Time**: 10-15 minutes

---

**Ready?** Start with Step 1 above! 👆
