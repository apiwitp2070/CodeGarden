import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { snippets, tags, snippetTags, users, userFavorites } from '@/db/schema'
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm'
import { getHighlightedHtml } from './highlight'
import { getCurrentSession, requireCurrentSession } from './auth.server'
import type { InferSelectModel } from 'drizzle-orm'

type Snippet = InferSelectModel<typeof snippets>
type Author = { id: string; name: string; image: string | null } | null

export async function enrichSnippets<T extends { snippet: Snippet; author: Author }>(
  rows: T[]
): Promise<
  (Snippet & {
    author: Author
    tags: { id: string; name: string; slug: string }[]
    htmlPreview: string
  })[]
> {
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.snippet.id)

  const tagRows = await db
    .select({ snippetId: snippetTags.snippetId, tag: tags })
    .from(snippetTags)
    .innerJoin(tags, eq(snippetTags.tagId, tags.id))
    .where(inArray(snippetTags.snippetId, ids))

  return Promise.all(
    rows.map(async ({ snippet, author }) => {
      const snippetTagList = tagRows.filter((t) => t.snippetId === snippet.id).map((t) => t.tag)
      const htmlPreview = await getHighlightedHtml(
        snippet.codeBody.split('\n').slice(0, 8).join('\n'),
        snippet.language
      )
      return {
        ...snippet,
        author: author?.id ? author : null,
        tags: snippetTagList,
        htmlPreview
      }
    })
  )
}

export const listSnippets = createServerFn({ method: 'GET' })
  .inputValidator((d: { q?: string; limit?: number; offset?: number; languages?: string[] }) => d)
  .handler(async ({ data: { q, limit = 20, offset = 0, languages } }) => {
    const session = await getCurrentSession()
    const userId = session?.user?.id ?? null
    const visibilityFilter = userId
      ? or(eq(snippets.visibility, 'public'), eq(snippets.authorId, userId))
      : eq(snippets.visibility, 'public')

    const langFilter = languages?.length ? inArray(snippets.language, languages) : undefined
    let query

    if (q) {
      // Dual-index search using Drizzle raw SQL mapping
      // Convert user input to a safe prefix tsquery: "hello world" → "hello:* & world:*"
      const prefixQuery = q
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((term) => `${term.replace(/[!&|():*\\]/g, '')}:*`)
        .join(' & ')

      const pattern = `%${q}%`
      query = db
        .select({
          snippet: snippets,
          author: {
            id: users.id,
            name: users.name,
            image: users.image
          },
          rank: sql<number>`
          ts_rank("search_vector", to_tsquery('english', ${prefixQuery})) +
          CASE WHEN "title" ILIKE ${pattern} THEN 0.5 ELSE 0 END
        `.as('rank')
        })
        .from(snippets)
        .leftJoin(users, eq(snippets.authorId, users.id))
        .where(
          and(
            sql`
          "search_vector" @@ to_tsquery('english', ${prefixQuery})
          OR "title" ILIKE ${pattern}
          OR "description" ILIKE ${pattern}
        `,
            langFilter,
            visibilityFilter
          )
        )
        .orderBy(sql`rank DESC`)
        .limit(limit)
        .offset(offset)
    } else {
      query = db
        .select({
          snippet: snippets,
          author: {
            id: users.id,
            name: users.name,
            image: users.image
          },
          rank: sql<number>`0`.as('rank')
        })
        .from(snippets)
        .leftJoin(users, eq(snippets.authorId, users.id))
        .where(and(langFilter, visibilityFilter))
        .orderBy(desc(snippets.createdAt))
        .limit(limit)
        .offset(offset)
    }

    const results = await query

    return enrichSnippets(results)
  })

export const getSnippet = createServerFn({ method: 'GET' })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data: { id } }) => {
    const [result] = await db
      .select({
        snippet: snippets,
        author: {
          id: users.id,
          name: users.name,
          image: users.image
        }
      })
      .from(snippets)
      .leftJoin(users, eq(snippets.authorId, users.id))
      .where(eq(snippets.id, id))

    if (!result) throw new Error('Snippet not found')

    const session = await getCurrentSession()
    const isOwner = session?.user?.id === result.snippet.authorId
    if (result.snippet.visibility === 'private' && !isOwner) {
      throw new Error('Snippet not found')
    }

    const relations = await db
      .select({ tag: tags })
      .from(snippetTags)
      .innerJoin(tags, eq(snippetTags.tagId, tags.id))
      .where(eq(snippetTags.snippetId, result.snippet.id))

    const htmlCode = await getHighlightedHtml(result.snippet.codeBody, result.snippet.language)

    let isFavorited = false
    if (session?.user?.id) {
      const [fav] = await db
        .select()
        .from(userFavorites)
        .where(
          and(
            eq(userFavorites.userId, session.user.id),
            eq(userFavorites.snippetId, result.snippet.id)
          )
        )
      isFavorited = Boolean(fav)
    }

    return {
      ...result.snippet,
      author: result.author?.id ? result.author : null,
      tags: relations.map((r) => r.tag),
      htmlCode,
      isFavorited
    }
  })

export const getMyFavoriteIds = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getCurrentSession()
  if (!session?.user?.id) return []
  const rows = await db
    .select({ snippetId: userFavorites.snippetId })
    .from(userFavorites)
    .where(eq(userFavorites.userId, session.user.id))
  return rows.map((r) => r.snippetId)
})

export const getUserFavorites = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await requireCurrentSession()
  const results = await db
    .select({
      snippet: snippets,
      author: { id: users.id, name: users.name, image: users.image }
    })
    .from(userFavorites)
    .innerJoin(snippets, eq(userFavorites.snippetId, snippets.id))
    .leftJoin(users, eq(snippets.authorId, users.id))
    .where(
      and(
        eq(userFavorites.userId, session.user.id),
        or(eq(snippets.visibility, 'public'), eq(snippets.authorId, session.user.id))
      )
    )
    .orderBy(desc(userFavorites.createdAt))

  const enriched = await enrichSnippets(results)
  return enriched.map((s) => ({ ...s, isFavorited: true as const }))
})

export const getUserProfile = createServerFn({ method: 'GET' })
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data: { userId } }) => {
    const session = await getCurrentSession()
    const viewerId = session?.user?.id ?? null

    const [user] = await db
      .select({ id: users.id, name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, userId))

    if (!user) throw new Error('User not found')

    const isOwner = viewerId === userId
    const visibilityFilter = isOwner ? undefined : eq(snippets.visibility, 'public')

    const userSnippets = await db
      .select({ snippet: snippets })
      .from(snippets)
      .where(and(eq(snippets.authorId, userId), visibilityFilter))
      .orderBy(desc(snippets.createdAt))

    const rows = userSnippets.map(({ snippet }) => ({ snippet, author: user }))
    const withPreviews = await enrichSnippets(rows)

    return { user, snippets: withPreviews, isOwner }
  })

export const getEditableSnippet = createServerFn({ method: 'GET' })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data: { id } }) => {
    const session = await requireCurrentSession()

    const [snippet] = await db
      .select()
      .from(snippets)
      .where(and(eq(snippets.id, id), eq(snippets.authorId, session.user.id)))

    if (!snippet) {
      throw new Error('Snippet not found')
    }

    return snippet
  })
