import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { CodeEditor } from '@/components/code-editor'
import { getLanguageExtension } from '#/lib/codemirror'

type CommentType = 'comment' | 'suggestion'

interface FormValues {
  type: CommentType
  body: string
  suggestionCode: string
  notifyAuthor: boolean
}

interface CommentFormProps {
  snippetId: string
  snippetCode: string
  language: string
  onSubmit: (values: {
    snippetId: string
    type: CommentType
    body: string
    suggestionCode?: string
    notifyAuthor?: boolean
  }) => Promise<void>
  initialValues?: {
    type: CommentType
    body: string
    suggestionCode?: string
  }
  isEditMode?: boolean
  onCancel?: () => void
}

export function CommentForm({
  snippetId,
  snippetCode,
  language,
  onSubmit,
  initialValues,
  isEditMode = false,
  onCancel
}: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      type: initialValues?.type ?? 'comment',
      body: initialValues?.body ?? '',
      suggestionCode: initialValues?.suggestionCode ?? snippetCode,
      notifyAuthor: false
    }
  })

  const type = watch('type')
  const langExtensions = getLanguageExtension(language)

  async function onFormSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      await onSubmit({
        snippetId,
        type: values.type,
        body: values.body,
        suggestionCode: values.type === 'suggestion' ? values.suggestionCode : undefined,
        notifyAuthor: !isEditMode && values.type === 'suggestion' ? values.notifyAuthor : undefined
      })
      if (!isEditMode) {
        reset({ type: 'comment', body: '', suggestionCode: snippetCode, notifyAuthor: false })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
      {/* Type selector — hidden in edit mode since type can't change */}
      {!isEditMode && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Type</span>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col"
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <RadioGroupItem value="comment" />
                  Comment
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <RadioGroupItem value="suggestion" />
                  Code Suggestion
                </label>
              </RadioGroup>
            )}
          />
        </div>
      )}

      {/* Comment body */}
      <Controller
        name="body"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder={
              type === 'suggestion' ? 'Describe your suggestion...' : 'Leave a comment...'
            }
            rows={3}
            className="resize-none"
          />
        )}
      />

      {/* Suggestion code editor */}
      {type === 'suggestion' && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Suggested Code</span>
          <Controller
            name="suggestionCode"
            control={control}
            render={({ field }) => (
              <CodeEditor
                value={field.value}
                onChange={field.onChange}
                extensions={langExtensions}
                minHeight="200px"
              />
            )}
          />
        </div>
      )}

      {/* Notify author option — only for new suggestions */}
      {type === 'suggestion' && !isEditMode && (
        <Controller
          name="notifyAuthor"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              Notify snippet author via email
            </label>
          )}
        />
      )}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isEditMode ? 'Save Changes' : type === 'suggestion' ? 'Post Suggestion' : 'Post Comment'}
        </Button>
      </div>
    </form>
  )
}
