import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProfileInfo from '../components/ProfileInfo';
import { useRouter } from 'next/router';
import styles from '../styles/perfil.module.css';

export default function PerfilPage(props) {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
      if (!loading && !user) {
        router.replace('/login');
      }
    }, [user, loading, router]);
    if (loading || !user) {
     return <div>Carregando...</div>;
   }
    return (
      <div style={{
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto',
        paddingTop: '2rem',
        minHeight: '100vh',
        background: '#030712',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 2rem',
        }}>
          <main style={{ flex: 1, minWidth: 0, padding: '2rem' }}>
            <ProfileInfo user={user} />
          </main>
        </div>
      </div>
    );
} 