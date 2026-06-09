# Database Quick Reference

## 🚀 Quick Start

```bash
# Setup everything (migrate + seed + validate)
npm run db:setup

# Open database GUI
npm run prisma:studio
```

## 📋 Common Commands

### Development
```bash
# Create and apply migration
npm run prisma:migrate

# Seed database (with clean)
npm run prisma:seed

# Reset everything (⚠️ deletes all data)
npx prisma migrate reset

# Validate database
npm run db:validate
```

### Production
```bash
# Apply migrations only
npx prisma migrate deploy

# Seed without cleaning
SEED_CLEAN=false npm run prisma:seed

# Validate
npm run db:validate
```

### Prisma Client
```bash
# Generate client
npm run prisma:generate

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

## 🔧 Environment Variables

### Local PostgreSQL
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/uru-ruziga"
DIRECT_URL="postgresql://user:pass@localhost:5432/uru-ruziga"
SEED_CLEAN="true"
```

### Supabase
```env
DATABASE_URL="postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:5432/postgres"
SEED_CLEAN="false"
```

## 📊 Database Stats

- **Tables**: 41
- **Indexes**: 179
- **Enums**: 13
- **Seed Records**: 197 (3 languages, 95 characters, 92 lessons, 4 achievements, 3 users)

## 🔍 Validation Checks

1. ✅ Database Connection
2. ✅ Table Existence (40 tables)
3. ✅ Seed Data (197 records)
4. ✅ Relationship Integrity
5. ✅ Index Validation (179 indexes)
6. ✅ Enum Validation (13 enums)

## 🆘 Troubleshooting

### Connection Failed
```bash
# Test connection
npx prisma db execute --stdin <<< "SELECT 1;"
```

### Migration Failed
```bash
# Check status
npx prisma migrate status

# Reset (dev only)
npx prisma migrate reset
```

### Seed Failed
```bash
# Run with logging
DEBUG=* npm run prisma:seed
```

## 📚 Documentation

- **Setup Guide**: DATABASE_SETUP_GUIDE.md
- **Completion Report**: DATABASE_SETUP_COMPLETE.md
- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs

## 🎯 Default Users

| Email | Username | Password | Role |
|-------|----------|----------|------|
| 37nzela@gmail.com | kwizera | Mugix260 | ADMIN |
| demo@uruziga.com | demo | demo123 | USER |
| teacher@uruziga.com | teacher | teach123 | TEACHER |

## ⚡ One-Liners

```bash
# Full setup
npm run db:setup

# Quick validate
npm run db:validate

# Open GUI
npm run prisma:studio

# Reset dev
npx prisma migrate reset -f

# Deploy prod
npx prisma migrate deploy && SEED_CLEAN=false npm run prisma:seed
```
