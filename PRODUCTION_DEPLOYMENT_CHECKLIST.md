# Production Deployment Checklist

Complete this checklist before deploying Uruziga to production and purchasing a domain.

---

## ✅ Phase 1: Database Setup

### 1.1 Supabase Project
- [ ] Supabase project is active (not paused)
- [ ] Database connection strings are current
- [ ] `.env` file has correct `DATABASE_URL` and `DIRECT_URL`
- [ ] Connection test passes: `node scripts/verify-database.js`

### 1.2 Schema & Data
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Schema pushed to database: `npx prisma db push`
- [ ] All tables created (verify with script)
- [ ] Initial data seeded: `npx prisma db seed`
- [ ] Test user created for testing

### 1.3 Database Performance
- [ ] Indexes created on all foreign keys
- [ ] Connection pooling enabled (pgBouncer)
- [ ] Query performance tested
- [ ] Backup strategy configured

**Verification Command**:
```bash
bash scripts/fix-database.sh
```

---

## ✅ Phase 2: Environment Configuration

### 2.1 Required Environment Variables
- [ ] `DATABASE_URL` - Supabase pooler connection
- [ ] `DIRECT_URL` - Supabase direct connection
- [ ] `JWT_SECRET` - Strong random string (32+ chars)
- [ ] `NEXTAUTH_SECRET` - Strong random string
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `OPENAI_API_KEY` - For AI evaluation (optional)
- [ ] `PYTHON_AI_SERVICE_URL` - Python service URL

### 2.2 Generate Secrets
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2.3 Security
- [ ] `.env` file in `.gitignore`
- [ ] No secrets committed to git
- [ ] Production `.env` stored securely (password manager)
- [ ] Different secrets for dev/staging/production

---

## ✅ Phase 3: Application Build

### 3.1 Code Quality
- [ ] All TypeScript errors fixed: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] No console.errors in production code
- [ ] All TODO comments addressed

### 3.2 Build Test
- [ ] Development build works: `npm run dev`
- [ ] Production build succeeds: `npm run build`
- [ ] Production server starts: `npm start`
- [ ] No build warnings or errors

### 3.3 Feature Testing
- [ ] User registration works
- [ ] User login works
- [ ] Character learning flow works
- [ ] Canvas drawing works
- [ ] AI evaluation works (if Python service running)
- [ ] Progress tracking works
- [ ] Community features work

**Test Commands**:
```bash
npm run build
npm start
# Then test in browser at http://localhost:3000
```

---

## ✅ Phase 4: Python AI Service

### 4.1 Service Setup
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Service starts: `python main.py`
- [ ] Health check passes: `curl http://localhost:8000/health`
- [ ] All tests pass: `python test_implementation.py`

### 4.2 Deployment
- [ ] Service deployed to Railway/Render/Fly.io
- [ ] Service URL added to Next.js `.env`
- [ ] CORS configured for your domain
- [ ] Health endpoint accessible
- [ ] Evaluation endpoint tested

### 4.3 Font & Assets
- [ ] Umwero font file added to `fonts/` directory
- [ ] Font path configured in `.env`
- [ ] Reference images generated
- [ ] Cache service configured (Redis optional)

---

## ✅ Phase 5: Hosting Platform

### 5.1 Choose Platform
- [ ] Platform selected (Vercel/Netlify/Railway/DigitalOcean)
- [ ] Account created
- [ ] Payment method added (if needed)

### 5.2 Vercel Deployment (Recommended)
- [ ] GitHub repository connected
- [ ] Project imported in Vercel
- [ ] Environment variables added
- [ ] Build settings configured:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
- [ ] First deployment successful

### 5.3 Alternative: Netlify
- [ ] Repository connected
- [ ] Build settings:
  - Build Command: `npm run build`
  - Publish Directory: `.next`
- [ ] Environment variables added
- [ ] Deployment successful

---

## ✅ Phase 6: Domain Configuration

### 6.1 Domain Purchase
- [ ] Domain name decided (e.g., uruziga.com)
- [ ] Domain purchased from registrar
- [ ] Domain ownership verified

### 6.2 DNS Configuration
- [ ] DNS records added:
  ```
  Type    Name    Value
  A       @       [Vercel-IP]
  CNAME   www     cname.vercel-dns.com
  ```
- [ ] Or Vercel nameservers configured
- [ ] DNS propagation complete (check: https://dnschecker.org)

### 6.3 SSL Certificate
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] SSL certificate valid
- [ ] HTTP redirects to HTTPS
- [ ] www redirects to non-www (or vice versa)

### 6.4 Update Environment
- [ ] `NEXTAUTH_URL` updated to production domain
- [ ] CORS origins updated
- [ ] Supabase allowed origins updated
- [ ] Redeploy with new environment variables

---

## ✅ Phase 7: Production Testing

### 7.1 Functionality Tests
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Email verification works (if enabled)
- [ ] User login works
- [ ] Dashboard loads
- [ ] Character learning works
- [ ] Canvas drawing works
- [ ] AI evaluation works
- [ ] Progress saves correctly
- [ ] Community features work

### 7.2 Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Lighthouse score > 80
- [ ] Mobile performance acceptable
- [ ] Database queries optimized

### 7.3 Security Tests
- [ ] HTTPS working
- [ ] No exposed secrets in client code
- [ ] API routes protected
- [ ] SQL injection prevented (Prisma handles this)
- [ ] XSS prevention in place
- [ ] CSRF protection enabled

### 7.4 Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## ✅ Phase 8: Monitoring & Analytics

### 8.1 Error Tracking
- [ ] Vercel Analytics enabled
- [ ] Error logging configured
- [ ] Sentry integrated (optional)

### 8.2 Performance Monitoring
- [ ] Vercel Speed Insights enabled
- [ ] Database performance monitored
- [ ] API response times tracked

### 8.3 User Analytics
- [ ] Google Analytics added (optional)
- [ ] User behavior tracking
- [ ] Conversion tracking

---

## ✅ Phase 9: Backup & Recovery

### 9.1 Database Backups
- [ ] Supabase automatic backups enabled
- [ ] Manual backup tested
- [ ] Backup restoration tested
- [ ] Backup schedule documented

### 9.2 Code Backups
- [ ] Code in GitHub
- [ ] Multiple branches (main, develop, staging)
- [ ] Tagged releases
- [ ] Deployment history in Vercel

### 9.3 Recovery Plan
- [ ] Rollback procedure documented
- [ ] Database restore procedure documented
- [ ] Emergency contacts listed
- [ ] Incident response plan created

---

## ✅ Phase 10: Documentation

### 10.1 User Documentation
- [ ] User guide created
- [ ] FAQ page created
- [ ] Tutorial videos (optional)
- [ ] Help/Support page

### 10.2 Technical Documentation
- [ ] API documentation
- [ ] Database schema documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created

### 10.3 Legal
- [ ] Privacy Policy created
- [ ] Terms of Service created
- [ ] Cookie Policy (if using cookies)
- [ ] GDPR compliance (if EU users)

---

## ✅ Phase 11: Launch Preparation

### 11.1 Pre-Launch
- [ ] All checklist items completed
- [ ] Final testing on production
- [ ] Team notified of launch
- [ ] Support channels ready

### 11.2 Launch Day
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Monitor user feedback
- [ ] Be ready for quick fixes

### 11.3 Post-Launch
- [ ] Announce launch (social media, email)
- [ ] Monitor for 24-48 hours
- [ ] Collect user feedback
- [ ] Plan first updates

---

## Quick Commands Reference

```bash
# Database
node scripts/verify-database.js
bash scripts/fix-database.sh
npx prisma generate
npx prisma db push
npx prisma db seed

# Build & Test
npm run build
npm start
npm run type-check
npm run lint

# Python Service
cd python-ai-service
python test_implementation.py
python main.py

# Deployment
git push origin main  # Triggers Vercel deployment
vercel --prod  # Manual Vercel deployment
```

---

## Estimated Timeline

- **Phase 1-3**: 2-4 hours (Database & Build)
- **Phase 4**: 1-2 hours (Python Service)
- **Phase 5-6**: 1-2 hours (Hosting & Domain)
- **Phase 7-8**: 2-3 hours (Testing & Monitoring)
- **Phase 9-11**: 2-4 hours (Backup, Docs, Launch)

**Total**: 8-15 hours for complete production deployment

---

## Cost Summary

### Minimal (Free Tier)
- Domain: $12/year
- Vercel: Free
- Supabase: Free
- **Total**: $12/year

### Recommended (Production)
- Domain: $12/year
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Railway (Python): $10/month
- **Total**: $55/month + $12/year = ~$672/year

---

## Support & Help

If you encounter issues:

1. Check `DATABASE_PRODUCTION_SETUP.md`
2. Run `bash scripts/fix-database.sh`
3. Check Vercel deployment logs
4. Check Supabase dashboard
5. Review error logs in production

---

**Ready to deploy? Start with Phase 1 and work through each phase systematically.** 🚀

**Good luck with your launch!** 🎉
