import React, { useState, useEffect } from 'react';
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
  Zap,
  CreditCard,
  LogOut,
  Send,
  Menu,
  ChevronLeft
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menu = [
  { label: 'Dashboard', href: '/dashboard', icon: (size) => <LayoutDashboard size={size} /> },
  { label: 'Produtos', href: '/produtos', icon: (size) => <ShoppingBag size={size} /> },
  { label: 'Checkout', href: '/checkout/123', icon: (size) => <CreditCard size={size} /> },
  { label: 'Relatórios', href: '/relatorio', icon: (size) => <BarChart2 size={size} /> },
  { label: 'Integrações', href: '/integracao', icon: (size) => <Plug size={size} /> },
  { label: 'Perfil', href: '/perfil', icon: (size) => <User size={size} /> },
];

const NavLink = ({ href, label, icon: Icon, className }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link href={href} passHref legacyBehavior>
      <a className={
        className
          ? `${className} ${router.pathname.startsWith(href.replace('/123','')) ? styles.active : styles.link}`
          : router.pathname.startsWith(href.replace('/123','')) ? styles.active : styles.link
      }>
        <span className={styles.icon}>{Icon}</span>
        <span>{label}</span>
      </a>
    </Link>
  );
};

export interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Responsivo: mostrar barra inferior no mobile
  useEffect(() => {
    // Remove scroll do body quando mobileNavBar está visível
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        document.body.style.paddingBottom = '64px';
      } else {
        document.body.style.paddingBottom = '';
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <aside
        className={styles.sidebar}
        style={{ width: open ? 300 : 96, transition: 'width 0.2s' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '8px 16px 0 16px' }}>
          <div className={`${styles.logoArea} ${!open ? styles.logoAreaClosed : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 8, width: '100%' }}>
            <img
              src={open ? "https://i.imgur.com/UUAV9T6.png" : "https://i.imgur.com/RGrHARN.png"}
              alt="Logo"
              style={open
                ? { height: 450, maxWidth: '100%', objectFit: 'contain', width: 'auto', display: 'block', filter: 'drop-shadow(0 2px 8px #0004)' }
                : { height: 220, width: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 2px 8px #0004)' }
              }
            />
          </div>
        </div>
        <nav className={`${styles.menu} ${!open ? styles.menuClosed : ''}`} style={{ marginLeft: open ? 0 : 0, marginTop: 8 }}>
          {menu.filter(item => item.label !== 'Perfil').map(item => (
            <NavLink key={item.href} href={item.href} label={open ? item.label : ''} icon={item.icon(open ? 22 : 28)} className={styles.link} />
          ))}
        </nav>
        <div className={styles.bottomArea}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              background: 'none',
              border: 'none',
              color: '#a78bfa',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: open ? 'flex-end' : 'flex-start',
              width: '100%',
              marginBottom: 8
            }}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <ChevronLeft size={28} /> : <Menu size={28} />}
          </button>
          <NavLink
            href={menu.find(item => item.label === 'Perfil')?.href || '/perfil'}
            label={open ? (<><User size={20} style={{marginRight: 8}} />Perfil</>) : <User size={20} />}
            icon={menu.find(item => item.label === 'Perfil')?.icon}
            className={open ? styles.logoutBtn : `${styles.logoutBtn} ${styles.perfilAlignLeft}`}
          />
          <button className={open ? styles.logoutBtn : `${styles.logoutBtn} ${styles.logoutAlignLeft}`} onClick={handleLogout} style={{ width: '100%' }}>
            <LogOut size={20} />
            {open && <span>Sair</span>}
          </button>
        </div>
      </aside>
      {/* Barra de navegação inferior para mobile */}
      <nav className={styles.mobileNavBar} style={{ display: 'none' }}>
        <a href="/dashboard" className={router.pathname === '/dashboard' ? `${styles.navIcon} ${styles.active}` : styles.navIcon}>
          <LayoutDashboard size={26} />
          <span>Dashboard</span>
        </a>
        <a href="/relatorio" className={router.pathname === '/relatorio' ? `${styles.navIcon} ${styles.active}` : styles.navIcon}>
          <BarChart2 size={26} />
          <span>Relatórios</span>
        </a>
        <a href="/perfil" className={router.pathname === '/perfil' ? `${styles.navIcon} ${styles.active}` : styles.navIcon}>
          <User size={26} />
          <span>Perfil</span>
        </a>
        <button onClick={handleLogout} className={styles.navIcon} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}>
          <LogOut size={26} />
          <span>Sair</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
