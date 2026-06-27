# DeveloperHubs-Task-02-Main-App-Features

## SocialConnect 🌐

A mobile-style social feed web app built with **Next.js 16**, **TypeScript**, **Prisma** (SQLite), **Zustand**, and **shadcn/ui**. Users can create posts (text + optional image), like/unlike posts, comment, and view any user's profile by tapping on their name.

## ✨ Features

1. **Post Management**
   - Create text posts with optional image attachment
   - Vertically scrollable feed with windowed virtualization (FlatList-style)
   - Relative timestamps ("just now", "15s", "2m", "1d")
   - Pull-to-refresh

2. **Like & Comment System**
   - Like/unlike toggle with optimistic UI updates
   - Separate comments modal with autoscroll to newest comment
   - `Cmd/Ctrl + Enter` to submit a comment

3. **User Profiles**
   - Full profile view with avatar, bio, join date, and stats
   - Tap any username or avatar in the feed or comments to open that user's profile
   - Profile shows user's posts with like/comment counts

4. **State Management**
   - Single Zustand store managing auth, posts, likes, comments, and UI modals
   - Auth state persists across page reloads (localStorage)
   - Switch between 4 mock accounts instantly from the header dropdown


## 🛠 Tech Stack

| Layer            | Choice                          |
| ---------------- | ------------------------------- |
| Framework        | Next.js 16 (App Router)         |
| Language         | TypeScript 5                    |
| Styling          | Tailwind CSS 4 + shadcn/ui      |
| Database         | SQLite via Prisma ORM           |
| State Management | Zustand (with persist middleware) |
| Notifications    | Sonner toasts                   |
| Icons            | lucide-react                    |

## 📋 Prerequisites

Install these on your machine before you start:

1. **Node.js** (v18 or newer) — https://nodejs.org/
2. **A package manager** — pick ONE:
   - **npm** (comes with Node.js) — easiest
   - **bun** — fastest, recommended (`npm install -g bun`)
   - **pnpm** (`npm install -g pnpm`)
3. **Git** — https://git-scm.com/downloads
4. **VS Code** — https://code.visualstudio.com/

---

## 🚀 Run in VS Code (Step-by-Step)

### 1. Extract the ZIP
Extract the downloaded ZIP file to any folder, e.g.:
- Windows: `C:\Users\YourName\Projects\social-connect`
- macOS/Linux: `~/Projects/social-connect`

### 2. Open in VS Code
- Open VS Code
- `File` → `Open Folder` → select the extracted `social-connect` folder

### 3. Open the Terminal
In VS Code: `Terminal` → `New Terminal` (or press `` Ctrl + ` ``)

### 4. Install Dependencies
Run ONE of these in the terminal (pick your package manager):

```bash
# Option A: npm (recommended)
npm install

# Option B: bun (fastest)
bun install

# Option C: pnpm
pnpm install
```

### 5. Set Up Environment Variables
Create a `.env` file in the project root (you can copy the example):

```bash
# Linux / macOS
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Or manually create a `.env` file with this content:
```env
DATABASE_URL="file:./db/dev.db"
```

### 6. Set Up the Database
Run these commands (this creates the SQLite database and generates the Prisma client):

```bash
# Generate Prisma Client
npx prisma generate

# Create the database schema
npx prisma db push
```

> **Note:** The app also auto-seeds mock data (4 users, 6 posts, likes, comments) the first time you run it. If you want to seed manually, run:
> ```bash
> curl -X POST http://localhost:3000/api/seed
> ```

### 7. Start the Dev Server
```bash
# npm
npm run dev

# bun
bun run dev

# pnpm
pnpm dev
```

### 8. Open in Browser
Visit:
```
http://localhost:3000
```

You should see the SocialConnect app with mock posts loaded. The app auto-logs you in as **Ayesha Khan** on first visit. Use the avatar dropdown in the top-right to switch between the 4 mock accounts.

---

## 🧪 Try the App

Once the app is running, try these flows:

1. **Like a post** — tap the heart icon. Count updates instantly. Tap again to unlike.
2. **Comment** — tap the message icon → comments modal opens → type a comment → press the send button (or `Cmd/Ctrl + Enter`).
3. **View a profile** — tap any **username** or **avatar** in the feed or comments. Profile modal opens with stats and posts.
4. **Create a post** — tap the floating **+ button** at the bottom-right → write text → optionally attach an image → tap **Post**.
5. **Switch account** — tap your avatar in the top-right → pick another user. All likes/comments now act as that user.

---

## 📁 Project Structure

```
social-connect/
├── prisma/
│   └── schema.prisma              # Database models: User, Post, Like, Comment
├── public/
│   ├── logo.svg
│   ├── robots.txt
│   └── uploads/                   # User-uploaded images go here
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts + toaster)
│   │   ├── page.tsx               # Main page (mobile-frame layout)
│   │   ├── globals.css            # Tailwind + custom scrollbar styles
│   │   └── api/
│   │       ├── posts/
│   │       │   ├── route.ts                    # GET list, POST create
│   │       │   └── [id]/
│   │       │       ├── like/route.ts           # POST toggle like
│   │       │       └── comments/route.ts       # GET/POST comments
│   │       ├── users/[id]/route.ts             # GET user profile + posts
│   │       ├── auth/login/route.ts             # GET list mock users
│   │       ├── seed/route.ts                   # POST idempotent re-seed
│   │       └── upload/route.ts                 # POST image upload (base64)
│   ├── components/
│   │   ├── AppBootstrap.tsx       # On mount: seed + load users + auto-login
│   │   ├── AppHeader.tsx          # Sticky header + account switcher
│   │   ├── PostFeed.tsx           # Virtualized scrollable feed
│   │   ├── PostCard.tsx           # Single post (like, comment, author tap)
│   │   ├── ComposerDialog.tsx     # Create-post modal with image picker
│   │   ├── CommentsDialog.tsx     # Comments modal with autoscroll
│   │   ├── ProfileDialog.tsx      # User profile modal
│   │   ├── ComposerFab.tsx        # Floating + button
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   ├── lib/
│   │   ├── db.ts                  # Prisma client
│   │   ├── store.ts               # Zustand global store
│   │   ├── types.ts               # Shared TypeScript types
│   │   ├── time.ts                # Relative time formatter
│   │   └── utils.ts               # cn() helper
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json
└── eslint.config.mjs
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `prisma: command not found` | Use `npx prisma ...` instead of `prisma ...` |
| `Error: P1003: Database does not exist` | Run `npx prisma db push` first |
| `Port 3000 already in use` | Run `npx next dev -p 3001` to use port 3001 |
| `Module not found` errors | Run `npm install` again, then restart the dev server |
| Cannot log in / no users | The app auto-seeds on first run. If it didn't, run: `curl -X POST http://localhost:3000/api/seed` |
| Image upload fails | Make sure `public/uploads/` folder exists and is writable |
| Hydration mismatch warning | Clear your browser localStorage and reload: `localStorage.clear()` in the browser console |

---

## 📦 Available Scripts

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Build for production
npm run start     # Start production server (after build)
npm run lint      # Run ESLint
npm run db:push   # Push schema changes to DB
npm run db:generate  # Regenerate Prisma client
```

---


## 📝 License

MIT — free to use, modify, and distribute.

---

## 🤝 Credits

Built with the Next.js + Tailwind + shadcn/ui stack. Mock avatars from [pravatar.cc](https://pravatar.cc), post images from [Unsplash](https://unsplash.com).


