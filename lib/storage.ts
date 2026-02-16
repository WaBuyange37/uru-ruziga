// lib/storage.ts
// Simple storage solution for Umwero app

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
})

// Upload file to S3
export async function uploadFile(
  file: Buffer | string, 
  key: string, 
  contentType: string = 'image/png'
) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'uru-ruziga-storage',
      Key: key,
      Body: file,
      ContentType: contentType,
    })
    
    const result = await s3Client.send(command)
    console.log('✅ File uploaded:', key)
    return result
  } catch (error) {
    console.error('❌ Upload failed:', error)
    throw error
  }
}

// Get signed URL for file access
export async function getFileUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'uru-ruziga-storage',
      Key: key,
    })
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    return url
  } catch (error) {
    console.error('❌ URL generation failed:', error)
    throw error
  }
}

// Upload character glyph image
export async function uploadCharacterGlyph(
  character: string, 
  imageData: Buffer
) {
  const key = `characters/${character}.png`
  return await uploadFile(imageData, key, 'image/png')
}

// Upload user drawing
export async function uploadUserDrawing(
  userId: string, 
  lessonId: string, 
  drawingData: Buffer
) {
  const timestamp = Date.now()
  const key = `drawings/${userId}/${lessonId}/${timestamp}.png`
  return await uploadFile(drawingData, key, 'image/png')
}

// Upload user avatar
export async function uploadUserAvatar(
  userId: string, 
  avatarData: Buffer
) {
  const key = `avatars/${userId}.png`
  return await uploadFile(avatarData, key, 'image/png')
}
