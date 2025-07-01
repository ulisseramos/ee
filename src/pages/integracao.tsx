"use client"

import { useState, useEffect } from 'react';
import { Zap, MousePointerClick, Plus, Globe, BarChart2, Share2, TrendingUp, Activity, ZapOff, Send, Type, Code } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetDescription } from '../components/ui/sheet';
import { useRouter } from 'next/router';
import styles from '../styles/integracao.module.css';

const integrations = [
  {
    key: 'pushinpay',
    nome: 'PushinPay',
    icon: <Zap size={44} color="#7c3aed" />,
    desc: 'PushinPay',
    enabled: true,
  },
  {
    key: 'pixel',
    nome: 'Facebook Ads',
    icon: <MousePointerClick size={44} color="#1877F2" />,
    desc: 'Facebook Ads',
    enabled: true,
  },
  {
    key: 'webhook',
    nome: 'Webhook',
    icon: <Share2 size={44} color="#2d3748" />,
    desc: 'Webhook',
    enabled: false,
  },
  {
    key: 'utmify',
    nome: 'Utmify',
    icon: <Globe size={44} color="#1a237e" />,
    desc: 'Utmify',
    enabled: false,
  },
  {
    key: 'googleads',
    nome: 'Google Ads',
    icon: <BarChart2 size={44} color="#ea4335" />,
    desc: 'Google Ads',
    enabled: false,
  },
  {
    key: 'tiktok',
    nome: 'Tiktok Ads',
    icon: <Activity size={44} color="#000" />,
    desc: 'Tiktok Ads',
    enabled: false,
  },
  {
    key: 'reportana',
    nome: 'Reportana',
    icon: <Send size={44} color="#16a34a" />,
    desc: 'Reportana',
    enabled: false,
  },
  {
    key: 'zapmizer',
    nome: 'Zapmizer',
    icon: <ZapOff size={44} color="#23233a" />,
    desc: 'Zapmizer',
    enabled: false,
  },
  {
    key: 'speedy',
    nome: 'Spedy',
    icon: <TrendingUp size={44} color="#a855f7" />,
    desc: 'Spedy',
    enabled: false,
  },
];

const eventos = [
  'Pagamento pendente',
  'Pagamento aprovado',
  'Pagamento Estornado',
  'Pagamento Recusado',
  'Chargeback',
  'Carrinho Abandonado',
];

export default function IntegracaoPage(props) {
  const [showForm, setShowForm] = useState('');
  const [pixelForm, setPixelForm] = useState({
    checkouts: '',
    pixelId: '',
    token: '',
    eventos: [] as string[],
  });
  const [pushinpayForm, setPushinpayForm] = useState({
    nome: '',
    apiKey: '',
  });
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState<'pushinpay' | 'pixel' | null>(null);
  const [drawerTested, setDrawerTested] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const router = useRouter();

  // Testa se o drawer está visível após abrir
  useEffect(() => {
    if (sheetOpen) {
      setDrawerTested(true);
      setTimeout(() => {
        const el = document.querySelector('[data-testid="drawer-teste"]');
        setDrawerVisible(!!el);
      }, 500);
    }
  }, [sheetOpen]);

  function handlePixelChange(field, value) {
    setPixelForm(prev => ({ ...prev, [field]: value }));
  }
  function handleEventoChange(evento: string) {
    setPixelForm(prev => ({
      ...prev,
      eventos: prev.eventos.includes(evento)
        ? prev.eventos.filter(e => e !== evento)
        : [...prev.eventos, evento],
    }));
  }
  function handlePixelSubmit(e) {
    e.preventDefault();
    setShowForm('');
  }
  function handlePushinpayChange(field, value) {
    setPushinpayForm(prev => ({ ...prev, [field]: value }));
  }
  function handlePushinpaySubmit(e) {
    e.preventDefault();
    setShowForm('');
  }

  function openSheet(type) {
    setSheetType(type);
    setSheetOpen(true);
  }
  function closeSheet() {
    setSheetOpen(false);
    setSheetType(null);
  }

  // Filtro de busca
  const filteredIntegrations = integrations.filter(intg =>
    intg.nome.toLowerCase().includes(search.toLowerCase()) ||
    intg.desc.toLowerCase().includes(search.toLowerCase())
  );

  // Renderização dos formulários
  function renderForm() {
    if (showForm === 'pixel') {
      return (
        <form onSubmit={handlePixelSubmit} style={{ maxWidth: 480, margin: '32px auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px #0001', border: '1.5px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <MousePointerClick size={32} color="#1877F2" />
            <span style={{ fontWeight: 800, fontSize: 22, color: '#23233a' }}>Facebook Ads</span>
          </div>
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>Selecione um ou mais checkouts</label>
          <input
            type="text"
            value={pixelForm.checkouts}
            onChange={e => handlePixelChange('checkouts', e.target.value)}
            placeholder=""
            style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 15 }}
          />
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>ID do Pixel*</label>
          <input
            type="text"
            value={pixelForm.pixelId}
            onChange={e => handlePixelChange('pixelId', e.target.value)}
            placeholder="ID Pixel Exemplo: 409944439437496"
            style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 15 }}
            required
          />
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>Token</label>
          <input
            type="text"
            value={pixelForm.token}
            onChange={e => handlePixelChange('token', e.target.value)}
            placeholder="Token (Opcional)"
            style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 15 }}
          />
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>Eventos para enviar*</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
            {eventos.map(ev => (
              <label key={ev} style={{ color: '#23233a', fontWeight: 500, fontSize: 15 }}>
                <input
                  type="checkbox"
                  checked={pixelForm.eventos.includes(ev)}
                  onChange={() => handleEventoChange(ev)}
                  style={{ marginRight: 8 }}
                />
                {ev}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button type="submit" style={{
              background: '#0f2233', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 8, border: 'none', padding: '10px 32px', cursor: 'pointer'
            }}>Salvar</button>
            <button type="button" onClick={() => setShowForm('')} style={{
              background: '#fff', color: '#23233a', fontWeight: 700, fontSize: 16, borderRadius: 8, border: '1.5px solid #e5e7eb', padding: '10px 32px', cursor: 'pointer'
            }}>Cancelar</button>
          </div>
        </form>
      );
    }
    if (showForm === 'pushinpay') {
      return (
        <form onSubmit={handlePushinpaySubmit} style={{ maxWidth: 480, margin: '32px auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px #0001', border: '1.5px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Zap size={32} color="#7c3aed" />
            <span style={{ fontWeight: 800, fontSize: 22, color: '#23233a' }}>PushinPay</span>
          </div>
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>Nome da integração*</label>
          <input
            type="text"
            value={pushinpayForm.nome}
            onChange={e => handlePushinpayChange('nome', e.target.value)}
            placeholder="Nome da integração"
            style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 15 }}
            required
          />
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>Chave de API PushinPay*</label>
          <input
            type="text"
            value={pushinpayForm.apiKey}
            onChange={e => handlePushinpayChange('apiKey', e.target.value)}
            placeholder="Cole sua chave de API PushinPay aqui"
            style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 15 }}
            required
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button type="submit" style={{
              background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 8, border: 'none', padding: '10px 32px', cursor: 'pointer'
            }}>Salvar</button>
            <button type="button" onClick={() => setShowForm('')} style={{
              background: '#fff', color: '#23233a', fontWeight: 700, fontSize: 16, borderRadius: 8, border: '1.5px solid #e5e7eb', padding: '10px 32px', cursor: 'pointer'
            }}>Cancelar</button>
          </div>
        </form>
      );
    }
    return null;
  }

  function renderCustomSheetForm() {
    if (sheetType === 'pixel') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 8 }}>
            <MousePointerClick size={28} color="#1877F2" />
            <span style={{ fontWeight: 800, fontSize: 20, color: '#23233a' }}>Adicionar Facebook Ads</span>
          </div>
          <div style={{ color: '#23233a', fontWeight: 500, fontSize: 15, marginBottom: 18 }}>
            Para configurar, siga as instruções abaixo:
          </div>
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>ID do Pixel*</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, marginBottom: 16, padding: '0 10px' }}>
            <Type size={20} color="#a1a1aa" />
            <input
              type="text"
              value={pixelForm.pixelId}
              onChange={e => handlePixelChange('pixelId', e.target.value)}
              placeholder="Ex: 409944439437496"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, padding: 12 }}
              required
            />
          </div>
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>Token (Opcional)</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, marginBottom: 16, padding: '0 10px' }}>
            <Code size={20} color="#a1a1aa" />
            <input
              type="text"
              value={pixelForm.token}
              onChange={e => handlePixelChange('token', e.target.value)}
              placeholder="Ex: Seu token aqui"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, padding: 12 }}
            />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'absolute', left: 32, bottom: 32 }}>
            <button type="button" style={{
              background: '#23233a', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 10, border: 'none', padding: '12px 48px', cursor: 'pointer', minWidth: 140
            }}>Salvar</button>
          </div>
        </div>
      );
    }
    if (sheetType === 'pushinpay') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 8 }}>
            <Zap size={28} color="#7c3aed" />
            <span style={{ fontWeight: 800, fontSize: 20, color: '#23233a' }}>Adicionar PushinPay</span>
          </div>
          <div style={{ color: '#23233a', fontWeight: 500, fontSize: 15, marginBottom: 18 }}>
            Para configurar, siga as instruções abaixo:
          </div>
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>Nome da conta*</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, marginBottom: 16, padding: '0 10px' }}>
            <Type size={20} color="#a1a1aa" />
            <input
              type="text"
              value={pushinpayForm.nome}
              onChange={e => handlePushinpayChange('nome', e.target.value)}
              placeholder="Ex: Conta do João, BM e etc"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, padding: 12 }}
              required
            />
          </div>
          <label style={{ fontWeight: 600, color: '#23233a', marginBottom: 6 }}>Cole aqui a Api key da PushinPay*</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, marginBottom: 16, padding: '0 10px' }}>
            <Code size={20} color="#a1a1aa" />
            <input
              type="text"
              value={pushinpayForm.apiKey}
              onChange={e => handlePushinpayChange('apiKey', e.target.value)}
              placeholder="Ex: 1234567890"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, padding: 12 }}
              required
            />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'absolute', left: 32, bottom: 32 }}>
            <button type="button" style={{
              background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 10, border: 'none', padding: '12px 48px', cursor: 'pointer', minWidth: 140
            }}>Salvar</button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'auto',
      paddingTop: '2rem',
      minHeight: '100vh',
      background: '#030712',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, marginTop: 32 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#23233a' }}>Integrações</h1>
          <button style={{
            background: '#fff',
            color: '#059669',
            border: '2px solid #059669',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 16,
            padding: '8px 22px',
            boxShadow: '0 2px 8px #05966911',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            Minhas integrações <span style={{ background: '#e0f7ef', color: '#059669', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: 15 }}>0</span>
          </button>
        </div>
        <div style={{ marginBottom: 32 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar integrações"
            style={{
              width: 320,
              maxWidth: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1.5px solid #e5e7eb',
              fontSize: 16,
              background: '#fff',
              boxShadow: '0 2px 8px #0001',
              outline: 'none',
              marginRight: 8
            }}
          />
          <button style={{ background: 'none', border: 'none', position: 'relative', left: -38, top: 2, cursor: 'pointer' }}>
            <svg width="22" height="22" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-2.2-2.2"/></svg>
          </button>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          {showForm === '' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 8,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 28,
                  justifyItems: 'end',
                  marginLeft: 360,
                  marginRight: 0,
                }}
              >
                {filteredIntegrations.map(card => (
                  <div
                    key={card.key}
                    style={{
                      background: '#fff',
                      borderRadius: 16,
                      boxShadow: '0 2px 12px #0001',
                      border: '1.5px solid #e5e7eb',
                      padding: 28,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      minHeight: 150,
                      transition: 'box-shadow 0.2s',
                      cursor: card.enabled ? 'pointer' : 'not-allowed',
                      justifyContent: 'center',
                      width: 260,
                      maxWidth: '100%',
                      marginLeft: 'auto',
                      opacity: card.enabled ? 1 : 0.5,
                      filter: card.enabled ? 'none' : 'grayscale(0.7)',
                    }}
                    onClick={card.enabled ? undefined : undefined}
                  >
                    {card.enabled && (
                      <div style={{ position: 'absolute', top: 18, right: 18 }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (card.key === 'pushinpay') router.push('/integracao/pushinpay');
                            if (card.key === 'pixel') router.push('/integracao/pixel');
                          }}
                          style={{
                            background: '#fff',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px #0001',
                            cursor: 'pointer',
                            transition: 'border 0.2s',
                          }}
                        >
                          <Plus size={20} color="#059669" />
                        </button>
                      </div>
                    )}
                    <div style={{ marginBottom: 12 }}>{card.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#23233a', marginBottom: 4 }}>{card.nome}</div>
                    <div style={{ color: '#6b7280', fontSize: 15, textAlign: 'center' }}>{card.desc}</div>
                    {!card.enabled && (
                      <div style={{ marginTop: 16, color: '#a1a1aa', fontWeight: 600, fontSize: 15 }}>Em breve</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <SheetContent side="right" style={{ width: 500, maxWidth: '100vw', zIndex: 99999, background: 'red', color: '#fff', fontSize: 24, fontWeight: 700, overflowY: 'auto', padding: 32, position: 'relative' }} data-testid="drawer-teste">
            TESTE DRAWER - SE VOCÊ VÊ ISSO, O DRAWER ESTÁ FUNCIONANDO
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}