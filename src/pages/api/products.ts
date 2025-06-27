import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { productName, productPrice, description } = req.body;

    if (!productName || !productPrice || !description) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Pega o token JWT do header Authorization
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const jwt = authHeader?.toString().replace('Bearer ', '');
    if (!jwt) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Cria o Supabase client com o JWT do usuário
    const supabaseServer = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });

    // Obtém o usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        name: productName,
        price: productPrice,
        description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, product: data });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(400).json({ error: error.message || 'Erro ao criar produto' });
  }
}
