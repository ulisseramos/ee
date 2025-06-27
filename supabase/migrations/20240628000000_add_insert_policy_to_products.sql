-- Permite que usuários autenticados insiram produtos para si mesmos
CREATE POLICY "Users can insert their own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid()) = user_id); 