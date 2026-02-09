# 🗄️ Database Setup Guide

**Date**: February 7, 2026  
**Status**: Database connection needed

---

## 🚨 Current Issue

The Neon database at `ep-royal-river-ahr5nk89-pooler.c-3.us-east-1.aws.neon.tech` is unreachable. This typically happens when:
- Database is paused (Neon auto-pauses inactive databases)
- Connection credentials expired
- Network connectivity issues

---

## 🔧 Solution Options

### Option 1: Reactivate Existing Neon Database (Recommended)

1. **Go to Neon Console**
   - Visit: https://console.neon.tech
   - Login with your account

2. **Find Your Project**
   - Look for project with database `neondb`
   - Check if it's paused

3. **Activate Database**
   - Click on the project
   - If paused, click "Resume" or "Activate"
   - Wait for database to start (~30 seconds)

4. **Get Connection String**
   - Go to "Connection Details"
   - Copy the "Connection string" (with pooler)
   - Should look like: `postgresql://user:password@host/database?sslmode=require`

5. **Update .env File**
   ```bash
   DATABASE_URL="your-new-connection-string"
   ```

6. **Test Connection**
   ```bash
   npx prisma db push
   ```

---

### Option 2: Create New Neon Database

1. **Go to Neon**
   - Visit: https://console.neon.tech
   - Login or create account (free tier available)

2. **Create New Project**
   - Click "New Project"
   - Name: `umwero-learning-platform`
   - Region: Choose closest to you
   - PostgreSQL version: 15 or 16

3. **Get Connection String**
   - After creation, copy the connection string
   - Use the "Pooled connection" string
   - Format: `postgresql://user:password@host/database?sslmode=require`

4. **Update .env File**
   ```bash
   DATABASE_URL="your-new-connection-string"
   ```

5. **Push Schema**
   ```bash
   npx prisma db push
   ```

6. **Seed Database**
   ```bash
   npm run prisma:seed
   ```

---

### Option 3: Use Supabase (Alternative)

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Login or create account (free tier available)

2. **Create New Project**
   - Click "New Project"
   - Name: `umwero-learning-platform`
   - Database password: Create strong password
   - Region: Choose closest to you

3. **Get Connection String**
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Copy "Connection pooling" string (Transaction mode)
   - Replace `[YOUR-PASSWORD]` with your password

4. **Update .env File**
   ```bash
   DATABASE_URL="your-supabase-connection-string"
   ```

5. **Push Schema**
   ```bash
   npx prisma db push
   ```

6. **Seed Database**
   ```bash
   npm run prisma:seed
   ```

---

### Option 4: Use Railway (Alternative)

1. **Go to Railway**
   - Visit: https://railway.app
   - Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"

3. **Get Connection String**
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy "Postgres Connection URL"

4. **Update .env File**
   ```bash
   DATABASE_URL="your-railway-connection-string"
   ```

5. **Push Schema**
   ```bash
   npx prisma db push
   ```

6. **Seed Database**
   ```bash
   npm run prisma:seed
   ```

---

## 📝 Complete Setup Commands

Once you have a working database connection:

### 1. Push Database Schema
```bash
# This creates all tables based on prisma/schema.prisma
npx prisma db push
```

Expected output:
```
✓ Generated Prisma Client
✓ Database synchronized with Prisma schema
```

### 2. Seed Database
```bash
# This populates the database with initial data
npm run prisma:seed
```

Expected output:
```
✓ Seeded admin user
✓ Seeded teacher user
✓ Seeded student user
✓ Seeded lessons
✓ Database seeded successfully
```

### 3. Verify Setup
```bash
# Open Prisma Studio to view data
npx prisma studio
```

This opens a browser at http://localhost:5555 where you can view all tables and data.

---

## 🔐 Seeded User Accounts

After seeding, these accounts will be available:

### Admin Account
```
Email: 37nzela@gmail.com
Password: Mugix260
Role: ADMIN
```

### Teacher Account
```
Email: teacher@uruziga.com
Password: teach123
Role: TEACHER
```

### Student Account
```
Email: demo@uruziga.com
Password: demo123
Role: USER
```

---

## 🗄️ Database Schema

The database includes these tables:

### Core Tables
- **User** - User accounts with authentication
- **Lesson** - Learning content and lessons
- **Progress** - User progress tracking
- **Drawing** - User drawings and submissions
- **Donation** - Donation records
- **Comment** - User comments
- **Discussion** - Discussion threads

### Relationships
- User → Progress (one-to-many)
- User → Drawing (one-to-many)
- User → Donation (one-to-many)
- User → Comment (one-to-many)
- User → Discussion (one-to-many)

---

## 🔧 Troubleshooting

### Error: Can't reach database server
**Solution**: Database is paused or credentials expired
- Reactivate database in provider console
- Get new connection string
- Update .env file

### Error: P3009 - Migration failed
**Solution**: Use `db push` instead of migrate
```bash
npx prisma db push --accept-data-loss
```

### Error: Unique constraint violation
**Solution**: Database already has data
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually delete conflicting records in Prisma Studio
npx prisma studio
```

### Error: SSL connection required
**Solution**: Add SSL parameters to connection string
```
?sslmode=require
```

### Error: Connection timeout
**Solution**: Check network/firewall
- Ensure you have internet connection
- Check if firewall blocks PostgreSQL port (5432)
- Try different network

---

## 📊 Database Providers Comparison

| Provider | Free Tier | Storage | Connections | Best For |
|----------|-----------|---------|-------------|----------|
| **Neon** | ✅ Yes | 3 GB | 100 | Development |
| **Supabase** | ✅ Yes | 500 MB | 60 | Full-stack apps |
| **Railway** | ✅ Yes | 1 GB | 100 | Quick setup |
| **Vercel Postgres** | ✅ Yes | 256 MB | 60 | Vercel deploys |

---

## 🚀 Quick Start (New Database)

If you need to set up a completely new database:

```bash
# 1. Create database on Neon/Supabase/Railway
# 2. Copy connection string
# 3. Update .env file

# 4. Install dependencies (if needed)
npm install

# 5. Generate Prisma Client
npx prisma generate

# 6. Push schema to database
npx prisma db push

# 7. Seed database
npm run prisma:seed

# 8. Verify in Prisma Studio
npx prisma studio

# 9. Test the application
npm run dev
```

---

## 📞 Support

If you continue to have database issues:

1. **Check Neon Console**: https://console.neon.tech
2. **Check Database Logs**: Look for error messages
3. **Verify Connection String**: Ensure it's correct in .env
4. **Test Connection**: Use a PostgreSQL client to test
5. **Create New Database**: If all else fails, create fresh database

---

## ✅ Success Checklist

- [ ] Database provider account created
- [ ] Database project created
- [ ] Connection string obtained
- [ ] .env file updated
- [ ] `npx prisma db push` successful
- [ ] `npm run prisma:seed` successful
- [ ] Prisma Studio shows data
- [ ] Can login with seeded accounts
- [ ] Application connects to database

---

**Status**: Waiting for database connection

**Next Steps**:
1. Reactivate or create database
2. Update DATABASE_URL in .env
3. Run `npx prisma db push`
4. Run `npm run prisma:seed`

---

*Once database is connected, the application will be fully functional!*
