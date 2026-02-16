# Lesson System Restructure - Single Page Architecture

## Current Problem
- Multiple pages (intro → practice → score)
- Page navigation creates friction
- Disconnected learning experience
- Slow load times between steps

## Proposed Solution: Single Dynamic Lesson Workspace

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Header + Progress Bar (Sticky)                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  LEFT PANEL      │  │  RIGHT PANEL         │   │
│  │  (Learning)      │  │  (Practice)          │   │
│  │                  │  │                      │   │
│  │  - Overview      │  │  - Canvas            │   │
│  │  - Story         │  │  - Drawing Tools     │   │
│  │  - Culture       │  │  - AI Evaluation     │   │
│  │  - Strokes       │  │  - Progress          │   │
│  │  - Audio         │  │                      │   │
│  │                  │  │                      │   │
│  └──────────────────┘  └──────────────────────┘   │
│                                                      │
├─────────────────────────────────────────────────────┤
│  Footer Actions (Sticky)                            │
└─────────────────────────────────────────────────────┘
```

### Key Features

#### 1. Tab-Based Navigation (No Page Reload)
- Overview
- Cultural Context
- Stroke Guide (Animated)
- Creator's Story
- Audio Pronunciation
- Example Words

#### 2. Practice Panel States
- **Idle**: Show character preview
- **Practice**: Canvas active for drawing
- **Evaluation**: AI comparison view
- **Complete**: Next character prompt

#### 3. Sticky Elements
- Header with progress bar
- Footer with action buttons
- Tab navigation

#### 4. Responsive Design
- Desktop: Side-by-side panels
- Tablet: Collapsible panels
- Mobile: Stacked with tabs

## Implementation Plan

### Phase 1: Core Structure
1. Create new lesson page component
2. Implement tab navigation system
3. Build split-panel layout
4. Add sticky header/footer

### Phase 2: Learning Panel
1. Overview section
2. Cultural context card
3. Animated stroke guide (SVG)
4. Creator's story
5. Audio player integration
6. Example words list

### Phase 3: Practice Panel
1. Canvas component
2. Drawing tools (undo, clear, guide toggle)
3. Ghost guide overlay
4. Touch/mouse support
5. Stroke recording

### Phase 4: AI Evaluation
1. Canvas to image conversion
2. AI comparison logic
3. Score calculation
4. Visual feedback
5. Retry/Next actions

### Phase 5: State Management
1. Lesson progress tracking
2. Drawing state
3. Evaluation results
4. Navigation state

### Phase 6: Polish
1. Animations
2. Sound effects
3. Haptic feedback
4. Loading states
5. Error handling

## Technical Stack

### Components
```
app/
└── lessons/
    └── [lessonId]/
        └── page.tsx              # Main lesson page

components/
└── lessons/
    ├── LessonWorkspace.tsx       # Main container
    ├── LessonHeader.tsx          # Sticky header
    ├── LessonTabs.tsx            # Tab navigation
    ├── LearningPanel.tsx         # Left panel
    │   ├── OverviewTab.tsx
    │   ├── CultureTab.tsx
    │   ├── StrokeGuideTab.tsx
    │   └── StoryTab.tsx
    ├── PracticePanel.tsx         # Right panel
    │   ├── DrawingCanvas.tsx
    │   ├── CanvasTools.tsx
    │   ├── GhostGuide.tsx
    │   └── EvaluationView.tsx
    └── LessonFooter.tsx          # Sticky footer
```

### State Management
```typescript
interface LessonState {
  // Lesson data
  lesson: Lesson
  character: Character
  
  // Navigation
  activeTab: 'overview' | 'culture' | 'strokes' | 'story'
  
  // Practice
  practiceMode: 'idle' | 'drawing' | 'evaluating' | 'complete'
  drawingPaths: Path[]
  showGuide: boolean
  
  // Evaluation
  score: number | null
  feedback: string | null
  userDrawing: string | null
  
  // Progress
  completed: boolean
  attempts: number
}
```

### Hooks
```typescript
// hooks/useLessonState.ts
export function useLessonState(lessonId: string)

// hooks/useDrawingCanvas.ts (already exists)
export function useDrawingCanvas()

// hooks/useLessonProgress.ts (already exists)
export function useLessonProgress()

// hooks/useAIEvaluation.ts
export function useAIEvaluation()
```

## Benefits

### User Experience
✅ No page reloads - smooth transitions
✅ Faster learning flow
✅ Better context retention
✅ Modern, app-like feel
✅ Reduced cognitive load

### Performance
✅ Single page load
✅ Lazy load tabs
✅ Optimized rendering
✅ Better caching

### Development
✅ Easier to maintain
✅ Better code organization
✅ Reusable components
✅ Clearer state management

## Migration Strategy

### Option 1: Gradual Migration
1. Create new lesson page alongside old
2. Test with beta users
3. Migrate lessons one by one
4. Deprecate old system

### Option 2: Big Bang
1. Build complete new system
2. Migrate all lessons at once
3. Remove old system
4. Deploy

**Recommendation**: Option 1 (Gradual Migration)

## Timeline Estimate

- Phase 1: 2-3 days
- Phase 2: 3-4 days
- Phase 3: 3-4 days
- Phase 4: 2-3 days
- Phase 5: 1-2 days
- Phase 6: 2-3 days

**Total**: 13-19 days for complete implementation

## Next Steps

1. Review and approve architecture
2. Create component structure
3. Build core layout
4. Implement tab navigation
5. Add practice canvas
6. Integrate AI evaluation
7. Test and refine
8. Deploy

## Questions to Answer

1. Should we keep old lesson system during migration?
2. What's the priority order for features?
3. Do we need A/B testing?
4. What's the rollout strategy?
5. How do we handle existing user progress?

---

**Ready to start implementation?** Let me know and I'll begin building the new lesson workspace!
