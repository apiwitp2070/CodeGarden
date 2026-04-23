import { useState } from 'react'
import type { ReactNode } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { Check, Copy, Star } from 'lucide-react'

interface SnippetCardProps {
  id: string
  title: string
  language: string
  tags: { id: string; name: string }[]
  htmlPreview: string
  createdAt: Date
  authorName?: string
  authorId?: string
  isFavorited?: boolean
  onFavoriteToggle?: (id: string) => void
  codeBody?: string
  actions?: ReactNode
}

export function SnippetCard({
  id,
  title,
  language,
  tags,
  htmlPreview,
  createdAt,
  authorName,
  authorId,
  isFavorited,
  onFavoriteToggle,
  codeBody,
  actions
}: SnippetCardProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!codeBody) return
    navigator.clipboard.writeText(codeBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative flex flex-col gap-4 rounded-(--radius) bg-card p-5 shadow-[0_24px_48px_rgba(3,8,20,0.22)] transition-all hover:bg-surface-container-high hover:shadow-[0_28px_56px_rgba(3,8,20,0.28)]">
      <Link
        to="/snippets/$snippetId"
        params={{ snippetId: id }}
        className="absolute inset-0 z-10"
        aria-label={`View snippet ${title}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-space text-xs font-semibold text-primary">
              {language}
            </span>
            <span className="font-space text-xs text-muted-foreground">
              Updated {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-sans text-xl font-semibold leading-tight text-foreground transition-colors">
            {title}
          </h3>
          {authorName && (
            <p className="mt-1 font-space text-xs text-muted-foreground">
              by{' '}
              {authorId ? (
                <Link
                  to="/users/$userId"
                  params={{ userId: authorId }}
                  className="relative z-20 font-medium text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{authorName}
                </Link>
              ) : (
                <span className="font-medium text-primary">@{authorName}</span>
              )}
            </p>
          )}
        </div>
        <div className="relative z-20 flex shrink-0 items-center gap-1">
          {codeBody && (
            <button
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleCopy}
              aria-label="Copy code"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
          )}
          {actions}
          {onFavoriteToggle && (
            <button
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-yellow-400"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onFavoriteToggle(id)
              }}
              aria-label={isFavorited ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Star className={`size-4 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-2 max-h-32 overflow-hidden rounded-(--radius) bg-surface-recessed p-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div
          className="font-mono text-xs leading-relaxed text-foreground/80 [&>pre]:bg-transparent [&>pre]:p-0! [&>pre]:m-0!"
          dangerouslySetInnerHTML={{ __html: htmlPreview }}
        />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-surface-recessed to-transparent" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {tags.map((t) => (
            <span key={t.id} className="text-xs font-semibold">
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
