import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Settings, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import RightDrawerModal from './RightDrawerModal';

interface IntegrationFormProps {
  type: 'pushinpay' | 'pixel';
  onSuccess?: () => void;
}

export default function IntegrationForm({ type, onSuccess }: IntegrationFormProps) {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // Facebook Pixel
  const [pixelId, setPixelId] = useState('');
  const [pixelMsg, setPixelMsg] = useState('');
  const [pixelLoading, setPixelLoading] = useState(false);
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'pushinpay' | 'pixel' | null>(null);

  useEffect(() => {
    if (!user) return;
    if (type === 'pushinpay') {
      const fetchPushinPay = async () => {
        const { data: integration } = await supabase
          .from('integrations')
          .select('pushinpay_api_key, is_active')
          .eq('user_id', user.id)
          .eq('provider', 'pushinpay')
          .single();
        if (integration?.pushinpay_api_key) {
          setApiKey(integration.pushinpay_api_key);
          setActive(!!integration.is_active);
        } else {
          setApiKey('');
          setActive(false);
        }
      };
      fetchPushinPay();
    } else if (type === 'pixel') {
      const fetchPixel = async () => {
        const { data: pixelIntegration } = await supabase
          .from('integrations')
          .select('pixel_id')
          .eq('user_id', user.id)
          .eq('provider', 'facebook_pixel')
          .single();
        if (pixelIntegration?.pixel_id) {
          setPixelId(pixelIntegration.pixel_id);
        } else {
          setPixelId('');
        }
      };
      fetchPixel();
    }
  }, [user, type]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, pushinpay_api_key: apiKey, api_token: apiKey, is_active: active, provider: 'pushinpay' }, { onConflict: 'user_id' });
    if (error) setMessage(error.message);
    else {
      setMessage('Chave salva!');
      localStorage.setItem('pushinpay_api_key', apiKey);
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  const handleSavePixel = async () => {
    setPixelLoading(true);
    setPixelMsg('');
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, provider: 'facebook_pixel', pixel_id: pixelId, api_token: '', }, { onConflict: 'user_id' });
    if (error) setPixelMsg(error.message);
    else {
      setPixelMsg('Pixel salvo!');
      if (onSuccess) onSuccess();
    }
    setPixelLoading(false);
  };

  // Função para copiar para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  return (
    <div className="w-full max-w-md mx-auto py-6">
      {type === 'pushinpay' && (
        <form
          className="flex flex-col gap-6"
          onSubmit={e => { e.preventDefault(); handleSave(); }}
        >
          <label className="text-zinc-200 text-base font-semibold">Chave de API PushinPay</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Cole sua chave de API PushinPay aqui"
            className="px-5 py-3 rounded-xl bg-zinc-900 border border-indigo-500 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg placeholder:text-zinc-500 shadow-md"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-400 text-white font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-60 text-lg"
          >
            {loading ? 'Salvando...' : (<><Save size={20} /> Salvar Chave</>)}
          </button>
          <p className="text-zinc-400 text-sm mt-2">
            Exemplo: <span className="font-mono text-indigo-400">pk_live_xxxxxxxxxxxxxxxxxxxxx</span>
          </p>
          {message && <p className="text-green-400 text-sm mt-2 font-semibold">{message}</p>}
        </form>
      )}
      {type === 'pixel' && (
        <form
          className="flex flex-col gap-6"
          onSubmit={e => { e.preventDefault(); handleSavePixel(); }}
        >
          <label className="text-zinc-200 text-base font-semibold">Pixel ID do Facebook</label>
          <input
            type="text"
            value={pixelId}
            onChange={e => setPixelId(e.target.value)}
            placeholder="Cole seu Pixel ID do Facebook aqui"
            className="px-5 py-3 rounded-xl bg-zinc-900 border border-blue-500 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg placeholder:text-zinc-500 shadow-md"
            required
          />
          <button
            type="submit"
            disabled={pixelLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-400 text-white font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-60 text-lg"
          >
            {pixelLoading ? 'Salvando...' : (<><Save size={20} /> Salvar Pixel</>)}
          </button>
          <p className="text-zinc-400 text-sm mt-2">
            Exemplo: <span className="font-mono text-blue-400">123456789012345</span>
          </p>
          {pixelMsg && <p className="text-green-400 text-sm mt-2 font-semibold">{pixelMsg}</p>}
        </form>
      )}
    </div>
  );
} 