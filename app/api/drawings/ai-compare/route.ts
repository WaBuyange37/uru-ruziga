import { NextRequest, NextResponse } from 'next/server';

// Anthropic API disabled - use OpenAI Vision instead
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Anthropic API disabled. Use OpenAI Vision endpoint instead.' },
    { status: 410 }
  );
}
