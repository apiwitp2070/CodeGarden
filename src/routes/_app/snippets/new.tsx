import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { SnippetForm } from '@/components/snippet-form'
import { createSnippet } from '@/server/mutations'
import { requireViewerSession } from '@/server/auth'

export const Route = createFileRoute('/_app/snippets/new')({
  loader: () => requireViewerSession(),
  component: CreateSnippet
})

function CreateSnippet() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: {
    title: string
    description: string
    language: string
    codeBody: string
    keywords: string
  }) => {
    setIsSubmitting(true)
    await createSnippet({
      data: {
        title: values.title,
        description: values.description || undefined,
        language: values.language,
        codeBody: values.codeBody,
        keywords: values.keywords
          ? values.keywords
              .split(',')
              .map((k) => k.trim())
              .filter(Boolean)
          : []
      }
    })
    setIsSubmitting(false)
  }

  return (
    <SnippetForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create Snippet" />
  )
}
