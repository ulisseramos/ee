import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaCheck, FaHourglassHalf, FaPercentage, FaDollarSign, FaSyncAlt, FaChevronDown, FaCalendarAlt, FaCreditCard, FaBoxOpen, FaUser, FaTag, FaCheckCircle } from 'react-icons/fa';
import { SiPix } from 'react-icons/si';
import DashboardSummary from '../components/DashboardSummary';
import { useRouter } from 'next/router';
import styles from '../styles/relatorio.module.css';

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

interface RelatorioSummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  cardStyle?: React.CSSProperties;
}

const RelatorioSummaryCard: React.FC<RelatorioSummaryCardProps> = ({ icon, label, value, subtext, cardStyle }) => (
  <div
    style={{
      backgroundColor: '#030712',
      border: '1px solid #1A0938',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      flex: '1 1 220px',
      minWidth: 180,
      maxWidth: 320,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxSizing: 'border-box',
      ...cardStyle,
    }}
  >
    <div style={{ color: '#8b5cf6' }}>
      {icon}
    </div>
    <div>
      <div style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold' }}>
        {value}
      </div>
      <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 500, marginTop: '0.25rem' }}>
        {subtext}
      </div>
    </div>
  </div>
);

export default function RelatorioPage() {
  const { user } = useAuth();
  const router = useRouter();
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
    if (!user) {
      router.replace('/login');
    } else {
      fetchSales();
    }
    // eslint-disable-next-line
  }, [user]);

  const dashboardSummaryData = useMemo(() => {
    if (loading || sales.length === 0) return {
      totalRevenue: 0,
      approvedSales: 0,
      pendingSales: 0,
      totalSales: 0,
    };
    const approvedSales = sales.filter(s => s.status === 'aprovado');
    const pendingSales = sales.filter(s => s.status === 'pendente');
    const totalRevenue = sales.reduce((acc, s) => acc + (s.price || 0), 0);
    return {
      totalRevenue,
      approvedSales: approvedSales.length,
      pendingSales: pendingSales.length,
      totalSales: sales.length,
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

  // Filtro de pesquisa funcional
  const filteredSales = useMemo(() => {
    if (!search.trim()) return sales;
    const term = search.trim().toLowerCase();
    return sales.filter(sale =>
      (sale.nome && sale.nome.toLowerCase().includes(term)) ||
      (sale.product_name && sale.product_name.toLowerCase().includes(term)) ||
      (sale.id && sale.id.toLowerCase().includes(term)) ||
      (sale.status && sale.status.toLowerCase().includes(term))
    );
  }, [sales, search]);

  if (!user) return <div>Carregando...</div>;

  // Filtros visuais apenas (não funcionais)
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
          {/* Cabeçalho da página */}
          <div style={{ marginBottom: '0', marginTop: '0.5rem' }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>Vendas</h1>
            <p style={{ fontSize: 18, color: '#fff', fontWeight: 400 }}>Gerencie suas transações</p>
          </div>

          {/* Botão Atualizar dados alinhado à direita */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button
              onClick={fetchSales}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: '#030712',
                border: '2px solid #23243a',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 12,
                padding: '0.7rem 1.6rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                transition: 'all 0.18s',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseOver={e => e.currentTarget.style.background = '#030712'}
              onMouseOut={e => e.currentTarget.style.background = '#030712'}
            >
              <FaSyncAlt style={{ color: '#a78bfa', fontSize: 20, animation: loading ? 'spin 1s linear infinite' : undefined }} />
              Atualizar dados
            </button>
          </div>

          {/* Cards resumo */}
          <div style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '1.5rem',
            width: '100%',
            justifyContent: 'stretch',
            marginBottom: '2rem',
          }}>
            <RelatorioSummaryCard
              icon={<FaCheckCircle size={26} />}
              label="Vendas aprovadas"
              value={dashboardSummaryData.approvedSales}
              subtext="Total de vendas aprovadas"
              cardStyle={{ flex: 1, minWidth: 0, maxWidth: 'none' }}
            />
            <RelatorioSummaryCard
              icon={<FaHourglassHalf size={26} />}
              label="Vendas pendentes"
              value={dashboardSummaryData.pendingSales}
              subtext="Aguardando confirmação"
              cardStyle={{ flex: 1, minWidth: 0, maxWidth: 'none' }}
            />
            <RelatorioSummaryCard
              icon={<FaPercentage size={26} />}
              label="Taxa de conversão"
              value={dashboardSummaryData.totalSales > 0 ? ((dashboardSummaryData.approvedSales / dashboardSummaryData.totalSales) * 100).toFixed(2) + '%' : '0.00%'}
              subtext="Aprovadas + Total"
              cardStyle={{ flex: 1, minWidth: 0, maxWidth: 'none' }}
            />
            <RelatorioSummaryCard
              icon={<FaDollarSign size={26} />}
              label="Valor total"
              value={`R$ ${dashboardSummaryData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtext="Receita bruta"
              cardStyle={{ flex: 1, minWidth: 0, maxWidth: 'none' }}
            />
          </div>

          {/* Filtros */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.1rem',
            alignItems: 'center',
            background: '#030712',
            borderRadius: '1.2rem',
            padding: '1.5rem 2.5rem',
            marginBottom: '2rem',
            border: '1px solid #23243a',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
          }}>
            <div style={{
              background: '#030712',
              border: '2px solid #23243a',
              borderRadius: '1rem',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
              padding: '0.2rem 1.2rem 0.2rem 0.5rem',
              display: 'flex',
              alignItems: 'center',
              minWidth: 260,
              position: 'relative',
            }}>
              <FaSearch style={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a78bfa',
                fontSize: 22,
                pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Pesquisar por"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  minWidth: 180,
                  background: 'transparent',
                  color: '#fff',
                  border: 'none',
                  outline: 'none',
                  height: 48,
                  fontSize: 17,
                  borderRadius: 10,
                  padding: '0 0 0 2.5rem',
                  fontWeight: 500,
                  flex: 1,
                  transition: 'border 0.18s',
                }}
                onFocus={e => {
                  if (e.target.parentElement) e.target.parentElement.style.border = '2px solid #a78bfa';
                }}
                onBlur={e => {
                  if (e.target.parentElement) e.target.parentElement.style.border = '2px solid #23243a';
                }}
              />
            </div>
            {[
              { label: 'Status', minWidth: 130 },
              { label: 'Data', minWidth: 110 },
              { label: 'Método de Pagamento', minWidth: 190 },
              { label: 'Produto', minWidth: 120 },
              { label: 'UTM', minWidth: 100 },
            ].map((btn, idx) => (
              <button
                key={btn.label}
                className="filter-btn"
                style={{
                  background: '#030712',
                  border: '2px solid #23243a',
                  borderRadius: '1rem',
                  color: '#a1a1aa',
                  minWidth: btn.minWidth,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 700,
                  fontSize: 17,
                  padding: '0 1.5rem',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  transition: 'border 0.2s, color 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.border = '2px solid #a78bfa';
                  e.currentTarget.style.color = '#a78bfa';
                  e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(0,0,0,0.16)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.border = '2px solid #23243a';
                  e.currentTarget.style.color = '#a1a1aa';
                  e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.10)';
                }}
              >
                {btn.label} <FaChevronDown style={{ marginLeft: 6, fontSize: 18 }} />
              </button>
            ))}
          </div>

          {/* Caixa Transações */}
          <div style={{
            background: '#030712',
            border: '2px solid #23243a',
            borderRadius: '1.2rem',
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
            padding: '2rem 2.5rem',
            marginTop: '2rem',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Transações</h2>
              <span style={{ fontSize: 16, color: '#a1a1aa', fontWeight: 500 }}>{sales.length} transações encontradas</span>
            </div>
            <div style={{ overflowX: 'auto', borderRadius: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'transparent' }}>
                <thead>
                  <tr style={{ background: '#0B101D' }}>
                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, textAlign: 'left', borderTopLeftRadius: '1rem', letterSpacing: '-0.5px' }}><FaCalendarAlt style={{marginRight: 6, marginBottom: -2}}/> Data</th>
                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, textAlign: 'left', letterSpacing: '-0.5px' }}>ID</th>
                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, textAlign: 'left', letterSpacing: '-0.5px' }}><FaDollarSign style={{marginRight: 6, marginBottom: -2}}/> Líquido</th>
                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, textAlign: 'left', letterSpacing: '-0.5px' }}><FaBoxOpen style={{marginRight: 6, marginBottom: -2}}/> Produto</th>
                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, textAlign: 'left', letterSpacing: '-0.5px' }}><FaUser style={{marginRight: 6, marginBottom: -2}}/> Cliente</th>
                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, textAlign: 'left', letterSpacing: '-0.5px' }}><FaCreditCard style={{marginRight: 6, marginBottom: -2}}/> Pagamento</th>
                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, textAlign: 'left', borderTopRightRadius: '1rem', letterSpacing: '-0.5px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#a1a1aa', padding: '2rem', fontSize: 16 }}>Nenhuma venda encontrada.</td>
                    </tr>
                  )}
                  {filteredSales.map((sale, idx) => (
                    <tr key={sale.id} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDate(sale.created_at)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: '#1C2533', color: '#F9FAFB', borderRadius: 8, padding: '0.3rem 0.7rem', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', display: 'inline-block', letterSpacing: '0.5px' }}>{sale.id}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#fff', fontWeight: 800, fontSize: 16 }}>{formatPrice(sale.price)}</td>
                      <td style={{ padding: '1rem', color: '#c4b5fd', fontWeight: 500 }}>{sale.product_name || '-'}</td>
                      <td style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 500, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sale.nome || '-'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: '#030712', borderRadius: '50%', width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <SiPix style={{ color: '#00B686', fontSize: 20 }} />
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {sale.status === 'aprovado' ? (
                          <span style={{ background: '#052e16', color: '#22c55e', borderRadius: 16, padding: '0.3rem 1.1rem', fontWeight: 700, fontSize: 14, display: 'inline-block' }}><FaCheckCircle style={{marginRight: 6, marginBottom: -2}}/>Aprovado</span>
                        ) : sale.status === 'pendente' ? (
                          <span style={{ background: '#3d2c13', color: '#fbbf24', borderRadius: 16, padding: '0.3rem 1.1rem', fontWeight: 700, fontSize: 14, display: 'inline-block' }}><FaHourglassHalf style={{marginRight: 6, marginBottom: -2}}/>Pendente</span>
                        ) : (
                          <span style={{ background: '#23243a', color: '#a1a1aa', borderRadius: 16, padding: '0.3rem 1.1rem', fontWeight: 700, fontSize: 14, display: 'inline-block' }}>{sale.status || '-'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 