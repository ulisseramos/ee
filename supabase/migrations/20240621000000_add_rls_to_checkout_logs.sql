-- Habilita a Row Level Security para a tabela de logs de checkout
ALTER TABLE public.checkout_logs ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem, para evitar conflitos
DROP POLICY IF EXISTS "Allow public insert for anyone" ON public.checkout_logs;
DROP POLICY IF EXISTS "Allow individual select access" ON public.checkout_logs;
DROP POLICY IF EXISTS "Allow individual update access" ON public.checkout_logs;

-- Cria a política para inserção pública
-- Qualquer pessoa pode registrar um início de checkout.
CREATE POLICY "Allow public insert for anyone"
ON public.checkout_logs
FOR INSERT
WITH CHECK (true);

-- Cria a política para leitura individual
-- Um usuário só pode ver os logs de checkout que pertencem a ele.
CREATE POLICY "Allow individual select access"
ON public.checkout_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Cria a política para atualização individual
-- Um usuário só pode atualizar os logs de checkout que pertencem a ele.
CREATE POLICY "Allow individual update access"
ON public.checkout_logs
FOR UPDATE
USING (auth.uid() = user_id); 