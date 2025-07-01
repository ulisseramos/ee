import { MousePointerClick, Type, Code } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function PixelIntegracao() {
  const [form, setForm] = useState({ pixelId: '', token: '' });
  const router = useRouter();

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Aqui você pode salvar a integração
    router.push('/integracao');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: 0, marginLeft: 320 }}>
      <div style={{ maxWidth: 1240, width: '100%' }}>
        {/* Botão de voltar */}
        <button
          type="button"
          onClick={() => router.push('/integracao')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, fontSize: 16, marginBottom: 24, cursor: 'pointer', padding: 0, transition: 'color 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#f8fafc')}
          onMouseOut={e => (e.currentTarget.style.color = '#7c3aed')}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          Voltar
        </button>
        {/* Card principal */}
        <div style={{ background: '#10121b', borderRadius: 18, boxShadow: '0 2px 16px #0006', padding: 36, marginBottom: 32, border: '1.5px solid #23233a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div style={{ background: '#181c2a', borderRadius: 12, padding: 8, boxShadow: '0 2px 8px #7c3aed22' }}>
              <MousePointerClick size={28} color="#7c3aed" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 26, color: '#f8fafc', letterSpacing: -1 }}>Integração Facebook Ads</span>
          </div>
          <div style={{ color: '#a1a1aa', fontWeight: 500, fontSize: 16, marginBottom: 18, opacity: 0.95 }}>
            Configure sua integração com o Facebook Ads abaixo.
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <label style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6, fontSize: 15 }}>ID do Pixel*</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#181c2a', border: '1.5px solid #23233a', borderRadius: 10, marginBottom: 18, padding: '0 14px' }}>
              <Type size={22} color="#a1a1aa" />
              <input
                type="text"
                value={form.pixelId}
                onChange={e => handleChange('pixelId', e.target.value)}
                placeholder="Ex: 409944439437496"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f8fafc', fontSize: 16, padding: 14 }}
                required
              />
            </div>
            <label style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6, fontSize: 15 }}>Token (Opcional)</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#181c2a', border: '1.5px solid #23233a', borderRadius: 10, marginBottom: 28, padding: '0 14px' }}>
              <Code size={22} color="#a1a1aa" />
              <input
                type="text"
                value={form.token}
                onChange={e => handleChange('token', e.target.value)}
                placeholder="Ex: Seu token aqui"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f8fafc', fontSize: 16, padding: 14 }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(90deg, #7c3aed 0%, #23233a 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
                borderRadius: 12,
                border: 'none',
                padding: '14px 0',
                cursor: 'pointer',
                minWidth: 160,
                marginTop: 10,
                boxShadow: '0 2px 12px #7c3aed22',
                transition: 'background 0.2s',
                width: '100%',
                letterSpacing: 0.5,
              }}
            >
              Salvar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 