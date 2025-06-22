export async function sendUtmfyWebhook({ webhookUrl, event, sale }: {
  webhookUrl: string;
  event: 'venda_pendente' | 'venda_aprovada';
  sale: {
    id: string;
    nome: string | null;
    email: string | null;
    telefone: string | null;
    price: number | null;
    status: string | null;
    created_at: string;
    // Adicione outros campos relevantes se necessário
  };
}) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        sale,
      }),
    });
  } catch (err) {
    console.error('[UTMFY] Falha ao enviar webhook:', err);
  }
} 