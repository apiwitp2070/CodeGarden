import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputPassword } from '@/components/ui/input-password'

type AuthSearch = {
  mode?: 'signin' | 'signup'
  redirect?: string
}

export const Route = createFileRoute('/auth/')({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search.mode === 'signup' ? 'signup' : 'signin',
    redirect: typeof search.redirect === 'string' ? search.redirect : '/'
  }),
  component: AuthRoute
})

const formSchema = z.object({
  name: z.string(),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string()
})

type FormValues = z.infer<typeof formSchema>

function makeResolver(tab: 'signin' | 'signup') {
  const schema =
    tab === 'signup'
      ? formSchema
          .extend({ name: z.string().min(1, 'Name is required.') })
          .refine((v) => v.password === v.confirmPassword, {
            message: 'Passwords do not match.',
            path: ['confirmPassword']
          })
      : formSchema
  return zodResolver(schema)
}

function AuthRoute() {
  const { mode = 'signin', redirect = '/' } = Route.useSearch() as AuthSearch
  const { data: session, isPending } = authClient.useSession()

  const [tab, setTab] = useState<'signin' | 'signup'>(mode)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: makeResolver(tab),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  })

  useEffect(() => {
    setTab(mode)
  }, [mode])

  useEffect(() => {
    if (!isPending && session?.user) {
      window.location.assign(redirect)
    }
  }, [isPending, redirect, session?.user])

  function switchTab(next: 'signin' | 'signup') {
    setTab(next)
    setServerError(null)
    clearErrors()
  }

  async function onSubmit({ confirmPassword: _, ...values }: FormValues) {
    setServerError(null)

    const result =
      tab === 'signup'
        ? await authClient.signUp.email(values)
        : await authClient.signIn.email(values)

    if (result.error) {
      setServerError(result.error.message ?? 'Authentication failed.')
      return
    }

    window.location.assign(redirect)
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row overflow-hidden bg-surface-base">
      {/* Left Side: Ambient Grid Graphics */}
      <div className="relative hidden w-full items-center justify-center overflow-hidden bg-surface-container-low md:flex md:w-1/2 lg:w-3/5">
        <div className="pointer-events-none absolute inset-0 opacity-25 text-primary">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid-pattern)" />
          </svg>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="z-20 flex flex-1 flex-col bg-surface-base px-8">
        <div className="mx-auto w-sm flex flex-col min-h-screen pt-[10vh] pb-12">
          <div className="flex flex-1 flex-col">
            {/* Centered Logo */}
            <div className="mb-12 flex items-center justify-center space-x-2">
              <div className="flex size-8 items-center justify-center rounded-(--radius) bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="m3 15 2 2 4-4" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Snippet<span className="text-primary">Vault</span>
              </span>
            </div>

            <div className="mb-8 grid grid-cols-2 border-b border-surface-container-high">
              <button
                type="button"
                onClick={() => switchTab('signin')}
                className={`relative w-full pb-3 font-space text-xs font-bold uppercase tracking-widest transition-colors ${
                  tab === 'signin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
                {tab === 'signin' && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-t-full bg-primary" />
                )}
              </button>
              <button
                type="button"
                onClick={() => switchTab('signup')}
                className={`relative w-full pb-3 font-space text-xs font-bold uppercase tracking-widest transition-colors ${
                  tab === 'signup' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Create Account
                {tab === 'signup' && (
                  <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-t-full bg-primary" />
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {tab === 'signup' ? (
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">Name</span>
                  <Input
                    {...register('name')}
                    aria-invalid={!!errors.name}
                    placeholder="Nocturnal Architect"
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </label>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">Email Address</span>
                <Input
                  {...register('email')}
                  type="email"
                  aria-invalid={!!errors.email}
                  placeholder="architect@vault.io"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-muted-foreground">Password</span>
                <InputPassword
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  placeholder="••••••••••••"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </label>

              {tab === 'signup' ? (
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Confirm Password
                  </span>
                  <InputPassword
                    {...register('confirmPassword')}
                    aria-invalid={!!errors.confirmPassword}
                    placeholder="••••••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </label>
              ) : null}

              {serverError ? (
                <p className="rounded-(--radius) bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {serverError}
                </p>
              ) : null}

              <Button
                size="lg"
                type="submit"
                disabled={isSubmitting}
                className="flex mt-12 w-full items-center justify-center font-semibold"
              >
                <span>
                  {isSubmitting ? 'Working...' : tab === 'signup' ? 'Create Account' : 'Log In'}
                </span>
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="font-sans text-sm text-muted-foreground">
                {tab === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('signup')}
                      className="ml-1 font-semibold text-primary hover:underline"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have access?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('signin')}
                      className="ml-1 font-semibold text-primary hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

            <footer className="mt-auto pb-8 pt-16">
              <div className="mx-auto flex max-w-md flex-col items-center opacity-60">
                <p className="text-xs text-muted-foreground/70">© 2026 SnippetVault</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
