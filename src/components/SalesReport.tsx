import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Sale {
  id: string;
  name: string | null;
  email: string | null;
  price: number;
  status: string;
  created_at: string;
  payment_method: string | null;
}

const SalesReport = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('checkout_logs')
          .select('id, name, email, price, status, created_at, payment_method')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setSales(data || []);
      } catch (e: any) {
        setError('Erro ao carregar relatório de vendas.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSales();
  }, [user]);

  if (loading) return <p>Carregando relatório...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="overflow-x-auto mt-8">
      <h2 className="text-lg font-semibold mb-4">Relatório de Vendas</h2>
      <table className="min-w-full bg-white border rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Nome</th>
            <th className="px-4 py-2 border">E-mail</th>
            <th className="px-4 py-2 border">Valor</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Data</th>
            <th className="px-4 py-2 border">PIX?</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">Nenhuma venda encontrada.</td>
            </tr>
          )}
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="px-4 py-2 border">{sale.name || '-'}</td>
              <td className="px-4 py-2 border">{sale.email || '-'}</td>
              <td className="px-4 py-2 border">R$ {Number(sale.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className="px-4 py-2 border">{sale.status}</td>
              <td className="px-4 py-2 border">{new Date(sale.created_at).toLocaleString('pt-BR')}</td>
              <td className="px-4 py-2 border">{sale.payment_method === 'pix' ? 'Sim' : 'Não'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport; 