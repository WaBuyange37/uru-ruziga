# Security Guide - Umwero Learning Platform

## 🔒 Environment Variables Security

### **CRITICAL: Never Commit Secrets to Git!**

Your `.env` file contains sensitive credentials and should **NEVER** be committed to version control.

### ✅ What's Protected

The `.gitignore` file already includes `.env*` to prevent accidental commits:
```
.env*
```

### 🔑 Required Environment Variables

1. **DATABASE_URL** - PostgreSQL connection string (Neon)
   - Get from: https://console.neon.tech/
   - Format: `postgresql://username:password@host/database?sslmode=require`

2. **JWT_SECRET** - Secret key for JWT token generation
   - Generate with: `openssl rand -base64 32`
   - Must be at least 32 characters long

### 📝 Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual values:**
   - Never use the example values in production
   - Generate new secrets for each environment

3. **Generate a secure JWT secret:**
   ```bash
   openssl rand -base64 32
   ```

### 🚨 If Secrets Were Leaked

If you accidentally committed secrets to git:

1. **Immediately rotate all credentials:**
   - Generate new JWT_SECRET
   - Create new database credentials in Neon
   - Update all API keys

2. **Remove from git history:**
   ```bash
   # Remove .env from git history (if accidentally committed)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: This rewrites history)
   git push origin --force --all
   ```

3. **Verify .gitignore:**
   ```bash
   git check-ignore .env
   # Should output: .env
   ```

### 🔐 Production Deployment

**For Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable individually
3. Never paste the entire .env file

**For Railway/Render:**
1. Use the dashboard to add environment variables
2. Enable "Secret" option for sensitive values

### 📋 Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has no real secrets
- [ ] JWT_SECRET is at least 32 characters
- [ ] Database credentials are unique per environment
- [ ] Production secrets are different from development
- [ ] Secrets are stored in deployment platform (not in code)
- [ ] Team members have their own local `.env` files

### 🛡️ Best Practices

1. **Never share .env files** via email, Slack, or messaging apps
2. **Use environment-specific secrets** (dev, staging, production)
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Use secret management tools** for team environments (1Password, AWS Secrets Manager)
5. **Monitor for leaked secrets** using tools like GitGuardian or GitHub Secret Scanning

### 🔍 Verify Your Setup

Run this command to ensure .env is not tracked:
```bash
git ls-files | grep .env
```
If it returns nothing, you're safe! ✅

### 📞 Need Help?

If you suspect a security issue:
1. Rotate all credentials immediately
2. Check git history for leaked secrets
3. Update deployment environment variables
4. Contact your team lead or security officer

---

**Remember:** Security is everyone's responsibility! 🛡️
