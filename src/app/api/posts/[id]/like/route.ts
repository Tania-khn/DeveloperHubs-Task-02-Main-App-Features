import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/posts/[id]/like - toggle like
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const body = await req.json()
    const { userId } = body as { userId?: string }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const existing = await db.like.findUnique({
      where: { userId_postId: { userId, postId } },
    })

    if (existing) {
      await db.like.delete({ where: { id: existing.id } })
      const count = await db.like.count({ where: { postId } })
      return NextResponse.json({ liked: false, likeCount: count })
    } else {
      await db.like.create({ data: { userId, postId } })
      const count = await db.like.count({ where: { postId } })
      return NextResponse.json({ liked: true, likeCount: count })
    }
  } catch (e) {
    console.error('POST /api/posts/[id]/like error', e)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
