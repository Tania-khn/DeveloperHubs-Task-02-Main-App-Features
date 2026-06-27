'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

export function ComposerDialog() {
  const open = useAppStore((s) => s.composerOpen)
  const setOpen = useAppStore((s) => s.setComposerOpen)
  const currentUser = useAppStore((s) => s.currentUser)
  const addPost = useAppStore((s) => s.addPost)

  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setContent('')
    setImageUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please pick an image file')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image must be under 4MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!currentUser) return
    if (!content.trim()) {
      toast.error('Write something first')
      return
    }
    setSubmitting(true)
    try {
      let finalImageUrl: string | null = null
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        const up = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: imageUrl }),
        })
        const upData = await up.json()
        if (!up.ok || !upData.url) throw new Error('Upload failed')
        finalImageUrl = upData.url
      } else if (imageUrl) {
        finalImageUrl = imageUrl
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          imageUrl: finalImageUrl,
          authorId: currentUser.id,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.post) throw new Error(data.error || 'Failed to post')
      addPost(data.post)
      toast.success('Post published')
      reset()
      setOpen(false)
    } catch (e) {
      console.error(e)
      toast.error('Could not publish post')
    } finally {
      setSubmitting(false)
    }
  }

  if (!currentUser) return null

  const initials = currentUser.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription className="sr-only">
            Share a text post with an optional image attachment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3">
          <Avatar className="size-10 ring-1 ring-border">
            <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} />
            <AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-400 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{currentUser.name}</div>
            <div className="text-xs text-muted-foreground">@{currentUser.username}</div>
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
          rows={5}
          maxLength={1000}
          className="resize-none text-base"
          autoFocus
        />

        {imageUrl && (
          <div className="relative rounded-xl overflow-hidden border bg-muted">
            <img src={imageUrl} alt="Preview" className="w-full max-h-72 object-cover" />
            <button
              type="button"
              onClick={() => {
                setImageUrl(null)
                if (fileRef.current) fileRef.current.value = ''
              }}
              className="absolute top-2 right-2 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              aria-label="Remove image"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickImage}
        />

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={submitting}
            className="gap-2"
          >
            <ImagePlus className="size-4" />
            {imageUrl ? 'Change image' : 'Add image'}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="gap-2 bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
