# 🚀 Quick Start Guide - Umwero Learning Platform

## ⚠️ SECURITY FIRST!

**Before you start, ensure your secrets are safe:**

1. **Never commit `.env` file** - It's already in `.gitignore` ✅
2. **Use `.env.example`** - Copy it to `.env` and fill in your values
3. **Generate secure secrets:**
   ```bash
   # Generate JWT_SECRET
   openssl rand -base64 32
   ```
4. **Read SECURITY.md** for complete security guidelines

---

## ⚡ Get Started in 5 Minutes

### 1. Start the Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 🔐 Test Accounts

### Admin Account (Full Control)
```
URL: http://localhost:3000/login
Email: 37nzela@gmail.com
Password: Mugix260

Then go to: http://localhost:3000/admin
```

**What you can do:**
- ✅ Manage all users
- ✅ Change user roles (Student → Teacher → Admin)
- ✅ Delete user accounts
- ✅ View and manage all lessons
- ✅ Delete lessons
- ✅ View all donations and funds
- ✅ Full platform control

---

### Teacher Account (Create Lessons)
```
URL: http://localhost:3000/login
Email: teacher@uruziga.com
Password: teach123

Then go to: http://localhost:3000/teacher
```

**What you can do:**
- ✅ Create new lessons
- ✅ Edit your lessons
- ✅ View student progress
- ✅ Manage quizzes

---

### Student Account (Learn)
```
URL: http://localhost:3000/login
Email: demo@uruziga.com
Password: demo123

Then go to: http://localhost:3000/learn
```

**What you can do:**
- ✅ Take lessons
- ✅ Practice Umwero writing
- ✅ Track your progress
- ✅ Earn achievements
- ✅ View your dashboard

---

## 🎯 Quick Test Scenarios

### Test 1: Admin Changes User Role

1. Login as **Admin** (37nzela@gmail.com)
2. Go to `/admin`
3. Click "Users" tab
4. Find "Demo Student"
5. Change role from "USER" to "TEACHER"
6. Logout
7. Login as demo@uruziga.com
8. You should now see Teacher dashboard!

---

### Test 2: Teacher Creates Lesson

1. Login as **Teacher** (teacher@uruziga.com)
2. Go to `/teacher`
3. Click "Create Lesson" tab
4. Fill in the form:
   ```
   Title: Consonant: T
   Description: Learn the Umwero character for T
   Content: {"consonant": "t", "umwero": "T", "examples": []}
   Module: BEGINNER
   Type: CONSONANT
   Duration: 10
   Order: 7
   ```
5. Click "Create Lesson"
6. Check "My Lessons" tab - your new lesson should appear!

---

### Test 3: Student Takes Lesson

1. Login as **Student** (demo@uruziga.com)
2. Go to `/learn`
3. Click on "Vowel: A" lesson
4. Practice drawing the character
5. Complete the lesson
6. Go to `/dashboard` to see your progress

---

### Test 4: Language Switching

1. On any page, look for the language switcher in the header
2. Click and select:
   - 🇺🇸 English
   - 🇷🇼 Kinyarwanda
   - ⭕ Umwero (Kinyarwanda text in Umwero script)
3. Watch the entire interface change language!

---

## 📊 Database Management

### View Database in Prisma Studio

```bash
npm run prisma:studio
```

Opens at: **http://localhost:5555**

You can:
- View all tables
- Edit records directly
- See relationships
- Query data

---

### Reset Database (Fresh Start)

```bash
# This will delete all data and reseed
npm run prisma:push
npm run prisma:seed
```

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database commands
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:seed      # Seed database with initial data
npm run prisma:studio    # Open Prisma Studio
```

---

## 🎨 Project Structure

```
uru-ruziga/
├── app/
│   ├── admin/              # Admin dashboard
│   │   └── page.tsx
│   ├── teacher/            # Teacher dashboard
│   │   └── page.tsx
│   ├── api/                # API routes
│   │   ├── admin/          # Admin APIs
│   │   ├── auth/           # Authentication
│   │   └── lessons/        # Lesson management
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── CartContext.tsx
│   └── learn/              # Learning interface
├── components/             # Reusable components
│   ├── ui/                 # UI components
│   ├── lessons/            # Lesson components
│   └── LanguageSwitcher.tsx
├── hooks/                  # Custom hooks
│   └── useTranslation.ts   # Translation hook
├── lib/                    # Utilities
│   ├── permissions.ts      # Role-based permissions
│   ├── translations.ts     # Translation data
│   └── prisma.ts           # Prisma client
├── prisma/                 # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
└── public/                 # Static files
    └── Umwero.ttf          # Umwero font
```

---

## 🔍 Key Features to Test

### ✅ Authentication
- [x] Login with email/password
- [x] JWT token storage
- [x] Protected routes
- [x] Role-based access

### ✅ Admin Features
- [x] User management
- [x] Role assignment
- [x] Account deletion
- [x] Lesson management
- [x] Fund viewing

### ✅ Teacher Features
- [x] Lesson creation
- [x] Lesson editing
- [x] Student progress viewing

### ✅ Student Features
- [x] Lesson taking
- [x] Progress tracking
- [x] Achievement earning
- [x] Canvas drawing practice

### ✅ Multi-Language
- [x] English interface
- [x] Kinyarwanda interface
- [x] Umwero script rendering
- [x] Dynamic translation

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Check your .env file has correct DATABASE_URL
# Verify Neon database is active
npm run prisma:push
```

### Issue: "User not found" when logging in
**Solution:**
```bash
# Reseed the database
npm run prisma:seed
```

### Issue: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
PORT=3001 npm run dev
```

---

## 📱 Mobile Testing

Test on mobile devices:

1. Find your local IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. Access from mobile:
   ```
   http://YOUR_IP:3000
   ```

---

## 🎓 Learning Resources

### Umwero Alphabet
- 5 Vowels: a("), e(|), i(}), o({), u(:)
- Consonants: M, N, B, K, T, etc.
- Special characters for compound sounds

### Database Schema
- **User**: Authentication and profile
- **Lesson**: Learning content
- **LessonProgress**: Student progress
- **Achievement**: Gamification
- **Donation**: Fund tracking

---

## 🚀 Ready to Deploy?

See **DEPLOYMENT_GUIDE.md** for full deployment instructions!

---

## 💡 Tips

1. **Use Prisma Studio** to inspect database while developing
2. **Check browser console** for any JavaScript errors
3. **Use React DevTools** to debug component state
4. **Test with all three roles** to ensure permissions work
5. **Try language switching** on every page

---

## 🎉 You're All Set!

Start building amazing features for the Umwero Learning Platform!

**Questions?** Check the main README.md or DEPLOYMENT_GUIDE.md

---

*Happy Coding! 🚀*
