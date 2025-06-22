-- Adiciona a coluna 'log_id' para armazenar um ID único gerado no cliente.
-- Isso nos permite rastrear o log sem precisar ler os dados de volta após a inserção,
-- contornando assim as restrições de RLS para o cliente.
ALTER TABLE public.checkout_logs
ADD COLUMN IF NOT EXISTS log_id UUID; 