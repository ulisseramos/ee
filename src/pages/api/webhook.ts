import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { log } from 'console';

// Inicializa o cliente Supabase com as variáveis de ambiente.
// É importante usar as variáveis de ambiente de serviço (service_role) para operações de escrita no backend.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Atenção: Use a chave de serviço aqui!
);

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
  // Garante que a requisição seja um POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Extrai o ID da transação e o status do corpo da requisição do webhook
    const { transaction_id, status } = req.body;
    
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

    console.log(`Status atualizado para ${newStatus}:`, updatedSale);

    // Se a atualização foi bem-sucedida, envia os dados para a Otimizey
    if (updatedSale) {
      await sendToOtimizey(updatedSale);
    }

    res.status(200).json({ success: true, message: 'Webhook processado.' });

  } catch (error) {
    // Captura qualquer erro inesperado no processamento
    console.error('Erro inesperado no handler do webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
} 