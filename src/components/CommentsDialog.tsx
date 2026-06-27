'use client'

import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, MessageCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { Comment } from '@/lib/types'
import { formatRelativeTime } from '@/lib/time'
import { toast } from 'sonner'
import { useAppStore as useStore } from '@/lib/store'

export function CommentsDialog() {
  const commentsPostId = useAppStore((s) => s.commentsPostId)
  const closeComments = useAppStore((s) => s.closeComments)
  const posts = useAppStore((s) => s.posts)
  const addCommentToPost = useAppStore((s) => s.addCommentToPost)
  const currentUser = useAppStore((s) => s.currentUser)
  const openProfile = useStore((s) => s.openProfile)

  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const listEndRef = useRef<HTMLDivElement>(null)

  const post = posts.find((p) => p.id === commentsPostId) || null

  useEffect(() => {
    if (commentsPostId) {
      // scroll to bottom on open
      setTimeout(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 50)
    }
  }, [commentsPostId])

  async function handleSubmit() {
    if (!currentUser || !post) return
    if (!draft.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft, userId: currentUser.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.comment) throw new Error(data.error || 'Failed')
      addCommentToPost(post.id, data.comment as Comment)
      setDraft('')
      setTimeout(() => {
        listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 50)
    } catch (e) {
      console.error(e)
      toast.error('Could not post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={!!commentsPostId}
      onOpenChange={(v) => {
        if (!v) closeComments()
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-base">
            Comments {post && post.commentCount > 0 && `(${post.commentCount})`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and add comments to this post.
          </DialogDescription>
        </DialogHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {post && post.comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <MessageCircle className="size-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No comments yet. Start the conversation!
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {post?.comments.map((c) => {
                const initials = c.user.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
                return (
                  <li key={c.id} className="px-4 py-3 flex items-start gap-3">
                    <button
                      onClick={() => {
                        closeComments()
                        openProfile(c.user.id)
                      }}
                      className="shrink-0"
                      aria-label={`View ${c.user.name}'s profile`}
                    >
                      <Avatar className="size-9 ring-1 ring-border">
                        <AvatarImage src={c.user.avatarUrl || undefined} alt={c.user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-cyan-400 text-white text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            closeComments()
                            openProfile(c.user.id)
                          }}
                          className="font-semibold text-sm hover:underline"
                        >
                          {c.user.name}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          @{c.user.username}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <time
                          className="text-xs text-muted-foreground"
                          dateTime={c.createdAt}
                        >
                          {formatRelativeTime(c.createdAt)}
                        </time>
                      </div>
                      <p className="text-sm leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                    </div>
                  </li>
                )
              })}
              <div ref={listEndRef} />
            </ul>
          )}
        </div>

        {/* Compose comment */}
        <div className="border-t p-3 flex items-end gap-2 bg-background">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={currentUser ? 'Add a comment…' : 'Please log in to comment'}
            rows={2}
            maxLength={500}
            disabled={!currentUser || submitting}
            className="resize-none text-sm flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!currentUser || !draft.trim() || submitting}
            className="bg-gradient-to-br from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white"
            aria-label="Send comment"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
