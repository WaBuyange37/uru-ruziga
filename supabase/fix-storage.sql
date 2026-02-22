-- Attempt to fix missing Storage schema/extension

-- 1. Ensure extensions schema exists
CREATE SCHEMA IF NOT EXISTS "extensions";

-- 2. Enable common extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_net" SCHEMA "extensions";

-- 3. Attempt to enable storage extension (if available to postgres role)
-- Note: In some Supabase setups, this is managed by the platform and might fail.
-- But if the schema is missing, we try to create it.
CREATE SCHEMA IF NOT EXISTS "storage";

-- 4. Grant usage
GRANT USAGE ON SCHEMA "storage" TO postgres, anon, authenticated, service_role;

-- 5. Verify if we can see the tables (this is just a check, won't error if empty)
SELECT * FROM information_schema.tables WHERE table_schema = 'storage';
