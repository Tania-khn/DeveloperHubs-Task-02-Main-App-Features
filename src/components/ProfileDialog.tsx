'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, MessageCircle, Calendar, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { UserProfile } from '@/lib/types'
import { formatRelativeTime } from '@/lib/time'
import { toast } from 'sonner'

export function ProfileDialog() {
  const profileUserId = useAppStore((s) => s.profileUserId)
  const closeProfile = useAppStore((s) => s.closeProfile)
  const currentUser = useAppStore((s) => s.currentUser)
  const openComments = useAppStore((s) => s.openComments)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profileUserId) {
      setProfile(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setProfile(null)
    async function load() {
      try {
        const res = await fetch(`/api/users/${profileUserId}`)
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) throw new Error(data.error || 'Failed')
        setProfile(data.user)
      } catch (e) {
        console.error(e)
        if (!cancelled) toast.error('Could not load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [profileUserId])

  const isMe = currentUser?.id === profileUserId

  return (
    <Dialog
      open={!!profileUserId}
      onOpenChange={(v) => {
        if (!v) closeProfile()
      }}
    >
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">User profile</DialogTitle>
        <DialogDescription className="sr-only">
          View user details, stats, and recent posts.
        </DialogDescription>
        {/* Cover */}
        <div className="relative h-24 bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400">
          <button
            onClick={closeProfile}
            className="absolute top-3 right-3 size-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50"
            aria-label="Close profile"
          >
            <X className="size-4" />
          </button>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : profile ? (
          <div className="px-5 pb-5">
            <div className="-mt-10 flex items-end justify-between">
              <Avatar className="size-20 ring-4 ring-background">
                <AvatarImage src={profile.avatarUrl || undefined} alt={profile.name} />
                <AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-400 text-white text-xl font-semibold">
                  {profile.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isMe && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-1"
                  onClick={() => toast.info('Edit profile coming soon')}
                >
                  Edit profile
                </Button>
              )}
            </div>

            <div className="mt-3">
              <h2 className="text-lg font-semibold leading-tight">{profile.name}</h2>
              <div className="text-sm text-muted-foreground">@{profile.username}</div>
              {profile.bio && (
                <p className="text-sm mt-2 leading-relaxed">{profile.bio}</p>
              )}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                Joined {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-5">
              <Stat label="Posts" value={profile.stats.posts} />
              <Stat label="Likes given" value={profile.stats.likes} />
              <Stat label="Comments" value={profile.stats.comments} />
            </div>

            {/* Posts */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                Posts
                <span className="text-xs text-muted-foreground font-normal">
                  ({profile.posts.length})
                </span>
              </h3>
              {profile.posts.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-xl">
                  No posts yet.
                </div>
              ) : (
                <ul className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {profile.posts.map((p) => (
                    <li
                      key={p.id}
                      className="border rounded-xl p-3 hover:bg-muted/50 transition-colors"
                    >
                      <p className="text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap break-words">
                        {p.content}
                      </p>
                      {p.imageUrl && (
                        <img
                          src={p.imageUrl}
                          alt="Post attachment"
                          className="mt-2 rounded-lg w-full max-h-40 object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="size-3.5" />
                          {p.likeCount}
                        </span>
                        <button
                          className="flex items-center gap-1 hover:text-foreground"
                          onClick={() => {
                            closeProfile()
                            // small delay so the comments dialog opens cleanly
                            setTimeout(() => openComments(p.id), 100)
                          }}
                        >
                          <MessageCircle className="size-3.5" />
                          {p.commentCount}
                        </button>
                        <span className="ml-auto">
                          {formatRelativeTime(p.createdAt)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Profile not available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="px-5 pb-5">
      <div className="-mt-10">
        <Skeleton className="size-20 rounded-full ring-4 ring-background" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="mt-4 flex gap-5">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}
