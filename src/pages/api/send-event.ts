import type { NextApiRequest, NextApiResponse } from 'next';

// Endpoint genérico para enviar eventos para qualquer API externa
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, token, ...body } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL de destino não informada.' });
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['x-api-key'] = token;
    }
    const apiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    let data = {};
    try { data = await apiRes.json(); } catch { data = {}; }
    console.log('Resposta do endpoint externo:', apiRes.status, data);
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: 'Erro do endpoint externo', details: data });
    }
    return res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('Erro ao enviar evento:', err);
    return res.status(500).json({ error: 'Erro ao enviar evento', details: String(err) });
  }
} 