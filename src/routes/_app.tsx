import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'

export const Route = createFileRoute('/_app')({
  component: AppLayout
})

function AppLayout() {
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
