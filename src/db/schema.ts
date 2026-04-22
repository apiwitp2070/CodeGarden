import {
  boolean,
  char,
  customType,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { ulid } from 'ulid'

// Custom type for tsvector since drizzle doesn't natively support it yet
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  }
})

// Better Auth user table mapping
export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull()
})

export const sessions = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
})

export const accounts = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull()
})

export const verifications = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull()
})

export const tags = pgTable('tags', {
  id: char('id', { length: 26 })
    .$defaultFn(() => ulid())
    .primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique()
})

export const snippets = pgTable('snippets', {
  id: char('id', { length: 26 })
    .$defaultFn(() => ulid())
    .primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  codeBody: text('code_body').notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  keywords: text('keywords')
    .array()
    .default(sql`'{}'::text[]`),
  authorId: text('author_id').references(() => users.id, { onDelete: 'cascade' }),
  searchVector: tsvector('search_vector'), // Maintained by SQL trigger for search indexing
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const userSettings = pgTable('user_settings', {
  id: char('id', { length: 26 })
    .$defaultFn(() => ulid())
    .primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  languagePreferences: text('language_preferences')
    .array()
    .default(sql`'{}'::text[]`)
    .notNull()
})

export const snippetTags = pgTable(
  'snippet_tags',
  {
    snippetId: char('snippet_id', { length: 26 })
      .references(() => snippets.id, { onDelete: 'cascade' })
      .notNull(),
    tagId: char('tag_id', { length: 26 })
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull()
  },
  (t) => [primaryKey({ columns: [t.snippetId, t.tagId] })]
)

export const userFavorites = pgTable(
  'user_favorites',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    snippetId: char('snippet_id', { length: 26 })
      .notNull()
      .references(() => snippets.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow()
  },
  (t) => [primaryKey({ columns: [t.userId, t.snippetId] })]
)

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  snippets: many(snippets),
  sessions: many(sessions),
  accounts: many(accounts),
  settings: one(userSettings, { fields: [users.id], references: [userSettings.userId] }),
  favorites: many(userFavorites),
  comments: many(snippetComments)
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}))

export const snippetsRelations = relations(snippets, ({ one, many }) => ({
  author: one(users, {
    fields: [snippets.authorId],
    references: [users.id]
  }),
  tags: many(snippetTags),
  favorites: many(userFavorites),
  comments: many(snippetComments)
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  snippets: many(snippetTags)
}))

export const snippetTagsRelations = relations(snippetTags, ({ one }) => ({
  snippet: one(snippets, {
    fields: [snippetTags.snippetId],
    references: [snippets.id]
  }),
  tag: one(tags, {
    fields: [snippetTags.tagId],
    references: [tags.id]
  })
}))

export const snippetComments = pgTable('snippet_comments', {
  id: char('id', { length: 26 })
    .$defaultFn(() => ulid())
    .primaryKey(),
  snippetId: char('snippet_id', { length: 26 })
    .notNull()
    .references(() => snippets.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['comment', 'suggestion'] }).notNull().default('comment'),
  body: text('body').notNull(),
  suggestionCode: text('suggestion_code'),
  status: text('status', { enum: ['open', 'merged', 'rejected'] }).notNull().default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id]
  }),
  snippet: one(snippets, {
    fields: [userFavorites.snippetId],
    references: [snippets.id]
  })
}))

export const snippetCommentsRelations = relations(snippetComments, ({ one }) => ({
  snippet: one(snippets, {
    fields: [snippetComments.snippetId],
    references: [snippets.id]
  }),
  author: one(users, {
    fields: [snippetComments.authorId],
    references: [users.id]
  })
}))
