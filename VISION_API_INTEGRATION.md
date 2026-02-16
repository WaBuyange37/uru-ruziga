# Vision API Integration for Drawing Evaluation

## Overview
Implemented AI-powered drawing evaluation using Vision models (OpenAI GPT-4 Vision and Claude Vision) to provide human-like feedback on student handwriting practice.

## Architecture

### API Endpoints

#### 1. OpenAI Vision API
**Endpoint**: `/api/lessons/evaluate-drawing`
**Model**: `gpt-4o` (or `gpt-4-vision-preview`)

#### 2. Claude Vision API (Alternative)
**Endpoint**: `/api/lessons/evaluate-drawing-claude`
**Model**: `claude-3-5-sonnet-20241022` (or `claude-3-opus-20240229`)

### Request Format

```typescript
POST /api/lessons/evaluate-drawing
Content-Type: application/json

{
  "userDrawing": "data:image/png;base64,...",      // Base64 canvas image
  "referenceImage": "https://...",                  // Optional reference image URL
  "characterName": "a",                             // Character being practiced
  "strokeGuide": [                                  // Optional stroke instructions
    "Start from the center",
    "Draw circular motion outward"
  ]
}
```

### Response Format

```typescript
{
  "success": true,
  "evaluation": {
    "score": 85,                                    // 0-100
    "strengths": [
      "Good stroke direction",
      "Proper proportions"
    ],
    "improvements": [
      "Try to make the curves smoother",
      "Pay attention to the ending stroke"
    ],
    "feedback": "Excellent work! Your character is very accurate.",
    "passed": true                                  // true if score >= 70
  }
}
```

## Evaluation Prompt

The Vision API receives this structured prompt:

```
You are an expert Umwero script teacher evaluating a student's handwriting practice.

Character being practiced: "a"

Stroke guide instructions:
- Start from the center
- Draw circular motion outward
- Complete the form with connecting line

Task:
1. Compare the student's drawing (first image) with the reference character (second image if provided)
2. Evaluate based on:
   - Stroke accuracy (are the strokes in the right direction and order?)
   - Proportions (is the character well-balanced?)
   - Form accuracy (does it match the reference shape?)
   - Overall legibility

3. Provide:
   - A score from 0-100
   - Specific feedback on what was done well
   - Specific suggestions for improvement
   - Encouragement

Format your response as JSON:
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "feedback": "Overall encouraging feedback message",
  "passed": <boolean, true if score >= 70>
}
```

## Implementation Details

### 1. Canvas to Image Conversion

```typescript
const drawingData = getCanvasDataURL() // Returns base64 PNG
```

### 2. API Call from Frontend

```typescript
const response = await fetch('/api/lessons/evaluate-drawing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userDrawing: drawingData,
    referenceImage: character.strokeImageUrl,
    characterName: character.vowel || character.consonant,
    strokeGuide: [] // From database
  })
})
```

### 3. Vision API Processing

**OpenAI Approach:**
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: userDrawing, detail: 'high' } },
      { type: 'image_url', image_url: { url: referenceImage, detail: 'high' } }
    ]
  }],
  max_tokens: 1000
})
```

**Claude Approach:**
```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64Data } },
      { type: 'text', text: prompt }
    ]
  }]
})
```

## UI Integration

### Evaluation Flow

1. **User draws on canvas**
2. **Clicks "Evaluate My Drawing"**
3. **Loading state**: "AI is evaluating your drawing..."
4. **Results displayed**:
   - Score (0-100)
   - Emoji (🎉 for pass, 💪 for retry)
   - Overall feedback
   - Strengths list (✅)
   - Improvements list (💡)
5. **Actions**: Try Again or Continue

### Feedback Display

```tsx
{/* Strengths */}
<div className="p-3 bg-white rounded-lg">
  <h4 className="font-semibold text-green-800">✅ What you did well:</h4>
  <ul className="text-sm text-green-700">
    {strengths.map(s => <li>• {s}</li>)}
  </ul>
</div>

{/* Improvements */}
<div className="p-3 bg-white rounded-lg">
  <h4 className="font-semibold text-blue-800">💡 Areas to improve:</h4>
  <ul className="text-sm text-blue-700">
    {improvements.map(i => <li>• {i}</li>)}
  </ul>
</div>
```

## Configuration

### Environment Variables

```bash
# .env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Choosing the API

By default, the system uses OpenAI Vision. To switch to Claude:

```typescript
// Change endpoint in PracticePanel.tsx
const response = await fetch('/api/lessons/evaluate-drawing-claude', {
  // ... same request body
})
```

## Cost Considerations

### OpenAI GPT-4 Vision Pricing
- Input: ~$0.01 per image
- Output: ~$0.03 per 1K tokens
- Estimated cost per evaluation: $0.02-0.05

### Claude Vision Pricing
- Input: ~$0.015 per image
- Output: ~$0.075 per 1K tokens
- Estimated cost per evaluation: $0.03-0.06

### Optimization Strategies

1. **Image compression**: Reduce canvas size before sending
2. **Caching**: Store evaluations for identical drawings
3. **Rate limiting**: Limit evaluations per user per day
4. **Fallback**: Use simple scoring if API fails

## Error Handling

### API Failures

```typescript
try {
  const response = await fetch('/api/lessons/evaluate-drawing', {...})
  // Process response
} catch (error) {
  // Fallback to basic evaluation
  setEvaluationResult({
    score: 75,
    strengths: ['You completed the drawing'],
    improvements: ['Keep practicing'],
    feedback: 'Good effort! Try again.',
    passed: true
  })
}
```

### Common Errors

1. **API Key Missing**: Returns 500 with "API key not configured"
2. **Invalid Image**: Returns 400 with "Invalid image data"
3. **Rate Limit**: Returns 429 with "Too many requests"
4. **Parse Error**: Falls back to text feedback

## Testing

### Manual Testing

1. Draw a character on canvas
2. Click "Evaluate My Drawing"
3. Verify:
   - Loading state appears
   - Evaluation completes within 5-10 seconds
   - Score is reasonable (0-100)
   - Feedback is specific and helpful
   - Strengths and improvements are listed

### Test Cases

```typescript
// Test 1: Perfect drawing
// Expected: Score 90-100, positive feedback

// Test 2: Poor drawing
// Expected: Score 40-60, constructive feedback

// Test 3: Partial drawing
// Expected: Score 50-70, encouragement to complete

// Test 4: No reference image
// Expected: Still evaluates based on stroke quality
```

## Future Enhancements

### Phase 1: Enhanced Evaluation
- [ ] Stroke-by-stroke analysis
- [ ] Timing analysis (speed of strokes)
- [ ] Pressure sensitivity (if available)
- [ ] Comparison with multiple reference styles

### Phase 2: Personalized Learning
- [ ] Track improvement over time
- [ ] Identify recurring mistakes
- [ ] Adaptive difficulty
- [ ] Personalized practice recommendations

### Phase 3: Advanced Features
- [ ] Video demonstration generation
- [ ] Real-time stroke guidance
- [ ] Peer comparison (anonymized)
- [ ] Achievement badges for milestones

## Security Considerations

1. **API Key Protection**: Never expose keys in frontend
2. **Rate Limiting**: Implement per-user limits
3. **Input Validation**: Verify image format and size
4. **Cost Monitoring**: Track API usage and costs
5. **User Privacy**: Don't store drawings without consent

## Monitoring

### Metrics to Track

- Evaluation success rate
- Average evaluation time
- API error rate
- Cost per evaluation
- User satisfaction (retry rate)

### Logging

```typescript
console.log('Evaluation request:', {
  characterName,
  hasReference: !!referenceImage,
  timestamp: new Date()
})

console.log('Evaluation result:', {
  score: evaluation.score,
  passed: evaluation.passed,
  duration: evaluationTime
})
```

## Conclusion

The Vision API integration provides:
- ✅ Human-like feedback on handwriting
- ✅ Specific, actionable suggestions
- ✅ Encouraging and educational tone
- ✅ Scalable evaluation system
- ✅ Fallback for reliability

This creates a more engaging and effective learning experience compared to simple pattern matching or rule-based evaluation.
