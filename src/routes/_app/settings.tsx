import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { getViewerSession } from '@/server/auth'
import { getUserSettings, saveUserSettings } from '@/server/settings'
import { LANGUAGES } from '@/lib/languages'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

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

  const { handleSubmit, control } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      languagePreferences: data.languagePreferences ?? []
    }
  })

  async function onSubmit(values: SettingsFormValues) {
    await saveUserSettings({ data: values })
    localStorage.setItem('snippetvault_filters', JSON.stringify({ languages: values.languagePreferences }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="rounded-(--radius) bg-surface-container p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground">Language Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Select the languages you work with. The Explore page will default to showing only these languages.
              Leave all unchecked to see snippets in all languages.
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
                          checked
                            ? [...field.value, lang]
                            : field.value.filter((l) => l !== lang)
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
          <Button type="submit" className="btn-emerald font-semibold">
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
          {saved && (
            <span className="text-sm text-muted-foreground">Your preferences have been updated.</span>
          )}
        </div>
      </form>
    </div>
  )
}
