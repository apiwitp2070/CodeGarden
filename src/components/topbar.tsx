import { Link } from '@tanstack/react-router'
import { LogIn, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'
import { SearchInput } from './search-input'

export function TopBar() {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user

  async function handleSignOut() {
    await authClient.signOut()
  }

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between bg-surface-base/70 p-6 backdrop-blur-xl">
      <div className="hidden md:block w-full">
        <SearchInput />
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Recent
          </Link>
        </nav>

        {user ? (
          <Button asChild size="sm" className="hidden sm:flex">
            <Link to="/snippets/new">
              <Plus className="size-4" />
              New Snippet
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" className="hidden sm:flex" variant="secondary">
            <a href="/auth?mode=signin">
              <LogIn className="size-4" />
              Sign In
            </a>
          </Button>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src={user.image ?? ''} alt={user.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild className="font-space cursor-pointer">
                <Link
                  to="/users/$userId"
                  params={{ userId: user.id }}
                  className="flex flex-col gap-1 items-start"
                >
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => void handleSignOut()}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : isPending ? (
          <div className="size-10 rounded-full bg-surface-container-low" />
        ) : null}
      </div>
    </header>
  )
}
