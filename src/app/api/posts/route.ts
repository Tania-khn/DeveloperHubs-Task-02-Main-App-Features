import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/posts - fetch all posts with author, likes, comments
export async function GET(req: NextRequest) {
  try {
    const currentUserId = req.headers.get('x-user-id') || null

    const posts = await db.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        likes: { include: { user: true } },
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
      },
    })

    const serialized = posts.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt.toISOString(),
      author: {
        id: p.author.id,
        name: p.author.name,
        username: p.author.username,
        avatarUrl: p.author.avatarUrl,
        bio: p.author.bio,
      },
      likeCount: p.likes.length,
      likedByMe: currentUserId
        ? p.likes.some((l) => l.userId === currentUserId)
        : false,
      likes: p.likes.map((l) => ({
        id: l.id,
        userId: l.userId,
        createdAt: l.createdAt.toISOString(),
      })),
      commentCount: p.comments.length,
      comments: p.comments.map((c) => ({
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
    }))

    return NextResponse.json({ posts: serialized })
  } catch (e) {
    console.error('GET /api/posts error', e)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/posts - create new post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content, imageUrl, authorId } = body as {
      content?: string
      imageUrl?: string | null
      authorId?: string
    }

    if (!authorId) {
      return NextResponse.json({ error: 'authorId is required' }, { status: 400 })
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const post = await db.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl || null,
        authorId,
      },
      include: {
        author: true,
        likes: { include: { user: true } },
        comments: { include: { user: true } },
      },
    })

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt.toISOString(),
        author: {
          id: post.author.id,
          name: post.author.name,
          username: post.author.username,
          avatarUrl: post.author.avatarUrl,
          bio: post.author.bio,
        },
        likeCount: 0,
        likedByMe: false,
        likes: [],
        commentCount: 0,
        comments: [],
      },
    })
  } catch (e) {
    console.error('POST /api/posts error', e)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
