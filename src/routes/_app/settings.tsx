import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { getViewerSession } from '@/server/auth'
import { getUserSettings, saveUserSettings } from '@/server/settings'
import { LANGUAGES } from '@/consts/languages'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

type AccentId = 'emerald' | 'sky' | 'blue' | 'indigo' | 'lavender' | 'violet'

const ACCENTS: { id: AccentId; label: string; color: string }[] = [
  { id: 'emerald', label: 'Emerald', color: '#75daa8' },
  { id: 'sky', label: 'Sky', color: '#7dd3fc' },
  { id: 'blue', label: 'Blue', color: '#93c5fd' },
  { id: 'indigo', label: 'Indigo', color: '#a5b4fc' },
  { id: 'lavender', label: 'Lavender', color: '#c4b5fd' },
  { id: 'violet', label: 'Violet', color: '#d8b4fe' }
]

function getStoredAccent(): AccentId {
  try {
    const v = localStorage.getItem('codegarden_accent')
    if (v && ACCENTS.some((a) => a.id === v)) return v as AccentId
  } catch {}
  return 'emerald'
}

function buildFaviconDataUrl(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#0c1629"/><polyline points="12,10 7,16 12,22" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="20,10 25,16 20,22" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function applyFavicon(id: AccentId) {
  const accent = ACCENTS.find((a) => a.id === id)
  if (!accent) return
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (link) link.href = buildFaviconDataUrl(accent.color)
}

function applyAccent(id: AccentId) {
  const root = document.documentElement
  if (id === 'emerald') {
    root.removeAttribute('data-accent')
    localStorage.removeItem('codegarden_accent')
  } else {
    root.setAttribute('data-accent', id)
    localStorage.setItem('codegarden_accent', id)
  }
  applyFavicon(id)
}

const settingsSchema = z.object({
  languagePreferences: z.array(z.string())
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export const Route = createFileRoute('/_app/settings')({
  loader: async () => {
    const session = await getViewerSession()
    if (!session?.user) throw redirect({ to: '/auth', search: { mode: 'signin' } })
    return getUserSettings()
  },
  component: SettingsPage
})

function SettingsPage() {
  const data = Route.useLoaderData()
  const [saved, setSaved] = useState(false)
  const [accent, setAccent] = useState<AccentId>(getStoredAccent)

  function handleAccentChange(id: AccentId) {
    setAccent(id)
    applyAccent(id)
  }

  const { handleSubmit, control } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      languagePreferences: data.languagePreferences ?? []
    }
  })

  async function onSubmit(values: SettingsFormValues) {
    await saveUserSettings({ data: values })
    localStorage.setItem(
      'codegarden_filters',
      JSON.stringify({ languages: values.languagePreferences })
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex max-w-full flex-col gap-8">
      <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>

      {/* Accent colour picker — client-only, no form submit needed */}
      <div className="rounded-(--radius) bg-surface-container p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Accent Colour</h2>
          <p className="text-sm text-muted-foreground">
            Choose the primary accent colour used across the interface.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map(({ id, label, color }) => {
            const isActive = accent === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleAccentChange(id)}
                aria-label={label}
                title={label}
                className="flex flex-col items-center gap-2 group"
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-full transition-all ${
                    isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: color,
                    outline: isActive ? `2px solid ${color}` : 'none',
                    outlineOffset: '3px'
                  }}
                >
                  {isActive && <Check className="size-4 text-[#060e20] stroke-3" />}
                </span>
                <span
                  className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="rounded-(--radius) bg-surface-container p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Language Preferences
            </h2>
            <p className="text-sm text-muted-foreground">
              Select the languages you work with. The Explore page will default to showing only
              these languages. Leave all unchecked to see snippets in all languages.
            </p>
          </div>

          <Controller
            name="languagePreferences"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {LANGUAGES.map((lang) => (
                  <label
                    key={lang}
                    className="flex cursor-pointer items-center gap-3 rounded-(--radius) bg-surface-container-low px-4 py-3 transition-colors hover:bg-surface-container-high"
                  >
                    <Checkbox
                      checked={field.value.includes(lang)}
                      onCheckedChange={(checked) => {
                        field.onChange(
                          checked ? [...field.value, lang] : field.value.filter((l) => l !== lang)
                        )
                      }}
                    />
                    <span className="text-sm font-medium capitalize text-foreground">{lang}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit">{saved ? 'Saved!' : 'Save Settings'}</Button>
          {saved && (
            <span className="text-sm text-muted-foreground">
              Your preferences have been updated.
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
