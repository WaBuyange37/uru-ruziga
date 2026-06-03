#!/bin/bash
# Project Guardrails Verification Script
# Verifies that protected infrastructure remains intact

set -e

# Get project root (4 levels up from scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FAILED=0

echo ""
echo -e "${BLUE}🛡️  Project Guardrails Verification${NC}"
echo "===================================="
echo ""

# Function to check a system
check_system() {
  local name=$1
  local command=$2
  
  echo -n "Checking $name... "
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# 1. Check seed guard is present
echo -e "${YELLOW}1. Seed Guard Protection${NC}"
SEED_FILE="$PROJECT_ROOT/prisma/seed.ts"

check_system "Seed guard presence" \
  "grep -Eq -- '--preflight|--dry-run' '$SEED_FILE' && grep -q 'SEED_CLEAN' '$SEED_FILE' && grep -q 'NODE_ENV' '$SEED_FILE' && grep -q 'DATABASE_URL' '$SEED_FILE' && grep -Eiq 'supabase|remote' '$SEED_FILE' && (grep -q 'remote-safe-upsert' '$SEED_FILE' || grep -Eq 'upsert|idempotent' '$SEED_FILE')"

check_system "Remote database detection" \
  "grep -Eiq 'supabase|remote' '$SEED_FILE'"

echo ""

# 2. Check for forbidden dependencies
echo -e "${YELLOW}2. Forbidden Dependencies${NC}"
check_system "No AWS SDK" \
  "! grep -E 'aws-sdk|@aws-sdk' '$PROJECT_ROOT/package.json'"

check_system "No Vercel Blob" \
  "! grep -q '@vercel/blob' '$PROJECT_ROOT/package.json'"

echo ""

# 3. Check Prisma validation
echo -e "${YELLOW}3. Database Schema Integrity${NC}"
check_system "Prisma schema validation" \
  "cd '$PROJECT_ROOT' && npx prisma validate"

echo ""

# 4. Check TypeScript validation
echo -e "${YELLOW}4. TypeScript Type Safety${NC}"
check_system "TypeScript compilation" \
  "cd '$PROJECT_ROOT' && npx tsc --noEmit"

echo ""

# Summary
echo "===================================="
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All guardrails verified successfully${NC}"
  echo ""
  echo "Protected systems are intact. Safe to continue development."
  exit 0
else
  echo -e "${RED}✗ $FAILED check(s) failed${NC}"
  echo ""
  echo "Some guardrails are not in place. Please review the failures above."
  echo ""
  echo "If you need to modify protected systems, see:"
  echo "  .kiro/specs/project-guardrails/protected-systems.md"
  echo "  .kiro/specs/project-guardrails/forbidden-actions.md"
  exit 1
fi
