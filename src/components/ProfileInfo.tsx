import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { User, Mail, Calendar, KeyRound, Save } from 'lucide-react';
import { useState } from 'react';

export default function ProfileInfo({ user }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (!user) {
    return <div>Carregando perfil...</div>;
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Por favor, insira uma nova senha.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }
      toast.success('Senha atualizada com sucesso!');
      setNewPassword('');
    } catch (error) {
      toast.error(`Erro ao atualizar a senha: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto perfilCard text-center w-full"
      style={{maxWidth: '100vw', boxSizing: 'border-box', margin: '0 auto'}}
    >
      <div className="flex items-center gap-4 mb-8 flex-col sm:flex-row justify-center text-center w-full">
        <User className="text-blue-600" size={32} />
        <h2 className="text-2xl font-bold text-gray-800">Informações do Perfil</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg flex-col sm:flex-row justify-center text-center w-full">
          <Mail className="text-gray-500" size={20} />
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-gray-800 font-semibold">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg flex-col sm:flex-row justify-center text-center w-full">
          <Calendar className="text-gray-500" size={20} />
          <div>
            <p className="text-sm font-medium text-gray-600">Membro desde</p>
            <p className="text-gray-800 font-semibold">
              {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
      
      <hr className="my-8 border-gray-200" />
      
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <KeyRound className="text-gray-600" />
          Alterar Senha
        </h3>
        <form onSubmit={handlePasswordUpdate} className="flex flex-col sm:flex-row items-center gap-2 perfilInput w-full justify-center">
           <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite a nova senha"
            className="w-full max-w-xs mx-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition perfilInput text-center"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:bg-blue-400 perfilButton"
            title="Salvar nova senha"
          >
            {loading ? <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" /> : <Save size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
} 