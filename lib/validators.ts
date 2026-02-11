// lib/validators.ts
// Zod validation schemas for all API endpoints

import { z } from 'zod'

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  birthday: z.string().optional(),
  countryCode: z.string().length(2, 'Country code must be 2 characters').default('RW'),
})

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Username, email, or mobile number is required'),
  password: z.string().min(1, 'Password is required'),
})

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers'),
})

export const resendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// ============================================
// LESSON SCHEMAS
// ============================================

export const createLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  content: z.string().min(1, 'Content is required'),
  module: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  type: z.enum(['VOWEL', 'CONSONANT', 'WORD', 'SENTENCE', 'GRAMMAR', 'CULTURE']),
  order: z.number().int().positive(),
  duration: z.number().int().positive().max(180, 'Duration cannot exceed 180 minutes'),
  videoUrl: z.string().url('Invalid video URL').optional().or(z.literal('')),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
  prerequisites: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
})

export const updateLessonSchema = createLessonSchema.partial()

// ============================================
// DISCUSSION SCHEMAS
// ============================================

export const createDiscussionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content cannot exceed 10000 characters'),
  script: z.enum(['LATIN', 'UMWERO', 'latin', 'umwero', 'mixed']).transform(val => val.toUpperCase() as 'LATIN' | 'UMWERO').default('LATIN'),
  category: z.string().optional(),
  mediaUrls: z.array(z.string().url('Invalid media URL')).optional().default([]),
})

export const updateDiscussionSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  category: z.string().optional(),
  isPinned: z.boolean().optional(),
})

export const createDiscussionCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment cannot exceed 5000 characters'),
  script: z.enum(['latin', 'umwero', 'mixed']).default('latin'),
})

// ============================================
// COMMUNITY SCHEMAS
// ============================================

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content cannot exceed 5000 characters'),
  language: z.enum(['en', 'rw', 'um']).default('en'),
  latinText: z.string().optional(),
  umweroText: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isChallenge: z.boolean().optional().default(false),
  challengeType: z.string().optional(),
})

export const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  isPinned: z.boolean().optional(),
  isPublic: z.boolean().optional(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment cannot exceed 2000 characters'),
  language: z.enum(['en', 'rw', 'um']).default('en'),
  latinText: z.string().optional(),
  umweroText: z.string().optional(),
})

// ============================================
// CHAT SCHEMAS
// ============================================

export const createChatMessageSchema = z.object({
  latinText: z.string().min(1, 'Message cannot be empty').max(1000),
  umweroText: z.string().min(1, 'Umwero text is required').max(1000),
  fontSize: z.number().int().min(12).max(72).default(24),
  imageUrl: z.string().url().optional(),
})

// ============================================
// DONATION SCHEMAS
// ============================================

export const createDonationSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum donation is $1'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  isAnonymous: z.boolean().optional().default(false),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
})

// ============================================
// ADMIN SCHEMAS
// ============================================

export const changeRoleSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
})

export const deleteUserSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  confirm: z.literal(true, { errorMap: () => ({ message: 'Confirmation required' }) }),
})

// ============================================
// PROGRESS SCHEMAS
// ============================================

export const updateProgressSchema = z.object({
  lessonId: z.string().cuid('Invalid lesson ID'),
  completed: z.boolean().optional(),
  score: z.number().int().min(0).max(100).optional(),
  timeSpent: z.number().int().min(0).optional(),
})

// ============================================
// DRAWING SCHEMAS
// ============================================

export const saveDrawingSchema = z.object({
  lessonId: z.string().cuid('Invalid lesson ID').optional(),
  vowel: z.string().min(1).max(10),
  umweroChar: z.string().min(1).max(10),
  drawingData: z.string().min(1, 'Drawing data is required'),
  timeSpent: z.number().int().min(0).optional().default(0),
})

// ============================================
// TRANSLATION SCHEMAS
// ============================================

export const translateSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text cannot exceed 10000 characters'),
  sourceLanguage: z.enum(['en', 'rw', 'um']),
  targetLanguage: z.enum(['en', 'rw', 'um']),
})

// ============================================
// IMAGE GENERATION SCHEMAS
// ============================================

export const generateImageSchema = z.object({
  text: z.string().min(1, 'Text is required').max(500, 'Text cannot exceed 500 characters'),
  fontSize: z.number().int().min(12).max(72).default(24),
  fontFamily: z.string().default('Umwero'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#FFFFFF'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#000000'),
  width: z.number().int().min(100).max(2000).default(800),
  height: z.number().int().min(100).max(2000).default(400),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request body against schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      }
    }
    return { success: false, error: 'Invalid request data' }
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(searchParams.entries())
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      }
    }
    return { success: false, error: 'Invalid query parameters' }
  }
}
