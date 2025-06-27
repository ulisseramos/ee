-- Migration para criar tabela webhook_logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  method text NOT NULL,
  headers jsonb NOT NULL,
  body jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
); 