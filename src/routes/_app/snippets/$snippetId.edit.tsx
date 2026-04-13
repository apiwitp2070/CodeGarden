import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SnippetForm } from "@/components/snippet-form";
import { getEditableSnippet } from "@/server/snippets";
import { updateSnippet, deleteSnippet } from "@/server/mutations";

export const Route = createFileRoute("/_app/snippets/$snippetId/edit")({
  loader: ({ params }: { params: { snippetId: string } }) =>
    getEditableSnippet({ data: { id: params.snippetId } }),
  component: EditSnippet,
});

function EditSnippet() {
  const snippet = Route.useLoaderData() as {
    id: string;
    title: string;
    description: string | null;
    language: string;
    codeBody: string;
    keywords: string[] | null;
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: {
    title: string;
    description: string;
    language: string;
    codeBody: string;
    keywords: string;
  }) => {
    setIsSubmitting(true);
    await updateSnippet({
      data: {
        id: snippet.id,
        title: values.title,
        description: values.description || undefined,
        language: values.language,
        codeBody: values.codeBody,
        keywords: values.keywords
          ? values.keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : [],
      },
    });
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this snippet?")) return;
    await deleteSnippet({ data: { id: snippet.id } });
  };

  return (
    <SnippetForm
      initialValues={{
        title: snippet.title,
        description: snippet.description ?? "",
        language: snippet.language,
        codeBody: snippet.codeBody,
        keywords: (snippet.keywords ?? []).join(", "),
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Update Snippet"
      onDelete={handleDelete}
    />
  );
}
