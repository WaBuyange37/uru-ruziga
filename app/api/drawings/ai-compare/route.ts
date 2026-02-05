import { NextRequest, NextResponse } from 'next/server';

interface ComparisonRequest {
  userDrawingBase64: string;
  referenceCharacterBase64: string;
  vowel: string;
  umweroChar: string;
}

interface AIResponse {
  score: number;
  feedback: string;
  isCorrect: boolean;
  details: {
    shapeMatch: number;
    strokeQuality: number;
    proportions: number;
    overallSimilarity: number;
  };
}

interface ComparisonResponse {
  score: number;
  feedback: string;
  isCorrect: boolean;
  details: {
    shapeMatch: number;
    strokeQuality: number;
    proportions: number;
    overallSimilarity: number;
  };
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

    // Create comparison prompt
    const comparisonPrompt = `You are an expert at evaluating handwritten character drawings, especially for the Umwero writing system.

Your task is to compare two images:
1. The LEFT image shows the user's handwritten attempt at drawing the Umwero character for "${vowel}"
2. The RIGHT image shows the correct reference form of the Umwero character

Analyze the user's drawing against the reference and provide:
1. A numerical score from 0-100 where:
   - 0-20: Very poor match (incomplete, missing strokes, wrong shape)
   - 21-40: Poor match (basic shape present but missing details or proportions off)
   - 41-60: Fair match (recognizable but needs refinement, some strokes misplaced)
   - 61-75: Good match (close to reference, minor differences in stroke weight or spacing)
   - 76-85: Very good match (nearly perfect, only tiny imperfections)
   - 86-100: Excellent match (nearly identical to reference)

2. Specific feedback on:
   - Shape Match (how well the overall shape matches): 0-100
   - Stroke Quality (line smoothness, weight consistency): 0-100
   - Proportions (relative sizing of components): 0-100
   - Overall Similarity: 0-100

3. Constructive feedback on what the user did well and what to improve

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "feedback": "<detailed feedback string>",
  "isCorrect": <true if score >= 75, false otherwise>,
  "details": {
    "shapeMatch": <number 0-100>,
    "strokeQuality": <number 0-100>,
    "proportions": <number 0-100>,
    "overallSimilarity": <number 0-100>
  }
}`;

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
                text: comparisonPrompt,
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
      feedback: result.feedback,
      isCorrect: result.isCorrect,
      details: result.details,
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
