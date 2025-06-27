const fetch = require('node-fetch');

const ADMIN_SECRET = 'SUA_ADMIN_SECRET'; // Troque pelo seu valor real do .env
const BASE_URL = 'http://localhost:3000'; // Troque para a URL do seu backend se for produção

async function vendaGerada() {
  const res = await fetch(`${BASE_URL}/api/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify({
      transaction_id: 'TESTE123456',
      status: 'pending'
    })
  });
  const data = await res.json();
  console.log('Venda Gerada:', data);
}

async function vendaAprovada() {
  const res = await fetch(`${BASE_URL}/api/approve-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': ADMIN_SECRET
    },
    body: JSON.stringify({
      logId: 'TESTE123456' // Use o mesmo ID do log criado na venda gerada
    })
  });
  const data = await res.json();
  console.log('Venda Aprovada:', data);
}

(async () => {
  await vendaGerada();
  // Aguarde o log ser criado no banco antes de aprovar (ou aprove manualmente no painel)
  await new Promise(r => setTimeout(r, 2000));
  await vendaAprovada();
})(); 