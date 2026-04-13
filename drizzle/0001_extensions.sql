CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP INDEX IF EXISTS "idx_snippets_search";
DROP INDEX IF EXISTS "idx_snippets_code_trgm";
DROP TRIGGER IF EXISTS snippets_search_vector_update ON "snippets";
DROP FUNCTION IF EXISTS snippets_search_vector_refresh();
ALTER TABLE "snippets" DROP COLUMN IF EXISTS "search_vector";

ALTER TABLE "snippets" ADD COLUMN "search_vector" tsvector;

CREATE FUNCTION snippets_search_vector_refresh()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(array_to_string(NEW.keywords, ' '), '')), 'C');

  RETURN NEW;
END;
$$;

CREATE TRIGGER snippets_search_vector_update
BEFORE INSERT OR UPDATE OF "title", "description", "keywords"
ON "snippets"
FOR EACH ROW
EXECUTE FUNCTION snippets_search_vector_refresh();

UPDATE "snippets"
SET "search_vector" =
  setweight(to_tsvector('english'::regconfig, coalesce("title", '')), 'A') ||
  setweight(to_tsvector('english'::regconfig, coalesce("description", '')), 'B') ||
  setweight(to_tsvector('english'::regconfig, coalesce(array_to_string("keywords", ' '), '')), 'C');

CREATE INDEX IF NOT EXISTS "idx_snippets_search" ON "snippets" USING GIN("search_vector");
CREATE INDEX IF NOT EXISTS "idx_snippets_code_trgm" ON "snippets" USING GIN("code_body" gin_trgm_ops);
