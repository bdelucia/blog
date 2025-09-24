-- Check if the order column already exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name = 'order';
