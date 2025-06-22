-- Adiciona a coluna 'price' à tabela 'checkout_logs' para armazenar o valor da venda.
-- O tipo NUMERIC é usado para valores monetários.
ALTER TABLE public.checkout_logs
ADD COLUMN IF NOT EXISTS price NUMERIC; 