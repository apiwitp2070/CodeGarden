import { createFileRoute, useRouter } from '@tanstack/react-router'
import { listSnippets, getMyFavoriteIds } from '@/server/snippets'
import { toggleFavorite } from '@/server/mutations'
import { SnippetCard } from '@/components/snippet-card'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_app/')({
  loader: async () => {
    const [snippets, favoriteIds] = await Promise.all([
      listSnippets({ data: { limit: 20 } }),
      getMyFavoriteIds()
    ])
    return { snippets, favoriteIds }
  },
  component: Homepage
})

function Homepage() {
  const { snippets, favoriteIds } = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const router = useRouter()

  async function handleToggleFavorite(snippetId: string) {
    await toggleFavorite({ data: { snippetId } })
    await router.invalidate()
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl font-bold text-foreground">Recent Snippets</h1>

      {snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-(--radius) bg-surface-container py-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <p className="font-display text-2xl font-semibold text-foreground">No snippets yet</p>
          <p className="mt-2 text-sm text-muted-foreground">It's so quiet here...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {snippets.map((snippet) => (
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
              codeBody={snippet.codeBody}
            />
          ))}
        </div>
      )}
    </div>
  )
}
