# Global Homepage Discussion System - Implementation Plan

## Overview
Upgrading the discussion system to a production-grade Twitter/X-style global feed with likes, comments, and image uploads.

## Database Schema Changes

### New Models Required

```prisma
// Global Feed Post (replaces Discussion for homepage)
model FeedPost {
  id           String        @id @default(cuid())
  userId       String
  content      String        @db.Text
  imageUrl     String?       // Optional image
  isPinned     Boolean       @default(false)
  views        Int           @default(0)
  likesCount   Int           @default(0)
  commentsCount Int          @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes        FeedPostLike[]
  comments     FeedPostComment[]
  
  @@index([userId])
  @@index([createdAt])
  @@index([isPinned])
  @@map("feed_posts")
}

model FeedPostLike {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      FeedPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId])
  @@index([userId])
  @@index([postId])
  @@map("feed_post_likes")
}

model FeedPostComment {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      FeedPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([postId])
  @@index([createdAt])
  @@map("feed_post_comments")
}
```

## API Routes

### 1. GET /api/feed
- Fetch paginated posts
- Order by: isPinned DESC, createdAt DESC
- Include: user info, like status, comment count
- Pagination: limit, cursor-based

### 2. POST /api/feed
- Create new post
- Validate: content (required), image (optional)
- Rate limit: 10 posts per hour
- Image upload to Cloudinary/storage

### 3. POST /api/feed/[postId]/like
- Toggle like (like/unlike)
- Optimistic UI support
- Update likesCount

### 4. POST /api/feed/[postId]/comment
- Add comment to post
- Rate limit: 30 comments per hour
- Update commentsCount

### 5. GET /api/feed/[postId]/comments
- Fetch comments for post
- Paginated
- Include user info

### 6. DELETE /api/feed/[postId]
- Delete post (owner or admin only)
- Cascade delete likes and comments

## UI Components

### 1. FeedPage (Homepage)
- Sticky create post box at top
- Infinite scroll feed
- Loading skeletons
- Empty state

### 2. CreatePostCard
- Textarea for content
- Image upload button
- Preview uploaded image
- Character count
- Submit button

### 3. FeedPostCard
- User avatar and name
- Post content
- Image (if exists)
- Like button with count
- Comment button with count
- Timestamp (relative)
- Delete button (owner/admin)

### 4. CommentSection
- Expandable/collapsible
- Comment input
- Comment list
- Pagination

## Security Measures

1. **Authentication**: JWT token required for all write operations
2. **Authorization**: Users can only delete their own posts (except admins)
3. **Rate Limiting**: 
   - Posts: 10/hour
   - Comments: 30/hour
   - Likes: 100/hour
4. **Input Validation**:
   - Content: max 5000 characters
   - Image: max 5MB, image/* only
5. **XSS Prevention**: Sanitize all text content
6. **CSRF Protection**: Use tokens for mutations

## Performance Optimizations

1. **Server Components**: Use for initial feed load
2. **Suspense Boundaries**: Wrap async components
3. **Pagination**: Cursor-based for infinite scroll
4. **Caching**: 
   - Feed: revalidate every 60s
   - Post details: revalidate on mutation
5. **Database Indexes**: On userId, createdAt, postId
6. **Optimistic UI**: Immediate feedback for likes/comments
7. **Image Optimization**: Next.js Image component with lazy loading

## Implementation Steps

1. ✅ Create database schema migration
2. ✅ Implement API routes with security
3. ✅ Create UI components
4. ✅ Add image upload functionality
5. ✅ Implement like system
6. ✅ Implement comment system
7. ✅ Add loading states and error handling
8. ✅ Optimize performance
9. ✅ Test security measures
10. ✅ Deploy and monitor

## Timeline

- Database & API: 2-3 hours
- UI Components: 2-3 hours
- Testing & Optimization: 1-2 hours
- Total: 5-8 hours

## Status: READY TO IMPLEMENT
