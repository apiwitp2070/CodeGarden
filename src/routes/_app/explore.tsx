import { createFileRoute } from '@tanstack/react-router'
import { listSnippets } from '@/server/snippets'
import { SnippetCard } from '@/components/snippet-card'

type SearchParams = {
  q?: string
}

export const Route = createFileRoute('/_app/explore')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === 'string' && search.q.trim() ? search.q.trim() : undefined,
  }),
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ deps: { q } }) => {
    const snippets = await listSnippets({ data: { q, limit: 20 } })
    return { snippets, q }
  },
  component: ExplorePage,
})

function ExplorePage() {
  const { snippets, q } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-foreground">
          {q ? `Results for "${q}"` : 'Explore'}
        </h1>
        {q && (
          <span className="text-sm text-muted-foreground">
            {snippets.length} result{snippets.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-(--radius) bg-surface-container py-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <p className="font-display text-2xl font-semibold text-foreground">No results for "{q}"</p>
          <p className="mt-2 text-sm text-muted-foreground">Try different keywords.</p>
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
