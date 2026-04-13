import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { snippets, tags, snippetTags, users } from '@/db/schema'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { getHighlightedHtml } from './highlight'
import { requireCurrentSession } from './auth.server'

export const listSnippets = createServerFn({ method: 'GET' })
  .inputValidator((d: { q?: string; limit?: number; offset?: number }) => d)
  .handler(async ({ data: { q, limit = 20, offset = 0 } }) => {
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
          sql`
        "search_vector" @@ to_tsquery('english', ${prefixQuery})
        OR "title" ILIKE ${pattern}
        OR "description" ILIKE ${pattern}
      `
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
        .orderBy(desc(snippets.createdAt))
        .limit(limit)
        .offset(offset)
    }

    const results = await query
    const snippetIds = results.map((r) => r.snippet.id)

    // Fetch relations
    const relations =
      snippetIds.length > 0
        ? await db
            .select({
              snippetId: snippetTags.snippetId,
              tag: tags
            })
            .from(snippetTags)
            .innerJoin(tags, eq(snippetTags.tagId, tags.id))
            .where(inArray(snippetTags.snippetId, snippetIds))
        : []

    const snippetsWithTags = await Promise.all(
      results.map(async ({ snippet, author }) => {
        const snippetTags = relations.filter((r) => r.snippetId === snippet.id).map((r) => r.tag)

        const htmlPreview = await getHighlightedHtml(
          snippet.codeBody.split('\n').slice(0, 8).join('\n'),
          snippet.language
        )

        return {
          ...snippet,
          author: author?.id ? author : null,
          tags: snippetTags,
          htmlPreview
        }
      })
    )

    return snippetsWithTags
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

    const relations = await db
      .select({ tag: tags })
      .from(snippetTags)
      .innerJoin(tags, eq(snippetTags.tagId, tags.id))
      .where(eq(snippetTags.snippetId, result.snippet.id))

    const htmlCode = await getHighlightedHtml(result.snippet.codeBody, result.snippet.language)

    return {
      ...result.snippet,
      author: result.author?.id ? result.author : null,
      tags: relations.map((r) => r.tag),
      htmlCode
    }
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
