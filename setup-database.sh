#!/bin/bash

# Database Setup Script for Umwero Learning Platform
# This script helps set up and seed the database

echo "🗄️  Umwero Learning Platform - Database Setup"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with DATABASE_URL"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ Error: DATABASE_URL not found in .env"
    echo "Please add DATABASE_URL to .env file"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"
echo ""

# Step 2: Push database schema
echo "🔄 Step 2: Pushing database schema..."
echo "This will create all tables in your database"
npx prisma db push
if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    echo ""
    echo "Possible issues:"
    echo "1. Database server is not reachable"
    echo "2. Connection credentials are incorrect"
    echo "3. Database is paused (Neon auto-pauses inactive databases)"
    echo ""
    echo "Solutions:"
    echo "1. Check your database provider console"
    echo "2. Verify DATABASE_URL in .env file"
    echo "3. Reactivate database if paused"
    echo ""
    exit 1
fi
echo "✅ Database schema pushed successfully"
echo ""

# Step 3: Seed database
echo "🌱 Step 3: Seeding database..."
echo "This will create initial users and data"
npm run prisma:seed
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi
echo "✅ Database seeded successfully"
echo ""

# Success message
echo "🎉 Database setup complete!"
echo ""
echo "📊 Seeded Accounts:"
echo "==================="
echo ""
echo "Admin:"
echo "  Email: 37nzela@gmail.com"
echo "  Password: Mugix260"
echo ""
echo "Teacher:"
echo "  Email: teacher@uruziga.com"
echo "  Password: teach123"
echo ""
echo "Student:"
echo "  Email: demo@uruziga.com"
echo "  Password: demo123"
echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Run 'npm run dev' to start development server"
echo "2. Run 'npx prisma studio' to view database"
echo "3. Visit http://localhost:3000 to test the app"
echo ""
