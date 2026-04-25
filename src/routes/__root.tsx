import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools'
import appCss from '@/styles.css?url'
import { useEffect } from 'react'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

const ACCENT_INIT_SCRIPT = `(function(){try{var valid=['sky','blue','indigo','lavender','violet'];var stored=window.localStorage.getItem('codegarden_accent');if(stored&&valid.includes(stored)){document.documentElement.setAttribute('data-accent',stored)}else{document.documentElement.removeAttribute('data-accent')}}catch(e){}})();`

const ACCENT_COLORS: Record<string, string> = {
  emerald: '#75daa8',
  sky: '#7dd3fc',
  blue: '#93c5fd',
  indigo: '#a5b4fc',
  lavender: '#c4b5fd',
  violet: '#d8b4fe'
}

function applyFaviconFromStorage() {
  try {
    const stored = localStorage.getItem('codegarden_accent')
    const color = ACCENT_COLORS[stored ?? 'emerald'] ?? ACCENT_COLORS.emerald
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#0c1629"/><polyline points="12,10 7,16 12,22" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="20,10 25,16 20,22" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (link) link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`
  } catch {}
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <p className="font-space text-sm font-semibold uppercase tracking-widest text-primary">404</p>
      <h1 className="font-display text-4xl font-bold text-foreground">Page Not Found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="mt-4 rounded-lg bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
      >
        Back to Homepage
      </a>
    </div>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'CodeGarden' }
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg'
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com'
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        crossOrigin: 'anonymous'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&family=Manrope:wght@500;700&family=Space+Grotesk:wght@400;500;600&display=swap'
      },
      {
        rel: 'stylesheet',
        href: appCss
      }
    ]
  }),
  shellComponent: RootDocument
})

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyFaviconFromStorage()
  }, [])

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ACCENT_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-surface-base text-foreground selection:bg-primary/20 flex min-h-screen flex-col overflow-hidden">
        <TooltipProvider>
          {children}
          <ConfirmDialog />

          <TanStackDevtools
            config={{
              position: 'bottom-right'
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />
              },
              TanStackQueryDevtools
            ]}
          />
        </TooltipProvider>
        <Scripts />
      </body>
    </html>
  )
}
