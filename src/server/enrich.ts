import { db } from '@/db'
import { snippets, tags, snippetTags } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { getHighlightedHtml } from './highlight'
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
