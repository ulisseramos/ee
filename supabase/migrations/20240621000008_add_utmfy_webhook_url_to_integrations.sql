ALTER TABLE public.integrations
ADD COLUMN IF NOT EXISTS utmfy_webhook_url TEXT; 