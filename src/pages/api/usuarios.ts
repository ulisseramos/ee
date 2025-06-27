import type { NextApiRequest, NextApiResponse } from 'next';

// ATENÇÃO: coloque sua Service Role Key do Supabase no arquivo .env.local
// SUPABASE_SERVICE_ROLE_KEY=xxxxxx

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Configuração do Supabase ausente' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/users`, {
      headers: {
        apiKey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }
    const data = await response.json();
    // Retornar apenas dados essenciais
    const usuarios = (data.users || data) // depende do formato da resposta
      .map((u: any) => ({
        id: u.id,
        email: u.email,
        criado_em: u.created_at,
      }));
    return res.status(200).json({ usuarios });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Erro desconhecido' });
  }
} 