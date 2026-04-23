import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { FolderOpen, Home, Plus, Search, Star, User } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { getMyCollections, createCollection } from '@/server/collections'
import { CreateCollectionDialog } from '@/components/common/create-collection-dialog'

type Collection = { id: string; name: string; createdAt: Date | null }

export function Sidebar() {
  const { data: session } = authClient.useSession()
  const [collections, setCollections] = useState<Collection[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!session?.user) {
      setCollections([])
      return
    }
    const refresh = () =>
      getMyCollections()
        .then(setCollections)
        .catch(() => {})
    refresh()
    window.addEventListener('collections-updated', refresh)
    return () => window.removeEventListener('collections-updated', refresh)
  }, [session?.user?.id])

  async function handleCreateCollection(name: string) {
    const newCol = await createCollection({ data: { name } })
    if (newCol) setCollections((prev) => [newCol, ...prev])
  }

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

      <div className="mt-8 flex h-full flex-col gap-4 overflow-y-auto">
        <nav className="space-y-2">
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
          {session?.user && (
            <Link
              to="/users/$userId"
              params={{ userId: session.user.id }}
              className="flex items-center gap-3 rounded-(--radius) px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground [&.active]:bg-surface-container-high [&.active]:text-primary"
            >
              <User className="size-4" />
              My Snippets
            </Link>
          )}
        </nav>

        {session?.user && (
          <div className="mt-2 border-t border-border pt-4">
            <div className="mb-4 flex items-center justify-between px-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Collections
              </span>
              <button
                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setDialogOpen(true)}
                aria-label="New collection"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            {collections.length === 0 ? (
              <p className="px-4 py-2 text-xs text-muted-foreground">No collections yet</p>
            ) : (
              <div className="space-y-1">
                {collections.map((c) => (
                  <Link
                    key={c.id}
                    to="/collections/$collectionId"
                    params={{ collectionId: c.id }}
                    className="flex items-center gap-3 rounded-(--radius) px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground [&.active]:bg-surface-container-high [&.active]:text-primary"
                  >
                    <FolderOpen className="size-4 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreateCollectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleCreateCollection}
      />
    </aside>
  )
}
