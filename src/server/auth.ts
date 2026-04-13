import { createServerFn } from '@tanstack/react-start'

export const getViewerSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getCurrentSession } = await import('./auth.server')

    return (await getCurrentSession()) ?? null
  },
)

export const requireViewerSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { requireCurrentSession } = await import('./auth.server')

    return requireCurrentSession()
  },
)
