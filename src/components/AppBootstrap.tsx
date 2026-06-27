'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import type { CurrentUser } from '@/lib/types'

const STORAGE_AVAILABLE_USERS = 'social-connect-available-users'

/**
 * On mount, ensures the backend is seeded and loads the available mock users.
 * Picks the first user as the default current user if none is set.
 */
export function AppBootstrap() {
  const currentUser = useAppStore((s) => s.currentUser)
  const login = useAppStore((s) => s.login)
  const setAvailableUsers = useAppStore((s) => s.setAvailableUsers)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        // 1. Seed (idempotent)
        await fetch('/api/seed', { method: 'POST' })

        // 2. Fetch available users
        const res = await fetch('/api/auth/login')
        const data = await res.json()
        const users: CurrentUser[] = (data.users ?? []).map((u: CurrentUser) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          avatarUrl: u.avatarUrl,
          bio: u.bio ?? null,
        }))
        if (cancelled) return
        setAvailableUsers(users)
        try {
          localStorage.setItem(STORAGE_AVAILABLE_USERS, JSON.stringify(users))
        } catch {
          /* ignore */
        }

        // 3. Auto-login as first user if none
        if (!currentUser && users.length > 0) {
          login(users[0])
        }
      } catch (e) {
        console.error('Bootstrap failed', e)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
