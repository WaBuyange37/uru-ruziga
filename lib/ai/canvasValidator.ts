// lib/ai/canvasValidator.ts
// AI-powered Umwero character validation using advanced computer vision techniques

import * as tf from '@tensorflow/tfjs'

interface ValidationResult {
  isCorrect: boolean
  confidence: number
  feedback: string
  score: number // 0-100
  details?: {
    shapeMatch: number
    strokeMatch: number
    positionMatch: number
    sizeMatch: number
  }
}

/**
 * Advanced Umwero character validator using multiple CV techniques
 * Similar to face recognition, we check:
 * 1. Shape/Structure (like facial features)
 * 2. Key points/landmarks (like eyes, nose positions)
 * 3. Proportions (like face ratios)
 * 4. Edge detection (like face contours)
 */
export class UmweroCanvasValidator {
  
  /**
   * Compare user drawing with reference character using multiple validation techniques
   */
  async validateDrawing(
    userCanvas: HTMLCanvasElement,
    referenceChar: string
  ): Promise<ValidationResult> {
    try {
      // Create reference canvas
      const refCanvas = this.createReferenceCanvas(userCanvas, referenceChar)
      
      // Get image data
      const userCtx = userCanvas.getContext('2d')
      const refCtx = refCanvas.getContext('2d')
      
      if (!userCtx || !refCtx) {
        throw new Error('Canvas context not available')
      }
      
      const userImageData = userCtx.getImageData(0, 0, userCanvas.width, userCanvas.height)
      const refImageData = refCtx.getImageData(0, 0, refCanvas.width, refCanvas.height)
      
      // Check if user actually drew something
      const hasDrawing = this.checkIfDrawn(userImageData)
      if (!hasDrawing) {
        return {
          isCorrect: false,
          confidence: 0,
          feedback: 'Please draw the character before submitting! ✏️',
          score: 0
        }
      }
      
      // Run multiple validation checks (like face recognition)
      const shapeScore = await this.validateShape(userImageData, refImageData)
      const edgeScore = await this.validateEdges(userImageData, refImageData)
      const structureScore = await this.validateStructure(userImageData, refImageData)
      const densityScore = await this.validateDensity(userImageData, refImageData)
      
      // Weighted combination (shape and edges are most important)
      const finalScore = (
        shapeScore * 0.35 +      // Shape similarity (35%)
        edgeScore * 0.35 +       // Edge/contour matching (35%)
        structureScore * 0.20 +  // Overall structure (20%)
        densityScore * 0.10      // Ink density/thickness (10%)
      )
      
      // Generate detailed feedback
      const result = this.generateFeedback(finalScore, {
        shapeMatch: shapeScore,
        strokeMatch: edgeScore,
        positionMatch: structureScore,
        sizeMatch: densityScore
      })
      
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
   * Create reference canvas with the correct character
   */
  private createReferenceCanvas(userCanvas: HTMLCanvasElement, referenceChar: string): HTMLCanvasElement {
    const refCanvas = document.createElement('canvas')
    refCanvas.width = userCanvas.width
    refCanvas.height = userCanvas.height
    const refCtx = refCanvas.getContext('2d')!
    
    // Draw reference character
    refCtx.fillStyle = '#FFFFFF'
    refCtx.fillRect(0, 0, refCanvas.width, refCanvas.height)
    refCtx.font = '280px UMWEROalpha, serif'
    refCtx.fillStyle = '#8B4513'
    refCtx.textAlign = 'center'
    refCtx.textBaseline = 'middle'
    refCtx.fillText(referenceChar, refCanvas.width / 2, refCanvas.height / 2)
    
    return refCanvas
  }
  
  /**
   * Check if user actually drew something
   */
  private checkIfDrawn(imageData: ImageData): boolean {
    const pixels = imageData.data
    let nonWhitePixels = 0
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      
      // Check if pixel is not white (allowing some tolerance)
      if (r < 250 || g < 250 || b < 250) {
        nonWhitePixels++
      }
    }
    
    // Need at least 100 non-white pixels to consider it drawn
    return nonWhitePixels > 100
  }
  
  /**
   * Validate overall shape using contour matching
   */
  private async validateShape(userImageData: ImageData, refImageData: ImageData): Promise<number> {
    return tf.tidy(() => {
      const userTensor = tf.browser.fromPixels(userImageData)
      const refTensor = tf.browser.fromPixels(refImageData)
      
      // Convert to binary (black/white only)
      const userBinary = this.toBinary(userTensor)
      const refBinary = this.toBinary(refTensor)
      
      // Calculate Intersection over Union (IoU) - like face detection
      const intersection = tf.mul(userBinary, refBinary)
      const union = tf.add(userBinary, refBinary)
      
      const intersectionSum = tf.sum(intersection)
      const unionSum = tf.sum(union)
      
      // IoU score
      const iou = tf.div(intersectionSum, tf.add(unionSum, 1e-7))
      const score = tf.mul(iou, 100)
      
      const result = score.dataSync()[0]
      
      userTensor.dispose()
      refTensor.dispose()
      
      return Math.min(100, Math.max(0, result))
    })
  }
  
  /**
   * Validate edges/contours (most important for character recognition)
   */
  private async validateEdges(userImageData: ImageData, refImageData: ImageData): Promise<number> {
    return tf.tidy(() => {
      const userTensor = tf.browser.fromPixels(userImageData)
      const refTensor = tf.browser.fromPixels(refImageData)
      
      // Convert to grayscale
      const userGray = this.toGrayscale(userTensor)
      const refGray = this.toGrayscale(refTensor)
      
      // Apply edge detection (Sobel filter)
      const userEdges = this.detectEdges(userGray)
      const refEdges = this.detectEdges(refGray)
      
      // Normalize
      const userNorm = tf.div(userEdges, 255)
      const refNorm = tf.div(refEdges, 255)
      
      // Calculate edge similarity using correlation
      const correlation = this.calculateCorrelation(userNorm, refNorm)
      
      userTensor.dispose()
      refTensor.dispose()
      
      return Math.min(100, Math.max(0, correlation * 100))
    })
  }
  
  /**
   * Validate overall structure and positioning
   */
  private async validateStructure(userImageData: ImageData, refImageData: ImageData): Promise<number> {
    return tf.tidy(() => {
      const userTensor = tf.browser.fromPixels(userImageData)
      const refTensor = tf.browser.fromPixels(refImageData)
      
      const userGray = this.toGrayscale(userTensor)
      const refGray = this.toGrayscale(refTensor)
      
      // Calculate center of mass (like face center detection)
      const userCenter = this.getCenterOfMass(userGray)
      const refCenter = this.getCenterOfMass(refGray)
      
      // Calculate distance between centers
      const distance = Math.sqrt(
        Math.pow(userCenter.x - refCenter.x, 2) +
        Math.pow(userCenter.y - refCenter.y, 2)
      )
      
      // Convert distance to score (closer = better)
      const maxDistance = Math.sqrt(Math.pow(userImageData.width, 2) + Math.pow(userImageData.height, 2))
      const score = (1 - distance / maxDistance) * 100
      
      userTensor.dispose()
      refTensor.dispose()
      
      return Math.min(100, Math.max(0, score))
    })
  }
  
  /**
   * Validate ink density and stroke thickness
   */
  private async validateDensity(userImageData: ImageData, refImageData: ImageData): Promise<number> {
    return tf.tidy(() => {
      const userTensor = tf.browser.fromPixels(userImageData)
      const refTensor = tf.browser.fromPixels(refImageData)
      
      const userGray = this.toGrayscale(userTensor)
      const refGray = this.toGrayscale(refTensor)
      
      // Calculate average intensity
      const userMean = tf.mean(userGray)
      const refMean = tf.mean(refGray)
      
      // Calculate difference
      const diff = tf.abs(tf.sub(userMean, refMean))
      const similarity = tf.sub(255, diff)
      const score = tf.div(similarity, 255)
      
      const result = tf.mul(score, 100).dataSync()[0]
      
      userTensor.dispose()
      refTensor.dispose()
      
      return Math.min(100, Math.max(0, result))
    })
  }
  
  /**
   * Convert to binary (black/white)
   */
  private toBinary(tensor: tf.Tensor3D, threshold: number = 200): tf.Tensor2D {
    return tf.tidy(() => {
      const gray = this.toGrayscale(tensor)
      // Pixels darker than threshold become 1, others become 0
      const binary = tf.cast(tf.less(gray, threshold), 'float32')
      return binary
    })
  }
  
  /**
   * Convert RGB to grayscale
   */
  private toGrayscale(tensor: tf.Tensor3D): tf.Tensor2D {
    return tf.tidy(() => {
      const [r, g, b] = tf.split(tensor, 3, 2)
      const gray = tf.add(
        tf.add(tf.mul(r, 0.299), tf.mul(g, 0.587)),
        tf.mul(b, 0.114)
      )
      return tf.squeeze(gray, [2]) as tf.Tensor2D
    })
  }
  
  /**
   * Edge detection using Sobel filter
   */
  private detectEdges(grayTensor: tf.Tensor2D): tf.Tensor2D {
    return tf.tidy(() => {
      // Sobel kernels
      const sobelX = tf.tensor2d([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
      const sobelY = tf.tensor2d([[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
      
      // Reshape for conv2d
      const input = grayTensor.expandDims(0).expandDims(-1)
      const kernelX = sobelX.expandDims(2).expandDims(3)
      const kernelY = sobelY.expandDims(2).expandDims(3)
      
      // Apply convolution
      const gradX = tf.conv2d(input, kernelX, 1, 'same')
      const gradY = tf.conv2d(input, kernelY, 1, 'same')
      
      // Calculate magnitude
      const magnitude = tf.sqrt(tf.add(tf.square(gradX), tf.square(gradY)))
      
      return tf.squeeze(magnitude) as tf.Tensor2D
    })
  }
  
  /**
   * Calculate correlation between two tensors
   */
  private calculateCorrelation(tensor1: tf.Tensor2D, tensor2: tf.Tensor2D): number {
    return tf.tidy(() => {
      const mean1 = tf.mean(tensor1)
      const mean2 = tf.mean(tensor2)
      
      const centered1 = tf.sub(tensor1, mean1)
      const centered2 = tf.sub(tensor2, mean2)
      
      const numerator = tf.sum(tf.mul(centered1, centered2))
      const denominator = tf.sqrt(
        tf.mul(
          tf.sum(tf.square(centered1)),
          tf.sum(tf.square(centered2))
        )
      )
      
      const correlation = tf.div(numerator, tf.add(denominator, 1e-7))
      
      return correlation.dataSync()[0]
    })
  }
  
  /**
   * Get center of mass (like finding face center)
   */
  private getCenterOfMass(grayTensor: tf.Tensor2D): { x: number; y: number } {
    return tf.tidy(() => {
      const shape = grayTensor.shape
      const height = shape[0]
      const width = shape[1]
      
      // Invert (dark pixels have high weight)
      const inverted = tf.sub(255, grayTensor)
      
      // Create coordinate grids
      const xCoords = tf.range(0, width).expandDims(0).tile([height, 1])
      const yCoords = tf.range(0, height).expandDims(1).tile([1, width])
      
      // Calculate weighted sums
      const totalWeight = tf.sum(inverted)
      const xWeighted = tf.sum(tf.mul(xCoords, inverted))
      const yWeighted = tf.sum(tf.mul(yCoords, inverted))
      
      const centerX = tf.div(xWeighted, tf.add(totalWeight, 1e-7)).dataSync()[0]
      const centerY = tf.div(yWeighted, tf.add(totalWeight, 1e-7)).dataSync()[0]
      
      return { x: centerX, y: centerY }
    })
  }
  
  /**
   * Generate detailed feedback based on scores
   */
  private generateFeedback(
    score: number,
    details: {
      shapeMatch: number
      strokeMatch: number
      positionMatch: number
      sizeMatch: number
    }
  ): ValidationResult {
    // Much stricter thresholds
    if (score >= 80) {
      return {
        isCorrect: true,
        confidence: score,
        feedback: 'Excellent! Your writing is very accurate! 🎉',
        score: Math.round(score),
        details
      }
    } else if (score >= 65) {
      return {
        isCorrect: true,
        confidence: score,
        feedback: 'Great job! Your character looks good! ✨',
        score: Math.round(score),
        details
      }
    } else if (score >= 50) {
      return {
        isCorrect: false,
        confidence: score,
        feedback: 'Getting closer! Pay attention to the shape and strokes. 💪',
        score: Math.round(score),
        details
      }
    } else if (score >= 35) {
      return {
        isCorrect: false,
        confidence: score,
        feedback: 'Not quite right. Study the reference character carefully. 🤔',
        score: Math.round(score),
        details
      }
    } else {
      return {
        isCorrect: false,
        confidence: score,
        feedback: 'This doesn\'t match the character. Try following the reference more closely. 📝',
        score: Math.round(score),
        details
      }
    }
  }
}

// Export singleton instance
export const canvasValidator = new UmweroCanvasValidator()