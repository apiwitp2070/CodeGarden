import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { snippetComments, snippets, users } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireCurrentSession } from './auth.server'
import { sendSuggestionNotification } from './email'

export const getSnippetComments = createServerFn({ method: 'GET' })
  .inputValidator((d: { snippetId: string }) => d)
  .handler(async ({ data }) => {
    return db
      .select({
        comment: snippetComments,
        author: { id: users.id, name: users.name, image: users.image }
      })
      .from(snippetComments)
      .leftJoin(users, eq(snippetComments.authorId, users.id))
      .where(eq(snippetComments.snippetId, data.snippetId))
      .orderBy(asc(snippetComments.createdAt))
  })

export const createComment = createServerFn({ method: 'POST' })
  .inputValidator(
    (d: {
      snippetId: string
      type: 'comment' | 'suggestion'
      body: string
      suggestionCode?: string
      notifyAuthor?: boolean
    }) => d
  )
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()

    await db.insert(snippetComments).values({
      snippetId: data.snippetId,
      authorId: session.user.id,
      type: data.type,
      body: data.body,
      suggestionCode: data.type === 'suggestion' ? (data.suggestionCode ?? null) : null
    })

    if (data.type === 'suggestion' && data.notifyAuthor) {
      const [snippetRow] = await db
        .select({
          snippet: snippets,
          author: { email: users.email, name: users.name }
        })
        .from(snippets)
        .leftJoin(users, eq(snippets.authorId, users.id))
        .where(eq(snippets.id, data.snippetId))

      // Don't notify if the suggester is the snippet author
      if (snippetRow?.author?.email && snippetRow.snippet.authorId !== session.user.id) {
        sendSuggestionNotification({
          toEmail: snippetRow.author.email,
          toName: snippetRow.author.name,
          fromName: session.user.name,
          snippetTitle: snippetRow.snippet.title,
          snippetId: data.snippetId,
          commentBody: data.body
        }).catch(console.error)
      }
    }
  })

export const updateComment = createServerFn({ method: 'POST' })
  .inputValidator((d: { commentId: string; body: string; suggestionCode?: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()
    const [comment] = await db
      .select()
      .from(snippetComments)
      .where(eq(snippetComments.id, data.commentId))
    if (!comment || comment.authorId !== session.user.id) throw new Error('Unauthorized')
    if (comment.status === 'merged') throw new Error('Cannot edit a merged suggestion')
    await db
      .update(snippetComments)
      .set({ body: data.body, suggestionCode: data.suggestionCode ?? null, updatedAt: new Date() })
      .where(eq(snippetComments.id, data.commentId))
  })

export const deleteComment = createServerFn({ method: 'POST' })
  .inputValidator((d: { commentId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()
    const [row] = await db
      .select({ comment: snippetComments, snippetAuthorId: snippets.authorId })
      .from(snippetComments)
      .leftJoin(snippets, eq(snippetComments.snippetId, snippets.id))
      .where(eq(snippetComments.id, data.commentId))
    if (!row) throw new Error('Not found')
    if (row.comment.status === 'merged') throw new Error('Cannot delete a merged suggestion')
    const isCommentAuthor = row.comment.authorId === session.user.id
    const isSnippetAuthor = row.snippetAuthorId === session.user.id
    if (!isCommentAuthor && !isSnippetAuthor) throw new Error('Unauthorized')
    await db.delete(snippetComments).where(eq(snippetComments.id, data.commentId))
  })

export const acceptSuggestion = createServerFn({ method: 'POST' })
  .inputValidator((d: { commentId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()
    const [row] = await db
      .select({ comment: snippetComments, snippet: snippets })
      .from(snippetComments)
      .leftJoin(snippets, eq(snippetComments.snippetId, snippets.id))
      .where(eq(snippetComments.id, data.commentId))
    if (!row || !row.snippet) throw new Error('Not found')
    if (row.snippet.authorId !== session.user.id) throw new Error('Only the snippet author can accept suggestions')
    if (row.comment.type !== 'suggestion') throw new Error('Not a suggestion')
    if (!row.comment.suggestionCode) throw new Error('No suggestion code')
    await db
      .update(snippets)
      .set({ codeBody: row.comment.suggestionCode, updatedAt: new Date() })
      .where(eq(snippets.id, row.snippet.id))
    await db
      .update(snippetComments)
      .set({ status: 'merged' })
      .where(eq(snippetComments.id, data.commentId))
  })

export const rejectSuggestion = createServerFn({ method: 'POST' })
  .inputValidator((d: { commentId: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()
    const [row] = await db
      .select({ comment: snippetComments, snippet: snippets })
      .from(snippetComments)
      .leftJoin(snippets, eq(snippetComments.snippetId, snippets.id))
      .where(eq(snippetComments.id, data.commentId))
    if (!row || !row.snippet) throw new Error('Not found')
    if (row.snippet.authorId !== session.user.id) throw new Error('Only the snippet author can reject suggestions')
    if (row.comment.type !== 'suggestion') throw new Error('Not a suggestion')
    if (row.comment.status !== 'open') throw new Error('Already resolved')
    await db
      .update(snippetComments)
      .set({ status: 'rejected' })
      .where(eq(snippetComments.id, data.commentId))
  })
