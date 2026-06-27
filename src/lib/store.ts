'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrentUser, Post, Comment } from './types'

interface AppState {
  // Auth
  currentUser: CurrentUser | null
  availableUsers: CurrentUser[]
  setAvailableUsers: (u: CurrentUser[]) => void
  login: (u: CurrentUser) => void
  logout: () => void

  // Posts
  posts: Post[]
  setPosts: (p: Post[]) => void
  addPost: (p: Post) => void
  updatePostLike: (postId: string, liked: boolean, likeCount: number) => void
  addCommentToPost: (postId: string, comment: Comment) => void

  // UI: profile modal
  profileUserId: string | null
  openProfile: (userId: string) => void
  closeProfile: () => void

  // UI: comments modal
  commentsPostId: string | null
  openComments: (postId: string) => void
  closeComments: () => void

  // UI: composer
  composerOpen: boolean
  setComposerOpen: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      availableUsers: [],
      setAvailableUsers: (u) => set({ availableUsers: u }),
      login: (u) => set({ currentUser: u }),
      logout: () => set({ currentUser: null }),

      posts: [],
      setPosts: (p) => set({ posts: p }),
      addPost: (p) => set((s) => ({ posts: [p, ...s.posts] })),
      updatePostLike: (postId, liked, likeCount) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId ? { ...p, likedByMe: liked, likeCount } : p
          ),
        })),
      addCommentToPost: (postId, comment) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [...p.comments, comment],
                  commentCount: p.commentCount + 1,
                }
              : p
          ),
        })),

      profileUserId: null,
      openProfile: (userId) => set({ profileUserId: userId }),
      closeProfile: () => set({ profileUserId: null }),

      commentsPostId: null,
      openComments: (postId) => set({ commentsPostId: postId }),
      closeComments: () => set({ commentsPostId: null }),

      composerOpen: false,
      setComposerOpen: (v) => set({ composerOpen: v }),
    }),
    {
      name: 'social-connect-store',
      // Persist only auth
      partialize: (s) => ({ currentUser: s.currentUser }),
    }
  )
)
