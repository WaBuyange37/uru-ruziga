#!/bin/bash

# Organize documentation files into proper directories

echo "📚 Organizing documentation files..."

# Create documentation structure
mkdir -p docs/{deployment,development,architecture,features,fixes}

# Move deployment-related docs
mv DEPLOY*.md docs/deployment/ 2>/dev/null
mv DEPLOYMENT*.md docs/deployment/ 2>/dev/null
mv NETLIFY*.md docs/deployment/ 2>/dev/null
mv PRODUCTION*.md docs/deployment/ 2>/dev/null
mv FINAL_DEPLOYMENT*.md docs/deployment/ 2>/dev/null

# Move development docs
mv DATABASE_SETUP_GUIDE.md docs/development/ 2>/dev/null
mv QUICK_START.md docs/development/ 2>/dev/null
mv QUICK_COMMANDS.md docs/development/ 2>/dev/null
mv API_INTEGRATION_GUIDE.md docs/development/ 2>/dev/null

# Move architecture docs
mv *ARCHITECTURE*.md docs/architecture/ 2>/dev/null
mv *SYSTEM*.md docs/architecture/ 2>/dev/null
mv UMWERO_CONTENT_ARCHITECTURE.md docs/architecture/ 2>/dev/null
mv UMWERO_TRANSLATION_SYSTEM.md docs/architecture/ 2>/dev/null
mv USER_IDENTITY_MODEL_PROPOSAL.md docs/architecture/ 2>/dev/null

# Move feature implementation docs
mv CART_*.md docs/features/ 2>/dev/null
mv *IMPLEMENTATION*.md docs/features/ 2>/dev/null
mv *UPGRADE*.md docs/features/ 2>/dev/null
mv COMMUNITY*.md docs/features/ 2>/dev/null
mv MULTILINGUAL*.md docs/features/ 2>/dev/null
mv GLOBAL_FEED*.md docs/features/ 2>/dev/null
mv LEARNING*.md docs/features/ 2>/dev/null
mv LESSONS*.md docs/features/ 2>/dev/null
mv TRANSLATION*.md docs/features/ 2>/dev/null
mv DISCUSSION*.md docs/features/ 2>/dev/null

# Move fix/update docs
mv *FIX*.md docs/fixes/ 2>/dev/null
mv *FIXES*.md docs/fixes/ 2>/dev/null
mv *UPDATE*.md docs/fixes/ 2>/dev/null
mv *IMPROVEMENTS*.md docs/fixes/ 2>/dev/null
mv *MODERNIZATION*.md docs/fixes/ 2>/dev/null
mv *OPTIMIZATION*.md docs/fixes/ 2>/dev/null
mv *REFACTOR*.md docs/fixes/ 2>/dev/null
mv *REFINEMENT*.md docs/fixes/ 2>/dev/null
mv MOBILE*.md docs/fixes/ 2>/dev/null
mv HEADER*.md docs/fixes/ 2>/dev/null
mv UI_*.md docs/fixes/ 2>/dev/null
mv HYDRATION*.md docs/fixes/ 2>/dev/null
mv ROUTING*.md docs/fixes/ 2>/dev/null
mv GALLERY*.md docs/fixes/ 2>/dev/null
mv PROFILE*.md docs/fixes/ 2>/dev/null
mv LIKES*.md docs/fixes/ 2>/dev/null
mv AUTH_*.md docs/fixes/ 2>/dev/null
mv DATABASE_FIX*.md docs/fixes/ 2>/dev/null

# Move summary/status docs
mv *SUMMARY*.md docs/ 2>/dev/null
mv *STATUS*.md docs/ 2>/dev/null
mv EXECUTIVE_SUMMARY.md docs/ 2>/dev/null
mv PROJECT_SUMMARY.md docs/ 2>/dev/null
mv TASK_COMPLETE_SUMMARY.md docs/ 2>/dev/null
mv LATEST_UPDATES.md docs/ 2>/dev/null

# Move testing docs
mv *TESTING*.md docs/development/ 2>/dev/null
mv *TEST*.md docs/development/ 2>/dev/null
mv FEED_TESTING_GUIDE.md docs/development/ 2>/dev/null
mv ROUTING_TEST_GUIDE.md docs/development/ 2>/dev/null

# Move security/checklist docs
mv SECURITY.md docs/ 2>/dev/null
mv *CHECKLIST*.md docs/deployment/ 2>/dev/null
mv PRISMA_NEON_VERIFICATION.md docs/development/ 2>/dev/null

# Move content docs
mv *CONTENT*.md docs/features/ 2>/dev/null
mv ABOUT_PAGE*.md docs/features/ 2>/dev/null
mv HOMEPAGE*.md docs/features/ 2>/dev/null

# Move plan docs
mv *PLAN*.md docs/architecture/ 2>/dev/null

echo "✅ Documentation organized!"
echo ""
echo "📁 Structure:"
echo "  docs/"
echo "    ├── deployment/     - Deployment guides and checklists"
echo "    ├── development/    - Development setup and testing"
echo "    ├── architecture/   - System design and architecture"
echo "    ├── features/       - Feature implementations"
echo "    └── fixes/          - Bug fixes and improvements"
echo ""
echo "📄 Root docs (kept):"
ls -1 *.md 2>/dev/null | head -5
