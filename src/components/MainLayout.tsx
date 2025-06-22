import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();

  if (userLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#030712' }}>
        <p style={{ color: 'white' }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2.5rem' }}>
        {children}
      </main>
    </div>
  );
}