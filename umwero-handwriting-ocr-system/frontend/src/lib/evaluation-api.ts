/**
 * API client for handwriting evaluation service
 * Handles communication with the FastAPI backend
 */

export interface EvaluationRequest {
  character: string;
  image: string; // base64 data URL
  sessionId?: string;
  userId?: string;
}

export interface FeedbackItem {
  category: string;
  severity: string;
  message: string;
  suggestion: string;
  confidence: number;
}

export interface EvaluationResponse {
  score: number; // 0-100
  passed: boolean; // score >= 70
  feedback: string[];
  detailed_feedback: FeedbackItem[];
  confidence: number;
  processing_time_ms: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id?: string;
  };
}

class EvaluationApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:8000', timeout: number = 10000) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = timeout;
  }

  /**
   * Evaluate a handwriting sample
   */
  async evaluateCharacter(request: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      // Validate request
      this.validateRequest(request);

      const response = await this.fetchWithTimeout('/api/evaluate-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const result: EvaluationResponse = await response.json();
      
      // Validate response
      this.validateResponse(result);
      
      return result;

    } catch (error) {
      if (error instanceof EvaluationApiError) {
        throw error;
      }
      
      // Handle network errors, timeouts, etc.
      throw new EvaluationApiError(
        'NETWORK_ERROR',
        `Failed to evaluate character: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      );
    }
  }

  /**
   * Get reference image for a character
   */
  async getReferenceImage(character: string): Promise<{ image_url: string; cached: boolean }> {
    try {
      const response = await this.fetchWithTimeout(`/api/reference/${encodeURIComponent(character)}`);
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();

    } catch (error) {
      if (error instanceof EvaluationApiError) {
        throw error;
      }
      
      throw new EvaluationApiError(
        'NETWORK_ERROR',
        `Failed to get reference image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { character, originalError: error }
      );
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.fetchWithTimeout('/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      throw new EvaluationApiError(
        'HEALTH_CHECK_FAILED',
        `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      );
    }
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Validate evaluation request
   */
  private validateRequest(request: EvaluationRequest): void {
    if (!request.character || request.character.length === 0) {
      throw new EvaluationApiError(
        'INVALID_REQUEST',
        'Character is required and cannot be empty'
      );
    }

    if (!request.image || !request.image.startsWith('data:image/')) {
      throw new EvaluationApiError(
        'INVALID_REQUEST',
        'Image must be a valid data URL (data:image/...)'
      );
    }

    // Check image size (rough estimate)
    const base64Data = request.image.split(',')[1];
    if (!base64Data) {
      throw new EvaluationApiError(
        'INVALID_REQUEST',
        'Invalid base64 image data'
      );
    }

    // Estimate size (base64 is ~33% larger than binary)
    const estimatedSize = (base64Data.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    if (estimatedSize > maxSize) {
      throw new EvaluationApiError(
        'INVALID_REQUEST',
        `Image too large: ${Math.round(estimatedSize / 1024)}KB (max: ${maxSize / 1024}KB)`
      );
    }
  }

  /**
   * Validate evaluation response
   */
  private validateResponse(response: EvaluationResponse): void {
    if (typeof response.score !== 'number' || response.score < 0 || response.score > 100) {
      throw new EvaluationApiError(
        'INVALID_RESPONSE',
        'Invalid score in response (must be 0-100)'
      );
    }

    if (typeof response.passed !== 'boolean') {
      throw new EvaluationApiError(
        'INVALID_RESPONSE',
        'Invalid passed field in response (must be boolean)'
      );
    }

    if (!Array.isArray(response.feedback)) {
      throw new EvaluationApiError(
        'INVALID_RESPONSE',
        'Invalid feedback field in response (must be array)'
      );
    }

    if (typeof response.confidence !== 'number' || response.confidence < 0 || response.confidence > 1) {
      throw new EvaluationApiError(
        'INVALID_RESPONSE',
        'Invalid confidence in response (must be 0-1)'
      );
    }
  }

  /**
   * Handle error responses from API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ApiError;
    
    try {
      errorData = await response.json();
    } catch {
      // If we can't parse JSON, create a generic error
      throw new EvaluationApiError(
        'HTTP_ERROR',
        `HTTP ${response.status}: ${response.statusText}`,
        { status: response.status, statusText: response.statusText }
      );
    }

    throw new EvaluationApiError(
      errorData.error.code,
      errorData.error.message,
      errorData.error.details
    );
  }
}

/**
 * Custom error class for API errors
 */
export class EvaluationApiError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'EvaluationApiError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Utility functions for image processing
 */
export class ImageUtils {
  /**
   * Validate base64 image data
   */
  static validateBase64Image(dataUrl: string): boolean {
    if (!dataUrl.startsWith('data:image/')) {
      return false;
    }

    const base64Data = dataUrl.split(',')[1];
    if (!base64Data) {
      return false;
    }

    try {
      // Try to decode base64
      atob(base64Data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get image dimensions from data URL
   */
  static getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = dataUrl;
    });
  }

  /**
   * Resize image to target dimensions
   */
  static resizeImage(dataUrl: string, targetWidth: number, targetHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };
      
      img.src = dataUrl;
    });
  }
}

/**
 * Default API client instance
 */
export const evaluationApi = new EvaluationApiClient();

/**
 * Hook for React components to use the evaluation API
 */
export const useEvaluationApi = () => {
  return {
    evaluateCharacter: evaluationApi.evaluateCharacter.bind(evaluationApi),
    getReferenceImage: evaluationApi.getReferenceImage.bind(evaluationApi),
    healthCheck: evaluationApi.healthCheck.bind(evaluationApi),
    EvaluationApiError,
    ImageUtils,
  };
};

export default EvaluationApiClient;