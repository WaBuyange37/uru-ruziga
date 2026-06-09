# Database Production Setup Guide

## Current Status

Your Prisma schema is comprehensive and includes all necessary models for the Uruziga AI Dataset Architecture:

✅ **Core Models**:
- User, Character, Lesson, LessonProgress
- UserCharacterProgress, UserAttempt

✅ **AI Dataset Models** (Phase 1-4):
- HandwritingAttempt - Stores all handwriting attempts with stroke data
- CharacterReference - Reference images and canonical stroke data
- CommunityEntry - Cultural discussions for NLP training
- DatasetEntry - ML-ready dataset entries

✅ **Community & Learning**:
- CommunityPost, Discussion, Comment
- Achievement, Certificate, Quiz

---

## Database Connection Issue

The error `FATAL: (ENOTFOUND) tenant/user postgres.ozaobsjgrtkpmortxmch not found` suggests:

1. **Supabase project might be paused** (free tier auto-pauses after inactivity)
2. **Database credentials might have changed**
3. **Network/firewall issue**

---

## Fix Steps

### Step 1: Verify Supabase Project Status

1. Go to https://supabase.com/dashboard
2. Check if your project is **paused** or **active**
3. If paused, click "Resume" or "Restore"

### Step 2: Get Fresh Database Credentials

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Copy the **Connection String** (Transaction mode for Prisma)
3. Update your `.env` file:

```bash
# Pooler connection (for serverless/API routes)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (for migrations/db push)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

**Important**: Replace `[PROJECT-REF]` and `[PASSWORD]` with your actual values.

### Step 3: Test Connection

```bash
# Test database connection
node scripts/verify-database.js
```

### Step 4: Push Schema to Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates/updates tables)
npx prisma db push

# Verify again
node scripts/verify-database.js
```

### Step 5: Seed Initial Data (Optional)

```bash
# Seed database with initial characters and lessons
npx prisma db seed
```

---

## Alternative: Create New Supabase Project

If your current project has issues, create a fresh one:

### 1. Create New Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose:
   - **Name**: uruziga-production
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to your users
   - **Plan**: Free (upgrade later)

### 2. Get Connection Strings

After project creation:
1. Go to **Settings** → **Database**
2. Copy **Connection string** (URI format)
3. Update `.env`:

```bash
DATABASE_URL="postgresql://postgres.[NEW-REF]:[NEW-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[NEW-REF]:[NEW-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

### 3. Update Supabase Keys

```bash
NEXT_PUBLIC_SUPABASE_URL="https://[NEW-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[NEW-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[NEW-SERVICE-ROLE-KEY]"
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema
npx prisma db push

# Seed data
npx prisma db seed

# Verify
node scripts/verify-database.js
```

---

## Production Deployment Checklist

### Database Configuration

- [ ] Database connection verified
- [ ] All tables created
- [ ] Indexes created
- [ ] Initial data seeded
- [ ] Backup strategy configured

### Environment Variables

- [ ] `DATABASE_URL` set correctly
- [ ] `DIRECT_URL` set correctly
- [ ] `JWT_SECRET` generated (strong random string)
- [ ] `NEXTAUTH_SECRET` generated
- [ ] `SUPABASE_*` keys configured
- [ ] `OPENAI_API_KEY` configured (for AI evaluation)

### Security

- [ ] Database password is strong
- [ ] Environment variables not committed to git
- [ ] `.env` in `.gitignore`
- [ ] Production `.env` stored securely

### Performance

- [ ] Connection pooling enabled (pgBouncer)
- [ ] Indexes on frequently queried fields
- [ ] Query optimization reviewed

---

## Hosting Options

### Option 1: Vercel (Recommended for Next.js)

**Pros**:
- Seamless Next.js deployment
- Automatic HTTPS
- Global CDN
- Easy environment variable management

**Steps**:
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Cost**: Free tier available, ~$20/month for Pro

### Option 2: Netlify

**Pros**:
- Good Next.js support
- Generous free tier
- Easy deployment

**Steps**:
1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

**Cost**: Free tier available

### Option 3: Railway

**Pros**:
- Includes database hosting
- Simple deployment
- Good for full-stack apps

**Steps**:
1. Connect GitHub
2. Add PostgreSQL service
3. Deploy

**Cost**: ~$5-20/month

### Option 4: DigitalOcean App Platform

**Pros**:
- Full control
- Predictable pricing
- Good performance

**Cost**: ~$12-25/month

---

## Python AI Service Deployment

The Python AI service needs separate hosting:

### Option 1: Railway (Recommended)

```bash
# In python-ai-service directory
railway init
railway up
```

### Option 2: Render

1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option 3: Fly.io

```bash
fly launch
fly deploy
```

### Update Next.js Environment

```bash
# Add Python service URL
PYTHON_AI_SERVICE_URL=https://your-python-service.railway.app
```

---

## Domain Setup

### 1. Purchase Domain

Recommended registrars:
- **Namecheap**: ~$10-15/year
- **Google Domains**: ~$12/year
- **Cloudflare**: ~$10/year (with free CDN)

### 2. Configure DNS

In your domain registrar:

```
Type    Name    Value
A       @       [Your-Vercel-IP]
CNAME   www     cname.vercel-dns.com
```

Or use Vercel's nameservers for easier management.

### 3. Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Follow verification steps
4. Wait for DNS propagation (5-60 minutes)

### 4. Enable HTTPS

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## Post-Deployment Verification

### 1. Test Database Connection

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-05-20T..."
}
```

### 2. Test Python AI Service

```bash
curl https://your-python-service.com/health
```

### 3. Test Full Flow

1. Register a user
2. Login
3. Start a lesson
4. Draw a character
5. Verify evaluation works

---

## Monitoring & Maintenance

### Database Monitoring

- **Supabase Dashboard**: Monitor queries, connections, storage
- **Set up alerts**: For high CPU, storage, or connection usage

### Application Monitoring

- **Vercel Analytics**: Track performance, errors
- **Sentry** (optional): Error tracking
- **LogRocket** (optional): Session replay

### Backups

Supabase automatically backs up your database:
- **Point-in-time recovery**: Last 7 days (free tier)
- **Manual backups**: Export via Supabase dashboard

---

## Cost Estimation

### Minimal Setup (Free Tier)
- **Vercel**: Free
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Domain**: ~$12/year
- **Total**: ~$12/year

### Production Setup
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month (8GB database, 50GB bandwidth)
- **Railway (Python)**: $10/month
- **Domain**: ~$12/year
- **Total**: ~$55/month + $12/year

### Scaling (High Traffic)
- **Vercel Enterprise**: $150+/month
- **Supabase Team**: $599/month
- **Railway**: $20-50/month
- **Total**: $770+/month

---

## Troubleshooting

### "Database connection failed"

1. Check Supabase project status
2. Verify connection strings
3. Check firewall/network
4. Try direct connection (DIRECT_URL)

### "Prisma Client not generated"

```bash
npx prisma generate
```

### "Migration failed"

```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or push schema without migration
npx prisma db push --force-reset
```

### "Out of connections"

- Increase connection pool size in Supabase
- Use connection pooling (pgBouncer)
- Optimize queries to reduce connection time

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## Quick Start Commands

```bash
# 1. Verify database
node scripts/verify-database.js

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema
npx prisma db push

# 4. Seed data
npx prisma db seed

# 5. Start development
npm run dev

# 6. Build for production
npm run build

# 7. Test production build
npm start
```

---

**Ready to deploy? Follow the steps above and your Uruziga platform will be live!** 🚀
