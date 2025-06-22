import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ProfileInfo from '../components/ProfileInfo';

export default function PerfilPage() {
    const { user, loading } = useAuth();
    
    if (loading || !user) {
     return <div>Carregando...</div>;
   }

    return <ProfileInfo user={user} />;
} 