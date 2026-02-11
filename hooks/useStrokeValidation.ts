// hooks/useStrokeValidation.ts
// Hook for managing stroke validation logic

import { useState, useCallback } from 'react'
import { validateStrokes, validateBasicStrokes } from '@/lib/stroke-validation'
import type { Stroke, ValidationResult } from '@/types/stroke-validation'

interface UseStrokeValidationOptions {
  templateStrokes?: any[][]
  passingThreshold?: number
  useBasicValidation?: boolean
}

export function useStrokeValidation(options: UseStrokeValidationOptions = {}) {
  const {
    templateStrokes = [],
    passingThreshold = 70,
    useBasicValidation = false
  } = options

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Validate strokes
  const validate = useCallback((strokes: Stroke[]): ValidationResult => {
    setIsValidating(true)

    let result: ValidationResult

    if (useBasicValidation || templateStrokes.length === 0) {
      // Use basic validation when no template available
      result = validateBasicStrokes(strokes)
    } else {
      // Use intelligent validation with template
      result = validateStrokes(strokes, templateStrokes, { passingThreshold })
    }

    setValidationResult(result)
    setIsValidating(false)

    return result
  }, [templateStrokes, passingThreshold, useBasicValidation])

  // Clear validation result
  const clearValidation = useCallback(() => {
    setValidationResult(null)
  }, [])

  // Check if strokes pass threshold
  const checkPassing = useCallback((strokes: Stroke[]): boolean => {
    const result = validate(strokes)
    return result.passed
  }, [validate])

  return {
    validationResult,
    isValidating,
    validate,
    clearValidation,
    checkPassing
  }
}
