import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, webhook_url, events } = req.body;
    if (!user_id || !webhook_url) {
      return res.status(400).json({ error: 'user_id e webhook_url são obrigatórios.' });
    }
    // Salva ou atualiza configuração de webhook customizado
    const { error } = await supabase
      .from('integrations')
      .upsert([
        {
          user_id,
          provider: 'webhook_custom',
          webhook_url,
          webhook_events: events,
        }
      ], { onConflict: 'user_id,provider' });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Configuração de Webhook salva com sucesso!' });
  }
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id é obrigatório.' });
    const { data, error } = await supabase
      .from('integrations')
      .select('webhook_url, webhook_events')
      .eq('user_id', user_id)
      .eq('provider', 'webhook_custom')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 