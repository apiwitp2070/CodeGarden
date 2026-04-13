import { Search, X } from 'lucide-react'
import { useRef } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Input } from './ui/input'

export function SearchInput() {
  const navigate = useNavigate()
  const routerState = useRouterState()
  const isExplorePage = routerState.location.pathname === '/explore'
  const currentQ = isExplorePage
    ? ((routerState.location.search as Record<string, unknown>).q as string | undefined)
    : undefined

  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = inputRef.current?.value.trim()
    if (!value && isExplorePage) handleClear()
    if (!value) return
    navigate({ to: '/explore', search: { q: value } })
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = ''
    navigate({ to: '/explore', search: { q: undefined } })
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg flex items-center">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="size-4 text-muted-foreground" />
      </div>
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search snippets…"
        defaultValue={currentQ ?? ''}
        key={currentQ}
        className="h-11 w-full bg-surface-container-low/90 pl-10 pr-20 text-sm"
      />
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
        {/* <button
          type="submit"
          className="rounded bg-primary/10 px-2.5 py-1 font-space text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          Go
        </button> */}
        {currentQ && (
          <button
            type="button"
            onClick={handleClear}
            className="flex size-5 items-center justify-center rounded-full bg-surface-container-high text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </form>
  )
}
