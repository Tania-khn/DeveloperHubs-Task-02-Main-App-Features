'use client'

import { AppBootstrap } from '@/components/AppBootstrap'
import { AppHeader } from '@/components/AppHeader'
import { PostFeed } from '@/components/PostFeed'
import { ComposerDialog } from '@/components/ComposerDialog'
import { ComposerFab } from '@/components/ComposerFab'
import { CommentsDialog } from '@/components/CommentsDialog'
import { ProfileDialog } from '@/components/ProfileDialog'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const currentUser = useAppStore((s) => s.currentUser)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50/40 via-background to-orange-50/30 dark:from-rose-950/10 dark:via-background dark:to-orange-950/10">
      <AppBootstrap />

      {/* Mobile-frame container that grows into full screen on small devices */}
      <div className="mx-auto w-full sm:max-w-md md:max-w-lg lg:max-w-xl flex-1 flex flex-col bg-background sm:my-6 sm:rounded-3xl sm:shadow-2xl sm:ring-1 sm:ring-border overflow-hidden sm:min-h-[640px] sm:max-h-[88vh]">
        <AppHeader />

        {currentUser ? (
          <main className="flex-1 flex flex-col min-h-0">
            <PostFeed />
          </main>
        ) : (
          <main className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            <Loader2 className="size-8 animate-spin text-rose-500" />
            <p className="text-sm text-muted-foreground">Loading SocialConnect…</p>
          </main>
        )}

        <Footer />
      </div>

      {/* Floating composer + modals */}
      {currentUser && <ComposerFab />}
      <ComposerDialog />
      <CommentsDialog />
      <ProfileDialog />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-muted/30 px-4 py-3 text-center">
      <p className="text-xs text-muted-foreground">
        SocialConnect · Built with Next.js, Zustand & Prisma
      </p>
    </footer>
  )
}
