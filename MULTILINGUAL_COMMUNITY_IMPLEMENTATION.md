# 🌍 Multilingual Community Implementation Guide

**Date**: February 7, 2026  
**Status**: ✅ **READY FOR IMPLEMENTATION**

---

## 🎯 Overview

The community platform now supports **three languages** for all content:
- **English (en)** - International language
- **Kinyarwanda (rw)** - Native language
- **Umwero (um)** - Umwero script (Kinyarwanda in Umwero font)

---

## ✅ Database Schema Updates

### CommunityPost Table
```prisma
model CommunityPost {
  id           String   @id @default(cuid())
  userId       String
  content      String
  language     String   @default("en") // NEW: en, rw, um
  latinText    String?
  umweroText   String?
  imageUrl     String?
  isChallenge  Boolean  @default(false)
  challengeType String?
  likesCount   Int      @default(0)
  commentsCount Int     @default(0)
  sharesCount  Int      @default(0)
  views        Int      @default(0)
  isPinned     Boolean  @default(false)
  isPublic     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([language]) // NEW: Index for filtering by language
}
```

### PostComment Table
```prisma
model PostComment {
  id         String   @id @default(cuid())
  userId     String
  postId     String
  content    String
  language   String   @default("en") // NEW: en, rw, um
  latinText  String?
  umweroText String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([language]) // NEW: Index for filtering by language
}
```

---

## 🔧 API Updates

### POST /api/community/posts
**New Required Field**: `language`

**Request Body**:
```json
{
  "content": "Mwaramutse! Ndabona umwero",
  "language": "rw",  // NEW: Required (en, rw, or um)
  "latinText": "Mwaramutse! Ndabona umwero",
  "umweroText": "ME"R"M:X|! ND"B{N" :ME|R{",
  "isChallenge": false
}
```

**Validation**:
- `language` must be one of: `en`, `rw`, `um`
- Returns 400 error if invalid or missing

### POST /api/community/posts/[postId]/comments
**New Required Field**: `language`

**Request Body**:
```json
{
  "content": "Ni byiza cyane!",
  "language": "rw",  // NEW: Required (en, rw, or um)
  "latinText": "Ni byiza cyane!",
  "umweroText": "N} BB}Z" CY"N|!"
}
```

---

## 🎨 UI Implementation

### Language Selector Component

Create a new component for language selection:

```typescript
// components/LanguageSelector.tsx
"use client"

import { useState } from 'react'
import { Button } from './ui/button'
import { Globe } from 'lucide-react'

interface LanguageSelectorProps {
  value: string
  onChange: (language: string) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'um', name: 'Umwero', flag: '📜' },
  ]

  return (
    <div className="flex gap-2 items-center">
      <Globe className="h-4 w-4 text-[#8B4513]" />
      <span className="text-sm text-[#8B4513] font-medium">Language:</span>
      <div className="flex gap-2">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            variant={value === lang.code ? 'default' : 'outline'}
            size="sm"
            className={`${
              value === lang.code
                ? 'bg-[#8B4513] text-[#F3E5AB]'
                : 'border-[#8B4513] text-[#8B4513]'
            } hover:bg-[#A0522D] hover:text-[#F3E5AB]`}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

### Updated Post Creation Form

```typescript
// In community page
const [postLanguage, setPostLanguage] = useState('en')
const [newPost, setNewPost] = useState('')

// Auto-translate when language changes
useEffect(() => {
  if (postLanguage === 'um' && newPost) {
    const translated = latinToUmwero(newPost)
    setUmweroPreview(translated)
  }
}, [postLanguage, newPost])

// In the form
<form onSubmit={handleSubmit}>
  {/* Language Selector */}
  <LanguageSelector 
    value={postLanguage} 
    onChange={setPostLanguage} 
  />
  
  {/* Text Input */}
  <Textarea
    value={newPost}
    onChange={(e) => setNewPost(e.target.value)}
    placeholder={
      postLanguage === 'en' ? 'Share your thoughts...' :
      postLanguage === 'rw' ? 'Andika ibitekerezo byawe...' :
      'Andika mu Umwero...'
    }
  />
  
  {/* Umwero Preview (if language is um) */}
  {postLanguage === 'um' && umweroPreview && (
    <div className="p-4 bg-[#F3E5AB] rounded-lg border-2 border-[#D2691E]">
      <p className="text-sm text-[#D2691E] mb-2">Umwero Preview:</p>
      <p 
        className="text-2xl"
        style={{ fontFamily: "'UMWEROalpha', serif", color: '#8B4513' }}
      >
        {umweroPreview}
      </p>
    </div>
  )}
  
  <Button type="submit">
    {postLanguage === 'en' ? 'Post' :
     postLanguage === 'rw' ? 'Ohereza' :
     'Ohereza'}
  </Button>
</form>
```

### Post Display with Language Badge

```typescript
// Display post with language indicator
<Card>
  <CardContent>
    {/* Header with language badge */}
    <div className="flex items-center gap-2 mb-2">
      <span className="font-bold">{post.user.fullName}</span>
      <Badge className="bg-[#D2691E]">{post.user.role}</Badge>
      <Badge className={`${
        post.language === 'en' ? 'bg-blue-500' :
        post.language === 'rw' ? 'bg-green-500' :
        'bg-purple-500'
      } text-white`}>
        {post.language === 'en' ? '🇬🇧 EN' :
         post.language === 'rw' ? '🇷🇼 RW' :
         '📜 UM'}
      </Badge>
    </div>
    
    {/* Content */}
    <p className={`${
      post.language === 'um' 
        ? "font-['UMWEROalpha'] text-2xl" 
        : ""
    } text-[#8B4513]`}>
      {post.content}
    </p>
    
    {/* Show both Latin and Umwero if available */}
    {post.language === 'um' && post.latinText && (
      <div className="mt-2 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Latin:</p>
        <p className="text-[#8B4513]">{post.latinText}</p>
      </div>
    )}
  </CardContent>
</Card>
```

---

## 🔄 Translation Flow

### When User Selects Language

#### English (en)
```
User types: "Hello, how are you?"
    ↓
Store as: content = "Hello, how are you?"
          language = "en"
          latinText = null
          umweroText = null
```

#### Kinyarwanda (rw)
```
User types: "Mwaramutse, amakuru?"
    ↓
Store as: content = "Mwaramutse, amakuru?"
          language = "rw"
          latinText = "Mwaramutse, amakuru?"
          umweroText = null (optional: can translate)
```

#### Umwero (um)
```
User types: "Mwaramutse, amakuru?"
    ↓
Auto-translate to Umwero
    ↓
Store as: content = "ME"R"M:X|, "M"K:R:?"
          language = "um"
          latinText = "Mwaramutse, amakuru?"
          umweroText = "ME"R"M:X|, "M"K:R:?"
```

---

## 📊 Language Filtering

### Filter Posts by Language

```typescript
// Add language filter to community page
const [languageFilter, setLanguageFilter] = useState<string | null>(null)

// Fetch posts with language filter
const fetchPosts = async () => {
  const params = new URLSearchParams()
  if (languageFilter) {
    params.append('language', languageFilter)
  }
  
  const response = await fetch(`/api/community/posts?${params}`)
  const data = await response.json()
  setPosts(data.posts)
}

// UI for language filter
<div className="flex gap-2 mb-4">
  <Button
    onClick={() => setLanguageFilter(null)}
    variant={!languageFilter ? 'default' : 'outline'}
  >
    All Languages
  </Button>
  <Button
    onClick={() => setLanguageFilter('en')}
    variant={languageFilter === 'en' ? 'default' : 'outline'}
  >
    🇬🇧 English
  </Button>
  <Button
    onClick={() => setLanguageFilter('rw')}
    variant={languageFilter === 'rw' ? 'default' : 'outline'}
  >
    🇷🇼 Kinyarwanda
  </Button>
  <Button
    onClick={() => setLanguageFilter('um')}
    variant={languageFilter === 'um' ? 'default' : 'outline'}
  >
    📜 Umwero
  </Button>
</div>
```

### Update API to Support Language Filter

```typescript
// In /api/community/posts/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const language = searchParams.get('language')
  
  const where: any = { isPublic: true }
  if (language && ['en', 'rw', 'um'].includes(language)) {
    where.language = language
  }
  
  const posts = await prisma.communityPost.findMany({
    where,
    // ... rest of query
  })
  
  return NextResponse.json({ posts })
}
```

---

## 🎨 UI Text Translations

### Add Community-Specific Translations

Update `lib/translations.ts`:

```typescript
export const translations = {
  en: {
    // ... existing translations
    community: "Community",
    newPost: "New Post",
    selectLanguage: "Select Language",
    writeInEnglish: "Write in English",
    writeInKinyarwanda: "Write in Kinyarwanda",
    writeInUmwero: "Write in Umwero",
    postInEnglish: "Post in English",
    postInKinyarwanda: "Post in Kinyarwanda",
    postInUmwero: "Post in Umwero",
    allLanguages: "All Languages",
    filterByLanguage: "Filter by Language",
    umweroPreview: "Umwero Preview",
    latinText: "Latin Text",
  },
  rw: {
    // ... existing translations
    community: "Umuryango",
    newPost: "Ubutumwa Bushya",
    selectLanguage: "Hitamo Ururimi",
    writeInEnglish: "Andika mu Cyongereza",
    writeInKinyarwanda: "Andika mu Kinyarwanda",
    writeInUmwero: "Andika mu Umwero",
    postInEnglish: "Ohereza mu Cyongereza",
    postInKinyarwanda: "Ohereza mu Kinyarwanda",
    postInUmwero: "Ohereza mu Umwero",
    allLanguages: "Indimi Zose",
    filterByLanguage: "Shungura ku Rurimi",
    umweroPreview: "Reba Umwero",
    latinText: "Inyandiko ya Latin",
  },
  um: {
    // ... Umwero translations (will be converted)
    community: "Umuryango",
    newPost: "Ubutumwa Bushya",
    // ... etc (same as rw, will be converted to Umwero)
  },
}
```

---

## 🚀 Implementation Steps

### Step 1: Run Database Migration
```bash
npx prisma migrate dev --name add_language_to_posts
npx prisma generate
```

### Step 2: Create Language Selector Component
```bash
# Create the component file
touch components/LanguageSelector.tsx
```

### Step 3: Update Community Page
- Add language selector to post creation form
- Add language filter buttons
- Update post display to show language badge
- Add Umwero preview for um language

### Step 4: Update Translations
- Add community-specific translations
- Ensure all UI text is translatable

### Step 5: Test
- Test posting in each language
- Test filtering by language
- Test Umwero auto-translation
- Test on mobile devices

---

## 📱 Mobile Considerations

### Language Selector on Mobile
```typescript
// Compact version for mobile
<select 
  value={postLanguage}
  onChange={(e) => setPostLanguage(e.target.value)}
  className="w-full p-2 border-2 border-[#8B4513] rounded-lg"
>
  <option value="en">🇬🇧 English</option>
  <option value="rw">🇷🇼 Kinyarwanda</option>
  <option value="um">📜 Umwero</option>
</select>
```

### Responsive Language Filter
```typescript
// Stack vertically on mobile
<div className="flex flex-col sm:flex-row gap-2">
  {/* Language filter buttons */}
</div>
```

---

## 🎯 User Experience Flow

### Creating a Post

1. **User clicks "New Post"**
2. **Language selector appears** (default: user's preferred language)
3. **User selects language**: EN, RW, or UM
4. **User types content**:
   - If UM selected: Auto-translate and show preview
   - If RW/EN: Just show text
5. **User clicks "Post"**
6. **System saves**:
   - Content in selected language
   - Language code
   - Latin text (if UM)
   - Umwero text (if UM)
   - Training data entry

### Viewing Posts

1. **User sees all posts** (mixed languages)
2. **Language badge** shows post language
3. **Umwero posts** display in Umwero font
4. **Latin translation** shown below Umwero posts
5. **User can filter** by language
6. **Comments** can be in any language

---

## ✅ Success Criteria

- [ ] Users can select language when creating posts
- [ ] Posts display with language badges
- [ ] Umwero posts show both Umwero and Latin text
- [ ] Language filtering works correctly
- [ ] All UI text is translatable
- [ ] Mobile experience is smooth
- [ ] Training data captures language info
- [ ] Comments support language selection

---

## 📊 Analytics to Track

- Posts per language (en, rw, um)
- Most popular language
- Language switching frequency
- Umwero adoption rate
- Cross-language engagement

---

**Status**: ✅ **READY FOR IMPLEMENTATION**

**Last Updated**: February 7, 2026  
**Next Step**: Run database migration

---

*Empowering multilingual communication in the Umwero community* 🌍
