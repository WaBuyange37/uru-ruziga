// lib/evaluation-api.ts
// Client library for Umwero Handwriting Evaluation API

interface EvaluationRequest {
  character: string;
  image: string; // base64 encoded
}

interface EvaluationResponse {
  score: number; // 0-100
}

interface EvaluationError {
  error: string;
}

// Map Latin to Umwero characters
const LATIN_TO_UMWERO: Record<string, string> = {
  'a': '"',   // Umwero vowel A
  'u': ':',   // Umwero vowel U
  'o': '{',   // Umwero vowel O
  'e': '|',   // Umwero vowel E
  'i': '}',   // Umwero vowel I
  // Add consonants as needed
};

export class HandwritingEvaluationClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl?: string, timeout: number = 5000) {
    // Use environment variable or default to localhost
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_EVALUATION_API_URL || 'http://localhost:8000';
    this.timeout = timeout;
  }

  /**
   * Evaluate a user-drawn character
   * 
   * @param character - The Latin character (e.g., "a", "u", "o") - will be converted to Umwero
   * @param imageDataUrl - Base64-encoded image or data URL
   * @returns Promise with similarity score (0-100)
   */
  async evaluateCharacter(
    character: string,
    imageDataUrl: string
  ): Promise<EvaluationResponse> {
    // Validate inputs
    if (!character) {
      throw new Error('Character is required');
    }
    if (!imageDataUrl) {
      throw new Error('Image data is required');
    }

    // CRITICAL: Ensure image is full data URL with header
    if (!imageDataUrl.startsWith('data:image/')) {
      throw new Error('Image must be a data URL (data:image/png;base64,...)');
    }

    // Convert Latin to Umwero character
    const umweroChar = LATIN_TO_UMWERO[character.toLowerCase()] || character;
    
    console.log('Sending to API:', {
      latinChar: character,
      umweroChar: umweroChar,
      imageLength: imageDataUrl.length,
      imagePrefix: imageDataUrl.substring(0, 50)
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/evaluate-character`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character: umweroChar, // Send Umwero character to API
          image: imageDataUrl,
        } as EvaluationRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData: EvaluationError = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: EvaluationResponse = await response.json();
      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Evaluation request timed out after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred during evaluation');
    }
  }

  /**
   * Check if the evaluation service is healthy
   * 
   * @returns Promise<boolean> - true if service is operational
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Get service information
   * 
   * @returns Promise with service metadata
   */
  async getServiceInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service info');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Could not connect to evaluation service');
    }
  }
}

// Singleton instance
let evaluationClient: HandwritingEvaluationClient | null = null;

/**
 * Get or create evaluation client instance
 */
export function getEvaluationClient(): HandwritingEvaluationClient {
  if (!evaluationClient) {
    evaluationClient = new HandwritingEvaluationClient();
  }
  return evaluationClient;
}

/**
 * Hook for React components
 */
export function useEvaluationAPI() {
  const client = getEvaluationClient();

  const evaluateDrawing = async (character: string, canvas: HTMLCanvasElement) => {
    // Convert canvas to base64 data URL
    const imageDataUrl = canvas.toDataURL('image/png');
    
    // Call evaluation API
    const result = await client.evaluateCharacter(character, imageDataUrl);
    return result;
  };

  return {
    evaluateDrawing,
    healthCheck: client.healthCheck.bind(client),
    getServiceInfo: client.getServiceInfo.bind(client),
  };
}

/**
 * Score interpretation helper
 */
export function interpretScore(score: number): {
  level: 'excellent' | 'good' | 'fair' | 'needs-practice';
  color: string;
  message: string;
} {
  if (score >= 90) {
    return {
      level: 'excellent',
      color: 'green',
      message: 'Excellent! Your character is nearly perfect.',
    };
  } else if (score >= 70) {
    return {
      level: 'good',
      color: 'blue',
      message: 'Great work! You\'re very close.',
    };
  } else if (score >= 50) {
    return {
      level: 'fair',
      color: 'yellow',
      message: 'Good effort. Keep practicing.',
    };
  } else {
    return {
      level: 'needs-practice',
      color: 'red',
      message: 'Try following the guide overlay more closely.',
    };
  }
}