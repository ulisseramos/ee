ALTER TABLE public.integrations
ADD COLUMN IF NOT EXISTS producer_hash TEXT; 