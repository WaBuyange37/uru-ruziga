import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userDrawing, referenceImage, characterName, strokeGuide } = body

    if (!userDrawing) {
      return NextResponse.json(
        { error: 'User drawing is required' },
        { status: 400 }
      )
    }

    // Construct evaluation prompt
    const prompt = `You are an expert Umwero script teacher evaluating a student's handwriting practice.

Character being practiced: "${characterName}"

Stroke guide instructions:
${strokeGuide?.join('\n') || 'Follow the reference image for proper stroke order.'}

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
}`

    // Prepare messages for Vision API
    const messages: any[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: userDrawing,
              detail: 'high'
            }
          }
        ]
      }
    ]

    // Add reference image if provided
    if (referenceImage) {
      messages[0].content.push({
        type: 'image_url',
        image_url: {
          url: referenceImage,
          detail: 'high'
        }
      })
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-4-vision-preview'
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse JSON response
    let evaluation
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      evaluation = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      // Fallback: create structured response from text
      evaluation = {
        score: 75,
        strengths: ['Attempted the character'],
        improvements: ['Continue practicing'],
        feedback: content,
        passed: true
      }
    }

    return NextResponse.json({
      success: true,
      evaluation
    })

  } catch (error: any) {
    console.error('Error evaluating drawing:', error)
    
    // Check for specific API errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to evaluate drawing',
        details: error?.message 
      },
      { status: 500 }
    )
  }
}
