-- 🚀 DATABASE OPTIMIZATION FOR UMWERO LESSONS
-- Run this in Supabase SQL Editor for instant query performance

-- 🔥 CRITICAL INDEX: Lessons by type and publication status
-- This makes /api/lessons?type=VOWEL queries instant
CREATE INDEX IF NOT EXISTS idx_lessons_type_published 
ON lessons(type, "isPublished", "order") 
WHERE "isPublished" = true;

-- 🔥 ADDITIONAL PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_lessons_order 
ON lessons("order") 
WHERE "isPublished" = true;

CREATE INDEX IF NOT EXISTS idx_lessons_created_at 
ON lessons("createdAt" DESC) 
WHERE "isPublished" = true;

-- 🔥 COMPOSITE INDEX for common queries
CREATE INDEX IF NOT EXISTS idx_lessons_published_type_order 
ON lessons("isPublished", type, "order");

-- 🔥 ANALYZE TABLES for query planner optimization
ANALYZE lessons;

-- 🔥 VACUUM for performance (run periodically)
-- VACUUM ANALYZE lessons;

-- ✅ VERIFICATION QUERIES
-- Test query performance (should be <1ms after indexing)
EXPLAIN ANALYZE 
SELECT id, title, description, content, module, type, "order", duration, "videoUrl", "thumbnailUrl", "isPublished", "createdAt"
FROM lessons 
WHERE type = 'VOWEL' AND "isPublished" = true 
ORDER BY "order" ASC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'lessons'
ORDER BY idx_scan DESC;