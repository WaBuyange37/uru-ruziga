#!/bin/bash
# Clear Next.js cache and rebuild

echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🔨 Building project..."
npm run build

echo "✅ Cache cleared and project rebuilt successfully!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "To start production server, run:"
echo "  npm start"
