// lib/bucket-setup.ts
// Configure your S3 bucket for Umwero app

import { S3Client, PutBucketCorsCommand, CreateBucketCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
})

// Configure CORS for your bucket
export async function setupBucketCors() {
  try {
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['http://localhost:3000', 'https://yourdomain.com'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3600,
        },
      ],
    }

    const command = new PutBucketCorsCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'uru-ruziga-storage',
      CORSConfiguration: corsConfiguration,
    })

    await s3Client.send(command)
    console.log('✅ Bucket CORS configured successfully')
  } catch (error) {
    console.error('❌ CORS setup failed:', error)
  }
}

// Get bucket URL
export function getBucketUrl() {
  const bucketName = process.env.AWS_S3_BUCKET || 'uru-ruziga-storage'
  const region = process.env.AWS_REGION || 'us-east-1'
  
  if (region === 'us-east-1') {
    return `https://${bucketName}.s3.amazonaws.com`
  } else {
    return `https://${bucketName}.s3.${region}.amazonaws.com`
  }
}

// Run setup
if (require.main === module) {
  setupBucketCors().then(() => {
    console.log('🪣 Bucket URL:', getBucketUrl())
    console.log('🎉 Your bucket is ready!')
  })
}
