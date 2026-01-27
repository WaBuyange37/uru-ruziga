// lib/ai/canvasValidator.ts
// AI-powered Umwero character validation using TensorFlow.js

import * as tf from '@tensorflow/tfjs'

interface ValidationResult {
  isCorrect: boolean
  confidence: number
  feedback: string
  score: number // 0-100
}

/**
 * Simple image similarity checker using pixel-based comparison
 * For production, you'd want to train a proper CNN model on Umwero characters
 */
export class UmweroCanvasValidator {
  
  /**
   * Compare user drawing with reference character
   * @param userCanvas - Canvas with user's drawing
   * @param referenceChar - The correct Umwero character
   * @returns Validation result with score and feedback
   */
  async validateDrawing(
    userCanvas: HTMLCanvasElement,
    referenceChar: string
  ): Promise<ValidationResult> {
    try {
      // Create reference canvas
      const refCanvas = document.createElement('canvas')
      refCanvas.width = userCanvas.width
      refCanvas.height = userCanvas.height
      const refCtx = refCanvas.getContext('2d')
      
      if (!refCtx) {
        throw new Error('Could not create reference canvas context')
      }
      
      // Draw reference character
      refCtx.fillStyle = '#FFFFFF'
      refCtx.fillRect(0, 0, refCanvas.width, refCanvas.height)
      refCtx.font = '280px UMWEROalpha, serif'
      refCtx.fillStyle = '#8B4513'
      refCtx.textAlign = 'center'
      refCtx.textBaseline = 'middle'
      refCtx.fillText(referenceChar, refCanvas.width / 2, refCanvas.height / 2)
      
      // Get image data from both canvases
      const userCtx = userCanvas.getContext('2d')
      if (!userCtx) {
        throw new Error('User canvas context not available')
      }
      
      const userImageData = userCtx.getImageData(0, 0, userCanvas.width, userCanvas.height)
      const refImageData = refCtx.getImageData(0, 0, refCanvas.width, refCanvas.height)
      
      // Calculate similarity using TensorFlow.js
      const score = await this.calculateSimilarity(userImageData, refImageData)
      
      // Generate feedback based on score
      const result = this.generateFeedback(score)
      
      return result
    } catch (error) {
      console.error('Error validating drawing:', error)
      return {
        isCorrect: false,
        confidence: 0,
        feedback: 'Unable to validate drawing. Please try again.',
        score: 0
      }
    }
  }
  
  /**
   * Calculate similarity between two images using TensorFlow.js
   */
  private async calculateSimilarity(
    userImageData: ImageData,
    refImageData: ImageData
  ): Promise<number> {
    // Convert ImageData to tensors
    const userTensor = tf.browser.fromPixels(userImageData)
    const refTensor = tf.browser.fromPixels(refImageData)
    
    // Convert to grayscale and normalize
    const userGray = this.toGrayscale(userTensor)
    const refGray = this.toGrayscale(refTensor)
    
    // Calculate structural similarity
    const similarity = await this.structuralSimilarity(userGray, refGray)
    
    // Clean up tensors
    userTensor.dispose()
    refTensor.dispose()
    userGray.dispose()
    refGray.dispose()
    
    return similarity
  }
  
  /**
   * Convert RGB tensor to grayscale
   */
  private toGrayscale(tensor: tf.Tensor3D): tf.Tensor2D {
    return tf.tidy(() => {
      const [r, g, b] = tf.split(tensor, 3, 2)
      // Grayscale formula: 0.299*R + 0.587*G + 0.114*B
      const gray = tf.add(
        tf.add(
          tf.mul(r, 0.299),
          tf.mul(g, 0.587)
        ),
        tf.mul(b, 0.114)
      )
      return tf.squeeze(gray, [2]) as tf.Tensor2D
    })
  }
  
  /**
   * Calculate Structural Similarity Index (SSIM)
   * Simplified version - for production, use full SSIM algorithm
   */
  private async structuralSimilarity(
    img1: tf.Tensor2D,
    img2: tf.Tensor2D
  ): Promise<number> {
    return tf.tidy(() => {
      // Normalize images to [0, 1]
      const norm1 = tf.div(img1, 255)
      const norm2 = tf.div(img2, 255)
      
      // Calculate mean squared error
      const diff = tf.sub(norm1, norm2)
      const squared = tf.square(diff)
      const mse = tf.mean(squared)
      
      // Convert MSE to similarity score (0-100)
      // Lower MSE = higher similarity
      const similarity = tf.mul(tf.sub(1, mse), 100)
      
      return similarity.dataSync()[0]
    })
  }
  
  /**
   * Generate feedback based on similarity score
   */
  private generateFeedback(score: number): ValidationResult {
    if (score >= 85) {
      return {
        isCorrect: true,
        confidence: score,
        feedback: 'Excellent! Your writing is very accurate! 🎉',
        score: Math.round(score)
      }
    } else if (score >= 70) {
      return {
        isCorrect: true,
        confidence: score,
        feedback: 'Great job! Your character looks good! ✨',
        score: Math.round(score)
      }
    } else if (score >= 55) {
      return {
        isCorrect: true,
        confidence: score,
        feedback: 'Good attempt! Keep practicing to improve! 💪',
        score: Math.round(score)
      }
    } else if (score >= 40) {
      return {
        isCorrect: false,
        confidence: score,
        feedback: 'Not quite there yet. Try to follow the reference more closely. 🤔',
        score: Math.round(score)
      }
    } else {
      return {
        isCorrect: false,
        confidence: score,
        feedback: 'Keep trying! Pay attention to the stroke order and shape. 📝',
        score: Math.round(score)
      }
    }
  }
  
  /**
   * Alternative: Use pre-trained model (if you have one)
   * This would be more accurate but requires training data
   */
  async validateWithModel(
    userCanvas: HTMLCanvasElement,
    expectedChar: string
  ): Promise<ValidationResult> {
    // Load your trained model
    // const model = await tf.loadLayersModel('/models/umwero-classifier/model.json')
    
    // Preprocess image
    // const tensor = tf.browser.fromPixels(userCanvas)
    // const preprocessed = this.preprocessImage(tensor)
    
    // Make prediction
    // const prediction = model.predict(preprocessed) as tf.Tensor
    
    // Get class probabilities
    // const probabilities = await prediction.data()
    
    // This is a placeholder - implement actual model logic
    throw new Error('Model-based validation not yet implemented')
  }
}

// Export singleton instance
export const canvasValidator = new UmweroCanvasValidator()