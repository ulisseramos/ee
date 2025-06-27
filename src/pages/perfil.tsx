import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProfileInfo from '../components/ProfileInfo';
import { useRouter } from 'next/router';

export default function PerfilPage() {
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
      <div style={{ width: '100%', boxSizing: 'border-box', overflowX: 'auto', paddingLeft: 300, paddingTop: '2rem', minHeight: '100vh', background: '#030712' }}>
        <ProfileInfo user={user} />
      </div>
    );
} 