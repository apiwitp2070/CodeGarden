CREATE TABLE "user_favorites" (
  "user_id" text NOT NULL,
  "snippet_id" char(26) NOT NULL,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("user_id", "snippet_id")
);
--> statement-breakpoint
ALTER TABLE "user_favorites"
  ADD CONSTRAINT "user_favorites_user_id_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_favorites"
  ADD CONSTRAINT "user_favorites_snippet_id_snippets_id_fk"
  FOREIGN KEY ("snippet_id") REFERENCES "snippets"("id") ON DELETE cascade ON UPDATE no action;
