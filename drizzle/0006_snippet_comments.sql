CREATE TABLE "snippet_comments" (
  "id" char(26) PRIMARY KEY NOT NULL,
  "snippet_id" char(26) NOT NULL,
  "author_id" text NOT NULL,
  "type" text NOT NULL DEFAULT 'comment',
  "body" text NOT NULL,
  "suggestion_code" text,
  "status" text NOT NULL DEFAULT 'open',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "snippet_comments"
  ADD CONSTRAINT "snippet_comments_snippet_id_snippets_id_fk"
  FOREIGN KEY ("snippet_id") REFERENCES "snippets"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "snippet_comments"
  ADD CONSTRAINT "snippet_comments_author_id_user_id_fk"
  FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
