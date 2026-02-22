# Global Feed Testing & Troubleshooting Guide

## ✅ Fix Applied

### Issue Identified
The POST endpoint for creating posts was not returning the `likes` and `comments` relations that the frontend components expect, causing the UI to break when trying to access these properties.

### Solution
Updated `/api/community/posts` POST endpoint to include:
- `likes` array with `userId` selection
- `comments` array (first 3) with user details
- Consistent with GET endpoint structure

---

## 🧪 Testing Checklist

### 1. Authentication Test
```bash
# Ensure you're logged in
# Check browser localStorage for 'token'
localStorage.getItem('token')
```

**Expected:** Should return a JWT token string

---

### 2. Create Post Test

#### Test A: Text-Only Post
1. Navigate to homepage (/)
2. Type content in "What's on your mind?" textarea
3. Click "Post" button

**Expected:**
- Post appears immediately at top of feed
- Shows your name and avatar
- Shows "just now" timestamp
- Like button shows "0"
- Comment button shows "0"
- No errors in console

#### Test B: Post with Image
1. Click "Photo" button
2. Select an image (< 5MB)
3. See image preview
4. Add text content
5. Click "Post"

**Expected:**
- Post appears with image
- Image is properly sized and responsive
- Can remove image before posting with X button

---

### 3. Like Functionality Test

#### Test A: Like a Post
1. Click the heart icon on any post
2. Observe immediate UI update

**Expected:**
- Heart turns red and fills
- Count increments by 1
- No page reload
- No console errors

#### Test B: Unlike a Post
1. Click the heart icon again on a liked post

**Expected:**
- Heart becomes outline (unfilled)
- Count decrements by 1
- Smooth transition

#### Test C: Multiple Users
1. Like a post from User A
2. Login as User B
3. View the same post

**Expected:**
- User B sees the like count includes User A's like
- User B's like button is not filled (they haven't liked it)

---

### 4. Comment Functionality Test

#### Test A: View Comments
1. Click the comment icon on any post

**Expected:**
- Comments section expands
- Shows existing comments (if any)
- Shows comment input box
- Shows "No comments yet" if empty

#### Test B: Add Comment
1. Click comment icon to expand
2. Type comment text
3. Click send button (or press Enter)

**Expected:**
- Comment appears immediately
- Shows your name and avatar
- Shows "just now" timestamp
- Comment count increments
- Input clears
- Success toast appears

#### Test C: Multiple Comments
1. Add 3-4 comments to a post
2. Refresh page

**Expected:**
- All comments persist
- Ordered by newest first
- Comment count is accurate

---

### 5. Delete Post Test

#### Test A: Delete Own Post
1. Find a post you created
2. Click trash icon
3. Confirm deletion

**Expected:**
- Confirmation dialog appears
- Post disappears from feed
- Success toast appears
- No console errors

#### Test B: Cannot Delete Others' Posts
1. View a post from another user

**Expected:**
- No trash icon visible
- No delete option available

---

### 6. Infinite Scroll Test

1. Scroll to bottom of feed
2. Wait for loading indicator

**Expected:**
- Loading spinner appears
- More posts load automatically
- No duplicate posts
- "You've reached the end" message when no more posts

---

### 7. Performance Test

1. Create 10+ posts
2. Like/unlike rapidly
3. Add multiple comments quickly

**Expected:**
- No lag or freezing
- Optimistic UI updates instantly
- Server sync happens in background
- No duplicate requests

---

## 🐛 Common Issues & Solutions

### Issue 1: "Please login to like posts"
**Cause:** Token not found or expired

**Solution:**
```javascript
// Check token in browser console
localStorage.getItem('token')

// If null, login again
// Navigate to /login
```

---

### Issue 2: Likes/Comments Not Updating
**Cause:** API endpoint not returning proper relations

**Solution:**
- Already fixed in this update
- Rebuild: `npm run build`
- Restart dev server: `npm run dev`

---

### Issue 3: "Failed to toggle like"
**Cause:** Database connection or JWT verification issue

**Check:**
1. Database is running
2. `DATABASE_URL` in `.env` is correct
3. JWT secret is set: `JWT_SECRET` in `.env`

**Debug:**
```bash
# Check database connection
npx prisma db pull

# Check API logs
# Look for errors in terminal where dev server is running
```

---

### Issue 4: Images Not Uploading
**Cause:** Base64 encoding (temporary solution)

**Current Behavior:**
- Images stored as base64 data URLs
- Works but not optimal for production

**Production Solution:**
- Integrate Cloudinary or AWS S3
- Update `uploadImage` function in `CreatePostCard.tsx`

---

### Issue 5: Comments Not Showing
**Cause:** Missing `language` field in request

**Solution:**
- Already handled in `FeedPostCard.tsx`
- Default language is 'en'
- Ensure request includes: `{ content, language: 'en' }`

---

## 🔍 Debugging Tools

### Browser Console Checks

```javascript
// Check authentication
localStorage.getItem('token')

// Check current user
// Should be available in AuthContext

// Monitor API calls
// Open Network tab in DevTools
// Filter by 'community/posts'
```

### API Response Validation

**GET /api/community/posts**
```json
{
  "posts": [
    {
      "id": "...",
      "content": "...",
      "likes": [],        // ✅ Must be present
      "comments": [],     // ✅ Must be present
      "likesCount": 0,
      "commentsCount": 0,
      "user": { ... }
    }
  ],
  "pagination": { ... }
}
```

**POST /api/community/posts**
```json
{
  "post": {
    "id": "...",
    "content": "...",
    "likes": [],        // ✅ Fixed: Now included
    "comments": [],     // ✅ Fixed: Now included
    "user": { ... }
  }
}
```

---

## 🚀 Production Readiness

### Before Deploying

- [ ] Replace base64 image storage with cloud storage
- [ ] Add rate limiting (already implemented)
- [ ] Test with 100+ posts
- [ ] Test on mobile devices
- [ ] Add image compression
- [ ] Add content moderation
- [ ] Set up error monitoring (Sentry)
- [ ] Add analytics tracking

### Environment Variables Required

```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Optional: For image upload
CLOUDINARY_URL="cloudinary://..."
# OR
AWS_S3_BUCKET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

---

## 📊 Monitoring

### Key Metrics to Track

1. **Post Creation Rate**
   - Average posts per day
   - Peak posting times

2. **Engagement Rate**
   - Likes per post
   - Comments per post
   - Active users

3. **Performance**
   - API response times
   - Page load times
   - Image load times

4. **Errors**
   - Failed post creations
   - Failed likes/comments
   - Authentication failures

---

## 🎯 Next Steps

### Immediate
1. Test all functionality in browser
2. Verify likes and comments work
3. Test with multiple users

### Short-term
1. Add real-time updates (WebSocket/Polling)
2. Implement image upload to cloud storage
3. Add post editing functionality
4. Add comment replies (nested comments)

### Long-term
1. Add post sharing
2. Add hashtags and mentions
3. Add post search and filtering
4. Add notifications system
5. Add content moderation tools

---

## 📞 Support

If issues persist:

1. Check browser console for errors
2. Check server logs for API errors
3. Verify database schema is up to date: `npx prisma db push`
4. Clear browser cache and localStorage
5. Try in incognito mode to rule out cache issues

---

## ✨ Success Criteria

The feed is working correctly when:

- ✅ Posts appear immediately after creation
- ✅ Likes toggle instantly with visual feedback
- ✅ Comments can be added and appear immediately
- ✅ Infinite scroll loads more posts
- ✅ No console errors
- ✅ Optimistic UI updates work smoothly
- ✅ Data persists after page refresh
- ✅ Multiple users can interact independently

---

**Last Updated:** February 11, 2026
**Status:** ✅ Fixed and Ready for Testing
