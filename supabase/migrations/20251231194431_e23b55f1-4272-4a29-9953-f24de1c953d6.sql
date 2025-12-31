-- Fix linter: Extension in Public
-- pg_cron does not support ALTER EXTENSION ... SET SCHEMA, so we recreate in a dedicated schema.

CREATE SCHEMA IF NOT EXISTS extensions;

-- Recreate extensions in the extensions schema
DROP EXTENSION IF EXISTS pg_cron CASCADE;
DROP EXTENSION IF EXISTS pg_net CASCADE;

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;