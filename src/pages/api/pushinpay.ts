import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { test, apiKey } = req.body;

  if (test && apiKey) {
    // Aqui você poderia adicionar uma lógica real para validar a chave de API
    // com o serviço da PushinPay, se eles tiverem um endpoint para isso.
    // Por enquanto, apenas checamos se a chave não está vazia.
    if (apiKey.startsWith('pk_live_') || apiKey.startsWith('pk_test_')) {
        return res.status(200).json({ success: true, message: 'Conexão OK!' });
    } else {
        return res.status(400).json({ error: 'Formato de chave de API inválido.' });
    }
  }

  // Adicionar aqui outras lógicas da API da PushinPay se necessário.

  return res.status(400).json({ error: 'Requisição inválida.' });
} 