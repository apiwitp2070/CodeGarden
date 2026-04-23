import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { getViewerSession } from '@/server/auth'
import { getUserSettings } from '@/server/settings'

export const Route = createFileRoute('/_app')({
  loader: async () => {
    const session = await getViewerSession()
    if (session?.user) {
      const settings = await getUserSettings()
      return { settings }
    }
    return { settings: null }
  },
  component: AppLayout
})

function AppLayout() {
  const { settings } = Route.useLoaderData()

  useEffect(() => {
    if (settings && localStorage.getItem('codegarden_filters') === null) {
      localStorage.setItem(
        'codegarden_filters',
        JSON.stringify({ languages: settings.languagePreferences ?? [] })
      )
    }
  }, [settings])

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-surface-base">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden md:pl-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-10 pt-2">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
