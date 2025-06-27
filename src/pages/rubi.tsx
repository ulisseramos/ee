import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const USERNAME = 'rubi';
const PASSWORD = '123456';
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET;

const RubiPage: React.FC = () => {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Painel de usuários
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosError, setUsuariosError] = useState('');

  const [resetLoading, setResetLoading] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setUsuariosLoading(true);
      fetch('/api/usuarios', {
        headers: { 'x-admin-secret': ADMIN_SECRET }
      })
        .then(async (res) => {
          if (!res.ok) throw new Error((await res.json()).error || 'Erro ao buscar usuários');
          return res.json();
        })
        .then(data => {
          setUsuarios(data.usuarios || []);
          setUsuariosError('');
        })
        .catch(e => {
          setUsuariosError(e.message || 'Erro desconhecido');
        })
        .finally(() => setUsuariosLoading(false));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === USERNAME && password === PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  const handleResetPassword = async (email: string) => {
    setResetLoading(email);
    setResetSuccess(null);
    setResetError(null);
    try {
      const res = await fetch('/api/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha');
      setResetSuccess(email);
    } catch (e: any) {
      setResetError(email);
    } finally {
      setResetLoading(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#030712',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        padding: 32,
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#a78bfa', marginBottom: 18 }}>Área Restrita: Rubi</h1>
        <form onSubmit={handleLogin} style={{
          background: '#18181b',
          border: '2px solid #a78bfa',
          borderRadius: 16,
          padding: 32,
          minWidth: 320,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}>
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: 8,
              border: '1px solid #a78bfa',
              fontSize: 16,
              marginBottom: 8,
              background: '#23243a',
              color: '#fff',
            }}
            autoFocus
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: 8,
              border: '1px solid #a78bfa',
              fontSize: 16,
              background: '#23243a',
              color: '#fff',
            }}
          />
          {error && <div style={{ color: '#f87171', fontWeight: 600 }}>{error}</div>}
          <button
            type="submit"
            style={{
              background: '#a78bfa',
              color: '#18181b',
              fontWeight: 700,
              fontSize: 17,
              border: 'none',
              borderRadius: 8,
              padding: '0.7rem 0',
              cursor: 'pointer',
              marginTop: 8,
              transition: 'background 0.2s',
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030712',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      padding: 32,
    }}>
      <h1 style={{ fontSize: 38, fontWeight: 900, color: '#a78bfa', marginBottom: 12 }}>Área Restrita: Rubi</h1>
      <p style={{ fontSize: 20, color: '#fff', marginBottom: 32 }}>
        Bem-vindo ao painel secreto!<br/>
        Apenas quem conhece este endereço pode acessar.
      </p>
      <div style={{
        background: '#18181b',
        border: '2px solid #a78bfa',
        borderRadius: 16,
        padding: 18,
        minWidth: 220,
        marginBottom: 24,
        fontWeight: 700,
        fontSize: 20,
        color: '#a78bfa',
        textAlign: 'center',
      }}>
        Total de usuários: {usuarios.length}
      </div>
      <div style={{
        background: '#18181b',
        border: '2px solid #a78bfa',
        borderRadius: 16,
        padding: 32,
        minWidth: 320,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Painel Rubi</h2>
        <p style={{ color: '#d1d5db', fontSize: 16, marginBottom: 8 }}>
          Personalize este painel com as informações ou controles que desejar!
        </p>
        {user ? (
          <div style={{ color: '#a78bfa', fontWeight: 600, marginTop: 16 }}>
            Logado como: {user.email}
          </div>
        ) : (
          <div style={{ color: '#f87171', fontWeight: 600, marginTop: 16 }}>
            Você não está logado.
          </div>
        )}
      </div>
      <div style={{
        background: '#18181b',
        border: '2px solid #a78bfa',
        borderRadius: 16,
        padding: 32,
        minWidth: 320,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
        textAlign: 'center',
        marginTop: 40,
        maxWidth: 700,
        width: '100%',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18, color: '#a78bfa' }}>Usuários cadastrados</h2>
        {usuariosLoading && <div style={{ color: '#a78bfa', marginBottom: 12 }}>Carregando usuários...</div>}
        {usuariosError && <div style={{ color: '#f87171', marginBottom: 12 }}>{usuariosError}</div>}
        {!usuariosLoading && !usuariosError && usuarios.length === 0 && (
          <div style={{ color: '#a1a1aa' }}>Nenhum usuário encontrado.</div>
        )}
        {!usuariosLoading && !usuariosError && usuarios.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ background: '#23243a' }}>
                <th style={{ color: '#a1a1aa', fontWeight: 700, fontSize: 15, padding: 8, textAlign: 'left' }}>ID</th>
                <th style={{ color: '#a1a1aa', fontWeight: 700, fontSize: 15, padding: 8, textAlign: 'left' }}>Email</th>
                <th style={{ color: '#a1a1aa', fontWeight: 700, fontSize: 15, padding: 8, textAlign: 'left' }}>Criado em</th>
                <th style={{ color: '#a1a1aa', fontWeight: 700, fontSize: 15, padding: 8, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #23243a' }}>
                  <td style={{ color: '#fff', fontSize: 14, padding: 8, fontFamily: 'monospace' }}>{u.id}</td>
                  <td style={{ color: '#c4b5fd', fontSize: 15, padding: 8 }}>{u.email}</td>
                  <td style={{ color: '#a1a1aa', fontSize: 14, padding: 8 }}>{new Date(u.criado_em).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: 8, textAlign: 'center' }}>
                    <button
                      onClick={() => handleResetPassword(u.email)}
                      disabled={resetLoading === u.email}
                      style={{
                        background: '#a78bfa',
                        color: '#18181b',
                        fontWeight: 700,
                        fontSize: 15,
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.5rem 1.1rem',
                        cursor: resetLoading === u.email ? 'not-allowed' : 'pointer',
                        opacity: resetLoading === u.email ? 0.6 : 1,
                        marginRight: 6,
                        transition: 'background 0.2s',
                      }}
                    >
                      {resetLoading === u.email ? 'Enviando...' : 'Redefinir senha'}
                    </button>
                    {resetSuccess === u.email && <span style={{ color: '#22c55e', fontWeight: 600, marginLeft: 4 }}>Enviado!</span>}
                    {resetError === u.email && <span style={{ color: '#f87171', fontWeight: 600, marginLeft: 4 }}>Erro!</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{
        background: '#18181b',
        border: '2px solid #a78bfa',
        borderRadius: 16,
        padding: 28,
        minWidth: 220,
        marginTop: 40,
        maxWidth: 700,
        width: '100%',
        color: '#d1d5db',
        fontSize: 15,
      }}>
        <h2 style={{ color: '#a78bfa', fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Ajuda & Documentação</h2>
        <ul style={{ textAlign: 'left', marginLeft: 18 }}>
          <li><a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Documentação oficial Supabase</a></li>
          <li><a href="https://app.supabase.com/project/_/auth/users" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Gerenciar usuários no painel Supabase</a></li>
          <li><a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>Documentação Next.js</a></li>
        </ul>
        <p style={{ marginTop: 12, color: '#a1a1aa' }}>
          Aqui você pode administrar usuários, redefinir senhas e consultar links úteis.<br/>
          Para mais funções, peça no chat!
        </p>
      </div>
    </div>
  );
};

export default RubiPage; 