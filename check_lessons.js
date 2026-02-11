const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      code: true,
      type: true,
      isPublished: true,
      createdAt: true
    }
  })
  
  console.log('Total lessons:', lessons.length)
  console.log('Published lessons:', lessons.filter(l => l.isPublished).length)
  console.log('\nLessons:')
  lessons.forEach(l => {
    console.log(`- ${l.code} (${l.type}) - Published: ${l.isPublished}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
