import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Search, Grid, List, CheckCircle, Plus, Layers, Zap, X, Link2, Send } from 'lucide-react';
// import { sendUtmfyEvent } from '../lib/utmfyWebhook'; // Removido pois não existe mais

export default function IntegracaoPage() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [pixels, setPixels] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [modal, setModal] = useState<null | 'PushinPay' | 'Facebook Pixel' | 'MpAnthon'>(null);
  const [modalInput, setModalInput] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalName, setModalName] = useState('');
  const [apiIntegrationName, setApiIntegrationName] = useState('');
  const [pixelIdEditando, setPixelIdEditando] = useState<string | null>(null);
  const [mpAnthonToken, setMpAnthonToken] = useState('');
  const [mpAnthonMsg, setMpAnthonMsg] = useState('');
  const [mpAnthonLoading, setMpAnthonLoading] = useState(false);
  const [mpAnthonConfigured, setMpAnthonConfigured] = useState(false);
  const [mpAnthonAccessToken, setMpAnthonAccessToken] = useState('');

  useEffect(() => {
    if (!user) return;
    // Buscar PushinPay
    supabase
      .from('integrations')
      .select('pushinpay_api_key, name')
      .eq('user_id', user.id)
      .eq('provider', 'pushinpay')
      .single()
      .then(({ data }) => {
        setApiKey(data?.pushinpay_api_key || '');
        setApiIntegrationName(data?.name || '');
      });
    // Buscar todos os pixels do usuário
    supabase
      .from('integrations')
      .select('id, pixel_id, name, created_at, status')
      .eq('user_id', user.id)
      .eq('provider', 'facebook_pixel')
      .then(({ data }) => {
        setPixels(data || []);
      });
    // Buscar integração Mercado Pago Anthon
    supabase
      .from('integrations')
      .select('mp_anthon_token, mp_anthon_access_token')
      .eq('user_id', user.id)
      .eq('provider', 'mercadopago_anthon')
      .single()
      .then(({ data }) => {
        if (data) {
          setMpAnthonToken(data.mp_anthon_token || '');
          setMpAnthonAccessToken(data.mp_anthon_access_token || '');
          setMpAnthonConfigured(!!data.mp_anthon_access_token);
        }
      });
  }, [user]);

  const integrations = [
    {
      name: 'PushinPay',
      description: 'Cobranças e pagamentos automáticos.',
      badge: 'Disponível',
      icon: <Layers size={28} color="#a1a1aa" strokeWidth={1.7} />,
      configured: !!apiKey,
      button: !!apiKey ? 'Gerenciar' : 'Configurar',
      info: apiKey ? `Chave configurada` : 'Configure sua chave de API',
      onClick: () => { setModal('PushinPay'); setModalInput(apiKey || ''); setModalName(apiIntegrationName || ''); setModalMsg(''); },
    },
    {
      name: 'Facebook Pixel',
      description: 'Pixels de conversão do Facebook.',
      badge: 'Disponível',
      icon: <Zap size={28} color="#a1a1aa" strokeWidth={1.7} />,
      configured: pixels.length > 0,
      button: pixels.length > 0 ? `Gerenciar (${pixels.length})` : 'Configurar',
      info: pixels.length > 0 ? `Total de pixels: ${pixels.length}` : 'Configure seus pixels do Facebook',
      onClick: () => {
        setModal('Facebook Pixel');
        setModalMsg('');
      },
    },
    {
      name: 'Mercado Pago (Anthon)',
      description: 'Conecte sua conta Mercado Pago via Anthon.',
      badge: 'Disponível',
      icon: <Zap size={28} color="#a1a1aa" strokeWidth={1.7} />,
      configured: mpAnthonConfigured,
      button: mpAnthonConfigured ? 'Gerenciar' : 'Conectar',
      info: mpAnthonConfigured ? `Conta conectada` : 'Conecte sua conta Mercado Pago (Anthon)',
      onClick: () => setModal('MpAnthon'),
    },
  ];

  const filteredIntegrations = integrations.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  // Novo: cards de pixel
  const filteredPixels = pixels.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) || p.pixel_id?.toLowerCase().includes(search.toLowerCase())
  );

  // Função para salvar integração no modal
  async function handleModalSave() {
    setModalLoading(true);
    setModalMsg('');
    if (!user) {
      setModalMsg('Usuário não autenticado.');
      setModalLoading(false);
      return;
    }
    if (!modalName.trim()) {
      setModalMsg('O nome é obrigatório.');
      setModalLoading(false);
      return;
    }
    if (modal === 'PushinPay') {
      const { error } = await supabase
        .from('integrations')
        .upsert({ user_id: user.id, pushinpay_api_key: modalInput, api_token: modalInput, provider: 'pushinpay', name: modalName }, { onConflict: 'user_id,provider' });
      if (error) setModalMsg('Erro ao salvar: ' + String(error));
      else setModalMsg('Chave salva com sucesso!');
    }
    if (modal === 'Facebook Pixel') {
      let result;
      if (pixelIdEditando) {
        // update
        result = await supabase
          .from('integrations')
          .update({ pixel_id: modalInput, name: modalName })
          .eq('id', pixelIdEditando)
          .select();
      } else {
        // insert
        result = await supabase
          .from('integrations')
          .upsert({ user_id: user.id, provider: 'facebook_pixel', pixel_id: modalInput, api_token: '', name: modalName }, { onConflict: 'user_id,provider' })
          .select();
      }
      const { error, data } = result;
      if (error) setModalMsg('Erro ao salvar: ' + String(error));
      else {
        setModalMsg('Pixel salvo com sucesso!');
        // Atualiza pixels no estado
        if (pixelIdEditando) {
          setPixels((prev) => prev.map(p => p.id === pixelIdEditando ? { ...p, pixel_id: modalInput, name: modalName } : p));
        } else {
          // Tenta encontrar um registro existente com o mesmo provider e user_id
          const existingPixel = pixels.find(p => p.provider === 'facebook_pixel');
          if (existingPixel) {
            // Se existir, atualiza o registro existente
            setPixels((prev) => prev.map(p => p.id === existingPixel.id ? { ...p, pixel_id: modalInput, name: modalName } : p));
          } else if (data && data[0]) {
            // Se não existir, adiciona novo registro
            setPixels((prev) => [...prev, data[0]]);
          }
        }
        setPixelIdEditando(null);
        setTimeout(() => setModal(null), 800);
      }
    }
    setModalLoading(false);
  }

  async function handleSaveMpAnthon() {
    setMpAnthonLoading(true);
    setMpAnthonMsg('');
    if (!user) {
      setMpAnthonMsg('Usuário não autenticado.');
      setMpAnthonLoading(false);
      return;
    }
    if (!mpAnthonToken.trim()) {
      setMpAnthonMsg('Preencha o token.');
      setMpAnthonLoading(false);
      return;
    }
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, provider: 'mercadopago_anthon', mp_anthon_token: mpAnthonToken }, { onConflict: 'user_id,provider' });
    if (error) setMpAnthonMsg('Erro ao salvar: ' + String(error));
    else setMpAnthonMsg('Integração Mercado Pago (Anthon) salva com sucesso!');
    setMpAnthonLoading(false);
    setMpAnthonConfigured(true);
  }

  function getMpAnthonOAuthUrl() {
    const clientId = process.env.NEXT_PUBLIC_MP_ANTHON_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_MP_ANTHON_REDIRECT_URI;
    return `https://auth.mercadopago.com.br/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}&state=${user?.id}`;
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', overflowX: 'auto', paddingLeft: 300, paddingTop: '2rem', minHeight: '100vh', background: '#030712' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 2 }}>Integrações</h1>
      <p style={{ fontSize: 16, color: '#a1a1aa', fontWeight: 400, marginBottom: 24 }}>Gerencie suas integrações e credenciais de API.</p>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 0 0 0' }}>
        {/* Topo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
              <input
                type="text"
                placeholder="Buscar integrações..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  background: '#18181b',
                  border: '1.5px solid #030712',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 15,
                  padding: '9px 14px 9px 36px',
                  outline: 'none',
                  width: '100%',
                  fontWeight: 500,
                  transition: 'border 0.18s',
                }}
              />
            </div>
            <button
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              style={{
                background: view === 'grid' ? '#a78bfa' : '#23243a',
                color: view === 'grid' ? '#fff' : '#a1a1aa',
                border: 'none',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.18s',
                marginLeft: 6,
              }}
            >
              {view === 'grid' ? <Grid size={17} /> : <List size={17} />}
            </button>
          </div>
        </div>

        {/* Grid de cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid' ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
            gap: 22,
          }}
        >
          {/* Cards de integrações normais */}
          {filteredIntegrations.map((i, idx) => (
            <div
              key={i.name}
              style={{
                background: '#030712',
                border: '1.5px solid #1A0837',
                borderRadius: 12,
                boxShadow: '0 2px 10px 0 #23243a11',
                padding: '20px 20px 16px 20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                minHeight: 150,
                justifyContent: 'space-between',
              }}
            >
              {/* Badge */}
              <span style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: '#23243a',
                color: '#a78bfa',
                fontWeight: 700,
                fontSize: 11,
                borderRadius: 7,
                padding: '2px 10px',
                boxShadow: 'none',
                letterSpacing: 0.2,
              }}>{i.badge}</span>
              {/* Ícone */}
              <div style={{ marginBottom: 8, marginTop: 6 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: '#18181b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                }}>
                  {i.icon}
                </div>
              </div>
              {/* Nome e descrição */}
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 2 }}>{i.name}</div>
              <div style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 10 }}>{i.description}</div>
              {/* Status/configuração */}
              {i.configured ? (
                <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={15} /> Integração configurada
                </div>
              ) : null}
              <div style={{ color: '#a1a1aa', fontSize: 12, marginBottom: 8 }}>{i.info}</div>
              {/* Botão */}
              <button
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  background: i.configured ? '#1A0837' : 'transparent',
                  color: i.configured ? '#a78bfa' : '#a1a1aa',
                  border: 'none',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  marginTop: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  transition: 'background 0.18s, color 0.18s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#a78bfa';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = i.configured ? '#1A0837' : 'transparent';
                  e.currentTarget.style.color = i.configured ? '#a78bfa' : '#a1a1aa';
                }}
                onClick={i.onClick}
              >
                {i.configured ? <span style={{ fontWeight: 700, fontSize: 15 }}> {i.button}</span> : <><Plus size={15} /> {i.button}</>}
              </button>
            </div>
          ))}

        </div>
      </div>
      {/* Drawer de integração */}
      {modal && (
        <>
          {/* Fundo escuro translúcido */}
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 1000,
            }}
            onClick={() => setModal(null)}
          />
          {/* Drawer lateral direito */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '440px',
              maxWidth: '100vw',
              background: '#18181b',
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
              boxShadow: '-8px 0 32px rgba(26,8,55,0.25)',
              zIndex: 1010,
              display: 'flex',
              flexDirection: 'column',
              padding: '44px 38px 32px 38px',
              animation: 'slideInDrawer 0.25s cubic-bezier(.4,1.2,.4,1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={() => setModal(null)}
              style={{
                position: 'absolute',
                top: 24,
                right: 28,
                background: 'none',
                border: 'none',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: 22,
                padding: 0,
                zIndex: 1020,
              }}
              aria-label="Fechar"
            >
              <X size={26} />
            </button>
            {/* Título */}
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 26, marginBottom: 32, marginTop: 0 }}>
              {modal === 'PushinPay' ? 'Configuração PushinPay' : modal === 'Facebook Pixel' ? 'Configuração Facebook Pixel' : 'Configuração Mercado Pago (Anthon)'}
            </h2>
            {/* Label e input do nome */}
            <label style={{ color: '#a1a1aa', fontWeight: 700, fontSize: 16, marginBottom: 10, display: 'block' }}>
              Nome
            </label>
            <input
              type="text"
              placeholder={modal === 'PushinPay' ? 'Ex: Minha PushinPay' : modal === 'Facebook Pixel' ? 'Ex: Pixel Loja Principal' : 'Ex: Token Mercado Pago (Anthon)'}
              value={modalName}
              onChange={e => setModalName(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 12,
                border: '1.5px solid #a78bfa',
                background: '#23243a',
                color: '#fff',
                fontSize: 18,
                marginBottom: 12,
                outline: 'none',
                fontWeight: 500,
                boxShadow: '0 1px 6px 0 #a78bfa22',
                transition: 'border 0.18s',
              }}
            />
            {/* Label e input da credencial */}
            <label style={{ color: '#a1a1aa', fontWeight: 700, fontSize: 16, marginBottom: 10, display: 'block' }}>
              {modal === 'PushinPay' ? 'Credencial de API' : modal === 'Facebook Pixel' ? 'Pixel ID' : 'Token/Credencial'}
            </label>
            <input
              type="text"
              placeholder={modal === 'PushinPay' ? 'Cole sua chave de API PushinPay...' : modal === 'Facebook Pixel' ? 'Cole seu Pixel ID do Facebook...' : 'Cole seu token do Mercado Pago via Anthon...'}
              value={modalInput}
              onChange={e => setModalInput(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 12,
                border: '1.5px solid #a78bfa',
                background: '#23243a',
                color: '#fff',
                fontSize: 18,
                marginBottom: 12,
                outline: 'none',
                fontWeight: 500,
                boxShadow: '0 1px 6px 0 #a78bfa22',
                transition: 'border 0.18s',
              }}
            />
            {/* Ajuda/descrição */}
            <div style={{ color: '#a1a1aa', fontSize: 14, marginBottom: 32, display: 'flex', alignItems: 'flex-start', gap: 7 }}>
              <svg width="18" height="18" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              {modal === 'PushinPay'
                ? 'Você pode obter sua chave de API no painel da PushinPay em: Configurações > API.'
                : modal === 'Facebook Pixel'
                  ? 'Você pode obter o Pixel ID no painel do Facebook em: Configurações > Pixels.'
                  : 'Use o token gerado via Anthon para conectar sua conta Mercado Pago.'}
            </div>
            {/* Botões */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
              <button
                onClick={() => setModal(null)}
                disabled={modalLoading}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 16,
                  background: 'transparent',
                  color: '#fff',
                  border: '1.5px solid #a1a1aa',
                  cursor: modalLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.18s, color 0.18s',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={modal === 'PushinPay' ? handleModalSave : modal === 'Facebook Pixel' ? handleModalSave : handleSaveMpAnthon}
                disabled={modalLoading}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  fontWeight: 800,
                  fontSize: 16,
                  background: '#a78bfa',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 2px 12px 0 #a78bfa33',
                  cursor: modalLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.18s',
                }}
              >
                {modalLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
            {/* Mensagem de feedback */}
            {modalMsg && <div style={{ color: modalMsg.includes('sucesso') ? '#22c55e' : '#f87171', fontWeight: 700, fontSize: 15, marginTop: 18, textAlign: 'right' }}>{modalMsg}</div>}
            {/* Seção de pixels */}
            {modal === 'Facebook Pixel' && (
              <div style={{ marginTop: 24, borderTop: '1px solid #a78bfa11', paddingTop: 24 }}>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Seus Pixels</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {pixels.map((pixel) => (
                    <div
                      key={pixel.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: 8,
                        background: '#23243a',
                        marginBottom: 8,
                        transition: 'background 0.18s',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 14,
                      }}
                      onClick={() => {
                        setModalInput(pixel.pixel_id);
                        setModalName(pixel.name || '');
                        setPixelIdEditando(pixel.id);
                      }}
                    >
                      <div style={{ marginRight: 12 }}>
                        <CheckCircle size={20} color="#a78bfa" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{pixel.name || 'Pixel Facebook'}</div>
                        <div style={{ color: '#a1a1aa', fontSize: 13 }}>ID: {pixel.pixel_id}</div>
                        <div style={{ color: '#a1a1aa', fontSize: 12 }}>Criado em: {pixel.created_at ? new Date(pixel.created_at).toLocaleString('pt-BR') : '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {modal === 'MpAnthon' && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.65)',
                    zIndex: 1000,
                  }}
                  onClick={() => setModal(null)}
                />
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: '440px',
                    maxWidth: '100vw',
                    background: '#18181b',
                    borderTopLeftRadius: 24,
                    borderBottomLeftRadius: 24,
                    boxShadow: '-8px 0 32px rgba(26,8,55,0.25)',
                    zIndex: 1010,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '44px 38px 32px 38px',
                    animation: 'slideInDrawer 0.25s cubic-bezier(.4,1.2,.4,1)'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setModal(null)}
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: 28,
                      background: 'none',
                      border: 'none',
                      color: '#a1a1aa',
                      cursor: 'pointer',
                      fontSize: 22,
                      padding: 0,
                      zIndex: 1020,
                    }}
                    aria-label="Fechar"
                  >
                    <X size={26} />
                  </button>
                  <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 26, marginBottom: 32, marginTop: 0 }}>
                    Configuração Mercado Pago (Anthon)
                  </h2>
                  {mpAnthonConfigured ? (
                    <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 16, marginBottom: 24 }}>
                      Conta Mercado Pago conectada com sucesso!
                    </div>
                  ) : (
                    <button
                      onClick={() => window.location.href = getMpAnthonOAuthUrl()}
                      style={{
                        width: '100%',
                        padding: '16px 0',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 17,
                        background: '#009ee3',
                        color: '#fff',
                        border: 'none',
                        boxShadow: '0 2px 12px 0 #009ee333',
                        cursor: 'pointer',
                        marginBottom: 24,
                        marginTop: 12,
                      }}
                    >
                      Conectar com Mercado Pago (Anthon)
                    </button>
                  )}
                  {mpAnthonMsg && <div style={{ color: mpAnthonMsg.includes('sucesso') ? '#22c55e' : '#f87171', fontWeight: 700, fontSize: 15, marginTop: 18, textAlign: 'right' }}>{mpAnthonMsg}</div>}
                </div>
              </>
            )}
          </div>
          {/* Animação do drawer */}
          <style>{`
            @keyframes slideInDrawer {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}