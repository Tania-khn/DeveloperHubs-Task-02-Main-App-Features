'use client'

import { useEffect, useRef, useState } from 'react'
import type { Post } from '@/lib/types'
import { PostCard } from './PostCard'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

/**
 * FlatList-style virtualized post feed.
 * - Vertically scrollable
 * - Windowed rendering: only items within viewport + overscan are mounted
 * - Pull-to-refresh (top) + Load-more sentinel (bottom)
 */
export function PostFeed() {
  const posts = useAppStore((s) => s.posts)
  const setPosts = useAppStore((s) => s.setPosts)
  const currentUser = useAppStore((s) => s.currentUser)

  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Virtualization state
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportH, setViewportH] = useState(800)
  const ITEM_HEIGHT_EST = 360 // estimated item height
  const OVERSCAN = 3

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    const onResize = () => setViewportH(el.clientHeight)
    onResize()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    let cancelled = false
    async function fetchPosts() {
      setLoading(true)
      try {
        const res = await fetch('/api/posts', {
          headers: currentUser ? { 'x-user-id': currentUser.id } : {},
        })
        const data = await res.json()
        if (!cancelled && data.posts) {
          setPosts(data.posts)
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) toast.error('Failed to load posts')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPosts()
    return () => {
      cancelled = true
    }
  }, [currentUser, setPosts])

  async function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    try {
      const res = await fetch('/api/posts', {
        headers: currentUser ? { 'x-user-id': currentUser.id } : {},
      })
      const data = await res.json()
      if (data.posts) {
        setPosts(data.posts)
        toast.success('Feed refreshed')
      }
    } catch {
      toast.error('Refresh failed')
    } finally {
      setRefreshing(false)
    }
  }

  // Virtualization calculation
  const startIdx = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT_EST) - OVERSCAN)
  const endIdx = Math.min(
    posts.length,
    Math.ceil((scrollTop + viewportH) / ITEM_HEIGHT_EST) + OVERSCAN
  )
  const visiblePosts = posts.slice(startIdx, endIdx)
  const topPad = startIdx * ITEM_HEIGHT_EST
  const bottomPad = Math.max(0, (posts.length - endIdx) * ITEM_HEIGHT_EST)

  return (
    <div className="flex flex-col h-full">
      {/* Refresh bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">
          {loading
            ? 'Loading feed…'
            : `${posts.length} post${posts.length === 1 ? '' : 's'}`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1.5"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          {refreshing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Scrollable feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
        aria-busy={loading}
      >
        {loading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ height: topPad }} aria-hidden />
            {visiblePosts.map((p) => (
              <div key={p.id} data-post-id={p.id}>
                <PostCard post={p} />
              </div>
            ))}
            <div style={{ height: bottomPad }} aria-hidden />
          </div>
        )}
      </div>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="px-4 py-4">
          <div className="flex items-start gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-40 w-full rounded-xl mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="size-16 rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-400/10 flex items-center justify-center mb-4">
        <RefreshCw className="size-7 text-rose-500" />
      </div>
      <h3 className="font-semibold text-base">No posts yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Be the first to share something. Tap the + button at the bottom to compose a post.
      </p>
    </div>
  )
}
