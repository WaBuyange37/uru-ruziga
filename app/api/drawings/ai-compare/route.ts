import { NextRequest, NextResponse } from 'next/server';

interface ComparisonRequest {
  userDrawingBase64: string;
  referenceCharacterBase64: string;
  vowel: string;
  umweroChar: string;
}

interface AIResponse {
  score: number;
  shapeAccuracy: number;
  strokeDirection: number;
  proportionAccuracy: number;
  feedback: string;
  improvementTips: string[];
  isCorrect: boolean;
  confidence: number;
}

interface ComparisonResponse {
  score: number;
  shapeAccuracy: number;
  strokeDirection: number;
  proportionAccuracy: number;
  feedback: string;
  improvementTips: string[];
  isCorrect: boolean;
  confidence: number;
  evaluationType: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ComparisonRequest = await request.json();
    const { userDrawingBase64, referenceCharacterBase64, vowel, umweroChar } = body;

    if (!userDrawingBase64 || !referenceCharacterBase64) {
      return NextResponse.json(
        { error: 'Missing required image data' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Create enhanced evaluation prompt
    const evaluationPrompt = `You are an expert Umwero writing instructor with deep understanding of Rwandan cultural heritage and the revolutionary Umwero script created by Kwizera Mugisha.

Your task is to evaluate a student's handwritten attempt at drawing an Umwero character with human-like visual reasoning and cultural encouragement.

IMAGES PROVIDED:
- LEFT: Student's handwritten attempt
- RIGHT: Reference character for "${vowel}" (Umwero: ${umweroChar})

EVALUATION CRITERIA:
1. **Shape Accuracy** (0-100): How closely the overall form matches the reference
2. **Stroke Direction** (0-100): Correctness of stroke directions and order
3. **Proportion Accuracy** (0-100): Proper sizing and spatial relationships
4. **Overall Score** (0-100): Weighted combination of all factors

SCORING GUIDELINES:
- 0-10: Just a dot, empty canvas, or completely unrelated marks
- 11-25: Basic attempt but missing fundamental structure
- 26-40: Recognizable effort but major structural issues
- 41-60: Getting closer - basic shape present but needs refinement
- 61-75: Good attempt - minor issues with proportions or stroke quality
- 76-85: Very good - nearly correct with small imperfections
- 86-95: Excellent - almost perfect match to reference
- 96-100: Perfect - indistinguishable from reference

CULTURAL ENCOURAGEMENT:
- Connect learning to Rwandan cultural values
- Mention the significance of preserving Kinyarwanda through Umwero
- Encourage persistence as part of the cultural renaissance
- Reference Kwizera Mugisha's vision when appropriate

ANALYSIS APPROACH:
1. First detect if the user actually drew something meaningful
2. Analyze the structural components step by step
3. Compare stroke directions and flow
4. Evaluate proportions and spatial relationships
5. Provide specific, actionable feedback
6. Include culturally motivating encouragement

RESPOND ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "shapeAccuracy": <number 0-100>,
  "strokeDirection": <number 0-100>,
  "proportionAccuracy": <number 0-100>,
  "feedback": "<detailed culturally-aware feedback>",
  "improvementTips": [
    "<specific tip 1>",
    "<specific tip 2>",
    "<specific tip 3>"
  ],
  "isCorrect": <true if score >= 75, false otherwise>,
  "confidence": <number 0-1 representing evaluation certainty>
}

IMPORTANT: 
- If the drawing is just a dot or nearly empty, score must be below 10
- Use visual similarity reasoning, not pattern matching
- Provide human-like analysis that shows understanding of the learning process
- Include at least 3 specific improvement tips
- Make feedback encouraging and culturally relevant`;

    // Call Claude API with vision
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: evaluationPrompt,
              },
              {
                type: 'text',
                text: 'USER DRAWING (LEFT):',
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: userDrawingBase64,
                },
              },
              {
                type: 'text',
                text: 'REFERENCE CHARACTER (RIGHT):',
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: referenceCharacterBase64,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json(
        { error: 'AI service error', details: error },
        { status: response.status }
      );
    }

    const apiResponse = await response.json() as { content: Array<{ type: string; text?: string }> };
    
    // Parse the AI response
    const textContent = apiResponse.content.find((block: { type: string; text?: string }) => block.type === 'text');
    if (!textContent || textContent.type !== 'text' || !textContent.text) {
      return NextResponse.json(
        { error: 'Invalid response from AI' },
        { status: 500 }
      );
    }

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from AI response:', textContent.text);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const result: AIResponse = JSON.parse(jsonMatch[0]);
    const comparisonResult: ComparisonResponse = {
      score: result.score,
      shapeAccuracy: result.shapeAccuracy,
      strokeDirection: result.strokeDirection,
      proportionAccuracy: result.proportionAccuracy,
      feedback: result.feedback,
      improvementTips: result.improvementTips,
      isCorrect: result.isCorrect,
      confidence: result.confidence,
      evaluationType: 'AI'
    };

    return NextResponse.json(comparisonResult);
  } catch (error) {
    console.error('AI comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to process comparison', details: String(error) },
      { status: 500 }
    );
  }
}
