#!/bin/bash

# Full Deployment Script for Umwero Learning Platform
# This script sets up the complete database and storage infrastructure

echo "🚀 UMWERO LEARNING PLATFORM - FULL DEPLOYMENT"
echo "=============================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your database credentials"
    exit 1
fi

# Load environment variables
source .env

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing database schema (with force reset)..."
npx prisma db push --force-reset

echo "🌱 Seeding database with comprehensive data..."
npx prisma db seed

echo "🏗️  Building Next.js application..."
npm run build

echo "✅ DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "🎯 Your Umwero Learning Platform is ready!"
echo ""
echo "📊 Database Summary:"
echo "  • 5 Languages (English, Kinyarwanda, Umwero, Kirundi, Kiswahili)"
echo "  • 109 Characters (5 vowels + 25 consonants + 72 ligatures + 7 special)"
echo "  • 22 Lessons (vowels, consonants, culture)"
echo "  • 12 Achievements"
echo "  • 3 Users (admin, demo, teacher)"
echo ""
echo "👥 Test Accounts:"
echo "  Admin:   37nzela@gmail.com / Mugix260"
echo "  Demo:    demo@uruziga.com / demo123"
echo "  Teacher: teacher@uruziga.com / teach123"
echo ""
echo "🔧 Next Steps:"
echo "  1. Run: npm run dev"
echo "  2. Visit: http://localhost:3000"
echo "  3. Login with any test account above"
echo "  4. Go to /learn to start practicing"
echo ""
echo "📝 Manual Setup Required:"
echo "  1. Create 'user-drawings' bucket in Supabase Storage"
echo "  2. Run setup-supabase-storage.sql in Supabase SQL Editor"
echo "  3. Add your OpenAI API key to .env for AI evaluation"
echo ""
echo "🎉 Happy Learning!"