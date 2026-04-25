import { createFileRoute } from '@tanstack/react-router'
import { getUserProfile } from '@/server/snippets'
import { SnippetCard } from '@/components/snippet-card'

export const Route = createFileRoute('/_app/users/$userId')({
  loader: ({ params }) => getUserProfile({ data: { userId: params.userId } }),
  component: UserProfilePage
})

function UserProfilePage() {
  const { user, snippets, isOwner } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="size-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 font-display text-2xl font-bold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {snippets.length} {isOwner ? '' : 'public '}
            {snippets.length === 1 ? 'snippet' : 'snippets'}
          </p>
        </div>
      </div>

      {snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-(--radius) bg-surface-container py-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <p className="font-display text-2xl font-semibold text-foreground">No snippets yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Nothing to see here...</p>
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
              authorName={snippet.author?.name ?? ''}
              authorId={snippet.author?.id ?? ''}
              codeBody={snippet.codeBody}
            />
          ))}
        </div>
      )}
    </div>
  )
}
