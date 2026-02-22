#!/bin/bash

# Clear Cache and Restart Development Server
# This script helps resolve browser caching issues

echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "🧹 Clearing node_modules/.cache..."
rm -rf node_modules/.cache

echo "✅ Cache cleared!"
echo ""
echo "📝 Next steps to see changes in Firefox:"
echo "1. In Firefox, press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "2. Select 'Cached Web Content' and click 'Clear Now'"
echo "3. Or use Ctrl+F5 (Cmd+Shift+R on Mac) for hard refresh"
echo ""
echo "🚀 Starting development server..."
npm run dev
