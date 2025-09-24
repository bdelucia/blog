-- Add order field to articles table for drag and drop functionality
ALTER TABLE "articles" ADD COLUMN "order" integer DEFAULT 0;

-- Update existing articles to have proper order values
UPDATE "articles" SET "order" = subquery.row_number - 1
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) as row_number
    FROM "articles"
) AS subquery
WHERE "articles".id = subquery.id;
