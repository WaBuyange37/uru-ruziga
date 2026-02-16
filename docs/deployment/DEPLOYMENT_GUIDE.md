# 🚀 Umwero Learning Platform - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ What's Ready
- [x] Database schema pushed to Neon PostgreSQL
- [x] Database seeded with initial data (5 vowel lessons, 1 consonant lesson, 6 achievements, 3 users)
- [x] Role-based permission system implemented
- [x] Admin dashboard with full control
- [x] Teacher dashboard for lesson creation
- [x] Student dashboard for learning
- [x] Multi-language support (English, Kinyarwanda, Umwero)
- [x] Authentication system with JWT
- [x] API routes for admin and teacher functions

### 🔐 Login Credentials

**Admin Account (Full Control):**
```
Email: 37nzela@gmail.com
Password: Mugix260
Role: ADMIN
```

**Teacher Account (Create Lessons):**
```
Email: teacher@uruziga.com
Password: teach123
Role: TEACHER
```

**Student Account (Learn):**
```
Email: demo@uruziga.com
Password: demo123
Role: USER
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended) ⭐

**Why Vercel?**
- Built specifically for Next.js
- Automatic deployments from Git
- Free SSL certificates
- Edge functions support
- Excellent performance

**Steps:**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Umwero Learning Platform"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set Environment Variables in Vercel**
   ```
   DATABASE_URL=your_neon_production_database_url
   JWT_SECRET=your_secure_jwt_secret_here
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live!

---

### Option 2: Railway

**Steps:**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set DATABASE_URL="your_database_url"
   railway variables set JWT_SECRET="your_jwt_secret"
   ```

---

### Option 3: Render

**Steps:**

1. **Create New Web Service**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure Build Settings**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Add Environment Variables**
   - Add all variables from `.env`

---

## 🔧 Environment Variables Setup

### Required Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_Tv3WzJxym7gO@ep-royal-river-ahr5nk89-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Authentication
JWT_SECRET="mQDtnOcbkEuOtBouri1n8tO3zkivr9xaRgZ258D2d6k="
NEXTAUTH_SECRET="generate_a_new_secure_secret_here"
NEXTAUTH_URL="https://your-domain.com"

# Optional: Email Service (for password reset)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASSWORD="your-app-password"

# Optional: File Storage (for user uploads)
# NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
# NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_key"
```

### Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗄️ Database Setup

### Production Database

**Option 1: Use Current Neon Database**
- Your current Neon database is already set up
- Already seeded with initial data
- Ready for production

**Option 2: Create Separate Production Database**
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in environment variables
5. Run migrations:
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```

---

## 🎨 Custom Domain Setup

### Vercel Custom Domain

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `umwero.com`)
4. Update DNS records as instructed:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 📊 Post-Deployment Checklist

### Immediate Actions

- [ ] Test login with all three accounts (Admin, Teacher, Student)
- [ ] Verify admin can manage users
- [ ] Verify teacher can create lessons
- [ ] Verify student can take lessons
- [ ] Test language switcher (English, Kinyarwanda, Umwero)
- [ ] Check mobile responsiveness
- [ ] Test all API endpoints

### Security

- [ ] Change default admin password
- [ ] Generate new JWT_SECRET for production
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up rate limiting (optional)
- [ ] Configure CORS if needed

### Monitoring

- [ ] Set up error tracking (Sentry recommended)
- [ ] Enable Vercel Analytics
- [ ] Set up uptime monitoring
- [ ] Configure database backups

---

## 🔍 Testing the Deployment

### 1. Test Authentication
```bash
# Login as Admin
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"37nzela@gmail.com","password":"Mugix260"}'
```

### 2. Test Admin Functions
- Login as admin
- Go to `/admin`
- Try changing a user's role
- Try viewing donations

### 3. Test Teacher Functions
- Login as teacher
- Go to `/teacher`
- Try creating a new lesson

### 4. Test Student Functions
- Login as student
- Go to `/learn`
- Try taking a lesson

---

## 🐛 Troubleshooting

### Build Errors

**Error: "Module not found"**
```bash
npm install
npm run build
```

**Error: "Database connection failed"**
- Check `DATABASE_URL` is correct
- Verify Neon database is active
- Check IP whitelist in Neon dashboard

### Runtime Errors

**Error: "Unauthorized"**
- Check JWT_SECRET is set
- Verify token is being sent in headers
- Clear browser cookies and login again

**Error: "Cannot read properties of undefined"**
- Check all environment variables are set
- Verify database is seeded
- Check API routes are deployed

---

## 📈 Performance Optimization

### Image Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### Caching
```javascript
// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600 // Revalidate every hour
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

With Vercel, every push to `main` branch automatically deploys:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys!
```

### Preview Deployments

Every pull request gets a preview URL:
```
https://umwero-pr-123.vercel.app
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check error logs
- Review user feedback
- Monitor database size

**Monthly:**
- Update dependencies: `npm update`
- Review and optimize database queries
- Check security updates

**Quarterly:**
- Database backup verification
- Performance audit
- Security audit

---

## 🎯 Next Features to Add

### High Priority
1. **Email Notifications**
   - Welcome emails
   - Password reset
   - Achievement notifications

2. **Payment Integration**
   - Stripe for donations
   - MTN Mobile Money for Rwanda

3. **Advanced Analytics**
   - Student progress tracking
   - Lesson completion rates
   - User engagement metrics

### Medium Priority
4. **Social Features**
   - Discussion forums
   - Student leaderboards
   - Share achievements

5. **Content Management**
   - Rich text editor for lessons
   - Image upload for lessons
   - Video embedding

### Future Enhancements
6. **Mobile App**
   - React Native version
   - Offline mode
   - Push notifications

7. **AI Features**
   - Handwriting recognition
   - Personalized learning paths
   - Chatbot tutor

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon PostgreSQL](https://neon.tech/docs)

---

## ✨ Congratulations!

Your Umwero Learning Platform is ready for the world! 🎉

**Live URL:** `https://your-domain.vercel.app`

**Admin Panel:** `https://your-domain.vercel.app/admin`

**Teacher Panel:** `https://your-domain.vercel.app/teacher`

---

*Built with ❤️ for preserving Kinyarwanda culture through the Umwero alphabet*

**Creator:** Kwizera Mugisha
**Platform:** Umwero Learning Platform
**Mission:** Decolonize and preserve African languages
