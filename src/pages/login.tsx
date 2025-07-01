import AuthForm from '../components/AuthForm';
// import '../styles/login.css'; // Removido para evitar erro de importação global
import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  return (
    <div className="login-container">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0, paddingBottom: 0 }}>
        <img
          src="https://i.imgur.com/UUAV9T6.png"
          alt="Logo"
          style={{ height: '140px', maxWidth: '80%', objectFit: 'contain', background: 'none', width: 'auto', display: 'block', filter: 'drop-shadow(0 2px 8px #0004)', marginBottom: 0, paddingBottom: 0 }}
        />
      </div>
      <AuthForm mode="login" />
    </div>
  );
} 