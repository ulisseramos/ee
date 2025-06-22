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
  // Otimizey
  const [otimizeyApiKey, setOtimizeyApiKey] = useState('');
  const [otimizeyMsg, setOtimizeyMsg] = useState('');
  const [otimizeyLoading, setOtimizeyLoading] = useState(false);

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
    // Buscar integração Otimizey
    const fetchOtimizey = async () => {
      const { data: otimizeyIntegration } = await supabase
        .from('integrations')
        .select('otimizey_api_key')
        .eq('user_id', user.id)
        .eq('provider', 'otimizey')
        .single();
      if (otimizeyIntegration?.otimizey_api_key) {
        setOtimizeyApiKey(otimizeyIntegration.otimizey_api_key);
      } else {
        setOtimizeyApiKey('');
      }
    };
    fetchPushinPay();
    fetchPixel();
    fetchOtimizey();
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

  const handleSaveOtimizey = async () => {
    setOtimizeyLoading(true);
    setOtimizeyMsg('');
    if (!otimizeyApiKey) {
      setOtimizeyMsg('Por favor, insira uma chave de API válida.');
      setOtimizeyLoading(false);
      return;
    }
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, provider: 'otimizey', otimizey_api_key: otimizeyApiKey }, { onConflict: ['user_id', 'provider'] });
      
    if (error) {
      setOtimizeyMsg(`Erro ao salvar: ${error.message}`);
      toast.error('Falha ao salvar a chave da Otimizey.');
    } else {
      setOtimizeyMsg('Chave da Otimizey salva com sucesso!');
      toast.success('Chave da Otimizey salva!');
    }
    setOtimizeyLoading(false);
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

        {/* PushinPay Integração */}
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-bold text-blue-700 mb-2">Integração PushinPay</h3>
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
            Chave de API PushinPay
          </label>
          <div className="flex items-center gap-2">
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua chave de API PushinPay aqui"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:bg-blue-400"
              title="Salvar Chave PushinPay"
            >
              {loading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" /> : <Save size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Sua chave de API para se conectar à <b>PushinPay</b> e gerar cobranças.<br/>
            Exemplo: <span className="font-mono">pk_live_xxxxxxxxxxxxxxxxxxxxx</span>
          </p>
          {message && <p className="text-xs text-green-600 mt-1">{message}</p>}
        </div>

        {/* Facebook Pixel Integração */}
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-bold text-blue-700 mb-2">Integração Facebook Pixel</h3>
          <label htmlFor="pixel-id" className="block text-sm font-medium text-gray-700 mb-2">
            Pixel ID
          </label>
          <div className="flex items-center gap-2">
            <input
              id="pixel-id"
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="Cole seu Pixel ID do Facebook aqui"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <button
              onClick={handleSavePixel}
              disabled={pixelLoading}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:bg-blue-400"
              title="Salvar Pixel ID"
            >
              {pixelLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" /> : <Save size={18} />}
            </button>
          </div>
          {pixelMsg && <p className="text-xs text-green-600 mt-1">{pixelMsg}</p>}
        </div>

        {/* Otimizey Integração */}
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-bold text-purple-700 mb-2">Integração Otimizey</h3>
          <label htmlFor="otimizey-api-key" className="block text-sm font-medium text-gray-700 mb-2">
            Chave de API Otimizey
          </label>
          <div className="flex items-center gap-2">
            <input
              id="otimizey-api-key"
              type="password"
              value={otimizeyApiKey}
              onChange={(e) => setOtimizeyApiKey(e.target.value)}
              placeholder="Cole sua chave de API Otimizey aqui"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
            />
            <button
              onClick={handleSaveOtimizey}
              disabled={otimizeyLoading}
              className="p-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition disabled:bg-purple-400"
              title="Salvar Chave Otimizey"
            >
              {otimizeyLoading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" /> : <Save size={18} />}
            </button>
          </div>
          {otimizeyMsg && <p className="text-xs text-purple-600 mt-1">{otimizeyMsg}</p>}
        </div>
      </div>
    </div>
  );
} 