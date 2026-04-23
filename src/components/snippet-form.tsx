import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CodeEditor } from './code-editor'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import type { Extension } from '@codemirror/state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Lock } from 'lucide-react'
import { LANGUAGES } from '@/lib/languages'

function getExtensions(language: string): Extension[] {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return [javascript({ typescript: language === 'typescript' })]
    case 'python':
      return [python()]
    case 'html':
      return [html()]
    case 'css':
      return [css()]
    case 'json':
      return [json()]
    default:
      return []
  }
}

const snippetSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string(),
  language: z.string().min(1, 'Language is required.'),
  codeBody: z.string().min(1, 'Code body is required.'),
  keywords: z.string(),
  visibility: z.enum(['public', 'private'])
})

export type SnippetFormValues = z.infer<typeof snippetSchema>

interface SnippetFormProps {
  initialValues?: Partial<SnippetFormValues>
  onSubmit: (values: SnippetFormValues) => void | Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
  onDelete?: () => void
}

export function SnippetForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Save Snippet',
  onDelete
}: SnippetFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      language: initialValues?.language ?? 'javascript',
      codeBody: initialValues?.codeBody ?? '',
      keywords: initialValues?.keywords ?? '',
      visibility: initialValues?.visibility ?? 'public'
    }
  })

  const language = watch('language')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-foreground">
          {initialValues?.title ? 'Edit Snippet' : 'Create Snippet'}
        </h1>
        <div className="flex gap-3">
          {onDelete && (
            <Button
              type="button"
              variant="secondary"
              onClick={onDelete}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Delete
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-(--radius) bg-surface-container p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">Title *</label>
          <Input
            {...register('title')}
            aria-invalid={!!errors.title}
            placeholder="e.g. Responsive Sidebar Menu"
            className="border-none bg-surface-container-low text-base font-medium shadow-inner"
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-muted-foreground">Description</label>
          <Textarea
            {...register('description')}
            placeholder="Briefly describe what this snippet does…"
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Language + Keywords row */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Visibility toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-muted-foreground">Visibility</label>
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <div className="flex rounded-(--radius) border border-border overflow-hidden w-fit">
                  <button
                    type="button"
                    onClick={() => field.onChange('public')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      field.value === 'public'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-container-low text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange('private')}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                      field.value === 'private'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-container-low text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Lock className="size-3" />
                    Private
                  </button>
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-muted-foreground">Language *</label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-52" aria-invalid={!!errors.language}>
                    <SelectValue placeholder="Pick a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.language && (
              <p className="text-xs text-destructive">{errors.language.message}</p>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-semibold text-muted-foreground">
              Keywords <span className="normal-case">(comma-separated)</span>
            </label>
            <Input
              {...register('keywords')}
              placeholder="e.g. react, sidebar, layout"
              className="text-sm"
            />
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-sm font-semibold text-muted-foreground">Code Body *</label>
          <Controller
            name="codeBody"
            control={control}
            render={({ field }) => (
              <div className="overflow-hidden rounded-(--radius) shadow-2xl">
                <CodeEditor
                  value={field.value}
                  onChange={field.onChange}
                  minHeight="400px"
                  placeholder="// Write your snippet here…"
                  extensions={getExtensions(language)}
                />
              </div>
            )}
          />
          {errors.codeBody && <p className="text-xs text-destructive">{errors.codeBody.message}</p>}
        </div>
      </div>
    </form>
  )
}
