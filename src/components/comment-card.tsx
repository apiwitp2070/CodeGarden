import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MergeView } from '@codemirror/merge'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { CommentForm } from '@/components/comment-form'
import { getLanguageExtension } from '@/lib/codemirror-langs'

interface Comment {
  id: string
  type: 'comment' | 'suggestion'
  body: string
  suggestionCode: string | null
  status: 'open' | 'merged' | 'rejected'
  createdAt: Date | null
  updatedAt: Date | null
  authorId: string
}

type Author = {
  id: string | null
  name: string | null
  image: string | null
} | null

interface CommentCardProps {
  comment: Comment
  author: Author
  snippetCode: string
  language: string
  snippetId: string
  currentUserId?: string
  snippetAuthorId: string | null
  onDelete: (commentId: string) => Promise<void>
  onAccept: (commentId: string) => Promise<void>
  onReject: (commentId: string) => Promise<void>
  onEdit: (commentId: string, values: { body: string; suggestionCode?: string }) => Promise<void>
}

function SuggestionDiff({
  original,
  modified,
  language
}: {
  original: string
  modified: string
  language: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const langExt = getLanguageExtension(language)
    const sharedExtensions = [EditorState.readOnly.of(true), oneDark, ...langExt]
    const view = new MergeView({
      a: { doc: original, extensions: sharedExtensions },
      b: { doc: modified, extensions: sharedExtensions },
      parent: ref.current,
      gutter: true,
      highlightChanges: true,
      collapseUnchanged: { margin: 3, minSize: 4 }
    })
    return () => view.destroy()
  }, [original, modified, language])

  return <div ref={ref} className="overflow-hidden rounded-(--radius) text-sm" />
}

export function CommentCard({
  comment,
  author,
  snippetCode,
  language,
  snippetId,
  currentUserId,
  snippetAuthorId,
  onDelete,
  onAccept,
  onReject,
  onEdit
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)

  const isCommentAuthor = currentUserId === comment.authorId
  const isSnippetAuthor = currentUserId === snippetAuthorId
  const isMerged = comment.status === 'merged'
  const isRejected = comment.status === 'rejected'

  const canEdit = isCommentAuthor && comment.status === 'open'
  const canDelete = (isCommentAuthor || isSnippetAuthor) && comment.status === 'open'
  const canAccept = isSnippetAuthor && comment.type === 'suggestion' && comment.status === 'open'
  const canReject = canAccept

  useEffect(() => {
    if (window.location.hash === `#comment-${comment.id}`) {
      setIsHighlighted(true)
      const t = setTimeout(() => setIsHighlighted(false), 2000)
      return () => clearTimeout(t)
    }
  }, [comment.id])

  async function handleDelete() {
    if (!confirm('Delete this comment?')) return
    setIsPending(true)
    try {
      await onDelete(comment.id)
    } finally {
      setIsPending(false)
    }
  }

  async function handleAccept() {
    setIsPending(true)
    try {
      await onAccept(comment.id)
    } finally {
      setIsPending(false)
    }
  }

  async function handleReject() {
    setIsPending(true)
    try {
      await onReject(comment.id)
    } finally {
      setIsPending(false)
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-(--radius) border border-border p-5">
        <CommentForm
          snippetId={snippetId}
          snippetCode={snippetCode}
          language={language}
          isEditMode={true}
          initialValues={{
            type: comment.type,
            body: comment.body,
            suggestionCode: comment.suggestionCode ?? undefined
          }}
          onSubmit={async (values) => {
            await onEdit(comment.id, {
              body: values.body,
              suggestionCode: values.suggestionCode
            })
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div
      id={`comment-${comment.id}`}
      className={`flex flex-col gap-4 rounded-(--radius) border p-5 transition-all duration-500 ${
        isHighlighted ? 'border-primary ring-2 ring-primary/30' : 'border-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">@{author?.name ?? 'unknown'}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {comment.createdAt
              ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
              : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {comment.type === 'suggestion' && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-space text-xs font-semibold text-primary">
              suggestion
            </span>
          )}
          {isMerged && (
            <span className="rounded-full bg-green-500/15 px-2 py-0.5 font-space text-xs font-semibold text-green-400">
              merged
            </span>
          )}
          {isRejected && (
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-space text-xs font-semibold text-red-400">
              rejected
            </span>
          )}
          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="text-muted-foreground">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.body}</p>

      {/* Diff — only for suggestions */}
      {comment.type === 'suggestion' && comment.suggestionCode !== null && (
        <SuggestionDiff
          original={snippetCode}
          modified={comment.suggestionCode}
          language={language}
        />
      )}

      {/* Accept / Reject actions */}
      {(canAccept || canReject) && (
        <div className="flex justify-end gap-2">
          {canReject && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReject}
              disabled={isPending}
              className="text-destructive hover:text-destructive"
            >
              Reject
            </Button>
          )}
          {canAccept && (
            <Button size="sm" onClick={handleAccept} disabled={isPending}>
              Accept Suggestion
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
