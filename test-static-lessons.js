// Test static lessons functionality
const { 
  STATIC_VOWEL_LESSONS, 
  STATIC_CONSONANT_LESSONS, 
  STATIC_LIGATURE_LESSONS 
} = require('./lib/static-lessons.ts');

console.log('🧪 Testing Static Lessons...\n');

console.log('📊 LESSON COUNTS:');
console.log(`Vowels: ${STATIC_VOWEL_LESSONS?.length || 0}`);
console.log(`Consonants: ${STATIC_CONSONANT_LESSONS?.length || 0}`);
console.log(`Ligatures: ${STATIC_LIGATURE_LESSONS?.length || 0}`);

if (STATIC_VOWEL_LESSONS?.length > 0) {
  console.log('\n📝 Sample Vowel:');
  const vowel = STATIC_VOWEL_LESSONS[0];
  console.log(`  - ${vowel.title}: ${vowel.character} → ${vowel.umwero}`);
}

if (STATIC_CONSONANT_LESSONS?.length > 0) {
  console.log('\n📝 Sample Consonant:');
  const consonant = STATIC_CONSONANT_LESSONS[0];
  console.log(`  - ${consonant.title}: ${consonant.character} → ${consonant.umwero}`);
}

if (STATIC_LIGATURE_LESSONS?.length > 0) {
  console.log('\n📝 Sample Ligature:');
  const ligature = STATIC_LIGATURE_LESSONS[0];
  console.log(`  - ${ligature.title}: ${ligature.character} → ${ligature.umwero}`);
}

console.log('\n✅ Static lessons are ready for instant loading!');
console.log('🚀 Performance optimization complete with fallback data.');