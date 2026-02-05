// app/api/admin/users/[userId]/role/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}
const JWT_SECRET = process.env.JWT_SECRET

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string }
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Only admins can change roles' }, { status: 403 })
    }

    const { role } = await request.json()

    if (!['USER', 'TEACHER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      }
    })

    return NextResponse.json({ user: updatedUser, message: 'Role updated successfully' })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
