import type { NextApiRequest, NextApiResponse } from 'next';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Configuração do Supabase ausente' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    // Envia o e-mail de redefinição de senha
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/by_email`, {
      method: 'POST',
      headers: {
        apiKey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, action: 'recovery' }),
    });
    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Erro desconhecido' });
  }
} 