import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { listSnippets, getMyFavoriteIds } from '@/server/snippets'
import { toggleFavorite } from '@/server/mutations'
import { saveUserSettings } from '@/server/settings'
import { SnippetCard } from '@/components/snippet-card'
import { LANGUAGES } from '@/lib/languages'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'

const PAGE_SIZE = 20

type SearchParams = {
  q?: string
  langs?: string
}

type Snippet = Awaited<ReturnType<typeof listSnippets>>[number]

export const Route = createFileRoute('/_app/explore')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === 'string' && search.q.trim() ? search.q.trim() : undefined,
    langs:
      typeof search.langs === 'string' && search.langs.trim() ? search.langs.trim() : undefined
  }),
  loaderDeps: ({ search: { q, langs } }) => ({ q, langs }),
  loader: async ({ deps: { q, langs } }) => {
    const languages = langs ? langs.split(',').filter(Boolean) : []
    const [snippets, favoriteIds] = await Promise.all([
      listSnippets({ data: { q, limit: PAGE_SIZE, languages } }),
      getMyFavoriteIds()
    ])
    return { snippets, favoriteIds, q }
  },
  component: ExplorePage
})

function ExplorePage() {
  const { snippets: initialSnippets, favoriteIds, q } = Route.useLoaderData()
  const { langs } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const [extraSnippets, setExtraSnippets] = useState<Snippet[]>([])
  const [hasMore, setHasMore] = useState(initialSnippets.length === PAGE_SIZE)
  const [isFetching, setIsFetching] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // Track current offset for next fetch
  const offsetRef = useRef(initialSnippets.length)

  // Reset client state whenever the loader data changes (q or langs changed)
  useEffect(() => {
    setExtraSnippets([])
    setHasMore(initialSnippets.length === PAGE_SIZE)
    offsetRef.current = initialSnippets.length
  }, [initialSnippets])

  async function handleToggleFavorite(snippetId: string) {
    await toggleFavorite({ data: { snippetId } })
    await router.invalidate()
  }

  const loadMore = useCallback(async () => {
    if (isFetching || !hasMore) return
    setIsFetching(true)
    try {
      const languages = langs ? langs.split(',').filter(Boolean) : []
      const next = await listSnippets({
        data: { q, limit: PAGE_SIZE, offset: offsetRef.current, languages }
      })
      setExtraSnippets((prev) => [...prev, ...next])
      offsetRef.current += next.length
      if (next.length < PAGE_SIZE) setHasMore(false)
    } finally {
      setIsFetching(false)
    }
  }, [isFetching, hasMore, q, langs])

  // IntersectionObserver on sentinel div
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  // On mount: if no langs in URL, seed from localStorage
  useEffect(() => {
    if (!langs) {
      try {
        const stored = localStorage.getItem('snippetvault_filters')
        if (stored) {
          const parsed = JSON.parse(stored) as { languages: string[] }
          if (parsed.languages.length > 0) {
            void navigate({
              search: (prev) => ({ ...prev, langs: parsed.languages.join(',') }),
              replace: true
            })
          }
        }
      } catch {
        // ignore malformed localStorage
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeLangs = langs ? langs.split(',').filter(Boolean) : []
  const allSnippets = [...initialSnippets, ...extraSnippets]

  function handleFilterApply(selectedLangs: string[]) {
    const langsParam = selectedLangs.length > 0 ? selectedLangs.join(',') : undefined
    localStorage.setItem('snippetvault_filters', JSON.stringify({ languages: selectedLangs }))
    if (session?.user) {
      saveUserSettings({ data: { languagePreferences: selectedLangs } }).catch(console.error)
    }
    void navigate({
      search: (prev) => ({ ...prev, langs: langsParam }),
      replace: true
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-3xl font-bold text-foreground">
            {q ? `Results for "${q}"` : 'Explore'}
          </h1>
          {q && (
            <span className="text-sm text-muted-foreground">
              {allSnippets.length} result{allSnippets.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <FilterDrawer activeLangs={activeLangs} onApply={handleFilterApply} />
      </div>

      {allSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-(--radius) bg-surface-container py-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          {q ? (
            <>
              <p className="font-display text-2xl font-semibold text-foreground">
                No results for "{q}"
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Try different keywords.</p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl font-semibold text-foreground">No snippets found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeLangs.length > 0
                  ? 'Try adjusting your language filter.'
                  : "It's so quiet here..."}
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
            {allSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                id={snippet.id}
                title={snippet.title}
                language={snippet.language}
                tags={snippet.tags}
                htmlPreview={snippet.htmlPreview || ''}
                createdAt={new Date(snippet.createdAt!)}
                authorName={snippet.author?.name ?? undefined}
                isFavorited={favoriteIds.includes(snippet.id)}
                onFavoriteToggle={session?.user ? handleToggleFavorite : undefined}
              />
            ))}
          </div>

          {/* Sentinel for IntersectionObserver */}
          <div ref={sentinelRef} className="flex justify-center py-4">
            {isFetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                Loading more…
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function FilterDrawer({
  activeLangs,
  onApply
}: {
  activeLangs: string[]
  onApply: (langs: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(activeLangs)

  // Reset to current active langs when drawer opens
  useEffect(() => {
    if (open) setSelected(activeLangs)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(lang: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, lang] : prev.filter((l) => l !== lang)))
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <SlidersHorizontal className="size-4" />
          Filters
          {activeLangs.length > 0 && (
            <span className="ml-0.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-semibold text-primary">
              {activeLangs.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter by Language</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-2 overflow-y-auto p-4">
          {LANGUAGES.map((lang) => (
            <label
              key={lang}
              className="flex cursor-pointer items-center gap-3 rounded-(--radius) px-3 py-2.5 transition-colors hover:bg-surface-container"
            >
              <Checkbox
                checked={selected.includes(lang)}
                onCheckedChange={(checked) => toggle(lang, !!checked)}
              />
              <span className="text-sm font-medium capitalize">{lang}</span>
            </label>
          ))}
        </div>
        <DrawerFooter>
          <Button
            onClick={() => {
              onApply(selected)
              setOpen(false)
            }}
          >
            Apply
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
