const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        // Check if Discussion table exists and create a test discussion if possible (requires a User)
        // First, check if any user exists or create a test user
        const users = await prisma.user.findMany({ take: 1 })
        let user

        if (users.length === 0) {
            console.log('No users found. Creating test user...')
            user = await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    password: 'password123',
                    fullName: 'Test User',
                    username: 'testuser',
                    role: 'ADMIN',
                    provider: 'EMAIL'
                }
            })
        } else {
            user = users[0]
            console.log('Using existing user:', user.email)
        }

        console.log('Creating test discussion...')
        const discussion = await prisma.discussion.create({
            data: {
                userId: user.id,
                title: 'Test Discussion',
                content: 'This is a test discussion to verify table creation.',
                script: 'latin',
                category: 'General'
            }
        })
        console.log('Discussion created successfully:', discussion.id)

        // Clean up
        await prisma.discussion.delete({ where: { id: discussion.id } })
        console.log('Test discussion cleaned up.')

    } catch (e) {
        console.error('Verification failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
