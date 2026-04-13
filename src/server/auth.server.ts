import { redirect } from '@tanstack/react-router'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'

function getAuthRedirectHref() {
  const request = getRequest()
  const url = new URL(request.url)
  const next = `${url.pathname}${url.search}`
  const redirectTo = next === '/auth' ? '/' : next

  return `/auth?redirect=${encodeURIComponent(redirectTo)}`
}

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: getRequest().headers,
  })
}

export async function requireCurrentSession() {
  const session = await getCurrentSession()

  if (!session?.user) {
    throw redirect({
      href: getAuthRedirectHref(),
    })
  }

  return session
}
