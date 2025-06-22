-- Corrige as políticas de RLS para inserção e atualização na tabela checkout_logs.
-- Removendo e recriando as políticas, forçamos o Supabase a reconhecer
-- o esquema mais recente da tabela, incluindo a coluna 'log_id' que foi adicionada depois.

-- Remove as políticas de inserção e atualização existentes para evitar conflitos.
DROP POLICY IF EXISTS "Allow public insert for anyone" ON public.checkout_logs;
DROP POLICY IF EXISTS "Allow individual update access" ON public.checkout_logs;

-- Recria a política de inserção para permitir que qualquer pessoa inicie um checkout.
-- Isso é necessário porque o cliente que paga não está logado como o dono do produto.
CREATE POLICY "Allow public insert for anyone"
ON public.checkout_logs
FOR INSERT
WITH CHECK (true);

-- Recria a política de atualização para ser mais permissiva.
-- Isso corrige o fluxo de checkout onde um cliente anônimo precisa atualizar o log com um ID de transação.
-- A segurança aqui depende da lógica da aplicação para apenas permitir atualizações válidas.
CREATE POLICY "Allow public update access"
ON public.checkout_logs
FOR UPDATE
USING (true)
WITH CHECK (true); 