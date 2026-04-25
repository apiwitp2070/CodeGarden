import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { userSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireCurrentSession } from './auth.server'
import { ulid } from 'ulid'

export const getUserSettings = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await requireCurrentSession()
  const [row] = await db.select().from(userSettings).where(eq(userSettings.userId, session.user.id))
  return row ?? { languagePreferences: [] as string[] }
})

export const saveUserSettings = createServerFn({ method: 'POST' })
  .inputValidator((d: { languagePreferences: string[] }) => d)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession()
    await db
      .insert(userSettings)
      .values({
        id: ulid(),
        userId: session.user.id,
        languagePreferences: data.languagePreferences
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: { languagePreferences: data.languagePreferences }
      })
    return { ok: true }
  })
