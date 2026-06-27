'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { LogOut, User as UserIcon, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function AppHeader() {
  const currentUser = useAppStore((s) => s.currentUser)
  const availableUsers = useAppStore((s) => s.availableUsers)
  const login = useAppStore((s) => s.login)
  const logout = useAppStore((s) => s.logout)
  const openProfile = useAppStore((s) => s.openProfile)

  if (!currentUser) {
    return (
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              S
            </div>
            <span className="font-semibold tracking-tight">SocialConnect</span>
          </div>
        </div>
      </header>
    )
  }

  const initials = currentUser.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            S
          </div>
          <span className="font-semibold tracking-tight">SocialConnect</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full pr-3 pl-1 py-1 hover:bg-muted transition-colors"
              aria-label="Open menu"
            >
              <Avatar className="size-8 ring-1 ring-border">
                <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} />
                <AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-400 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{currentUser.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground leading-tight">
                  @{currentUser.username}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => openProfile(currentUser.id)}
              className="cursor-pointer"
            >
              <UserIcon className="mr-2 size-4" />
              My profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs text-muted-foreground">Switch account</div>
            {availableUsers
              .filter((u) => u.id !== currentUser.id)
              .map((u) => (
                <DropdownMenuItem
                  key={u.id}
                  className="cursor-pointer"
                  onClick={() => {
                    login(u)
                    toast.success(`Switched to ${u.name}`)
                  }}
                >
                  <Avatar className="mr-2 size-6">
                    <AvatarImage src={u.avatarUrl || undefined} alt={u.name} />
                    <AvatarFallback className="text-[10px]">
                      {u.name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm leading-tight">{u.name}</span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      @{u.username}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => {
                logout()
                toast.info('Logged out')
              }}
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
