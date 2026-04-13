INSERT INTO "tags" ("id", "name", "slug")
VALUES
  ('01HTAG00000000000000000001', 'TypeScript', 'typescript'),
  ('01HTAG00000000000000000002', 'Node.js', 'nodejs'),
  ('01HTAG00000000000000000003', 'React', 'react'),
  ('01HTAG00000000000000000004', 'API', 'api'),
  ('01HTAG00000000000000000005', 'Database', 'database'),
  ('01HTAG00000000000000000006', 'Validation', 'validation'),
  ('01HTAG00000000000000000007', 'Utilities', 'utilities'),
  ('01HTAG00000000000000000008', 'Security', 'security'),
  ('01HTAG00000000000000000009', 'Performance', 'performance'),
  ('01HTAG0000000000000000000A', 'Testing', 'testing')
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "snippets" (
  "id",
  "title",
  "description",
  "code_body",
  "language",
  "keywords",
  "author_id"
)
VALUES
  (
    '01HSN1P0000000000000000001',
    'Debounced Search Input Hook',
    'A small React hook for debouncing text input before triggering expensive client-side or server-side searches.',
    $snippet$
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
$snippet$,
    'typescript',
    ARRAY['react', 'hooks', 'debounce', 'search'],
    NULL
  ),
  (
    '01HSN1P0000000000000000002',
    'Express Async Route Wrapper',
    'Wrap async Express handlers so thrown errors reach your centralized error middleware without repetitive try/catch blocks.',
    $snippet$
import type { NextFunction, Request, Response, RequestHandler } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function asyncRoute(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}
$snippet$,
    'typescript',
    ARRAY['express', 'middleware', 'errors', 'backend'],
    NULL
  ),
  (
    '01HSN1P0000000000000000003',
    'Environment Variable Assertion',
    'Validate required environment variables early and fail fast with a clear message during application startup.',
    $snippet$
export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  databaseUrl: requireEnv('DATABASE_URL'),
  authSecret: requireEnv('BETTER_AUTH_SECRET'),
};
$snippet$,
    'typescript',
    ARRAY['env', 'configuration', 'startup', 'node'],
    NULL
  ),
  (
    '01HSN1P0000000000000000004',
    'Fetch With Timeout',
    'Abort long-running fetch requests using AbortController so network calls do not hang indefinitely.',
    $snippet$
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 5000,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
$snippet$,
    'typescript',
    ARRAY['fetch', 'timeout', 'network', 'utility'],
    NULL
  ),
  (
    '01HSN1P0000000000000000005',
    'Zod Request Body Parser',
    'Parse JSON request bodies with Zod and return a strongly typed payload for route handlers.',
    $snippet$
import { z } from 'zod';

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const body = await request.json();
  return schema.parse(body);
}

export const createSnippetSchema = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  codeBody: z.string().min(1),
});
$snippet$,
    'typescript',
    ARRAY['zod', 'validation', 'request', 'api'],
    NULL
  ),
  (
    '01HSN1P0000000000000000006',
    'Generic Result Type',
    'Represent success and failure outcomes explicitly without throwing for expected control flow.',
    $snippet$
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };

export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
$snippet$,
    'typescript',
    ARRAY['result', 'error-handling', 'types', 'utility'],
    NULL
  ),
  (
    '01HSN1P0000000000000000007',
    'Node.js Graceful Shutdown',
    'Handle SIGTERM and SIGINT consistently to stop servers and close resources before exiting.',
    $snippet$
type AsyncCleanup = () => Promise<void> | void;

export function registerGracefulShutdown(cleanup: AsyncCleanup) {
  let shuttingDown = false;

  async function shutdown(signal: NodeJS.Signals) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.info(`Received ${signal}. Shutting down...`);

    try {
      await cleanup();
      process.exit(0);
    } catch (error) {
      console.error('Cleanup failed', error);
      process.exit(1);
    }
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
$snippet$,
    'typescript',
    ARRAY['shutdown', 'signals', 'server', 'operations'],
    NULL
  ),
  (
    '01HSN1P0000000000000000008',
    'In-Memory TTL Cache',
    'Cache computed values for a short period to reduce repeated expensive work on the server.',
    $snippet$
type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class TtlCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T, ttlMs: number) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }
}
$snippet$,
    'typescript',
    ARRAY['cache', 'ttl', 'performance', 'backend'],
    NULL
  ),
  (
    '01HSN1P0000000000000000009',
    'Timing Safe Token Compare',
    'Compare untrusted tokens with crypto.timingSafeEqual to avoid basic timing leaks in Node.js.',
    $snippet$
import { timingSafeEqual } from 'node:crypto';

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}
$snippet$,
    'typescript',
    ARRAY['security', 'crypto', 'tokens', 'node'],
    NULL
  ),
  (
    '01HSN1P000000000000000000A',
    'Vitest Mock Request Helper',
    'Create lightweight Request objects for unit tests around fetch handlers or server utilities.',
    $snippet$
export function createJsonRequest(
  url: string,
  body: unknown,
  init: RequestInit = {},
) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...init,
  });
}
$snippet$,
    'typescript',
    ARRAY['vitest', 'testing', 'request', 'helpers'],
    NULL
  )
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "snippet_tags" ("snippet_id", "tag_id")
VALUES
  ('01HSN1P0000000000000000001', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000001', '01HTAG00000000000000000003'),
  ('01HSN1P0000000000000000001', '01HTAG00000000000000000007'),
  ('01HSN1P0000000000000000002', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000002', '01HTAG00000000000000000002'),
  ('01HSN1P0000000000000000002', '01HTAG00000000000000000004'),
  ('01HSN1P0000000000000000003', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000003', '01HTAG00000000000000000002'),
  ('01HSN1P0000000000000000004', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000004', '01HTAG00000000000000000007'),
  ('01HSN1P0000000000000000005', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000005', '01HTAG00000000000000000004'),
  ('01HSN1P0000000000000000005', '01HTAG00000000000000000006'),
  ('01HSN1P0000000000000000006', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000006', '01HTAG00000000000000000007'),
  ('01HSN1P0000000000000000007', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000007', '01HTAG00000000000000000002'),
  ('01HSN1P0000000000000000008', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000008', '01HTAG00000000000000000009'),
  ('01HSN1P0000000000000000009', '01HTAG00000000000000000001'),
  ('01HSN1P0000000000000000009', '01HTAG00000000000000000002'),
  ('01HSN1P0000000000000000009', '01HTAG00000000000000000008'),
  ('01HSN1P000000000000000000A', '01HTAG00000000000000000001'),
  ('01HSN1P000000000000000000A', '01HTAG0000000000000000000A')
ON CONFLICT DO NOTHING;
