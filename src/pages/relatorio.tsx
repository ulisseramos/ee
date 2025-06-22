import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaCheck, FaHourglassHalf, FaPercentage, FaDollarSign, FaSyncAlt, FaChevronDown, FaCalendarAlt, FaCreditCard, FaBoxOpen, FaUser, FaTag } from 'react-icons/fa';

interface Sale {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  price: number | null;
  status: string | null;
  created_at: string;
  product_name?: string | null;
  payment_method?: string | null;
}

const summaryCards = [
  {
    label: 'Vendas aprovadas',
    icon: <FaCheck size={20} />, 
    iconClass: 'bg-purple-700/15 text-purple-400',
    borderClass: 'border-[#7E22CE]',
    valueKey: 'approvedCount',
    subtext: 'Total de vendas aprovadas',
  },
  {
    label: 'Vendas pendentes',
    icon: <FaHourglassHalf size={20} />, 
    iconClass: 'bg-yellow-400/15 text-yellow-400',
    borderClass: 'border-yellow-400',
    valueKey: 'pendingCount',
    subtext: 'Aguardando confirmação',
  },
  {
    label: 'Taxa de conversão',
    icon: <FaPercentage size={20} />, 
    iconClass: 'bg-blue-500/15 text-blue-400',
    borderClass: 'border-blue-500',
    valueKey: 'conversionRate',
    subtext: 'Aprovadas + Total',
  },
  {
    label: 'Valor total',
    icon: <FaDollarSign size={20} />, 
    iconClass: 'bg-green-500/15 text-green-400',
    borderClass: 'border-green-500',
    valueKey: 'totalRevenue',
    subtext: 'Receita bruta',
  },
];

export default function RelatorioPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchSales = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('checkout_logs')
        .select('id, nome, email, telefone, price, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSales(data || []);
    } catch (e: any) {
      setError(`Erro ao carregar relatório: ${e.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line
  }, [user]);

  const summaryData = useMemo(() => {
    if (loading || sales.length === 0) return {
      approvedCount: 0,
      pendingCount: 0,
      conversionRate: 0,
      totalRevenue: 0,
    };
    const approvedSales = sales.filter(s => s.status === 'aprovado');
    const pendingSales = sales.filter(s => s.status === 'pendente');
    const approvedCount = approvedSales.length;
    const pendingCount = pendingSales.length;
    const totalRevenue = sales.reduce((acc, s) => acc + (s.price || 0), 0);
    const conversionRate = sales.length > 0 ? (approvedCount / sales.length) * 100 : 0;
    return {
      approvedCount,
      pendingCount,
      conversionRate,
      totalRevenue,
    };
  }, [sales, loading]);

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'R$ 0,00';
    return `R$ ${Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Filtros visuais apenas (não funcionais)
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-0 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-purple-700 rounded-lg p-3 flex items-center justify-center">
            <FaDollarSign size={24} className="text-white" />
          </div>
          <div>
            <h1 className="heading-1 mb-1">Vendas</h1>
            <p className="text-gray-400 text-base">Gerencie suas transações</p>
          </div>
        </div>
        <button onClick={fetchSales} disabled={loading} className="btn-outline flex items-center gap-2 disabled:opacity-50">
          <FaSyncAlt className={loading ? 'animate-spin' : ''} />
          Atualizar dados
        </button>
      </div>

      {/* Cards de resumo - VISUAL EXATO DO PRINT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="card-neon"
          >
            <div className="icon-corner">{card.icon}</div>
            <div>
              <div className="label">{card.label}</div>
              <div className="value">
                {card.valueKey === 'conversionRate'
                  ? `${summaryData.conversionRate.toFixed(2)}%`
                  : card.valueKey === 'totalRevenue'
                  ? formatPrice(summaryData.totalRevenue)
                  : summaryData[card.valueKey as keyof typeof summaryData]}
              </div>
              <div className="subtext">{card.subtext}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center mb-6 bg-transparent">
        <div className="relative flex-grow max-w-xs">
          <FaSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por"
            className="input-modern pl-10 pr-4"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="filter-btn">Status <FaChevronDown /></button>
        <button className="filter-btn">Data <FaChevronDown /></button>
        <button className="filter-btn">Método de Pagamento <FaChevronDown /></button>
        <button className="filter-btn">Produto <FaChevronDown /></button>
        <button className="filter-btn">UTM <FaChevronDown /></button>
      </div>

      {/* Caixa Transações */}
      <div className="card-glass mt-2 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="heading-2">Transações</h2>
          <span className="text-base text-gray-400">{sales.length} transações encontradas</span>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="table-modern text-base">
            <thead>
              <tr>
                <th><FaCalendarAlt className="inline-block mr-2" /> Data</th>
                <th>ID</th>
                <th>$ Líquido</th>
                <th><FaBoxOpen className="inline-block mr-2" /> Produto</th>
                <th><FaUser className="inline-block mr-2" /> Cliente</th>
                <th><FaCreditCard className="inline-block mr-2" /> Pagamento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && [...Array(5)].map((_, i) => (
                <tr key={i} className="skeleton">
                  <td colSpan={7} className="h-8"></td>
                </tr>
              ))}
              {!loading && sales.map((sale) => (
                <tr key={sale.id} className="hover-lift transition-all">
                  <td>{formatDate(sale.created_at)}</td>
                  <td className="font-mono text-gray-400">{sale.id.substring(0, 8)}...</td>
                  <td className="font-semibold text-green-500">{formatPrice(sale.price)}</td>
                  <td>Produto</td>
                  <td>{sale.nome || 'N/A'}</td>
                  <td>----</td>
                  <td>
                    {sale.status === 'aprovado' ? (
                      <span className="bg-green-900/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-700">Aprovado</span>
                    ) : sale.status === 'pendente' ? (
                      <span className="bg-yellow-900/30 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-700">Pendente</span>
                    ) : (
                      <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-gray-700">{sale.status || 'Desconhecido'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && sales.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-xl">Nenhuma transação encontrada.</p>
              <p className="text-base">Quando as vendas começarem, elas aparecerão aqui.</p>
            </div>
          )}
          {error && (
            <div className="text-center py-16 text-red-400">
              <p><strong>Erro:</strong> {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 