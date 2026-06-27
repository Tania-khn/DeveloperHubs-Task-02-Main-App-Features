import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/auth/login - list mock users (for "switch account" UX)
export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
      },
    })
    return NextResponse.json({ users })
  } catch (e) {
    console.error('GET /api/auth/login error', e)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
