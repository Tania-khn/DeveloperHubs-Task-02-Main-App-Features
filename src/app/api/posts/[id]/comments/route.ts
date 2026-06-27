import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/posts/[id]/comments - list comments for a post
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const comments = await db.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    })
    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        user: {
          id: c.user.id,
          name: c.user.name,
          username: c.user.username,
          avatarUrl: c.user.avatarUrl,
        },
      })),
    })
  } catch (e) {
    console.error('GET /api/posts/[id]/comments error', e)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/posts/[id]/comments - add a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const body = await req.json()
    const { content, userId } = body as { content?: string; userId?: string }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: { content: content.trim(), userId, postId },
      include: { user: true },
    })

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
        },
      },
    })
  } catch (e) {
    console.error('POST /api/posts/[id]/comments error', e)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}
