import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { SnippetForm } from '@/components/snippet-form'
import { createSnippet } from '@/server/mutations'
import { requireViewerSession } from '@/server/auth'

export const Route = createFileRoute('/_app/snippets/new')({
  loader: () => requireViewerSession(),
  component: CreateSnippet
})

function CreateSnippet() {
  const create = useServerFn(createSnippet)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: {
    title: string
    description: string
    language: string
    codeBody: string
    keywords: string
    visibility: 'public' | 'private'
  }) => {
    setIsSubmitting(true)
    try {
      await create({
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
            : [],
          visibility: values.visibility
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SnippetForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create Snippet" />
  )
}
