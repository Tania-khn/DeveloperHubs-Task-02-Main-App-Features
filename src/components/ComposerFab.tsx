'use client'

import { Plus } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function ComposerFab() {
  const setComposerOpen = useAppStore((s) => s.setComposerOpen)
  return (
    <button
      onClick={() => setComposerOpen(true)}
      aria-label="Create new post"
      className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
    >
      <Plus className="size-6" />
    </button>
  )
}
