import { formatDistanceToNow } from 'date-fns'
import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/code-block'
import { TagChip } from '@/components/tag-chip'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { getSnippet } from '@/server/snippets'

export const Route = createFileRoute('/_app/snippets/$snippetId')({
  loader: async ({ params }) => {
    return getSnippet({ data: { id: params.snippetId } })
  },
  component: SnippetDetail
})

function SnippetDetail() {
  const snippet = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const canEdit = session?.user.id === snippet.authorId

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-primary">
              {snippet.language}
            </span>
            <span className="text-xs text-muted-foreground">
              Updated{' '}
              {formatDistanceToNow(new Date(snippet.updatedAt ?? snippet.createdAt ?? Date.now()), {
                addSuffix: true
              })}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">{snippet.title}</h1>
          {snippet.author ? (
            <p className="font-space text-sm text-muted-foreground">
              by <span className="font-medium text-primary">@{snippet.author.name}</span>
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {canEdit ? (
            <Button asChild variant="secondary" className="min-w-32">
              <a href={`/snippets/${snippet.id}/edit`}>Edit Snippet</a>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-surface-recessed shadow-[0_32px_72px_rgba(3,8,20,0.52)]">
        <div className="flex items-center justify-between bg-surface-container-high/60 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-500/60" />
            <div className="size-2.5 rounded-full bg-yellow-500/60" />
            <div className="size-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="font-space text-xs font-medium text-muted-foreground/50 lowercase">
            {snippet.language}
          </span>
        </div>
        <div>
          <CodeBlock html={snippet.htmlCode} />
        </div>
      </div>

      {snippet.description ? (
        <section className="rounded-(--radius) bg-surface-container p-6 flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold text-foreground">Description</h2>
          <p className="w-full text-muted-foreground">{snippet.description}</p>
          {snippet.tags.length ? (
            <div className="flex flex-wrap gap-4">
              {snippet.tags.map((tag) => (
                <TagChip key={tag.id} variant="secondary">
                  {tag.name}
                </TagChip>
              ))}
            </div>
          ) : null}
        </section>
      ) : (
        <div className="rounded-(--radius) bg-surface-container-low px-6 py-5 text-sm text-muted-foreground">
          This snippet does not include any description.
        </div>
      )}
    </div>
  )
}
