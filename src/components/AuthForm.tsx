import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { FiMail, FiLock } from 'react-icons/fi';

export default function AuthForm({ mode }: { mode: 'login' | 'register' | 'forgot' }) {
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
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="card-glass w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="heading-1 text-gradient">
            {mode === 'login' && 'Bem-vindo de volta!'}
            {mode === 'register' && 'Crie sua conta'}
            {mode === 'forgot' && 'Recuperar Senha'}
          </h2>
          <p className="text-gray-300 mt-2">
            {mode === 'login' && 'Entre com suas credenciais para acessar sua conta'}
            {mode === 'register' && 'Preencha os dados para criar sua conta'}
            {mode === 'forgot' && 'Digite seu email para recuperar a senha'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FiMail size={20} />
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-modern pl-12"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock size={20} />
              </span>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-modern pl-12"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full text-lg py-4"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="loading-spinner w-5 h-5"></div>
                Aguarde...
              </div>
            ) : (
              mode === 'login' ? 'Entrar' :
              mode === 'register' ? 'Cadastrar' :
              'Enviar email'
            )}
          </button>

          {message && (
            <div className={`mt-4 text-center text-sm font-medium p-3 rounded-xl ${
              message.includes('Erro') || message.includes('error') 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : 'bg-green-500/20 text-green-300 border border-green-500/30'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="space-y-3">
            {mode === 'login' && (
              <>
                <a href="/register" className="btn-outline block w-full">
                  Criar nova conta
                </a>
                <a href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Esqueci minha senha
                </a>
              </>
            )}
            {mode === 'register' && (
              <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Já tenho uma conta? Entrar
              </a>
            )}
            {mode === 'forgot' && (
              <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Voltar ao login
              </a>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 