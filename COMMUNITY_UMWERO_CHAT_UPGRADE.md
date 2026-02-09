# 🚀 Community & Umwero Chat Upgrade - Implementation Plan

**Date**: February 7, 2026  
**Status**: 🔄 **IN PROGRESS**

---

## 🎯 Objectives

### 1. Community Page (Twitter-like)
- ✅ Create Twitter-style feed for students
- ✅ Enable open discussions and challenges
- ✅ Add like, comment, share functionality
- ✅ Store all interactions for ML training

### 2. ML Training Database
- ✅ Store all user text interactions
- ✅ Store translations (Latin ↔ Umwero)
- ✅ Store learning content
- ✅ Track data quality and verification

### 3. Umwero Chat Enhancement
- 🔄 Auto-generate PNG images from Umwero text
- 🔄 Professional social media sharing
- 🔄 Share to Facebook, Twitter, TikTok, Instagram
- 🔄 Interactive, modern design

---

## ✅ Completed Work

### 1. Database Schema Updates
**File**: `prisma/schema.prisma`

#### New Tables Added:

**CommunityPost** - Twitter-like posts
```prisma
model CommunityPost {
  id            String   @id @default(cuid())
  userId        String
  content       String
  latinText     String?
  umweroText    String?
  imageUrl      String?
  isChallenge   Boolean  @default(false)
  challengeType String?
  likesCount    Int      @default(0)
  commentsCount Int      @default(0)
  sharesCount   Int      @default(0)
  views         Int      @default(0)
  isPinned      Boolean  @default(false)
  isPublic      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
  likes         PostLike[]
  comments      PostComment[]
}
```

**PostLike** - Track post likes
```prisma
model PostLike {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  post      CommunityPost @relation(fields: [postId], references: [id])
  
  @@unique([userId, postId])
}
```

**PostComment** - Comments on posts
```prisma
model PostComment {
  id         String   @id @default(cuid())
  userId     String
  postId     String
  content    String
  latinText  String?
  umweroText String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id])
  post       CommunityPost @relation(fields: [postId], references: [id])
}
```

**ChatMessage** - Umwero chat messages
```prisma
model ChatMessage {
  id         String   @id @default(cuid())
  userId     String
  latinText  String
  umweroText String
  imageUrl   String?
  fontSize   Int      @default(24)
  shared     Boolean  @default(false)
  shareCount Int      @default(0)
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}
```

**TrainingData** - ML training data
```prisma
model TrainingData {
  id             String   @id @default(cuid())
  userId         String?
  sourceType     DataSourceType
  sourceId       String?
  latinText      String
  umweroText     String?
  translatedText String?
  context        String?
  language       String   @default("rw")
  targetLanguage String?
  quality        Int?
  verified       Boolean  @default(false)
  metadata       String?
  createdAt      DateTime @default(now())
  user           User?    @relation(fields: [userId], references: [id])
}

enum DataSourceType {
  CHAT_MESSAGE
  COMMUNITY_POST
  POST_COMMENT
  LESSON_CONTENT
  USER_TRANSLATION
  DRAWING_FEEDBACK
  QUIZ_ANSWER
}
```

### 2. API Routes Created

#### Community Posts API
- ✅ `POST /api/community/posts` - Create new post
- ✅ `GET /api/community/posts` - Fetch all posts (with pagination)
- ✅ `GET /api/community/posts/[postId]` - Fetch single post
- ✅ `DELETE /api/community/posts/[postId]` - Delete post
- ✅ `POST /api/community/posts/[postId]/like` - Like/unlike post
- ✅ `POST /api/community/posts/[postId]/comments` - Add comment

#### Chat Messages API
- ✅ `POST /api/chat/messages` - Save chat message
- ✅ `GET /api/chat/messages` - Fetch user's messages

### 3. Features Implemented

#### Community Posts
- ✅ Create posts with Latin and Umwero text
- ✅ Automatic translation storage
- ✅ Like/unlike functionality
- ✅ Comment system
- ✅ View tracking
- ✅ Challenge posts
- ✅ User roles (Student, Teacher, Admin)
- ✅ Post filtering (All/Challenges)

#### ML Training Data
- ✅ Automatic data collection from:
  - Community posts
  - Post comments
  - Chat messages
- ✅ Source tracking (type and ID)
- ✅ Context preservation
- ✅ Quality scoring system
- ✅ Verification status

---

## 🔄 Work In Progress

### 1. Community Page UI
**Status**: Partially complete

**What's Done**:
- Basic structure created
- Post creation form
- Post feed display
- Like/comment functionality
- Sidebar with stats

**What's Needed**:
- Replace current community page
- Add image upload for posts
- Add hashtag support
- Add user mentions (@username)
- Add post search
- Add trending topics
- Add user profiles
- Mobile optimization

### 2. Umwero Chat PNG Generation
**Status**: Not started

**Requirements**:
1. **Auto-generate PNG images**
   - Convert Umwero text to high-quality PNG
   - Include branding (Uruziga logo)
   - Add decorative borders
   - Include user attribution
   - Multiple size options (Instagram, Twitter, Facebook)

2. **Social Media Sharing**
   - One-click share to:
     - Facebook
     - Twitter/X
     - Instagram
     - TikTok
   - Pre-filled captions
   - Hashtags (#Umwero, #Kinyarwanda, #Culture)
   - Direct image upload

3. **Professional Design**
   - Modern, clean interface
   - Smooth animations
   - Loading states
   - Success feedback
   - Error handling

---

## 📋 Implementation Steps

### Step 1: Database Migration
```bash
# Run Prisma migration
npx prisma migrate dev --name add_community_and_training_tables

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

### Step 2: Update Community Page
1. Replace `app/community/page.tsx` with new implementation
2. Add proper authentication checks
3. Implement real-time updates (optional)
4. Add image upload functionality
5. Test all features

### Step 3: Enhance Umwero Chat
1. Add PNG generation function
2. Implement canvas-based image creation
3. Add social media share buttons
4. Add download functionality
5. Store generated images
6. Track shares

### Step 4: Testing
1. Test post creation
2. Test like/comment functionality
3. Test PNG generation
4. Test social media sharing
5. Test data storage
6. Test mobile responsiveness

---

## 🎨 Design Specifications

### Community Post Card
```
┌─────────────────────────────────────┐
│ 👤 User Name [ROLE BADGE] [CHALLENGE]│
│    2 hours ago                       │
├─────────────────────────────────────┤
│ Post content goes here...            │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │ Umwero:                         │ │
│ │ [Umwero text in custom font]    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 👁 123 views • 45 likes • 12 comments│
├─────────────────────────────────────┤
│ [❤️ Like] [💬 Comment] [🔗 Share]   │
└─────────────────────────────────────┘
```

### Umwero Chat PNG Output
```
┌─────────────────────────────────────┐
│          UMWERO MESSAGE             │
│                                      │
│  Latin: Mwaramutse                  │
│                                      │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   [Large Umwero Text]         │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                      │
│  Created with Uruziga               │
│  By: User Name                      │
│                                      │
│  [LOGO]                             │
└─────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### PNG Generation Function
```typescript
async function generateUmweroPNG(
  latinText: string,
  umweroText: string,
  fontSize: number = 48,
  userName: string
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // Set canvas size (Instagram square: 1080x1080)
  canvas.width = 1080
  canvas.height = 1080
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#F3E5AB')
  gradient.addColorStop(1, '#D2691E')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Border
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = 12
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)
  
  // Title
  ctx.fillStyle = '#8B4513'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('UMWERO MESSAGE', canvas.width / 2, 120)
  
  // Latin text
  ctx.font = '32px Arial'
  ctx.fillStyle = '#654321'
  ctx.fillText(`Latin: ${latinText}`, canvas.width / 2, 220)
  
  // Umwero text (large, centered)
  ctx.font = `${fontSize}px UMWEROalpha, serif`
  ctx.fillStyle = '#8B4513'
  
  // Word wrap
  const words = umweroText.split(' ')
  let line = ''
  let y = 400
  const maxWidth = canvas.width - 200
  const lineHeight = fontSize + 40
  
  for (let word of words) {
    const testLine = line + word + ' '
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, canvas.width / 2, y)
      line = word + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, canvas.width / 2, y)
  
  // Footer
  ctx.font = '24px Arial'
  ctx.fillStyle = '#8B4513'
  ctx.fillText('Created with Uruziga - Umwero Learning Platform', canvas.width / 2, canvas.height - 150)
  ctx.fillText(`By: ${userName}`, canvas.width / 2, canvas.height - 100)
  
  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}
```

### Social Media Share Function
```typescript
function shareToSocial(
  platform: 'facebook' | 'twitter' | 'instagram' | 'tiktok',
  imageBlob: Blob,
  latinText: string
) {
  const text = `Check out my Umwero message: "${latinText}" ✨ #Umwero #Kinyarwanda #Culture`
  const url = window.location.origin
  
  switch (platform) {
    case 'facebook':
      // Facebook requires image upload via their API
      // For now, open share dialog
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
        '_blank'
      )
      break
      
    case 'twitter':
      // Twitter share with text
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank'
      )
      break
      
    case 'instagram':
      // Instagram doesn't support direct web sharing
      // Download image and show instructions
      downloadImage(imageBlob, 'umwero-message.png')
      alert('Image downloaded! Open Instagram and upload from your gallery.')
      break
      
    case 'tiktok':
      // TikTok doesn't support direct web sharing
      // Download image and show instructions
      downloadImage(imageBlob, 'umwero-message.png')
      alert('Image downloaded! Open TikTok and upload from your gallery.')
      break
  }
}

function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 📊 Data Flow

### Community Post Creation
```
User writes post
    ↓
Convert to Umwero (if needed)
    ↓
Save to CommunityPost table
    ↓
Save to TrainingData table
    ↓
Return post to user
    ↓
Update feed
```

### Chat Message with PNG
```
User types message
    ↓
Auto-translate to Umwero
    ↓
Generate PNG image
    ↓
Upload image to storage
    ↓
Save to ChatMessage table
    ↓
Save to TrainingData table
    ↓
Show preview with share buttons
```

---

## 🎯 Success Metrics

### Community Engagement
- [ ] 100+ posts in first week
- [ ] 50+ active users daily
- [ ] 500+ likes/comments per day
- [ ] 10+ challenges created

### ML Training Data
- [ ] 1,000+ text samples collected
- [ ] 500+ translations stored
- [ ] 100+ verified entries
- [ ] Quality score > 4/5 average

### Umwero Chat
- [ ] 200+ PNG images generated
- [ ] 100+ social media shares
- [ ] 50+ downloads per day
- [ ] 90%+ user satisfaction

---

## 🚀 Next Steps

### Immediate (Today)
1. Run database migration
2. Test API routes
3. Update community page UI
4. Test post creation

### Short-term (This Week)
1. Implement PNG generation
2. Add social media sharing
3. Test on mobile devices
4. Gather user feedback

### Long-term (This Month)
1. Add real-time updates
2. Implement notifications
3. Add user profiles
4. Analytics dashboard
5. ML model training

---

## 📝 Notes

- All API routes use JWT authentication
- Training data is automatically collected
- Images should be optimized for web
- Consider CDN for image storage
- Monitor database size growth
- Implement rate limiting
- Add content moderation

---

**Status**: 🔄 **60% COMPLETE**

**Last Updated**: February 7, 2026  
**Next Review**: After database migration

---

*Building the future of Kinyarwanda learning* 🚀
