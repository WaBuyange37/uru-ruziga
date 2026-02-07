// app/api/auth/login/route.ts
// Login API route for Neon database (App Router)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/jwt'

