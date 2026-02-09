// lib/email-validation.ts - Real email validation service
import validator from 'email-validator'

export interface ValidationResult {
  isValid: boolean
  isDisposable: boolean
  isCatchAll: boolean
  domain: string
  suggestions?: string[]
}

/**
 * List of common disposable email domains
 */
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', '20minutemail.com', '30minutemail.com',
  'guerrillamail.com', 'mailinator.com', 'tempmail.org',
  'yopmail.com', 'throwaway.email', 'temp-mail.org',
  'maildrop.cc', 'tempmail.de', '10minutemail.de',
  'tempmail.org', 'mailtempora.com', 'temp-mail.org',
  'mailcatch.com', 'zippymail.info', 'tempmaildemo.com',
  'mailinator.net', 'mailinator2.com', 'mailinator3.com',
  'yopmail.net', 'coolmail.in', 'tempmail.link',
  'tempmail.dev', 'tempmail.io', 'tempmail.app',
  'tempmail.space', 'tempmail.tech', 'tempmail.email'
]

/**
 * Common email typos and their corrections
 */
const COMMON_TYPOS: { [key: string]: string } = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmailcom': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'protonmai.com': 'protonmail.com',
  'protonmal.com': 'protonmail.com'
}

/**
 * Check if email domain is disposable
 */
function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.includes(domain.toLowerCase())
}

/**
 * Get suggestions for common typos
 */
function getTypoSuggestions(domain: string): string[] {
  const suggestions: string[] = []
  const lowerDomain = domain.toLowerCase()
  
  for (const [typo, correction] of Object.entries(COMMON_TYPOS)) {
    if (lowerDomain === typo) {
      suggestions.push(correction)
    }
  }
  
  return suggestions
}

/**
 * Validate email format and domain
 */
export async function validateEmail(email: string): Promise<ValidationResult> {
  const trimmedEmail = email.trim().toLowerCase()
  
  // Use email-validator for comprehensive validation
  if (!validator.validate(trimmedEmail)) {
    return {
      isValid: false,
      isDisposable: false,
      isCatchAll: false,
      domain: '',
      suggestions: []
    }
  }

  const [, domain] = trimmedEmail.split('@')
  
  // Check for disposable email
  const isDisposable = isDisposableDomain(domain)
  
  // Get typo suggestions
  const suggestions = getTypoSuggestions(domain)
  
  // Additional validation with email-validator
  const domainValidation = await validator.validate(trimmedEmail)
  
  return {
    isValid: domainValidation && !isDisposable,
    isDisposable,
    isCatchAll: false, // Could be enhanced with catch-all detection
    domain,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}

/**
 * Quick email validation for form validation (async)
 */
export function quickEmailValidation(email: string): {
  isValid: boolean
  hasCommonTypos: boolean
  suggestions?: string[]
} {
  const trimmedEmail = email.trim().toLowerCase()
  
  // Basic format validation
  if (!validator.validate(trimmedEmail)) {
    return {
      isValid: false,
      hasCommonTypos: false
    }
  }

  const [, domain] = trimmedEmail.split('@')
  
  // Check for disposable email
  const isDisposable = isDisposableDomain(domain)
  
  // Get typo suggestions
  const suggestions = getTypoSuggestions(domain)
  
  return {
    isValid: !isDisposable,
    hasCommonTypos: suggestions.length > 0,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}
