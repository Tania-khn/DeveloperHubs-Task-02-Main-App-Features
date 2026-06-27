import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/users/[id] - fetch a user's profile + their posts
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            likes: true,
            comments: true,
          },
        },
        _count: {
          select: {
            posts: true,
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        stats: {
          posts: user._count.posts,
          likes: user._count.likes,
          comments: user._count.comments,
        },
        posts: user.posts.map((p) => ({
          id: p.id,
          content: p.content,
          imageUrl: p.imageUrl,
          createdAt: p.createdAt.toISOString(),
          likeCount: p.likes.length,
          commentCount: p.comments.length,
        })),
      },
    })
  } catch (e) {
    console.error('GET /api/users/[id] error', e)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
