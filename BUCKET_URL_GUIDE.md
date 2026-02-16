# 🪣 Your S3 Bucket URL & Setup

## ✅ Your Bucket URL:
```
https://uru-ruziga-storage.s3.amazonaws.com
```

## 🔧 Fix AWS Credentials in .env

The error shows your AWS keys aren't set properly. Update your .env file:

```bash
# Replace these lines in .env:
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# With your actual AWS credentials:
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## 🎯 How to Find Your AWS Keys:

### Option 1: AWS Console
1. Go to https://aws.amazon.com/
2. Sign in → Go to "IAM" service
3. Click "Users" → Select your user
4. Click "Security credentials" tab
5. Click "Create access key"
6. Copy "Access key ID" and "Secret access key"

### Option 2: From When You Created User
Check the CSV file you downloaded when creating the IAM user

## 🚀 Test Your Setup:

```bash
# Test bucket access
npx tsx lib/bucket-setup.ts
```

## 📱 Use Your Bucket URL:

```typescript
// Your files will be accessible at:
const imageUrl = "https://uru-ruziga-storage.s3.amazonaws.com/characters/vowel-a.png"
const drawingUrl = "https://uru-ruziga-storage.s3.amazonaws.com/drawings/user123/lesson1.png"
```

## 🔐 Security Note:
Never share your AWS keys! They're like passwords for your storage.

**Need help finding your AWS keys?** I can guide you step by step!
