import { createServerFn } from '@tanstack/react-start';
import { db } from '@/db';
import { snippets } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { redirect } from '@tanstack/react-router';
import { requireCurrentSession } from './auth.server';

type SnippetInput = {
  title: string;
  description?: string;
  codeBody: string;
  language: string;
  keywords?: string[];
};

export const createSnippet = createServerFn({ method: 'POST' })
  .inputValidator((d: SnippetInput) => d)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession();
    const [snippet] = await db
      .insert(snippets)
      .values({
        title: data.title,
        description: data.description,
        codeBody: data.codeBody,
        language: data.language,
        keywords: data.keywords ?? [],
        authorId: session.user.id,
      })
      .returning();

    throw redirect({ to: '/snippets/$snippetId', params: { snippetId: snippet.id } });
  });

export const updateSnippet = createServerFn({ method: 'POST' })
  .inputValidator((d: SnippetInput & { id: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession();
    const [snippet] = await db
      .update(snippets)
      .set({
        title: data.title,
        description: data.description,
        codeBody: data.codeBody,
        language: data.language,
        keywords: data.keywords ?? [],
        updatedAt: new Date(),
      })
      .where(and(eq(snippets.id, data.id), eq(snippets.authorId, session.user.id)))
      .returning();

    if (!snippet) {
      throw redirect({ to: '/' });
    }

    throw redirect({ to: '/snippets/$snippetId', params: { snippetId: snippet.id } });
  });

export const deleteSnippet = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const session = await requireCurrentSession();
    await db
      .delete(snippets)
      .where(and(eq(snippets.id, data.id), eq(snippets.authorId, session.user.id)));
    throw redirect({ to: '/' });
  });
