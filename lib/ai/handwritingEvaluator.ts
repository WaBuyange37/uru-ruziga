// lib/ai/handwritingEvaluator.ts
// Deterministic image-based handwriting evaluation for Umwero characters

export interface EvaluationMetadata {
  characterId: string
  lessonId: string
}

export interface EvaluationResult {
  overallScore: number
  shapeAccuracy: number
  strokeConsistency: number
  proportionAccuracy: number
  alignmentAccuracy: number
  confidence: number
  isCorrect: boolean
  feedback: string
  improvementTips: string[]
  evaluationType: "algorithmic"
}

export interface ProcessedImage {
  data: Uint8ClampedArray
  width: number
  height: number
  binaryData: boolean[]
  bounds: BoundingBox
  centerOfMass: Point
  inkDensity: number
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

/**
 * Deterministic Umwero Handwriting Evaluator
 * Uses mathematical image processing for reliable character evaluation
 */
export class UmweroHandwritingEvaluator {
  private readonly TARGET_SIZE = 128
  private readonly BINARY_THRESHOLD = 200 // 0-255, above this is white
  private readonly MIN_DRAWING_AREA = 50 // Minimum pixels to consider valid drawing
  private readonly MAX_DRAWING_AREA_RATIO = 0.8 // Max % of canvas that can be filled
  private readonly MIN_OVERLAP_FOR_SCORE = 0.05 // 5% minimum overlap for any score

  /**
   * Main evaluation method - performs deterministic image analysis
   */
  async evaluateDrawing(
    userImageBuffer: Buffer,
    referenceImageBuffer: Buffer,
    metadata: EvaluationMetadata
  ): Promise<EvaluationResult> {
    try {
      // Step 1: Process both images
      const userImage = await this.processImage(userImageBuffer)
      const referenceImage = await this.processImage(referenceImageBuffer)

      // Step 2: Validate drawing has meaningful content
      if (!this.isValidDrawing(userImage)) {
        return this.createEmptyResult()
      }

      // Step 3: Compute deterministic metrics
      const shapeAccuracy = this.computeShapeAccuracy(userImage, referenceImage)
      const strokeConsistency = this.computeStrokeConsistency(userImage, referenceImage)
      const proportionAccuracy = this.computeProportionAccuracy(userImage, referenceImage)
      const alignmentAccuracy = this.computeAlignmentAccuracy(userImage, referenceImage)

      // Step 4: Calculate overall score with penalties
      const overallScore = this.calculateOverallScore({
        shape: shapeAccuracy,
        stroke: strokeConsistency,
        proportion: proportionAccuracy,
        alignment: alignmentAccuracy
      }, userImage)

      // Step 5: Calculate confidence based on metric consistency
      const confidence = this.calculateConfidence({
        shape: shapeAccuracy,
        stroke: strokeConsistency,
        proportion: proportionAccuracy,
        alignment: alignmentAccuracy
      })

      // Step 6: Generate feedback
      const feedback = this.generateFeedback(overallScore, metadata.characterId, {
        shape: shapeAccuracy,
        stroke: strokeConsistency,
        proportion: proportionAccuracy,
        alignment: alignmentAccuracy
      })

      return {
        overallScore,
        shapeAccuracy,
        strokeConsistency,
        proportionAccuracy,
        alignmentAccuracy,
        confidence,
        isCorrect: overallScore >= 75,
        feedback: feedback.message,
        improvementTips: feedback.tips,
        evaluationType: "algorithmic"
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      return this.createErrorResult()
    }
  }

  /**
   * Process image buffer to standardized format
   */
  private async processImage(imageBuffer: Buffer): Promise<ProcessedImage> {
    // Create image from buffer
    const uint8Array = new Uint8Array(imageBuffer)
    const blob = new Blob([uint8Array], { type: 'image/png' })
    const img = await createImageBitmap(blob)
    
    // Create canvas for processing
    const canvas = new OffscreenCanvas(this.TARGET_SIZE, this.TARGET_SIZE)
    const ctx = canvas.getContext('2d')!
    
    // Draw and scale to target size
    ctx.drawImage(img, 0, 0, this.TARGET_SIZE, this.TARGET_SIZE)
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, this.TARGET_SIZE, this.TARGET_SIZE)
    const data = imageData.data
    
    // Convert to grayscale and binary
    const binaryData: boolean[] = []
    const grayData = new Uint8ClampedArray(data.length)
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale using luminance formula
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      grayData[i] = gray
      grayData[i + 1] = gray
      grayData[i + 2] = gray
      grayData[i + 3] = 255
      
      // Binary threshold
      binaryData[i / 4] = gray < this.BINARY_THRESHOLD
    }
    
    // Calculate properties
    const bounds = this.calculateBounds(binaryData, this.TARGET_SIZE, this.TARGET_SIZE)
    const centerOfMass = this.calculateCenterOfMass(binaryData, this.TARGET_SIZE, this.TARGET_SIZE)
    const inkDensity = this.calculateInkDensity(binaryData)
    
    return {
      data: grayData,
      width: this.TARGET_SIZE,
      height: this.TARGET_SIZE,
      binaryData,
      bounds,
      centerOfMass,
      inkDensity
    }
  }

  /**
   * Validate that drawing contains meaningful content
   */
  private isValidDrawing(image: ProcessedImage): boolean {
    // Check minimum drawing area
    const drawingArea = image.bounds.width * image.bounds.height
    if (drawingArea < this.MIN_DRAWING_AREA) {
      return false
    }
    
    // Check that it's not just a single dot
    const filledPixels = image.binaryData.filter(pixel => pixel).length
    const totalPixels = image.binaryData.length
    const fillRatio = filledPixels / totalPixels
    
    // Must have at least 1% fill and not be concentrated in one tiny area
    return fillRatio > 0.01 && drawingArea > this.MIN_DRAWING_AREA
  }

  /**
   * Compute shape accuracy using pixel overlap
   */
  private computeShapeAccuracy(userImage: ProcessedImage, referenceImage: ProcessedImage): number {
    let overlap = 0
    let referencePixels = 0
    
    for (let i = 0; i < userImage.binaryData.length; i++) {
      if (referenceImage.binaryData[i]) {
        referencePixels++
        if (userImage.binaryData[i]) {
          overlap++
        }
      }
    }
    
    const overlapRatio = referencePixels > 0 ? overlap / referencePixels : 0
    
    // Apply minimum overlap threshold
    if (overlapRatio < this.MIN_OVERLAP_FOR_SCORE) {
      return 0
    }
    
    return Math.round(overlapRatio * 100)
  }

  /**
   * Compute stroke consistency using edge density
   */
  private computeStrokeConsistency(userImage: ProcessedImage, referenceImage: ProcessedImage): number {
    const userEdges = this.detectEdges(userImage.binaryData, userImage.width, userImage.height)
    const referenceEdges = this.detectEdges(referenceImage.binaryData, referenceImage.width, referenceImage.height)
    
    let matchingEdges = 0
    let totalReferenceEdges = 0
    
    for (let i = 0; i < referenceEdges.length; i++) {
      if (referenceEdges[i]) {
        totalReferenceEdges++
        if (userEdges[i]) {
          matchingEdges++
        }
      }
    }
    
    return totalReferenceEdges > 0 ? Math.round((matchingEdges / totalReferenceEdges) * 100) : 0
  }

  /**
   * Compute proportion accuracy using bounding box comparison
   */
  private computeProportionAccuracy(userImage: ProcessedImage, referenceImage: ProcessedImage): number {
    const userAspect = userImage.bounds.width / userImage.bounds.height
    const referenceAspect = referenceImage.bounds.width / referenceImage.bounds.height
    
    // Calculate aspect ratio difference
    const aspectDiff = Math.abs(userAspect - referenceAspect)
    const aspectScore = Math.max(0, 100 - aspectDiff * 50) // Penalize aspect differences
    
    // Calculate size difference
    const userArea = userImage.bounds.width * userImage.bounds.height
    const referenceArea = referenceImage.bounds.width * referenceImage.bounds.height
    const sizeRatio = Math.min(userArea, referenceArea) / Math.max(userArea, referenceArea)
    const sizeScore = sizeRatio * 100
    
    return Math.round((aspectScore + sizeScore) / 2)
  }

  /**
   * Compute alignment accuracy using center of mass
   */
  private computeAlignmentAccuracy(userImage: ProcessedImage, referenceImage: ProcessedImage): number {
    const userCenter = userImage.centerOfMass
    const refCenter = referenceImage.centerOfMass
    
    // Calculate distance between centers
    const distance = Math.sqrt(
      Math.pow(userCenter.x - refCenter.x, 2) + 
      Math.pow(userCenter.y - refCenter.y, 2)
    )
    
    // Normalize distance to canvas size
    const maxDistance = Math.sqrt(
      Math.pow(this.TARGET_SIZE, 2) + Math.pow(this.TARGET_SIZE, 2)
    )
    
    const normalizedDistance = distance / maxDistance
    const alignmentScore = Math.max(0, 100 - normalizedDistance * 200) // Strong penalty for misalignment
    
    return Math.round(alignmentScore)
  }

  /**
   * Calculate overall score with penalties
   */
  private calculateOverallScore(
    scores: {
      shape: number
      stroke: number
      proportion: number
      alignment: number
    },
    userImage: ProcessedImage
  ): number {
    // Weighted average
    let baseScore = (
      scores.shape * 0.4 +      // Shape overlap is most important
      scores.alignment * 0.25 +   // Proper positioning
      scores.proportion * 0.2 +   // Good proportions
      scores.stroke * 0.15         // Stroke quality
    )
    
    // Apply size penalties
    const fillRatio = userImage.inkDensity
    if (fillRatio < 0.02) {
      baseScore *= 0.3 // Strong penalty for tiny drawings
    } else if (fillRatio > this.MAX_DRAWING_AREA_RATIO) {
      baseScore *= 0.7 // Penalty for oversized drawings
    }
    
    return Math.round(Math.max(0, Math.min(100, baseScore)))
  }

  /**
   * Calculate confidence based on metric consistency
   */
  private calculateConfidence(scores: {
    shape: number
    stroke: number
    proportion: number
    alignment: number
  }): number {
    const values = Object.values(scores)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    const standardDeviation = Math.sqrt(variance)
    
    // Lower variance = higher confidence
    const confidence = Math.max(0.5, Math.min(0.95, 1 - (standardDeviation / 100)))
    
    return Math.round(confidence * 100) / 100
  }

  /**
   * Generate culturally-aware feedback
   */
  private generateFeedback(
    score: number,
    characterName: string,
    breakdown: { shape: number; stroke: number; proportion: number; alignment: number }
  ): { message: string; tips: string[] } {
    const culturalMessages = [
      "Every stroke in Umwero carries the wisdom of our ancestors. Keep practicing!",
      "Kwizera Mugisha created Umwero to preserve our beautiful Kinyarwanda language.",
      "Your dedication to learning Umwero strengthens our cultural heritage.",
      "In Umwero, each character tells a story of Rwandan identity.",
      "You are part of the cultural renaissance through Umwero writing!"
    ]

    const randomMessage = culturalMessages[Math.floor(Math.random() * culturalMessages.length)]
    
    let message = ''
    const tips: string[] = []

    if (score >= 85) {
      message = `🎉 Excellent work! Your ${characterName} is nearly perfect! ${randomMessage}`
      tips.push("Maintain this beautiful form in your practice")
      tips.push("Share your skill with others learning Umwero")
      tips.push("Try writing this character in different contexts")
    } else if (score >= 70) {
      message = `✨ Very good! Your ${characterName} shows great improvement. ${randomMessage}`
      tips.push("Focus on refining your stroke directions")
      tips.push("Pay attention to the proportions of each component")
      tips.push("Practice the character slowly at first, then build speed")
    } else if (score >= 50) {
      message = `💪 Getting there! Your ${characterName} is taking shape. ${randomMessage}`
      tips.push("Study the reference character more carefully")
      tips.push("Practice each stroke separately before combining")
      tips.push("Use the proper stroke order for better results")
    } else if (score >= 25) {
      message = `📝 Keep practicing! Learning ${characterName} takes patience. ${randomMessage}`
      tips.push("Start with basic strokes before attempting the full character")
      tips.push("Watch video tutorials for proper technique")
      tips.push("Trace the reference character several times")
    } else {
      message = `🌱 Every master was once a beginner. Let's improve your ${characterName}! ${randomMessage}`
      tips.push("Focus on drawing the basic shape first")
      tips.push("Don't worry about perfection - consistency matters more")
      tips.push("Practice for 10 minutes daily for better results")
    }

    // Add specific tips based on breakdown
    if (breakdown.shape < 60) {
      tips.push("Work on the overall shape - it needs to match the reference more closely")
    }
    if (breakdown.alignment < 60) {
      tips.push("Center your character better on the canvas")
    }
    if (breakdown.proportion < 60) {
      tips.push("Pay attention to the size relationships between character parts")
    }
    if (breakdown.stroke < 60) {
      tips.push("Focus on smooth, consistent strokes")
    }

    return { message, tips: tips.slice(0, 5) } // Limit to 5 tips
  }

  /**
   * Create result for empty/invalid drawings
   */
  private createEmptyResult(): EvaluationResult {
    return {
      overallScore: 0,
      shapeAccuracy: 0,
      strokeConsistency: 0,
      proportionAccuracy: 0,
      alignmentAccuracy: 0,
      confidence: 1.0,
      isCorrect: false,
      feedback: "Please draw the character before submitting. Every great journey begins with a single stroke! 🌱",
      improvementTips: [
        "Draw something meaningful on the canvas",
        "Don't be afraid to make mistakes - learning takes practice",
        "Start with simple strokes to build confidence"
      ],
      evaluationType: "algorithmic"
    }
  }

  /**
   * Create result for evaluation errors
   */
  private createErrorResult(): EvaluationResult {
    return {
      overallScore: 0,
      shapeAccuracy: 0,
      strokeConsistency: 0,
      proportionAccuracy: 0,
      alignmentAccuracy: 0,
      confidence: 0,
      isCorrect: false,
      feedback: "Unable to evaluate your drawing. Please try again.",
      improvementTips: [
        "Check your internet connection",
        "Try drawing the character again",
        "Contact support if the problem persists"
      ],
      evaluationType: "algorithmic"
    }
  }

  // Helper methods for image processing
  private calculateBounds(binaryData: boolean[], width: number, height: number): BoundingBox {
    let minX = width, minY = height, maxX = 0, maxY = 0
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        if (binaryData[idx]) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
      }
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  private calculateCenterOfMass(binaryData: boolean[], width: number, height: number): Point {
    let sumX = 0, sumY = 0, count = 0
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        if (binaryData[idx]) {
          sumX += x
          sumY += y
          count++
        }
      }
    }
    
    return {
      x: count > 0 ? sumX / count : width / 2,
      y: count > 0 ? sumY / count : height / 2
    }
  }

  private calculateInkDensity(binaryData: boolean[]): number {
    const filledPixels = binaryData.filter(pixel => pixel).length
    return filledPixels / binaryData.length
  }

  private detectEdges(binaryData: boolean[], width: number, height: number): boolean[] {
    const edges: boolean[] = new Array(binaryData.length).fill(false)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        
        // Check if current pixel is an edge (has different neighbors)
        const current = binaryData[idx]
        const neighbors = [
          binaryData[idx - 1],     // left
          binaryData[idx + 1],     // right
          binaryData[idx - width], // top
          binaryData[idx + width]  // bottom
        ]
        
        // Edge if any neighbor differs from current
        edges[idx] = neighbors.some(neighbor => neighbor !== current)
      }
    }
    
    return edges
  }
}

// Export singleton instance
export const handwritingEvaluator = new UmweroHandwritingEvaluator()
