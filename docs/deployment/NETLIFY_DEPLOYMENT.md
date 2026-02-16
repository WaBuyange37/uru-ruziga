# Netlify Deployment Guide

## Quick Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "UI modernization complete - production ready"
git push origin main
```

### 2. Connect to Netlify
1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 18.x

### 3. Set Environment Variables
In Netlify Dashboard → Site settings → Environment variables, add:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=8e821af423110b56792260ac9a249083b9d004bab54613a22fc14f567c5c9bf9
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

**Important**: 
- Use your actual Neon/PostgreSQL database URL
- Keep JWT_SECRET secure (use the one from your .env file)
- ANTHROPIC_API_KEY is optional (only needed for AI drawing comparison)

### 4. Deploy
Click "Deploy site" and wait for build to complete (~2-3 minutes)

### 5. Setup Database
After first deployment, run migrations:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Run database migrations
netlify env:import .env
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

### 6. Verify Deployment
1. Visit your Netlify URL
2. Test login with seeded accounts:
   - Admin: `37nzela@gmail.com` / `Mugix260`
   - Teacher: `teacher@uruziga.com` / `teach123`
   - Student: `demo@uruziga.com` / `demo123`
3. Check mobile responsiveness
4. Test all major features

---

## Troubleshooting

### Build Fails
**Issue**: Build fails with "JWT_SECRET not set"  
**Solution**: Ensure environment variables are set in Netlify dashboard

**Issue**: Database connection fails  
**Solution**: Check DATABASE_URL is correct and database is accessible

### Runtime Errors
**Issue**: 500 errors on API routes  
**Solution**: Check Netlify function logs in dashboard

**Issue**: Login doesn't work  
**Solution**: Verify JWT_SECRET is set and database is seeded

### Mobile Issues
**Issue**: Horizontal scrolling on mobile  
**Solution**: Clear browser cache and test in incognito mode

---

## Custom Domain (Optional)

### Add Custom Domain
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `umwero.com`)
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

### DNS Configuration
Add these records to your domain provider:

```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site.netlify.app
```

---

## Performance Optimization

### Enable Features in Netlify
1. **Asset Optimization**: Auto-minify CSS, JS, images
2. **Prerendering**: Enable for better SEO
3. **Edge Functions**: For faster API responses
4. **Analytics**: Track visitor behavior

### Caching
Netlify automatically caches:
- Static assets (images, fonts, CSS, JS)
- API responses (with proper headers)
- Build artifacts

---

## Monitoring

### Check Site Health
- **Build logs**: Netlify dashboard → Deploys
- **Function logs**: Netlify dashboard → Functions
- **Analytics**: Netlify dashboard → Analytics
- **Performance**: Use Lighthouse or PageSpeed Insights

### Set Up Alerts
1. Go to Site settings → Notifications
2. Add email notifications for:
   - Deploy failures
   - Form submissions
   - Function errors

---

## Continuous Deployment

### Automatic Deploys
Netlify automatically deploys when you push to GitHub:
- **Main branch**: Production deployment
- **Other branches**: Preview deployments

### Deploy Previews
Every pull request gets a unique preview URL for testing

### Rollback
If something goes wrong:
1. Go to Deploys
2. Find previous working deploy
3. Click "Publish deploy"

---

## Security

### HTTPS
- Automatically enabled by Netlify
- Free SSL certificate
- Auto-renewal

### Environment Variables
- Never commit .env to Git
- Use Netlify dashboard to manage secrets
- Different values for production/preview

### Headers
Add security headers in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## Cost Estimate

### Netlify Free Tier
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ HTTPS included
- ✅ Deploy previews

### Neon Database Free Tier
- ✅ 0.5 GB storage
- ✅ 1 project
- ✅ Unlimited queries
- ✅ Auto-suspend after inactivity

**Total Cost**: $0/month for small to medium traffic

---

## Support

### Resources
- [Netlify Docs](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

### Community
- [Netlify Community](https://answers.netlify.com)
- [Next.js Discord](https://nextjs.org/discord)
- [Prisma Discord](https://pris.ly/discord)

---

## Checklist

Before going live:
- [ ] Environment variables set
- [ ] Database migrated and seeded
- [ ] Login functionality tested
- [ ] Mobile responsiveness verified
- [ ] All pages load correctly
- [ ] API routes working
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Analytics set up (optional)
- [ ] Monitoring configured

---

**Deployment Status**: Ready for Production 🚀
