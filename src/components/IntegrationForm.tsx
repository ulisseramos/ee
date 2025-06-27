import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Settings, Copy, Save } from 'lucide-react';
import Link from 'next/link';

export default function IntegrationForm() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // Facebook Pixel
  const [pixelId, setPixelId] = useState('');
  const [pixelMsg, setPixelMsg] = useState('');
  const [pixelLoading, setPixelLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Buscar integração PushinPay
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
    // Buscar integração Facebook Pixel
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
    fetchPushinPay();
    fetchPixel();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    // Salva chave PushinPay no Supabase
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, pushinpay_api_key: apiKey, api_token: apiKey, is_active: active, provider: 'pushinpay' }, { onConflict: ['user_id', 'provider'] });
    if (error) setMessage(error.message);
    else {
      setMessage('Chave salva!');
      localStorage.setItem('pushinpay_api_key', apiKey);
    }
    setLoading(false);
  };

  const handleSavePixel = async () => {
    setPixelLoading(true);
    setPixelMsg('');
    // Salva pixel_id em provider: 'facebook_pixel', preenchendo api_token com string vazia
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, provider: 'facebook_pixel', pixel_id: pixelId, api_token: '', }, { onConflict: ['user_id', 'provider'] });
    if (error) setPixelMsg(error.message);
    else setPixelMsg('Pixel salvo!');
    setPixelLoading(false);
  };

  // Função para copiar para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const webhookUrl = `${window.location.origin}/api/webhook`;

  return (
    <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Settings className="text-blue-600" size={32} />
        <h2 className="text-2xl font-bold text-gray-800">Integrações</h2>
      </div>
      <p className="text-gray-600 mb-8">
        Configure suas chaves de API e webhooks para integrar com serviços externos.
      </p>

      <div className="flex justify-end mb-4">
        <Link href="/dashboard" legacyBehavior>
          <a className="bg-gray-800 text-white hover:bg-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-md">
            Ir para a Dashboard →
          </a>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Webhook URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL do seu Webhook
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
            />
            <button
              onClick={() => copyToClipboard(webhookUrl)}
              className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              title="Copiar URL"
            >
              <Copy size={18} />
            </button>
          </div>
           <p className="text-xs text-gray-500 mt-2">
            Use esta URL para receber notificações de pagamento da PushinPay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* PushinPay Integração */}
          <div className="bg-gradient-to-br from-[#181826] to-[#23233a] border-2 border-purple-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-[1.03] hover:border-purple-400">
            <div className="bg-gradient-to-br from-purple-700 to-blue-700 rounded-full p-4 mb-4 shadow-lg">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">PushinPay</h3>
            <label htmlFor="api-key" className="block text-sm font-medium text-purple-300 mb-2 w-full text-left">
              Chave de API
            </label>
            <div className="flex items-center gap-2 w-full mb-2">
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua chave de API PushinPay aqui"
                className="w-full px-4 py-2 border border-purple-700 rounded-lg bg-[#23233a] text-white focus:ring-2 focus:ring-purple-600 focus:border-purple-500 transition-all duration-200 placeholder-purple-400"
              />
              <button
                onClick={handleSave}
                disabled={loading}
                className="p-3 bg-gradient-to-br from-purple-700 to-blue-700 text-white hover:from-purple-800 hover:to-blue-800 rounded-lg transition disabled:bg-purple-400 shadow-lg"
                title="Salvar Chave PushinPay"
              >
                {loading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" /> : <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14a1 1 0 110-2 1 1 0 010 2zm1-4h-2V7h2v6z"/></svg>}
              </button>
            </div>
            <p className="text-xs text-purple-300 mb-2 w-full text-left">
              Sua chave de API para se conectar à <b>PushinPay</b> e gerar cobranças.<br/>
              Exemplo: <span className="font-mono text-purple-400">pk_live_xxxxxxxxxxxxxxxxxxxxx</span>
            </p>
            {message && <p className="text-xs text-green-400 mt-1 w-full text-left">{message}</p>}
          </div>

          {/* Facebook Pixel Integração */}
          <div className="bg-gradient-to-br from-[#181826] to-[#23233a] border-2 border-purple-700 rounded-2xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 hover:scale-[1.03] hover:border-purple-400">
            <div className="bg-gradient-to-br from-blue-700 to-purple-700 rounded-full p-4 mb-4 shadow-lg">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#1877F2"/><path d="M21.333 16.001h-3.2v8h-3.2v-8h-2.133v-2.667h2.133v-1.6c0-2.133 1.067-3.2 3.2-3.2h2.133v2.667h-1.6c-.267 0-.533.267-.533.533v1.6h2.133l-.267 2.667z" fill="white"/></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Facebook Pixel</h3>
            <label htmlFor="pixel-id" className="block text-sm font-medium text-purple-300 mb-2 w-full text-left">
              Pixel ID
            </label>
            <div className="flex items-center gap-2 w-full mb-2">
              <input
                id="pixel-id"
                type="text"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="Cole seu Pixel ID do Facebook aqui"
                className="w-full px-4 py-2 border border-purple-700 rounded-lg bg-[#23233a] text-white focus:ring-2 focus:ring-purple-600 focus:border-purple-500 transition-all duration-200 placeholder-purple-400"
              />
              <button
                onClick={handleSavePixel}
                disabled={pixelLoading}
                className="p-3 bg-gradient-to-br from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800 rounded-lg transition disabled:bg-purple-400 shadow-lg"
                title="Salvar Pixel ID"
              >
                {pixelLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" /> : <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14a1 1 0 110-2 1 1 0 010 2zm1-4h-2V7h2v6z"/></svg>}
              </button>
            </div>
            {pixelMsg && <p className="text-xs text-green-400 mt-1 w-full text-left">{pixelMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
} 