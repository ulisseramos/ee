import { useEffect, useState, Fragment } from 'react';
import { supabase } from '../lib/supabaseClient';
import DashboardSummary from '../components/DashboardSummary';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/router';
import { FaEye } from 'react-icons/fa';
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

interface SaleData {
  totalRevenue: number;
  approvedSales: number;
  pendingSales: number;
  totalSales: number;
}

const DashboardPage = () => {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();
  const [salesData, setSalesData] = useState<SaleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [salesByPeriod, setSalesByPeriod] = useState<any[]>([]);
  const [salesByHour, setSalesByHour] = useState<any[]>([]);
  const [period, setPeriod] = useState<'today' | '7d' | '14d' | '30d'>('7d');
  const [showValues, setShowValues] = useState(true);
  
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchSalesData = async () => {
        try {
          const { data, error: rpcError } = await supabase
            .rpc('calculate_user_sales_summary', { p_user_id: user.id });

          if (rpcError) throw rpcError;

          const safeData = data?.[0] || {};
          setSalesData({
            totalRevenue: Number(safeData.total_revenue ?? 0),
            approvedSales: Number(safeData.approved_sales ?? 0),
            pendingSales: Number(safeData.pending_sales ?? 0),
            totalSales: Number(safeData.total_sales ?? 0),
          });
        } catch (e: any) {
          console.error("Erro ao buscar dados de vendas:", e);
          setError("Falha ao carregar os dados de vendas.");
        }
      };
      
      const fetchSalesByTime = async () => {
        try {
          const { data, error } = await supabase
            .from('checkout_logs')
            .select('status, created_at')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          const now = new Date();
          let startDate = new Date();
          
          if (period === 'today') {
            startDate.setHours(0, 0, 0, 0);
            
            const hourlyStats: { [hour: string]: { aprovado: number; pendente: number } } = {};
            for (let h = 0; h < 24; h++) { hourlyStats[h] = { aprovado: 0, pendente: 0 }; }

            data?.forEach((sale: any) => {
              const saleDate = new Date(sale.created_at);
              if (saleDate >= startDate && saleDate <= now) {
                const hour = saleDate.getHours();
                if (sale.status === 'aprovado') hourlyStats[hour].aprovado++;
                if (sale.status === 'pendente') hourlyStats[hour].pendente++;
              }
            });
            const hourlyResult = Array.from({ length: 24 }, (_, h) => ({
              hour: h,
              ...hourlyStats[h],
            }));
            setSalesByHour(hourlyResult);
            
          } else {
            if (period === '7d') startDate.setDate(now.getDate() - 6);
            else if (period === '14d') startDate.setDate(now.getDate() - 13);
            else if (period === '30d') startDate.setDate(now.getDate() - 29);
            startDate.setHours(0, 0, 0, 0);
            
            const dailyStats: { [date: string]: { aprovado: number; pendente: number } } = {};
          data?.forEach((sale: any) => {
            const saleDate = new Date(sale.created_at);
            if (saleDate >= startDate && saleDate <= now) {
              const dateStr = saleDate.toLocaleDateString('pt-BR');
                if (!dailyStats[dateStr]) dailyStats[dateStr] = { aprovado: 0, pendente: 0 };
                if (sale.status === 'aprovado') dailyStats[dateStr].aprovado++;
                if (sale.status === 'pendente') dailyStats[dateStr].pendente++;
              }
            });
            
          const days = [];
          for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
          }
            const dailyResult = days.map((d) => {
            const dateStr = d.toLocaleDateString('pt-BR');
            return {
              date: dateStr,
                aprovado: dailyStats[dateStr]?.aprovado || 0,
                pendente: dailyStats[dateStr]?.pendente || 0,
            };
          });
            setSalesByPeriod(dailyResult);
          }
        } catch (e) {
          setSalesByPeriod([]);
          setSalesByHour([]);
        }
      };

      fetchSalesData();
      fetchSalesByTime();
    }
  }, [user, period]);

  if (userLoading || !user) return <div>Carregando...</div>;
  
  if (error) {
    return <p style={{ color: '#EF4444' }}>{error}</p>;
  }

  const isTodayView = period === 'today';

  const chartData = {
      labels: isTodayView 
          ? salesByHour.map(d => `${String(d.hour).padStart(2, '0')}:00`)
          : salesByPeriod.map(d => {
              const dateParts = d.date.split('/');
              return `${dateParts[0]} de ${new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toLocaleString('pt-BR', { month: 'short' })}`;
          }),
      datasets: [
        {
          label: 'Vendas Aprovadas',
          data: isTodayView ? salesByHour.map(d => d.aprovado) : salesByPeriod.map(d => d.aprovado),
          borderColor: '#7910CE',
          backgroundColor: 'rgba(121, 16, 206, 0.15)',
          borderWidth: 4,
          tension: 0.5,
          fill: true,
          pointRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#7910CE',
          pointBorderWidth: 3,
          pointHoverRadius: 9,
          shadowOffsetX: 0,
          shadowOffsetY: 4,
          shadowBlur: 10,
          shadowColor: 'rgba(121, 16, 206, 0.25)',
        },
        {
          label: 'Vendas Pendentes',
          data: isTodayView ? salesByHour.map(d => d.pendente) : salesByPeriod.map(d => d.pendente),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          borderWidth: 4,
          tension: 0.5,
          fill: true,
          pointRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#f59e0b',
          pointBorderWidth: 3,
          pointHoverRadius: 9,
          shadowOffsetX: 0,
          shadowOffsetY: 4,
          shadowBlur: 10,
          shadowColor: 'rgba(245, 158, 11, 0.18)',
        },
      ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    elements: {
      line: {
        capBezierPoints: true,
      },
      point: {
        pointStyle: 'circle',
        hoverBorderWidth: 4,
      },
    },
    scales: {
      x: { 
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#A1A1AA' },
      },
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#A1A1AA' },
      },
    },
  };
  
  return (
    <div style={{
      width: 'min(90vw, 1700px)',
      boxSizing: 'border-box',
      overflowX: 'auto',
      paddingLeft: 240,
      paddingTop: '2rem',
      minHeight: '100vh',
      background: '#030712',
      margin: '0 auto',
    }}>
      {/* Botão Mostrar valores agora vai como children do DashboardSummary */}
      <DashboardSummary salesData={salesData} showValues={showValues}>
        <button
          onClick={() => setShowValues(v => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#030712',
            border: '1.5px solid #1A0938',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 12,
            padding: '0.7rem 1.6rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
            transition: 'all 0.18s',
          }}
        >
          <FaEye style={{ color: '#a78bfa', fontSize: 18 }} />
          {showValues ? 'Ocultar valores' : 'Mostrar valores'}
        </button>
      </DashboardSummary>

      <div style={{
        marginTop: '2rem',
        backgroundColor: '#030712',
        border: '1px solid #1A0938',
        borderRadius: '0.75rem',
        padding: '1.5rem',
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Visão Geral de Vendas</h2>
            <p style={{ color: '#A1A1AA', fontSize: '0.875rem' }}>Acompanhe o desempenho das suas vendas ao longo do tempo</p>
          </div>
          <div style={{
            display: 'flex',
            gap: '0.25rem',
            border: '1px solid #27272A',
            borderRadius: '0.5rem',
            padding: '0.25rem',
          }}>
            {['today', '7d', '14d', '30d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as any)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: period === p ? '#27272A' : 'transparent',
                  color: period === p ? 'white' : '#A1A1AA',
                  cursor: 'pointer'
                }}
              >
                {p === 'today' ? 'Hoje' : `${p.replace('d', '')} dias`}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'flex-end',
            marginBottom: '1rem',
            gap: '1rem'
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#7910CE'}}></div>
                <span style={{color: '#A1A1AA', fontSize: '0.875rem'}}>Vendas Aprovadas</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b'}}></div>
                <span style={{color: '#A1A1AA', fontSize: '0.875rem'}}>Vendas Pendentes</span>
        </div>
      </div>

        <div style={{ width: '100%', height: '350px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
    </div>
    </div>
  );
};

export default DashboardPage; 