import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/seed - seed mock users and posts (always resets to a clean state)
export async function POST() {
  try {
    // Clean slate: delete in dependency order
    await db.comment.deleteMany()
    await db.like.deleteMany()
    await db.post.deleteMany()
    await db.user.deleteMany()

    const users = await db.user.createMany({
      data: [
        {
          name: 'Ayesha Khan',
          username: 'ayesha.k',
          email: 'ayesha@example.com',
          bio: 'Coffee enthusiast ☕ | Photographer | Lahore, PK',
          avatarUrl: 'https://i.pravatar.cc/200?img=47',
        },
        {
          name: 'Bilal Ahmed',
          username: 'bilal.ahmed',
          email: 'bilal@example.com',
          bio: 'Software engineer. Building things on the web.',
          avatarUrl: 'https://i.pravatar.cc/200?img=12',
        },
        {
          name: 'Sara Malik',
          username: 'sara.malik',
          email: 'sara@example.com',
          bio: 'Designer & illustrator. Loves typography.',
          avatarUrl: 'https://i.pravatar.cc/200?img=32',
        },
        {
          name: 'Hamza Sheikh',
          username: 'hamza.s',
          email: 'hamza@example.com',
          bio: 'Traveler 🌍 | Foodie 🍜 | Karachi',
          avatarUrl: 'https://i.pravatar.cc/200?img=15',
        },
      ],
    })

    const allUsers = await db.user.findMany()

    const samplePosts: { authorIdx: number; content: string; imageUrl: string | null }[] = [
      {
        authorIdx: 0,
        content:
          'Just finished a beautiful sunrise photoshoot at Badshahi Mosque today. The light was absolutely magical! 🌅',
        imageUrl: 'https://images.unsplash.com/photo-1546484959-f9a381d1330c?w=900',
      },
      {
        authorIdx: 1,
        content:
          'Spent the morning refactoring our state management. Zustand + React Query is honestly such a clean combo for medium-sized apps. Less boilerplate, more clarity.',
        imageUrl: null,
      },
      {
        authorIdx: 2,
        content:
          'New typography study dropping soon. Working on a serif/sans-serif pairing that feels editorial but modern. Anyone else obsessed with kerning? 😅',
        imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900',
      },
      {
        authorIdx: 3,
        content:
          'Street food tour in Karachi was unreal. Biryani at Burns Road, then dahi baray at Lahore Hotel. 10/10 would do it again tomorrow.',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900',
      },
      {
        authorIdx: 0,
        content:
          'Reminder: take breaks. The best ideas often come when you are not staring at the screen. ✨',
        imageUrl: null,
      },
      {
        authorIdx: 1,
        content:
          'Hot take: comments are documentation that ages well. Write more of them, especially the "why" not the "what".',
        imageUrl: null,
      },
    ]

    for (const p of samplePosts) {
      await db.post.create({
        data: {
          content: p.content,
          imageUrl: p.imageUrl,
          authorId: allUsers[p.authorIdx].id,
        },
      })
    }

    // Add some likes & comments
    const allPosts = await db.post.findMany()
    if (allPosts.length > 0 && allUsers.length >= 4) {
      // Individual creates with try/catch to handle unique constraint
      const likesToCreate: [number, number][] = [
        [1, 0], [2, 0], // likes on Ayesha's photoshoot post
        [0, 1], [3, 1], // likes on Bilal's "refactoring" post
        [0, 3], [1, 3], [2, 3], // likes on Hamza's street food post
      ]
      for (const [uIdx, pIdx] of likesToCreate) {
        try {
          await db.like.create({
            data: {
              userId: allUsers[uIdx].id,
              postId: allPosts[pIdx].id,
            },
          })
        } catch {
          // skip duplicates
        }
      }

      const commentsToCreate: { uIdx: number; pIdx: number; content: string }[] = [
        {
          uIdx: 1,
          pIdx: 0,
          content: 'These shots are stunning! What camera did you use?',
        },
        {
          uIdx: 2,
          pIdx: 0,
          content: 'The composition is on point 🔥',
        },
        {
          uIdx: 0,
          pIdx: 1,
          content: 'Agreed! Zustand has been my go-to lately.',
        },
        {
          uIdx: 3,
          pIdx: 1,
          content: 'TanStack Query for the win.',
        },
        {
          uIdx: 0,
          pIdx: 3,
          content: 'Burns Road biryani hits different 🤤',
        },
      ]
      for (const c of commentsToCreate) {
        await db.comment.create({
          data: {
            content: c.content,
            userId: allUsers[c.uIdx].id,
            postId: allPosts[c.pIdx].id,
          },
        })
      }
    }

    return NextResponse.json({
      message: 'Seeded successfully',
      users: users.count,
      posts: samplePosts.length,
    })
  } catch (e) {
    console.error('POST /api/seed error', e)
    return NextResponse.json({ error: 'Failed to seed' }, { status: 500 })
  }
}
