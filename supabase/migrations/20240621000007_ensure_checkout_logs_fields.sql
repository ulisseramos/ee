-- Garante que todos os campos necessários para o relatório existam na tabela checkout_logs

-- Adiciona coluna nome se não existir
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS nome TEXT;

-- Adiciona coluna email se não existir
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Adiciona coluna telefone se não existir
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Adiciona coluna transaction_id se não existir
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Adiciona coluna log_id se não existir
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS log_id UUID;

-- Adiciona coluna price se não existir
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Adiciona coluna status se não existir
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';

-- Garante que a coluna created_at existe
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Garante que a coluna updated_at existe
ALTER TABLE public.checkout_logs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); 