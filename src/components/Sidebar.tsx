import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BarChart2, 
  Plug, 
  User, 
  Power,
  Zap
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/produtos', label: 'Produtos', icon: ShoppingBag },
  { href: '/relatorio', label: 'Análises', icon: BarChart2 },
  { href: '/integracao', label: 'Conexões', icon: Plug },
];

const NavLink = ({ href, label, icon: Icon }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link href={href} passHref legacyBehavior>
      <a style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        margin: '0.25rem 0',
        borderRadius: '0.5rem',
        color: isActive ? 'white' : '#A1A1AA',
        backgroundColor: isActive ? 'rgba(126, 34, 206, 0.2)' : 'transparent',
        fontWeight: isActive ? '600' : '400',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
      }}>
        {isActive && (
          <span style={{
            position: 'absolute',
            left: '0',
            top: '25%',
            bottom: '25%',
            width: '4px',
            backgroundColor: '#7E22CE',
            borderRadius: '0 9999px 9999px 0',
          }}></span>
        )}
        <Icon size={20} style={{ marginRight: '1rem' }} />
        <span>{label}</span>
      </a>
    </Link>
  );
};

const Sidebar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      backgroundColor: '#030712',
      borderRight: '1px solid #0E0725',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem 1.5rem 0.5rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#7E22CE',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '0.75rem'
        }}>
          <Zap size={24} color="white" />
        </div>
        <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>MeuPainel</span>
      </div>

      <nav style={{ flexGrow: 1 }}>
        {navItems.map(item => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      <div>
        <div style={{ borderTop: '1px solid #0E0725', margin: '0.5rem 0' }}></div>
        <NavLink href="/perfil" label="Minha Conta" icon={User} />
        <a onClick={handleLogout} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1.5rem',
          margin: '0.25rem 0',
          borderRadius: '0.5rem',
          color: '#A1A1AA',
          cursor: 'pointer'
        }}>
          <Power size={20} style={{ marginRight: '1rem' }} />
          <span>Sair</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
