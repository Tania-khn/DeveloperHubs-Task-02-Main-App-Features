export interface Author {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  bio?: string | null
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    username: string
    avatarUrl: string | null
  }
}

export interface Post {
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  author: Author
  likeCount: number
  likedByMe: boolean
  likes: { id: string; userId: string; createdAt: string }[]
  commentCount: number
  comments: Comment[]
}

export interface CurrentUser {
  id: string
  name: string
  username: string
  email: string
  avatarUrl: string | null
  bio: string | null
}

export interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  bio: string | null
  avatarUrl: string | null
  createdAt: string
  stats: { posts: number; likes: number; comments: number }
  posts: {
    id: string
    content: string
    imageUrl: string | null
    createdAt: string
    likeCount: number
    commentCount: number
  }[]
}
