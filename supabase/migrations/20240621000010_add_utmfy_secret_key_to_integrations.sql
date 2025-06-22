ALTER TABLE public.integrations
ADD COLUMN IF NOT EXISTS utmfy_secret_key TEXT; 