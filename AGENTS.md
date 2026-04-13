# SnippetVault

SnippetVault is a full-stack code snippet manager.

## Tech Stack
- **Framework**: TanStack Start with React 19
- **Routing/SSR**: TanStack Router (`react-router`)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Search**: Drizzle raw SQL with `tsvector` (full-text) and `pg_trgm` (trigram / substring matching)
- **Code Highlighting**: `shiki` (server-side generation to HTML)
- **Code Editing**: CodeMirror 6 (`@uiw/react-codemirror`) lazy-loaded on client
- **Auth**: Better Auth (`better-auth`) with Drizzle Postgres adapter
- **Monitoring**: Sentry

## Environment
Ensure the following are set in `.env.local`:
- `DATABASE_URL`: PostgreSQL connection string (Docker or cloud)
- `BETTER_AUTH_SECRET`: Generate using `bunx --bun @better-auth/cli secret`
- `BETTER_AUTH_URL`: `http://localhost:3000` for local dev
- `VITE_SENTRY_DSN`: Sentry DSN (optional)

## Design System: Nocturnal Architect
- **Concept**: A bespoke, high-end IDE/editorial aesthetic.
- **Colors**: Deep Navies (Backgrounds: `#060e20`, `#0c1629`, `#111d33`) and Desaturated Emeralds (Primary: `#75daa8`).
- **Typography**: Manrope (Headlines), Inter (Body), Space Grotesk (Labels/Tags), JetBrains Mono (Code).
- **The "No-Line" Rule**: 1px solid borders are prohibited for structural sectioning. Use background shifts, negative space, and tonal transitions instead. Ghost borders (`15%`) are only for interactive fields.
- **Elevation**: Use `surface-container` tiers and `backdrop-blur(12-20px)` glassmorphism for floating elements. Ambient shadows only (4-8% opacity of text color, 32-64px blur), never solid black drops.

## TanStack Start + React Rules
- **Isomorphic by Default**: All code in Start runs on both server AND client unless specifically marked or isolated. Loaders run on both. 
- **Server Functions**: Use `createServerFn` for server-only operations (db, secrets).
- **Hooks**: Use `useLoaderData` and `useSearch` directly from `Route` (e.g. `Route.useLoaderData()`). These return values directly, not accessors (unlike Solid).

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "Adding or modifying routes, link navigation, URL search parameters, or data loading hooks"
    load: "node_modules/@tanstack/react-router/skills/react-router/SKILL.md"
  - task: "Server components, isomorphic execution, app configuration, or SSR"
    load: "node_modules/@tanstack/start-client-core/skills/start-core/SKILL.md"
  - task: "Creating server-only code (RPCs, database access, API endpoints) via createServerFn"
    load: "node_modules/@tanstack/start-client-core/skills/start-core/server-functions/SKILL.md"
  - task: "Setting up authentication, middleware, or server context"
    load: "node_modules/@tanstack/start-client-core/skills/start-core/middleware/SKILL.md"
<!-- intent-skills:end -->
