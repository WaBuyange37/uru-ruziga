-- Check installed extensions
SELECT * FROM pg_extension;

-- Attempt to create the extension explicitly (if permissions allow)
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "public"; 

-- Check if the schema exists and has tables
SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'storage';
