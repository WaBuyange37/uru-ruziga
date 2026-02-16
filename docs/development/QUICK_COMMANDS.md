# ⚡ Quick Commands Reference

## Development Commands

### Start Development Server
```bash
npm run dev
```
Opens at: http://localhost:3000

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

---

## Database Commands

### Generate Prisma Client
```bash
npm run prisma:generate
# or
npx prisma generate
```

### Push Schema to Database
```bash
npm run prisma:push
# or
npx prisma db push
```

### Run Migrations
```bash
npx prisma migrate deploy
```

### Seed Database
```bash
npm run prisma:seed
# or
npx prisma db seed
```

### Open Prisma Studio
```bash
npm run prisma:studio
# or
npx prisma studio
```

---

## Deployment Commands

### Netlify
```bash
# Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# Then connect on netlify.com
```

### Vercel
```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Railway
```bash
# Push to GitHub
git push origin main

# Then connect on railway.app
```

---

## Git Commands

### Check Status
```bash
git status
```

### Add All Changes
```bash
git add .
```

### Commit Changes
```bash
git commit -m "Your message here"
```

### Push to GitHub
```bash
git push origin main
```

### Pull Latest Changes
```bash
git pull origin main
```

### Create New Branch
```bash
git checkout -b feature-name
```

### Switch Branch
```bash
git checkout main
```

---

## Testing Commands

### Test Build
```bash
npm run build
```

### Check for Errors
```bash
npm run lint
```

### Test Database Connection
```bash
npx prisma db push
```

---

## Environment Setup

### Copy Environment Variables
```bash
cp .env.example .env
```

### Edit Environment Variables
```bash
nano .env
# or
vim .env
```

### Required Variables
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
```

---

## Useful Commands

### Install Dependencies
```bash
npm install
```

### Update Dependencies
```bash
npm update
```

### Clean Build
```bash
rm -rf .next
npm run build
```

### Check Node Version
```bash
node --version
```

### Check npm Version
```bash
npm --version
```

---

## Production Checklist

### Before Deployment
```bash
# 1. Build
npm run build

# 2. Check for errors
npm run lint

# 3. Test database
npx prisma db push

# 4. Commit changes
git add .
git commit -m "Production ready"
git push origin main
```

### After Deployment
```bash
# 1. Run migrations
npx prisma migrate deploy

# 2. Seed database
npx prisma db seed

# 3. Verify deployment
# Visit your site URL
```

---

## Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues
```bash
# Reset database
npx prisma migrate reset

# Push schema
npx prisma db push

# Seed data
npx prisma db seed
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## Quick Links

- **Local Dev**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555
- **Netlify**: https://app.netlify.com
- **Vercel**: https://vercel.com
- **Railway**: https://railway.app

---

## Seeded Accounts

### Admin
```
Email: 37nzela@gmail.com
Password: Mugix260
```

### Teacher
```
Email: teacher@uruziga.com
Password: teach123
```

### Student
```
Email: demo@uruziga.com
Password: demo123
```

---

## Support

**Email**: 37nzela@gmail.com  
**Phone**: +250 786 375 052  
**Location**: Kigali, Rwanda

---

*Quick reference for common commands*
