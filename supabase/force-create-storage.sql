-- =============================================================================
-- FORCE RE-CREATION OF SUPABASE STORAGE SCHEMA
-- =============================================================================
-- This script manually creates the tables and functions required by Supabase Storage
-- when the extension is missing or broken.

CREATE SCHEMA IF NOT EXISTS "storage";

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS "storage"."buckets" (
    "id" text NOT NULL,
    "name" text NOT NULL,
    "owner" uuid,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    "public" boolean DEFAULT false,
    "avif_autodetection" boolean DEFAULT false,
    "file_size_limit" bigint,
    "allowed_mime_types" text[],
    CONSTRAINT "buckets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "buckets_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users"("id"),
    CONSTRAINT "buckets_id_name_unique" UNIQUE ("id", "name")
);

CREATE TABLE IF NOT EXISTS "storage"."objects" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "bucket_id" text,
    "name" text,
    "owner" uuid,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    "last_accessed_at" timestamptz DEFAULT now(),
    "metadata" jsonb,
    "path_tokens" text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    "version" text,
    "owner_id" text,
    CONSTRAINT "objects_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id"),
    CONSTRAINT "objects_owner_fkey" FOREIGN KEY ("owner") REFERENCES "auth"."users"("id")
);

-- 2. Create Helper Functions (Required for RLS)
CREATE OR REPLACE FUNCTION storage.foldername(name text)
 VALUES (string_to_array(name, '/'));

CREATE OR REPLACE FUNCTION storage.filename(name text)
 VALUES (split_part(name, '/', array_length(string_to_array(name, '/'), 1)));

CREATE OR REPLACE FUNCTION storage.extension(name text)
 VALUES (split_part(name, '.', array_length(string_to_array(name, '.'), 1)));

-- 3. Enable RLS
ALTER TABLE "storage"."objects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "storage"."buckets" ENABLE ROW LEVEL SECURITY;

-- 4. Grant Permissions
GRANT USAGE ON SCHEMA "storage" TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA "storage" TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA "storage" TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "storage" TO postgres, anon, authenticated, service_role;

console.log('✅ Storage Schema Re-created manually.');
