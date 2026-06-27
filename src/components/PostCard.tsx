'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'
import { useAppStore } from '@/lib/store'
import { formatRelativeTime, formatFullDate } from '@/lib/time'
import { useState } from 'react'
import { toast } from 'sonner'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const currentUser = useAppStore((s) => s.currentUser)
  const updatePostLike = useAppStore((s) => s.updatePostLike)
  const openComments = useAppStore((s) => s.openComments)
  const openProfile = useAppStore((s) => s.openProfile)
  const [busy, setBusy] = useState(false)

  const initials = post.author.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  async function handleLike() {
    if (!currentUser) return
    if (busy) return
    setBusy(true)
    // Optimistic update
    const wasLiked = post.likedByMe
    updatePostLike(
      post.id,
      !wasLiked,
      Math.max(0, post.likeCount + (wasLiked ? -1 : 1))
    )
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      updatePostLike(post.id, data.liked, data.likeCount)
    } catch {
      // rollback
      updatePostLike(post.id, wasLiked, post.likeCount)
      toast.error('Could not update like')
    } finally {
      setBusy(false)
    }
  }

  function handleOpenComments() {
    openComments(post.id)
  }

  function handleAuthorClick() {
    openProfile(post.author.id)
  }

  return (
    <article className="border-b px-4 py-4">
      {/* Header: avatar + name + timestamp */}
      <div className="flex items-start gap-3">
        <button
          onClick={handleAuthorClick}
          className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400/40"
          aria-label={`View ${post.author.name}'s profile`}
        >
          <Avatar className="size-11 ring-1 ring-border">
            <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.name} />
            <AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-400 text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAuthorClick}
              className="font-semibold text-sm hover:underline truncate"
            >
              {post.author.name}
            </button>
            <span className="text-xs text-muted-foreground truncate">
              @{post.author.username}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <time
              className="text-xs text-muted-foreground"
              title={formatFullDate(post.createdAt)}
              dateTime={post.createdAt}
            >
              {formatRelativeTime(post.createdAt)}
            </time>
          </div>

          {/* Content */}
          <div className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border bg-muted">
              <img
                src={post.imageUrl}
                alt="Post attachment"
                className="w-full max-h-[480px] object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={busy}
              className={cn(
                'h-8 px-2 gap-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40',
                post.likedByMe && 'text-rose-500'
              )}
              aria-pressed={post.likedByMe}
              aria-label={post.likedByMe ? 'Unlike post' : 'Like post'}
            >
              <Heart
                className={cn('size-4', post.likedByMe && 'fill-current')}
              />
              <span className="text-xs font-medium tabular-nums">
                {post.likeCount}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenComments}
              className="h-8 px-2 gap-1.5 text-muted-foreground hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40"
              aria-label="View comments"
            >
              <MessageCircle className="size-4" />
              <span className="text-xs font-medium tabular-nums">
                {post.commentCount}
              </span>
            </Button>
          </div>

          {/* Last comment preview */}
          {post.comments.length > 0 && (
            <button
              onClick={handleOpenComments}
              className="mt-1 text-xs text-muted-foreground hover:underline"
            >
              View all {post.commentCount} comment{post.commentCount === 1 ? '' : 's'}
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          aria-label="More options"
          onClick={() => toast.info('More options coming soon')}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </article>
  )
}
