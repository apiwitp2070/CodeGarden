import { Link } from '@tanstack/react-router'
import { Home, Search, Star } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="fixed bottom-0 left-0 top-0 z-20 hidden w-64 bg-surface-container-low/90 p-6 md:flex md:flex-col">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-(--radius) bg-primary/10 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
            <polyline points="14 2 14 8 20 8" />
            <path d="m3 15 2 2 4-4" />
          </svg>
        </div>
        <span className="font-display text-lg font-bold text-foreground">
          Snippet<span className="text-primary">Vault</span>
        </span>
      </Link>

      <div className="mt-8 flex h-full flex-col gap-4">
        <nav className="flex-1 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-(--radius) px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground [&.active]:bg-surface-container-high [&.active]:text-primary"
          >
            <Home className="size-4" />
            Home
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-3 rounded-(--radius) px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground [&.active]:bg-surface-container-high [&.active]:text-primary"
          >
            <Search className="size-4" />
            Explore
          </Link>
          <Link
            to="/favourites"
            className="flex items-center gap-3 rounded-(--radius) px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground [&.active]:bg-surface-container-high [&.active]:text-primary"
          >
            <Star className="size-4" />
            Favourites
          </Link>
        </nav>
      </div>
    </aside>
  )
}
