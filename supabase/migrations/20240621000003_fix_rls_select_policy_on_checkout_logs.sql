-- Revoga a política de seleção individual existente, se houver, para evitar conflitos.
DROP POLICY IF EXISTS "Allow individual select access" ON public.checkout_logs;

-- Cria (ou recria) a política para permitir que usuários leiam apenas seus próprios logs de checkout.
-- Isso garante que um usuário só possa visualizar as vendas associadas ao seu ID.
CREATE POLICY "Allow individual select access"
ON public.checkout_logs
FOR SELECT
USING (auth.uid() = user_id); 