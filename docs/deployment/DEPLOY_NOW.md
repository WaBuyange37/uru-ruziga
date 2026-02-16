# 🚀 DEPLOY URUZIGA NOW - QUICK START

**Time to Deploy**: 30 minutes  
**Difficulty**: Easy  
**Prerequisites**: Vercel account, Neon database

---

## ⚡ FASTEST PATH TO PRODUCTION

### **Step 1: Environment Setup** (5 min)

Create `.env.local` file:

```bash
# Required
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
JWT_SECRET="generate-with-openssl-rand-base64-32"
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
NODE_ENV="production"

# Optional (for email)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@uruziga.com"
```

**Generate JWT Secret**:
```bash
openssl rand -base64 32
```

---

### **Step 2: Database Setup** (10 min)

```bash
# 1. Push schema to database
npx prisma db push

# 2. Seed initial data
npm run prisma:seed

# 3. Verify (opens Prisma Studio)
npx prisma studio
```

**Expected Result**:
- 3 users created (admin, teacher, student)
- 5 vowel lessons
- 1 consonant lesson
- 4 achievements

---

### **Step 3: Deploy to Vercel** (10 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add BLOB_READ_WRITE_TOKEN
```

**Or use Vercel Dashboard**:
1. Go to vercel.com
2. Import Git repository
3. Add environment variables
4. Deploy

---

### **Step 4: Configure Domain** (5 min)

**In Vercel Dashboard**:
1. Go to Project Settings → Domains
2. Add your domain (e.g., uruziga.com)
3. Update DNS records:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`

**Wait 5-10 minutes for DNS propagation**

---

### **Step 5: Test Critical Flows** (5 min)

```bash
# Test homepage
curl https://your-domain.com

# Test API
curl https://your-domain.com/api/lessons

# Test authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@uruziga.com","password":"demo123"}'
```

**Manual Testing**:
1. ✅ Visit homepage
2. ✅ Register new account
3. ✅ Verify email (check inbox)
4. ✅ Login
5. ✅ View lessons
6. ✅ Create community post
7. ✅ Use Umwero chat
8. ✅ Generate image

---

## 🎯 DEFAULT ACCOUNTS

### **Admin Account**
```
Email: kwizera@uruziga.com
Password: admin123
Role: ADMIN
```

### **Teacher Account**
```
Email: teacher@uruziga.com
Password: teacher123
Role: TEACHER
```

### **Student Account**
```
Email: demo@uruziga.com
Password: demo123
Role: USER
```

**⚠️ CHANGE THESE PASSWORDS IMMEDIATELY AFTER DEPLOYMENT**

---

## 📊 POST-DEPLOYMENT CHECKLIST

### **Immediate (First Hour)**
- [ ] Change default passwords
- [ ] Test all critical flows
- [ ] Verify email delivery
- [ ] Check error logs in Vercel
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificate

### **First Day**
- [ ] Create real teacher accounts
- [ ] Upload additional lessons
- [ ] Seed community with posts
- [ ] Setup monitoring (Sentry)
- [ ] Configure analytics
- [ ] Test payment flow

### **First Week**
- [ ] Invite beta users
- [ ] Monitor performance
- [ ] Fix reported bugs
- [ ] Gather feedback
- [ ] Iterate on UX
- [ ] Plan marketing launch

---

## 🔧 TROUBLESHOOTING

### **Database Connection Failed**
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:pass@host/db?sslmode=require

# Test connection
npx prisma db pull
```

### **JWT Secret Error**
```bash
# Generate new secret
openssl rand -base64 32

# Add to .env.local and Vercel
```

### **File Upload Fails**
```bash
# Check BLOB_READ_WRITE_TOKEN
# Get from: vercel.com/dashboard/stores

# Test upload
curl -X POST https://your-domain.com/api/lessons/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.mp4" \
  -F "type=video"
```

### **Email Not Sending**
```bash
# Check SMTP credentials
# For Gmail: Enable "App Passwords"
# Settings → Security → 2-Step Verification → App Passwords

# Test email
node -e "require('./lib/email').sendVerificationEmail('test@test.com', '123456', 'Test')"
```

---

## 📞 EMERGENCY CONTACTS

### **Platform Issues**
- Vercel Status: status.vercel.com
- Neon Status: status.neon.tech

### **Support**
- Technical: tech@uruziga.com
- General: support@uruziga.com

---

## 🎉 YOU'RE LIVE!

Once deployed, your platform is accessible at:
- **Production**: https://your-domain.com
- **Admin**: https://your-domain.com/admin
- **Teacher**: https://your-domain.com/teacher
- **API**: https://your-domain.com/api

### **Share the News**
```
🎉 Uruziga is LIVE! 🎉

Learn the Umwero alphabet and preserve Kinyarwanda culture.

🌐 Visit: https://your-domain.com
📚 Free lessons for all
🌍 Join our community

#Umwero #Kinyarwanda #Rwanda #CulturalPreservation
```

---

## 📈 MONITORING

### **Vercel Dashboard**
- Analytics: vercel.com/dashboard/analytics
- Logs: vercel.com/dashboard/logs
- Deployments: vercel.com/dashboard/deployments

### **Database**
- Neon Console: console.neon.tech
- Prisma Studio: `npx prisma studio`

### **Key Metrics to Watch**
- Response time (target: < 500ms)
- Error rate (target: < 0.1%)
- User registrations
- Lesson completions
- Community posts

---

## 🚀 NEXT STEPS

1. **Content**: Upload remaining lessons
2. **Marketing**: Launch social media campaign
3. **Partnerships**: Reach out to schools
4. **Funding**: Apply for grants
5. **Community**: Engage with users

---

**Deployment Time**: ~30 minutes  
**Status**: PRODUCTION-READY ✅  
**Confidence**: 100%

**"The journey of a thousand miles begins with a single step."**  
— Your step is deploying Uruziga TODAY.

---

**Last Updated**: February 9, 2026  
**Version**: 1.0  
**Ready**: YES ✅
