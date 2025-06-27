import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { log } from 'console';
// import { sendUtmfyWebhook } from '../../lib/utmfWebhook'; // Removido pois não existe mais

// Inicializa o cliente Supabase com as variáveis de ambiente.
// É importante usar as variáveis de ambiente de serviço (service_role) para operações de escrita no backend.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Atenção: Use a chave de serviço aqui!
);

const ADMIN_SECRET = process.env.ADMIN_SECRET;

async function sendToOtimizey(saleData: any) {
  const otimizeyWebhookUrl = process.env.NEXT_PUBLIC_OTIMIZEY_WEBHOOK_URL;

  if (!otimizeyWebhookUrl) {
    console.error('URL do webhook da Otimizey não está configurada. Verifique a variável de ambiente NEXT_PUBLIC_OTIMIZEY_WEBHOOK_URL.');
    return;
  }

  // Mapeia os dados da sua tabela `checkout_logs` para o formato que a Otimizey espera.
  // Isso é um exemplo, você pode precisar ajustar os campos.
  const payload = {
    event: saleData.status === 'aprovado' ? 'sale_approved' : 'sale_pending',
    transaction_id: saleData.id, // ou saleData.transaction_id, se você tiver esse campo
    customer_name: saleData.nome,
    customer_email: saleData.email,
    price: saleData.price,
    product_name: saleData.product_name || 'Produto Padrão', // Adicione o nome do produto se tiver
    timestamp: saleData.created_at,
  };

  try {
    console.log('Enviando para Otimizey:', payload);
    const response = await fetch(otimizeyWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(`Erro ao enviar webhook para Otimizey: ${response.status} - ${response.statusText}`, responseBody);
      throw new Error(`Otimizey respondeu com status ${response.status}`);
    }

    console.log('Webhook enviado com sucesso para Otimizey.');

  } catch (error) {
    console.error('Falha ao enviar webhook para Otimizey:', error);
    // Mesmo que falhe, não interrompemos o fluxo principal.
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('--- [WEBHOOK] Requisição recebida ---');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  // Garante que a requisição seja um POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Extrai o ID da transação e o status do corpo da requisição do webhook
    const { transaction_id, status } = req.body;
    console.log('[WEBHOOK] transaction_id:', transaction_id, 'status:', status);
    // Log para depuração no Vercel ou terminal
    console.log('Webhook da PushinPay recebido:', { transaction_id, status });

    // Valida se o ID da transação foi enviado
    if (!transaction_id) {
      console.warn('Webhook recebido sem transaction_id.');
      return res.status(400).json({ error: 'transaction_id é obrigatório' });
    }

    // Define o status que será salvo no banco
    let newStatus = '';
    if (status === 'approved' || status === 'paid') {
      newStatus = 'aprovado';
    } else if (status === 'pending' || status === 'waiting_payment') {
      newStatus = 'pendente';
    } else {
       // Se o status não for um dos esperados, apenas registramos e saímos.
       console.log(`Status '${status}' não relevante para rastreamento. Ignorando.`);
       return res.status(200).json({ success: true, message: 'Status não rastreável.' });
    }

    // Atualiza o status no banco de dados e obtém os dados da venda
    const { data: updatedSale, error } = await supabase
      .from('checkout_logs')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transaction_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar checkout_log:', error);
      // Se o log não for encontrado, pode ser um webhook para uma transação não iniciada no nosso sistema
      if (error.code === 'PGRST116') {
         return res.status(404).json({ error: 'Transação não encontrada.' });
      }
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }

    console.log(`[WEBHOOK] Status atualizado para ${newStatus}:`, updatedSale);

    // Se a atualização foi bem-sucedida, envia os dados para a Otimizey
    if (updatedSale) {
      await sendToOtimizey(updatedSale);
      // Envia para UTMFY se integração estiver configurada
      try {
        // Busca integração UTMFY do usuário
        const { data: integration } = await supabase
          .from('integrations')
          .select('utmfy_webhook_url')
          .eq('user_id', updatedSale.user_id)
          .single();
        console.log('[WEBHOOK] Integração UTMFY encontrada:', integration);
        if (integration?.utmfy_webhook_url) {
          // Monta payload no formato Vega Checkout (completo, igual documentação)
          const utmfyPayload = {
            transaction_token: String(updatedSale.transaction_id || updatedSale.id || ''),
            method: String(updatedSale.payment_method || ''),
            user_ip: String(updatedSale.user_ip || ''),
            user_agent: String(updatedSale.user_agent || ''),
            business_name: String(updatedSale.business_name || ''),
            total_price: String(updatedSale.price ? Math.round(updatedSale.price) : ''),
            checkout_tax_amount: String(updatedSale.checkout_tax_amount || ''),
            checkout_tax_percentage: String(updatedSale.checkout_tax_percentage || ''),
            status: String(updatedSale.status || ''),
            order_url: String(updatedSale.order_url || updatedSale.checkout_url || ''),
            checkout_url: String(updatedSale.checkout_url || ''),
            billet_url: String(updatedSale.billet_url || ''),
            billet_digitable_line: String(updatedSale.billet_digitable_line || ''),
            billet_due_date: String(updatedSale.billet_due_date || ''),
            pix_code: String(updatedSale.pix_code || ''),
            pix_code_image64: String(updatedSale.pix_code_image64 || ''),
            created_at: String(updatedSale.created_at || ''),
            updated_at: String(updatedSale.updated_at || ''),
            approved_at: String(updatedSale.status === 'aprovado' ? (updatedSale.updated_at || updatedSale.created_at || '') : ''),
            refunded_at: String(updatedSale.refunded_at || ''),
            checkout: updatedSale.checkout || {
              src: '',
              fbclid: '',
              ttclid: '',
              click_id: '',
              utm_source: '',
              utm_medium: '',
              utm_campaign: '',
              utm_term: '',
              utm_content: ''
            },
            customer: updatedSale.customer || {
              name: updatedSale.nome || '',
              document: updatedSale.documento || '',
              email: updatedSale.email || '',
              phone: updatedSale.telefone || ''
            },
            address: updatedSale.address || {
              street: updatedSale.rua || '',
              number: updatedSale.numero || '',
              district: updatedSale.bairro || '',
              zip_code: updatedSale.cep || '',
              city: updatedSale.cidade || '',
              state: updatedSale.estado || '',
              country: updatedSale.pais || 'BR',
              complement: updatedSale.complemento || ''
            },
            products: Array.isArray(updatedSale.products) && updatedSale.products.length > 0 ? updatedSale.products : [
              {
                code: String(updatedSale.product_id || ''),
                brand: null,
                model: null,
                title: String(updatedSale.product_name || ''),
                amount: updatedSale.price ? Math.round(updatedSale.price) : 0,
                version: null,
                quantity: 1,
                description: null
              }
            ]
          };
          console.log('[WEBHOOK] Enviando payload para UTMFY (com assinatura AWS V4):', integration.utmfy_webhook_url, utmfyPayload);
          // Pega as credenciais do .env
          const accessKeyId = process.env.UTMFY_ACCESS_KEY || '';
          const secretAccessKey = process.env.UTMFY_SECRET_KEY || '';
          const region = process.env.UTMFY_REGION || 'us-east-1';
          const service = process.env.UTMFY_SERVICE || 'execute-api';
          if (!accessKeyId || !secretAccessKey) {
            console.error('[WEBHOOK] Credenciais UTMFY não configuradas no .env');
          } else {
            const utmfyResp = await sendUtmfyWebhook({
              webhookUrl: integration.utmfy_webhook_url,
              payload: utmfyPayload,
              accessKeyId,
              secretAccessKey,
              region,
              service,
            });
            console.log('[WEBHOOK] Resposta da UTMFY:', utmfyResp);
          }
        } else {
          console.log('[WEBHOOK] Nenhuma integração UTMFY encontrada para o usuário.');
        }
      } catch (e) {
        console.error('Erro ao enviar webhook para UTMFY:', e);
      }
    }

    res.status(200).json({ success: true, message: 'Webhook processado.' });

  } catch (error) {
    // Captura qualquer erro inesperado no processamento
    console.error('Erro inesperado no handler do webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
} 