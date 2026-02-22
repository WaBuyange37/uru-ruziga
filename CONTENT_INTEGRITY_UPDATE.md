# Content Integrity Update - Authentic Source Integration

## Overview
Updated lesson workspace implementation to use only authentic Umwero documentation and assets, eliminating all fabricated content.

## Key Changes Implemented

### 1. Dynamic Asset Loading
All character assets are now dynamically loaded from `/public/UmweroLetaByLeta/` based on character ID:

```typescript
// Asset path structure
const char = (content.vowel || content.consonant).toLowerCase()
const charUpper = char.toUpperCase()

imageUrl: `/UmweroLetaByLeta/${char}/${charUpper}in8.jpg`
strokeImageUrl: `/UmweroLetaByLeta/${char}/${charUpper}-ways.{png|jpg}`
audioUrl: `/UmweroLetaByLeta/${char}/${charUpper}.mp3`
```

### 2. Stroke Direction Display
- Stroke direction images now display below the practice canvas
- Uses actual `-ways.png` or `-ways.jpg` files from character folders
- Provides visual reference while drawing

### 3. Content Source Rules

#### What We Display:
✅ Content from database (lesson.content JSON)
✅ Images from `/UmweroLetaByLeta/`
✅ Audio from `/UmweroLetaByLeta/Voice/`
✅ PDFs from `/doc-umwero-explained/`

#### What We DON'T Display:
❌ AI-generated cultural explanations
❌ Fabricated historical narratives
❌ Invented symbolic meanings
❌ Made-up preservation stories

### 4. Tab Content Updates

#### Overview Tab
- Displays character image (Xin8.jpg)
- Shows pronunciation from database
- Lists example words from database
- Plays audio from actual .mp3 files

#### Culture Tab
- Only shows `culturalNote` from database
- Only shows `meaning` from database
- Links to authentic PDF documentation
- Shows placeholder if no content available

#### Stroke Guide Tab
- Displays character image (Xin8.jpg)
- Shows stroke direction image (X-ways.png/jpg)
- Lists stroke instructions from database only
- No fabricated writing tips beyond basic UI guidance

#### Story Tab
- Only shows `description` from database
- Links to authentic PDF documentation
- Shows placeholder if no content available
- No fabricated historical narratives

### 5. Canvas Enhancements

#### Touch Support
```css
touchAction: 'none' // Prevents page scroll during drawing
```

#### Features:
- Free drawing with mouse/touch
- Undo last stroke
- Clear canvas
- Ghost guide overlay (toggleable)
- Smooth stroke rendering
- PNG export for AI evaluation

### 6. Asset File Structure

```
/public/UmweroLetaByLeta/
├── a/
│   ├── Ain8.jpg          # Character visual
│   ├── A-ways.png        # Stroke direction
│   └── A.mp3             # Pronunciation
├── e/
│   ├── Ein8.jpg
│   ├── E-ways.jpg
│   └── E.mp3
├── i/
│   ├── Iin8.jpg
│   ├── I-ways.jpg
│   └── I.mp3
└── [other characters...]

/public/doc-umwero-explained/
├── Umwero Visual Cultural-1.pdf
├── UmweroIPA-1.pdf
├── Umwero Ibihekane (3).pdf
├── umweroChart.PNG
└── [other documentation...]
```

### 7. Database Content Structure

Lesson content JSON should contain:
```json
{
  "vowel": "a",
  "umwero": "\"",
  "pronunciation": "/a/ as in father",
  "meaning": "Authentic meaning from documentation",
  "culturalNote": "Authentic cultural context",
  "examples": [
    {
      "umwero": "\"M\"Z}",
      "latin": "amazi",
      "meaning": "water"
    }
  ],
  "strokeGuide": [
    "Step 1 from documentation",
    "Step 2 from documentation"
  ]
}
```

## Implementation Checklist

- [x] Dynamic asset path generation
- [x] Stroke image display below canvas
- [x] Remove fabricated cultural content
- [x] Remove fabricated historical narratives
- [x] Link to authentic PDF documentation
- [x] Show placeholders when content unavailable
- [x] Canvas touch support (prevent scroll)
- [x] Image component for proper loading
- [x] Audio playback from actual files
- [x] Database-only content rendering

## Content Integrity Rules

### Rule 1: Source Verification
Every piece of educational content must be traceable to:
- Database lesson content (from authentic sources)
- Files in `/public/UmweroLetaByLeta/`
- Files in `/public/doc-umwero-explained/`

### Rule 2: No Fabrication
If content is not available in the database or files:
- Show placeholder message
- Link to documentation
- Do NOT generate explanations

### Rule 3: Dynamic Asset Loading
Never hardcode asset paths per character:
```typescript
// ❌ BAD
imageUrl: '/UmweroLetaByLeta/a/Ain8.jpg'

// ✅ GOOD
imageUrl: `/UmweroLetaByLeta/${char}/${charUpper}in8.jpg`
```

### Rule 4: Authentic Documentation Links
Always link to actual PDF files:
- Umwero Visual Cultural-1.pdf
- UmweroIPA-1.pdf
- Umwero Ibihekane (3).pdf
- umweroChart.PNG

## Testing Verification

### Asset Loading Test
1. Navigate to `/lessons/[lessonId]`
2. Verify character image loads (Xin8.jpg)
3. Verify stroke image loads (X-ways.png/jpg)
4. Verify audio plays (X.mp3)

### Content Integrity Test
1. Check Culture tab - only database content
2. Check Story tab - only database content
3. Verify no fabricated explanations
4. Verify PDF links work

### Canvas Test
1. Draw on canvas with mouse
2. Draw on canvas with touch (mobile)
3. Verify page doesn't scroll during drawing
4. Test undo/clear functions
5. Verify stroke image visible below canvas

## Next Steps

### Phase 1: Content Population
- Extract content from PDF documentation
- Populate database with authentic information
- Add stroke guide instructions

### Phase 2: Audio Integration
- Verify all audio files exist
- Implement audio player controls
- Add pronunciation practice mode

### Phase 3: AI Evaluation
- Integrate actual AI comparison API
- Use stroke direction images for evaluation
- Provide detailed feedback metrics

## Conclusion

The lesson workspace now maintains complete content integrity by:
1. Using only authentic source materials
2. Dynamically loading assets from actual files
3. Displaying database content without fabrication
4. Linking to original documentation
5. Showing placeholders when content unavailable

This ensures cultural accuracy and preserves the creator's authentic Umwero teachings.
