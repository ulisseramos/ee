import { useRouter } from 'next/router';
import Sidebar, { SidebarProps } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  if (userLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#030712' }}>
        <p style={{ color: 'white' }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#030712' }}>
      <div
        style={{
          width: open ? 300 : 96,
          minWidth: open ? 300 : 96,
          maxWidth: open ? 300 : 96,
          transition: 'width 0.2s',
        }}
      >
        <Sidebar open={open} setOpen={setOpen} />
      </div>
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: '2rem',
          transition: 'all 0.2s',
        }}
      >
        {children}
      </main>
    </div>
  );
}