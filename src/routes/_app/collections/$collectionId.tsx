import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getCollection, deleteCollection, removeSnippetFromCollection } from '@/server/collections'
import { SnippetCard } from '@/components/snippet-card'
import { Button } from '@/components/ui/button'
import { dialog } from '@/utils/dialog'
import { Trash2, X } from 'lucide-react'

export const Route = createFileRoute('/_app/collections/$collectionId')({
  loader: ({ params }) => getCollection({ data: { collectionId: params.collectionId } }),
  component: CollectionPage
})

function CollectionPage() {
  const { collection, snippets } = Route.useLoaderData()
  const router = useRouter()

  function handleDelete() {
    dialog.danger({
      title: 'Delete Collection',
      description: `Delete "${collection.name}"? This cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        await deleteCollection({ data: { id: collection.id } })
        await router.navigate({ to: '/' })
      }
    })
  }

  async function handleRemove(snippetId: string) {
    await removeSnippetFromCollection({ data: { collectionId: collection.id, snippetId } })
    await router.invalidate()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{collection.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {snippets.length} {snippets.length === 1 ? 'snippet' : 'snippets'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label="Delete collection"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-(--radius) bg-surface-container py-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <p className="font-display text-2xl font-semibold text-foreground">
            No snippets in this collection
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Add snippets from their detail page.</p>
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
              authorId={snippet.author?.id ?? undefined}
              codeBody={snippet.codeBody}
              actions={
                <button
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleRemove(snippet.id)
                  }}
                  aria-label="Remove from collection"
                >
                  <X className="size-4" />
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
