import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
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

    // Extract base64 data from data URL
    const extractBase64 = (dataUrl: string) => {
      const matches = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/)
      if (!matches) throw new Error('Invalid image data URL')
      return {
        type: matches[1] === 'jpg' ? 'jpeg' : matches[1],
        data: matches[2]
      }
    }

    const userImageData = extractBase64(userDrawing)

    // Construct evaluation prompt
    const prompt = `You are an expert Umwero script teacher evaluating a student's handwriting practice.

Character being practiced: "${characterName}"

Stroke guide instructions:
${strokeGuide?.join('\n') || 'Follow the reference image for proper stroke order.'}

Task:
1. Analyze the student's drawing carefully
2. Evaluate based on:
   - Stroke accuracy (are the strokes in the right direction and order?)
   - Proportions (is the character well-balanced?)
   - Form accuracy (does it match the expected shape?)
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

    // Prepare content array
    const content: any[] = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: `image/${userImageData.type}`,
          data: userImageData.data
        }
      },
      {
        type: 'text',
        text: prompt
      }
    ]

    // Add reference image if provided
    if (referenceImage) {
      const refImageData = extractBase64(referenceImage)
      content.unshift({
        type: 'image',
        source: {
          type: 'base64',
          media_type: `image/${refImageData.type}`,
          data: refImageData.data
        }
      })
    }

    // Call Claude Vision API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // or 'claude-3-opus-20240229'
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: content
        }
      ]
    })

    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON response
    let evaluation
    try {
      const jsonMatch = textContent.text.match(/```json\n([\s\S]*?)\n```/) || textContent.text.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : textContent.text
      evaluation = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text)
      evaluation = {
        score: 75,
        strengths: ['Attempted the character'],
        improvements: ['Continue practicing'],
        feedback: textContent.text,
        passed: true
      }
    }

    return NextResponse.json({
      success: true,
      evaluation
    })

  } catch (error: any) {
    console.error('Error evaluating drawing with Claude:', error)
    
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
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
