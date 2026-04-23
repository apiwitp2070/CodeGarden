CREATE TABLE "collections" (
  "id" char(26) PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "author_id" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collection_snippets" (
  "collection_id" char(26) NOT NULL,
  "snippet_id" char(26) NOT NULL,
  "added_at" timestamp DEFAULT now(),
  CONSTRAINT "collection_snippets_pkey" PRIMARY KEY ("collection_id", "snippet_id")
);
--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_author_id_user_id_fk"
  FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "cs_collection_fk"
  FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "collection_snippets" ADD CONSTRAINT "cs_snippet_fk"
  FOREIGN KEY ("snippet_id") REFERENCES "snippets"("id") ON DELETE cascade ON UPDATE no action;
