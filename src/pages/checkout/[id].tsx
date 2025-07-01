import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiArrowLeft, FiCheckCircle, FiStar } from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';

declare global {
  interface Window {
    fbq: any;
    _fbq?: any;
  }
}

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
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

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
    (function(f,b,e,v,n,t,s)
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

  useEffect(() => {
    document.body.classList.add('checkout-page');
    return () => document.body.classList.remove('checkout-page');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Novo: função unificada para enviar e pagar
  const handleSubmitAndPay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.nome || !form.email || !form.telefone) {
      setFormError('Preencha todos os campos!');
      return;
    }
    // Se já existe logId, só paga
    if (logId) {
      await handlePagar();
      return;
    }
    // Envia formulário e depois paga
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
      setFormError('Erro ao registrar checkout.');
      return;
    }
    setStatus('pendente');
    setFormSuccess('Dados enviados! Gerando pagamento...');
    await handlePagar(clientGeneratedId);
  };

  // Adaptar handlePagar para aceitar logId opcional
  const handlePagar = async (customLogId?: string) => {
    const useLogId = customLogId || logId;
    if (!useLogId) {
      setFormError('Preencha e envie o formulário antes de pagar!');
      return;
    }
    if (!apiKey) {
      setFormError('Chave de API não encontrada.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setChecking(true);
    try {
      const value = Math.round(Number(product.price) * 100);
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
      console.log('PushinPay response:', data);
      if (!res.ok) {
        setFormError(data.error || data.message || JSON.stringify(data) || 'Erro ao gerar cobrança.');
        setChecking(false);
        return;
      }
      if (data.id && data.qr_code) {
        setPixCode(data.qr_code);
        setFormSuccess('Pagamento gerado! Copie o código Pix abaixo e pague no seu banco.');
        setTransId(data.id);
        if (!useLogId || typeof useLogId !== 'string' || useLogId.length < 10) {
          setFormError('Erro interno: logId inválido.');
          setChecking(false);
          return;
        }
        await supabase.from('checkout_logs').update({ 
          status: 'pendente', 
          transaction_id: data.id 
        }).eq('log_id', useLogId);
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
        
        const { error: updateError, data: updatedLog } = await supabase
          .from('checkout_logs')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('log_id', logId)
          .select()
          .single();

        if (updateError) {
          console.error("Erro ao aprovar o log de checkout:", updateError);
        }
        
        clearInterval(interval);
        // Redireciona para página de obrigado
        router.push('/checkout/obrigado');
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 3000);
  };

  // Timer para banner
  function Timer() {
    const [time, setTime] = useState(7 * 60 + 46); // 7min 46s
    useEffect(() => {
      if (time <= 0) return;
      const interval = setInterval(() => setTime(t => t - 1), 1000);
      return () => clearInterval(interval);
    }, [time]);
    const min = String(Math.floor(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    return (
      <div className="checkout-timer">
        <div className="checkout-timer-box">0<br/><span className="checkout-timer-label">HORAS</span></div>
        <div className="checkout-timer-box">{min}<br/><span className="checkout-timer-label">MIN</span></div>
        <div className="checkout-timer-box">{sec}<br/><span className="checkout-timer-label">SEG</span></div>
      </div>
    );
  }

  if (loading) {
    return <div className="checkout-loading"><div className="checkout-spinner"></div>Carregando...</div>;
  }

  if (!product) {
    return <div className="checkout-loading">Produto não encontrado.</div>;
  }

  return (
    <div className="checkout-container">
      {/* Banner customizável */}
      {bannerUrl && (
        <div className="checkout-banner-image" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <img src={bannerUrl} alt="Banner do Checkout" style={{ maxWidth: 380, width: '100%', borderRadius: 14, boxShadow: '0 2px 16px #0002' }} />
        </div>
      )}
      {/* Banner/topo com timer */}
      <div className="checkout-banner">
        Oferta por Tempo Limitado!
        <Timer />
      </div>
      {/* Cartão do produto */}
      <div className="checkout-card checkout-card-pro">
        {product.imagem_url && (
          <img src={product.imagem_url} alt={product.name} className="checkout-product-img" />
        )}
        <div className="checkout-title">{product.name}</div>
        {/* Upsell */}
        <div className="checkout-upsell">
          <div className="checkout-upsell-title"><FiStar color="#facc15" /> Você também pode gostar de:</div>
          <div className="checkout-upsell-product">
            <div style={{fontWeight:600}}>Produto Extra</div>
            <div style={{fontSize:'0.97rem',color:'#444'}}>Um produto voltando para voce consguir da capa em seus inimigos</div>
            <div style={{color:'#22c55e',fontWeight:700,marginTop:4}}>+ R$ 12,00</div>
            <div style={{color:'#22c55e',fontWeight:700,marginTop:2}}>+ R$ 12,00</div>
            <div style={{marginTop:6}}><input type="checkbox" className="checkout-upsell-checkbox"/> Quero comprar também!</div>
          </div>
        </div>
        {/* Resumo do pedido */}
        <div className="checkout-summary">
          <div className="checkout-summary-row"><span>teste</span><span style={{color:'#22c55e'}}>+R$ 12,00</span></div>
          <div className="checkout-summary-total"><span>Total</span><span>R$ 12,00</span></div>
        </div>
      </div>
      {/* Formulário e pagamento */}
      <div className="checkout-form-card checkout-form-card-pro">
        <div className="checkout-form-title">Preencha suas informações pra envio do produto.</div>
        <input name="email" type="email" value={form.email} onChange={handleChange} className="checkout-input checkout-input-pro" placeholder="Digite seu e-mail" required />
        <input name="nome" value={form.nome} onChange={handleChange} className="checkout-input checkout-input-pro" placeholder="Digite seu nome completo" required />
        <input name="telefone" value={form.telefone} onChange={handleChange} className="checkout-input checkout-input-pro" placeholder="Digite seu telefone/WhatsApp" required />
        <div className="checkout-form-title" style={{marginTop:12,marginBottom:6}}>Formas de pagamento</div>
        <div className="checkout-payment-box checkout-payment-box-pro">
          <span style={{fontSize:'1.2em',marginRight:8}}>⚡</span> Pix
        </div>
        {formError && <div className="checkout-message error checkout-message-pro">{formError}</div>}
        {formSuccess && <div className="checkout-message success checkout-message-pro"><FiCheckCircle style={{marginRight: 6}} /> {formSuccess}</div>}
        <button onClick={handleSubmitAndPay} className="checkout-btn checkout-btn-pro" disabled={checking}>{checking ? 'Processando...' : 'Pagar agora'}</button>
        {pixCode && (
          <div className="checkout-qrcode checkout-qrcode-pro">
            <div className="checkout-qrcode-label">Escaneie o QR Code ou copie o Pix:</div>
            <QRCodeCanvas value={pixCode} size={180} bgColor="#fff" fgColor="#2563eb" style={{marginBottom: 12, borderRadius: 12, boxShadow: '0 2px 12px #2563eb22'}} />
            <textarea
              className="checkout-pix-code checkout-pix-code-pro"
              value={pixCode}
              readOnly
              style={{ width: '100%', minHeight: 60, borderRadius: 8, padding: 8, fontSize: 14, marginBottom: 8 }}
            />
            <button
              className="checkout-btn checkout-btn-copy"
              style={{ marginTop: 8, background: '#22c55e', color: '#111', fontWeight: 700 }}
              onClick={() => { navigator.clipboard.writeText(pixCode); setFormSuccess('Código Pix copiado!'); }}
              type="button"
            >
              Copiar código Pix
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 