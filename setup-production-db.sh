#!/bin/bash
echo "🗄️  Setting up production database..."
echo ""
echo "Make sure your .env file has the production DATABASE_URL"
echo ""

# Push schema
echo "📤 Pushing database schema..."
npx prisma db push --accept-data-loss

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database
echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Login credentials:"
echo "Admin: 37nzela@gmail.com / Mugix260"
echo "Teacher: teacher@uruziga.com / teach123"
echo "Student: demo@uruziga.com / demo123"
