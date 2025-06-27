import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface ApiCredential {
  id: string;
  provider: string;
  api_key: string;
  created_at: string;
}

export default function ApiCredentialsManager() {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [provider, setProvider] = useState('utmfy');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setCredentials(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCredentials();
    // eslint-disable-next-line
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!provider || !apiKey) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('api_credentials').insert([
      { user_id: user.id, provider, api_key: apiKey },
    ]);
    if (error) setError(error.message);
    setApiKey('');
    setProvider('utmfy');
    await fetchCredentials();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await supabase.from('api_credentials').delete().eq('id', id);
    await fetchCredentials();
    setLoading(false);
  };

  return (
    <div style={{ background: '#18181b', borderRadius: 16, padding: 24, maxWidth: 480, margin: '32px auto' }}>
      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Credenciais de API</h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <select value={provider} onChange={e => setProvider(e.target.value)} style={{ borderRadius: 8, padding: 8 }}>
          <option value="utmfy">UTMFY</option>
          <option value="pushinpay">PushinPay</option>
          <option value="outro">Outro</option>
        </select>
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{ borderRadius: 8, padding: 8, flex: 1 }}
        />
        <button type="submit" disabled={loading} style={{ borderRadius: 8, padding: '8px 16px', background: '#7E22CE', color: '#fff', fontWeight: 600 }}>
          Adicionar
        </button>
      </form>
      {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {credentials.map(cred => (
          <li key={cred.id} style={{ background: '#232334', borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#a1a1aa', fontWeight: 500 }}>{cred.provider.toUpperCase()}:</span>
            <span style={{ color: '#fff', marginLeft: 8, fontFamily: 'monospace', fontSize: 15 }}>{cred.api_key}</span>
            <button onClick={() => handleDelete(cred.id)} style={{ marginLeft: 16, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>Remover</button>
          </li>
        ))}
      </ul>
      {loading && <p style={{ color: '#a1a1aa' }}>Carregando...</p>}
    </div>
  );
} 