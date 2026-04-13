import { createFileRoute } from '@tanstack/react-router'
import { listSnippets } from '@/server/snippets'
import { SnippetCard } from '@/components/snippet-card'

export const Route = createFileRoute('/_app/')({
  loader: async () => {
    const snippets = await listSnippets({ data: { limit: 20 } })
    return { snippets }
  },
  component: Homepage
})

function Homepage() {
  const { snippets } = Route.useLoaderData()

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
            />
          ))}
        </div>
      )}
    </div>
  )
}
