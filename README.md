# SnippetVault

SnippetVault is a full-stack code snippet manager built with TanStack Start, PostgreSQL, Drizzle ORM, Better Auth, Shiki, and CodeMirror.

## Stack

- TanStack Start with React 19
- PostgreSQL via `postgres` + Drizzle ORM
- Better Auth with the Drizzle Postgres adapter
- Server-side syntax highlighting with Shiki
- Client-side editing with lazy-loaded CodeMirror 6
- Tailwind CSS v4 + shadcn/ui

## Local Setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env.local` with:

```bash
DATABASE_URL=postgres://...
BETTER_AUTH_SECRET=generate-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
VITE_SENTRY_DSN=
```

Generate a secret with:

```bash
bunx --bun @better-auth/cli secret
```

3. Apply the Drizzle SQL migrations in `drizzle/` to your Postgres database.

4. Start the app:

```bash
bun --bun run dev
```

The app runs on `http://localhost:3000`.

## Scripts

- `bun --bun run dev` starts the local dev server with dotenv + Sentry instrumentation.
- `bun --bun run build` builds the TanStack Start app and copies the server instrumentation file into `dist/server`.
- `bun --bun run start` runs the production server from `dist/server/server.js`.
- `bun --bun run test` runs Vitest in non-failing no-tests mode.
- `bunx tsc --noEmit` runs a full TypeScript check.

## Database Notes

- `drizzle/0001_extensions.sql` enables `pg_trgm`, recreates `search_vector` as a generated stored column, and adds the required GIN indexes.
- `drizzle/0002_better_auth.sql` adds the Better Auth persistence tables: `session`, `account`, and `verification`.
- Search uses weighted full-text ranking over `title`, `description`, and `keywords`, plus trigram and substring matching over `code_body`.

## Product Notes

- Snippet detail pages are public.
- Creating, editing, and deleting snippets requires authentication.
- Only the author of a snippet can edit or delete it.
- Search is URL-driven from the global topbar search field.
