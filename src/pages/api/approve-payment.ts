import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
// import { sendUtmfyWebhook } from '../../lib/utmfWebhook'; // Removido pois não existe mais

// Esta API usa a CHAVE DE SERVIÇO para ter permissão de administrador
// e atualizar qualquer registro no banco de dados.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { logId } = req.body;

    if (!logId) {
      return res.status(400).json({ error: 'O ID do log de checkout é obrigatório.' });
    }

    // Atualiza o status para aprovado
    const { data: venda, error } = await supabaseAdmin
      .from('checkout_logs')
      .update({ 
        status: 'aprovado',
        updated_at: new Date().toISOString() 
      })
      .eq('log_id', logId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao aprovar pagamento (API):', error);
      return res.status(500).json({ error: error.message });
    }

    // Busca a integração do usuário para pegar a API Key do UTMFY
    if (venda && venda.user_id) {
      const { data: integracao } = await supabaseAdmin
        .from('integrations')
        .select('utmfy_api_key')
        .eq('user_id', venda.user_id)
        .single();
      if (integracao?.utmfy_api_key) {
        // Monta o payload no formato Disrupty
        const payload = {
          hash: venda.id,
          customer: {
            name: venda.nome,
            email: venda.email,
            phone_number: venda.telefone,
            zip_code: venda.cep || '',
            street_name: venda.rua || '',
            number: venda.numero || '',
            complement: venda.complemento || '',
            neighborhood: venda.bairro || '',
            city: venda.cidade || '',
            state: venda.estado || '',
          },
          producer: {
            hash: 'produtor-hash',
            name: 'Produtor',
            document: '00000000000',
            recipient_type: 'individual',
          },
          offer: {
            hash: 'oferta-hash',
            title: venda.product_name || 'Produto',
            price: Math.round((venda.price || 0) * 100),
            url: 'https://seusite.com/oferta',
            status: 1,
          },
          product: {
            hash: 'produto-hash',
            title: venda.product_name || 'Produto',
            cover: '',
            product_type: 'digital',
            guaranted_days: '30',
            sale_page: '',
            offers: [],
            status: 1,
          },
          balance: null,
          payment_method: venda.payment_method || 'credit_card',
          payment_status: 'paid',
          installments: venda.installments || 1,
          pix: null,
          billet: null,
          amount: Math.round((venda.price || 0) * 100),
          amount_liquid: Math.round((venda.price || 0) * 90),
          transaction: venda.id,
          postback_url: integracao.utmfy_api_key,
          utm_source: venda.utm_source || '',
          utm_campaign: venda.utm_campaign || '',
          utm_content: venda.utm_content || '',
          utm_term: venda.utm_term || '',
          utm_medium: venda.utm_medium || '',
          created_at: venda.created_at,
          updated_at: new Date().toISOString(),
        };
        // Envia o webhook para a UTMFY
        try {
          const resp = await fetch(integracao.utmfy_api_key, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const respData = await resp.text();
          console.log('[UTMFY] Webhook Disrupty enviado:', resp.status, respData);
        } catch (err) {
          console.error('[UTMFY] Falha ao enviar webhook Disrupty:', err);
        }
      }
    }

    console.log('Venda aprovada com sucesso pela API:', venda);
    res.status(200).json({ success: true, data: venda });

  } catch (err: any) {
    console.error('Erro inesperado na API approve-payment:', err);
    res.status(500).json({ error: 'Erro interno do servidor.', details: err.message });
  }
} 