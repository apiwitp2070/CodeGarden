import { formatDistanceToNow } from 'date-fns'
import { createFileRoute, Outlet, useChildMatches, useRouter } from '@tanstack/react-router'
import { Check, Copy, FolderOpen, FolderPlus, Lock, Plus, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CodeBlock } from '@/components/code-block'
import { TagChip } from '@/components/tag-chip'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { getSnippet } from '@/server/snippets'
import { toggleFavorite } from '@/server/mutations'
import {
  getMyCollections,
  createCollection,
  addSnippetToCollection,
  removeSnippetFromCollection,
  getSnippetCollections
} from '@/server/collections'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { CreateCollectionDialog } from '@/components/common/create-collection-dialog'
import {
  getSnippetComments,
  createComment,
  updateComment,
  deleteComment,
  acceptSuggestion,
  rejectSuggestion
} from '@/server/comments'
import { CommentForm } from '@/components/comment-form'
import { CommentCard } from '@/components/comment-card'

export const Route = createFileRoute('/_app/snippets/$snippetId')({
  loader: async ({ params }) => {
    const [snippet, comments] = await Promise.all([
      getSnippet({ data: { id: params.snippetId } }),
      getSnippetComments({ data: { snippetId: params.snippetId } })
    ])
    const snippetCollections = await getSnippetCollections({
      data: { snippetId: params.snippetId }
    }).catch(() => [] as { id: string; name: string }[])
    return { snippet, comments, snippetCollections }
  },
  component: SnippetDetailLayout
})

function SnippetDetailLayout() {
  const childMatches = useChildMatches()
  if (childMatches.length > 0) return <Outlet />
  return <SnippetDetail />
}

function dispatchCollectionsUpdated() {
  window.dispatchEvent(new CustomEvent('collections-updated'))
}

function SnippetDetail() {
  const { snippet, comments, snippetCollections } = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const canEdit = session?.user.id === snippet.authorId
  const isLoggedIn = Boolean(session?.user)
  const [isPending, setIsPending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userCollections, setUserCollections] = useState<{ id: string; name: string }[]>([])
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    getMyCollections()
      .then(setUserCollections)
      .catch(() => {})
  }, [isLoggedIn])

  async function handleToggleFavorite() {
    if (isPending) return
    setIsPending(true)
    try {
      await toggleFavorite({ data: { snippetId: snippet.id } })
      await router.invalidate()
    } finally {
      setIsPending(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(snippet.codeBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Scroll to a specific comment when URL has #comment-<id>
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#comment-')) return
    const el = document.getElementById(hash.slice(1))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [comments])

  return (
    <div className="flex max-w-full flex-col gap-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-primary">
              {snippet.language}
            </span>
            {snippet.visibility === 'private' && (
              <span className="flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Lock className="size-3" />
                Private
              </span>
            )}
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
          {snippetCollections.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {snippetCollections.map((c) => (
                <a
                  key={c.id}
                  href={`/collections/${c.id}`}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <FolderOpen className="size-3" />
                  {c.name}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={isPending}
              aria-label={snippet.isFavorited ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Star
                className={
                  snippet.isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-foreground'
                }
              />
            </Button>
          ) : null}
          {canEdit ? (
            <Button asChild variant="secondary" className="min-w-32">
              <a href={`/snippets/${snippet.id}/edit`}>Edit Snippet</a>
            </Button>
          ) : null}
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Add to collection">
                  <FolderPlus className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {userCollections.length === 0 ? (
                  <DropdownMenuItem disabled>No collections yet</DropdownMenuItem>
                ) : (
                  userCollections.map((c) => {
                    const inCollection = snippetCollections.some((sc) => sc.id === c.id)
                    return (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={async () => {
                          if (inCollection) {
                            await removeSnippetFromCollection({
                              data: { collectionId: c.id, snippetId: snippet.id }
                            }).catch(() => {})
                          } else {
                            await addSnippetToCollection({
                              data: { collectionId: c.id, snippetId: snippet.id }
                            }).catch(() => {})
                          }
                          await router.invalidate()
                        }}
                      >
                        {inCollection ? (
                          <Check className="mr-2 size-4 text-primary" />
                        ) : (
                          <FolderPlus className="mr-2 size-4" />
                        )}
                        {c.name}
                      </DropdownMenuItem>
                    )
                  })
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setNewCollectionDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  New collection…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="ghost" size="icon" onClick={handleCopy} aria-label="Copy code">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
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

      {/* Comments & Suggestions */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-foreground">
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </h2>

        {comments.map((c) => (
          <CommentCard
            key={c.comment.id}
            comment={c.comment}
            author={c.author}
            snippetCode={snippet.codeBody}
            language={snippet.language}
            snippetId={snippet.id}
            currentUserId={session?.user?.id}
            snippetAuthorId={snippet.authorId}
            onDelete={async (id) => {
              await deleteComment({ data: { commentId: id } })
              await router.invalidate()
            }}
            onAccept={async (id) => {
              await acceptSuggestion({ data: { commentId: id } })
              await router.invalidate()
            }}
            onReject={async (id) => {
              await rejectSuggestion({ data: { commentId: id } })
              await router.invalidate()
            }}
            onEdit={async (id, vals) => {
              await updateComment({ data: { commentId: id, ...vals } })
              await router.invalidate()
            }}
          />
        ))}

        {isLoggedIn && (
          <div className="mt-6 flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              Add Comment or Suggestion
            </h2>
            <div className="rounded-(--radius) border border-border p-5">
              <CommentForm
                snippetId={snippet.id}
                snippetCode={snippet.codeBody}
                language={snippet.language}
                onSubmit={async (values) => {
                  await createComment({ data: values })
                  await router.invalidate()
                }}
              />
            </div>
          </div>
        )}
      </section>

      <CreateCollectionDialog
        open={newCollectionDialogOpen}
        onOpenChange={setNewCollectionDialogOpen}
        onConfirm={async (name) => {
          const newCol = await createCollection({ data: { name } })
          if (newCol) {
            setUserCollections((prev) => [newCol, ...prev])
            await addSnippetToCollection({
              data: { collectionId: newCol.id, snippetId: snippet.id }
            })
            dispatchCollectionsUpdated()
            await router.invalidate()
          }
        }}
      />
    </div>
  )
}
