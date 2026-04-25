import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { tags, snippetTags } from '@/db/schema'
import { sql } from 'drizzle-orm'

export const listTags = createServerFn({ method: 'GET' }).handler(async () => {
  const allTags = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      count: sql<number>`count(${snippetTags.snippetId})`.mapWith(Number)
    })
    .from(tags)
    .leftJoin(snippetTags, sql`${tags.id} = ${snippetTags.tagId}`)
    .groupBy(tags.id)
    .orderBy(sql`count(${snippetTags.snippetId}) DESC`)

  return allTags
})
