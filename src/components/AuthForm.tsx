import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { FiMail, FiLock } from 'react-icons/fi';

type Props = {
  mode: 'login' | 'register' | 'forgot';
  variant?: 'login' | 'register';
};

export default function AuthForm({ mode, variant = 'login' }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(error.message);
        else router.push('/dashboard');
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setMessage(error.message);
        else setMessage('Verifique seu email para confirmar o cadastro.');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) setMessage(error.message);
        else setMessage('Email de recuperação enviado!');
      }
    } catch (err: any) {
      setMessage('Erro inesperado: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="text-center mb-8">
          <h2 className={variant === 'register' ? 'register-title' : 'login-title'}>
            {mode === 'login' && 'Bem-vindo de volta!'}
            {mode === 'register' && 'Crie sua conta'}
            {mode === 'forgot' && 'Recuperar Senha'}
          </h2>
          <p className={variant === 'register' ? 'register-desc' : 'login-desc'}>
            {mode === 'login' && 'Entre com suas credenciais para acessar sua conta'}
            {mode === 'register' && 'Preencha os dados para criar sua conta'}
            {mode === 'forgot' && 'Digite seu email para recuperar a senha'}
          </p>
        </div>

        <div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }}>
              <FiMail size={22} />
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={variant === 'register' ? 'register-input' : 'login-input'}
              style={{ paddingLeft: 44 }}
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }}>
                <FiLock size={22} />
              </span>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={variant === 'register' ? 'register-input' : 'login-input'}
                style={{ paddingLeft: 44 }}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className={variant === 'register' ? 'register-btn' : 'login-btn'}
            disabled={loading}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div className="loading-spinner" style={{ width: 20, height: 20 }}></div>
                Aguarde...
              </div>
            ) : (
              mode === 'login' ? 'Entrar' :
              mode === 'register' ? 'Cadastrar' :
              'Enviar email'
            )}
          </button>

          {message && (
            <div className={`${variant === 'register' ? 'register-message' : 'login-message'} ${message.includes('Erro') || message.includes('error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>

        <div className={variant === 'register' ? 'register-links' : 'login-links'}>
          {mode === 'login' && (
            <>
              <a href="/register" className="login-link">Criar nova conta</a>
              <a href="/forgot-password" className="login-link">Esqueci minha senha</a>
            </>
          )}
          {mode === 'register' && (
            <a href="/login" className="register-link">Já tenho uma conta? Entrar</a>
          )}
          {mode === 'forgot' && (
            <a href="/login" className="login-link">Voltar ao login</a>
          )}
        </div>
      </form>
    </div>
  );
} 