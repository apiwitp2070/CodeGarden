import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { collections, collectionSnippets, snippets, users } from '@/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { requireCurrentSession } from './auth.server'
import { enrichSnippets } from './snippets'

export const getMyCollections = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await requireCurrentSession()
  return db
    .select({ id: collections.id, name: collections.name, createdAt: collections.createdAt })
    .from(collections)
    .where(eq(collections.authorId, session.user.id))
    .orderBy(desc(collections.createdAt))
})

export const createCollection = createServerFn({ method: 'POST' })
  .inputValidator((d: { name: string }) => d)
  .handler(async ({ data: { name } }) => {
    const session = await requireCurrentSession()
    const [collection] = await db
      .insert(collections)
      .values({ name: name.trim(), authorId: session.user.id })
      .returning()
    return collection
  })

export const deleteCollection = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data: { id } }) => {
    const session = await requireCurrentSession()
    await db
      .delete(collections)
      .where(and(eq(collections.id, id), eq(collections.authorId, session.user.id)))
  })

export const addSnippetToCollection = createServerFn({ method: 'POST' })
  .inputValidator((d: { collectionId: string; snippetId: string }) => d)
  .handler(async ({ data: { collectionId, snippetId } }) => {
    const session = await requireCurrentSession()
    const [col] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.authorId, session.user.id)))
    if (!col) throw new Error('Collection not found')

    const [existing] = await db
      .select()
      .from(collectionSnippets)
      .where(
        and(
          eq(collectionSnippets.collectionId, collectionId),
          eq(collectionSnippets.snippetId, snippetId)
        )
      )
    if (existing) return { added: false }

    await db.insert(collectionSnippets).values({ collectionId, snippetId })
    return { added: true }
  })

export const removeSnippetFromCollection = createServerFn({ method: 'POST' })
  .inputValidator((d: { collectionId: string; snippetId: string }) => d)
  .handler(async ({ data: { collectionId, snippetId } }) => {
    const session = await requireCurrentSession()
    const [col] = await db
      .select({ id: collections.id })
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.authorId, session.user.id)))
    if (!col) throw new Error('Collection not found')

    await db
      .delete(collectionSnippets)
      .where(
        and(
          eq(collectionSnippets.collectionId, collectionId),
          eq(collectionSnippets.snippetId, snippetId)
        )
      )
  })

export const getSnippetCollections = createServerFn({ method: 'GET' })
  .inputValidator((d: { snippetId: string }) => d)
  .handler(async ({ data: { snippetId } }) => {
    const session = await requireCurrentSession()
    const rows = await db
      .select({ id: collections.id, name: collections.name })
      .from(collectionSnippets)
      .innerJoin(collections, eq(collectionSnippets.collectionId, collections.id))
      .where(
        and(
          eq(collectionSnippets.snippetId, snippetId),
          eq(collections.authorId, session.user.id)
        )
      )
    return rows
  })

export const getCollection = createServerFn({ method: 'GET' })
  .inputValidator((d: { collectionId: string }) => d)
  .handler(async ({ data: { collectionId } }) => {
    const session = await requireCurrentSession()

    const [collection] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.authorId, session.user.id)))
    if (!collection) throw new Error('Collection not found')

    const rows = await db
      .select({ snippet: snippets, author: { id: users.id, name: users.name, image: users.image } })
      .from(collectionSnippets)
      .innerJoin(snippets, eq(collectionSnippets.snippetId, snippets.id))
      .leftJoin(users, eq(snippets.authorId, users.id))
      .where(eq(collectionSnippets.collectionId, collectionId))
      .orderBy(desc(collectionSnippets.addedAt))

    return { collection, snippets: await enrichSnippets(rows) }
  })
