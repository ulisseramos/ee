import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [logId, setLogId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pendente');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [transId, setTransId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [pixelId, setPixelId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Busca usuário logado
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null);
    });
    // Tenta buscar apiKey do localStorage
    const localApiKey = localStorage.getItem('pushinpay_api_key');
    if (localApiKey) setApiKey(localApiKey);
  }, []);

  useEffect(() => {
    if (!id || !user) return;
    const fetchProductAndIntegration = async () => {
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (productError) throw productError;
        if (!productData) throw new Error('Produto não encontrado');
        // Só deixa acessar se o produto for do usuário logado
        if (productData.user_id !== user.id) {
          router.replace('/acesso-negado');
          return;
        }
        setProduct(productData);
        setUserId(productData.user_id);

        // 2. Buscar as integrações do dono do produto
        if (productData.user_id) {
          // Buscar API Key
          const { data: integrationData } = await supabase
            .from('integrations')
            .select('pushinpay_api_key')
            .eq('user_id', productData.user_id)
            .eq('provider', 'pushinpay')
            .single();
          
          if (integrationData?.pushinpay_api_key) {
            setApiKey(integrationData.pushinpay_api_key);
          }

          // Buscar Pixel ID
          const { data: pixelData } = await supabase
            .from('integrations')
            .select('pixel_id')
            .eq('user_id', productData.user_id)
            .eq('provider', 'facebook_pixel')
            .single();
          
          if (pixelData?.pixel_id) {
            setPixelId(pixelData.pixel_id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar checkout:", error);
        setProduct(null); // Limpa o produto em caso de erro
      }
    };

    fetchProductAndIntegration();
  }, [id, user, router]);

  // Injetar Pixel do Facebook se houver pixelId
  useEffect(() => {
    if (!pixelId || !product) return;
    // Evita injetar múltiplas vezes
    if (document.getElementById('fb-pixel-script')) return;
    !(function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.id = 'fb-pixel-script';
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)})(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    // Envia currency e value no InitiateCheckout
    let value = Number(product.price);
    if (value > 1000) value = value / 100; // Corrige se estiver em centavos
    window.fbq('track', 'InitiateCheckout', { currency: 'BRL', value });
  }, [pixelId, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.nome || !form.email || !form.telefone) {
      setFormError('Preencha todos os campos!');
      return;
    }

    const clientGeneratedId = uuidv4();
    setLogId(clientGeneratedId);

    const { data: inserted, error } = await supabase
      .from('checkout_logs')
      .insert({
        log_id: clientGeneratedId,
        product_id: product.id,
        user_id: product.user_id,
        price: product.price,
        checkout_url: window.location.href,
        status: 'pendente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        nome: form.nome,
        email: form.email,
        telefone: form.telefone
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir log de checkout:", error);
      setFormError('Erro ao registrar checkout.');
      return;
    }

    setStatus('pendente');
    setFormSuccess('Dados enviados! Agora clique em Pagar para finalizar.');
  };

  const handlePagar = async () => {
    if (!logId || !apiKey) {
      setFormError('Chave de API não encontrada.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setChecking(true);
    // Chama API PushinPay
    try {
      const value = Math.round(Number(product.price) * 100); // valor em centavos
      if (!value || isNaN(value) || value <= 0) {
        setFormError('Valor do produto inválido.');
        setChecking(false);
        return;
      }
      const res = await fetch('https://api.pushinpay.com.br/api/pix/cashIn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value,
          webhook_url: `${window.location.origin}/api/webhook`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || data.message || JSON.stringify(data) || 'Erro ao gerar cobrança.');
        setChecking(false);
        return;
      }
      if (data.id && data.qr_code_base64) {
        setQrCode(data.qr_code_base64);
        setTransId(data.id);
        setFormSuccess('Pagamento gerado! Escaneie o QR Code para pagar.');
        // Atualiza log com id da transação (status ainda pendente)
        if (!logId || typeof logId !== 'string' || logId.length < 10) {
          setFormError('Erro interno: logId inválido.');
          setChecking(false);
          return;
        }
        console.log('Atualizando checkout_logs (pendente):', { logId, status: 'pendente', transaction_id: data.id });
        await supabase.from('checkout_logs').update({ 
          status: 'pendente', 
          transaction_id: data.id 
        }).eq('log_id', logId);
        // Começa a checar status
        checkStatus(data.id);
      } else {
        setFormError('Erro ao gerar cobrança.');
      }
    } catch (err) {
      setFormError('Erro ao conectar com PushinPay.');
    }
    setChecking(false);
  };

  const checkStatus = async (transactionId: string) => {
    if (!apiKey) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const res = await fetch(`https://api.pushinpay.com.br/api/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.status === 'approved' || data.status === 'paid') {
        setStatus('aprovado');
        setFormSuccess('Pagamento aprovado!');
        
        const { error: updateError } = await supabase
          .from('checkout_logs')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('log_id', logId);

        if (updateError) {
          console.error("Erro ao aprovar o log de checkout:", updateError);
        }
        
        try {
          console.log(`[Checkout] Pagamento aprovado. Chamando API para finalizar a venda com logId: ${logId}`);
          const apiRes = await fetch('/api/approve-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logId }),
          });

          if (!apiRes.ok) {
            const errorData = await apiRes.json();
            console.error('[Checkout] Erro ao chamar a API de aprovação:', errorData);
          } else {
            console.log('[Checkout] API de aprovação respondeu com sucesso.');
          }
        } catch (error) {
          console.error('[Checkout] Falha catastrófica ao chamar a API de aprovação:', error);
        }
        
        clearInterval(interval);
        // Redireciona para página de obrigado
        router.push('/checkout/obrigado');
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 3000);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Produto não encontrado.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Checkout do Produto</h1>
        {product.imagem_url && (
          <img src={product.imagem_url} alt={product.name} className="mx-auto mb-4 max-h-40 rounded" />
        )}
        <div className="mb-2 text-xl font-semibold">{product.name}</div>
        <div className="mb-2 text-green-700 text-lg">R$ {product.price}</div>
        <div className="mb-4 text-gray-600">{product.description}</div>
        <form onSubmit={handleSubmit} className="mb-4 text-left">
          <label className="block mb-2 font-medium">Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} className="w-full mb-3 p-2 border rounded" required />
          <label className="block mb-2 font-medium">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full mb-3 p-2 border rounded" required />
          <label className="block mb-2 font-medium">Telefone</label>
          <input name="telefone" value={form.telefone} onChange={handleChange} className="w-full mb-3 p-2 border rounded" required />
          {formError && <div className="text-red-600 mb-2">{formError}</div>}
          {formSuccess && <div className="text-green-600 mb-2">{formSuccess}</div>}
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold text-lg w-full" disabled={!!logId}>Enviar dados</button>
        </form>
        <button onClick={handlePagar} className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-lg w-full mb-2" disabled={!logId || status === 'aprovado' || checking}>Pagar</button>
        {qrCode && (
          <div className="mt-4">
            <div className="mb-2 font-semibold">Escaneie o QR Code para pagar:</div>
            <img src={qrCode} alt="QR Code PIX" className="mx-auto" />
          </div>
        )}
        <button onClick={() => router.back()} className="mt-2 bg-gray-300 text-gray-800 px-4 py-2 rounded w-full">Voltar</button>
      </div>
    </div>
  );
} 