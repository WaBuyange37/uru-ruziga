// app/api/admin/donations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}
const JWT_SECRET = process.env.JWT_SECRET

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string }
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const donations = await prisma.donation.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ donations })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
