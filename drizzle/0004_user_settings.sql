CREATE TABLE "user_settings" (
  "id" char(26) PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "language_preferences" text[] DEFAULT '{}' NOT NULL,
  CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_settings"
  ADD CONSTRAINT "user_settings_user_id_user_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
