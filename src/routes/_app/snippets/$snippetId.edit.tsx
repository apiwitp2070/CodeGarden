import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { SnippetForm } from '@/components/snippet-form'
import { getEditableSnippet } from '@/server/snippets'
import { updateSnippet, deleteSnippet } from '@/server/mutations'
import { dialog } from '@/utils/dialog'

export const Route = createFileRoute('/_app/snippets/$snippetId/edit')({
  loader: ({ params }: { params: { snippetId: string } }) =>
    getEditableSnippet({ data: { id: params.snippetId } }),
  component: EditSnippet
})

function EditSnippet() {
  const snippet = Route.useLoaderData() as {
    id: string
    title: string
    description: string | null
    language: string
    codeBody: string
    keywords: string[] | null
    visibility: 'public' | 'private'
  }
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
      await updateSnippet({
        data: {
          id: snippet.id,
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

  const handleDelete = () => {
    dialog.danger({
      title: 'Delete Snippet',
      description: 'Are you sure you want to delete this snippet? This cannot be undone.',
      confirmText: 'Delete',
      onConfirm: () => deleteSnippet({ data: { id: snippet.id } })
    })
  }

  return (
    <SnippetForm
      initialValues={{
        title: snippet.title,
        description: snippet.description ?? '',
        language: snippet.language,
        codeBody: snippet.codeBody,
        keywords: (snippet.keywords ?? []).join(', '),
        visibility: snippet.visibility
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Update Snippet"
      onDelete={handleDelete}
    />
  )
}
