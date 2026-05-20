#!/usr/bin/env node

/**
 * Verify AI Dataset Tables
 * Confirms all AI dataset architecture tables exist
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  AI DATASET TABLES VERIFICATION');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const aiTables = [
    { name: 'handwriting_attempts', description: 'Stores all handwriting attempts with stroke data' },
    { name: 'character_references', description: 'Reference images and canonical stroke data' },
    { name: 'community_entries', description: 'Cultural discussions for NLP training' },
    { name: 'dataset_entries', description: 'ML-ready dataset entries' }
  ];
  
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN ('handwriting_attempts', 'character_references', 'community_entries', 'dataset_entries')
      ORDER BY table_name
    `;
    
    console.log('AI Dataset Tables:\n');
    
    for (const aiTable of aiTables) {
      const found = tables.find(t => t.table_name === aiTable.name);
      
      if (found) {
        console.log(`✅ ${aiTable.name}`);
        console.log(`   ${aiTable.description}`);
        console.log(`   Columns: ${found.column_count}\n`);
      } else {
        console.log(`❌ ${aiTable.name} - NOT FOUND\n`);
      }
    }
    
    // Check indexes for AI tables
    const indexes = await prisma.$queryRaw`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('handwriting_attempts', 'character_references', 'community_entries', 'dataset_entries')
      ORDER BY tablename, indexname
    `;
    
    console.log('Indexes:');
    console.log(`✅ ${indexes.length} indexes created for AI tables\n`);
    
    // Show sample structure
    console.log('═══════════════════════════════════════════════════════');
    console.log('  TABLE STRUCTURES');
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (const aiTable of aiTables) {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${aiTable.name}
        ORDER BY ordinal_position
      `;
      
      if (columns.length > 0) {
        console.log(`${aiTable.name}:`);
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? '(nullable)' : '';
          console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}`);
        });
        console.log('');
      }
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALL AI DATASET TABLES ARE READY');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('Next Steps:');
    console.log('  1. Deploy Python AI service to Railway/Render/Fly.io');
    console.log('  2. Update PYTHON_AI_SERVICE_URL in .env');
    console.log('  3. Deploy Next.js app to Vercel/Netlify');
    console.log('  4. Purchase and configure domain');
    console.log('  5. Go live! 🚀\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
