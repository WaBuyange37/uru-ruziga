# Enable Comments and Reactions on Discussions

## What's Required

### 1. Database Changes ✅ DONE
- Added `DiscussionLike` model to track who liked which discussion
- Added relation to User model
- Added relation to Discussion model

### 2. API Routes

#### Already Implemented ✅
- `POST /api/discussions/[discussionId]/comments` - Add comment
- `GET /api/discussions/[discussionId]/comments` - Get all comments

#### Newly Created ✅
- `POST /api/discussions/[discussionId]/like` - Toggle like/unlike
- `GET /api/discussions/[discussionId]/like` - Check if user liked

### 3. Frontend Components (TODO)
Need to create interactive UI components:

#### DiscussionCard Component
- Like button with count
- Comment button with count  
- Expand to show comments
- Add comment form

#### CommentList Component
- Display all comments
- Show user info, timestamp
- Support Umwero script rendering

#### CommentForm Component
- Text input for comment
- Script type selector (Latin/Umwero)
- Submit button

### 4. Hooks (TODO)
Create custom hooks for data management:

#### useDiscussionInteractions
```typescript
{
  likeDiscussion: (id) => Promise<void>
  unlikeDiscussion: (id) => Promise<void>
  addComment: (id, content, script) => Promise<void>
  fetchComments: (id) => Promise<Comment[]>
  isLiked: (id) => boolean
}
```

## Implementation Steps

### Step 1: Run Database Migration
```bash
npx prisma migrate dev --name add_discussion_likes
npx prisma generate
```

### Step 2: Create Frontend Components
1. Create `components/discussions/DiscussionCard.tsx`
2. Create `components/discussions/CommentList.tsx`
3. Create `components/discussions/CommentForm.tsx`

### Step 3: Create Hooks
1. Create `hooks/useDiscussionInteractions.ts`

### Step 4: Update Homepage
1. Replace static discussion cards with interactive DiscussionCard component
2. Add comment/like functionality

### Step 5: Test
1. Like a discussion
2. Unlike a discussion
3. Add a comment
4. View comments
5. Test with Umwero script

## API Endpoints Summary

### Discussions
- `GET /api/discussions` - Get all discussions
- `POST /api/discussions` - Create discussion (auth required)
- `GET /api/discussions/[id]` - Get single discussion with comments
- `DELETE /api/discussions/[id]` - Delete discussion (owner/admin)

### Likes
- `POST /api/discussions/[id]/like` - Toggle like (auth required)
- `GET /api/discussions/[id]/like` - Check if liked (auth required)

### Comments
- `POST /api/discussions/[id]/comments` - Add comment (auth required)
- `GET /api/discussions/[id]/comments` - Get all comments

## Database Schema

```prisma
model Discussion {
  id         String           @id @default(cuid())
  userId     String
  title      String
  content    String           @db.Text
  script     String           @default("latin")
  category   String?
  likesCount Int              @default(0)
  views      Int              @default(0)
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
  
  user       User             @relation(...)
  comments   Comment[]
  likes      DiscussionLike[]
}

model DiscussionLike {
  id           String     @id @default(cuid())
  userId       String
  discussionId String
  createdAt    DateTime   @default(now())
  
  user         User       @relation(...)
  discussion   Discussion @relation(...)
  
  @@unique([userId, discussionId])
}

model Comment {
  id           String     @id @default(cuid())
  userId       String
  discussionId String
  content      String     @db.Text
  script       String     @default("latin")
  createdAt    DateTime   @default(now())
  
  user         User       @relation(...)
  discussion   Discussion @relation(...)
}
```

## Next Steps

Run the migration, then I'll create the frontend components and hooks to make it all work!
