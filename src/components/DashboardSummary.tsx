import { FaWallet, FaHourglassHalf, FaShoppingCart, FaReceipt, FaTasks } from 'react-icons/fa';

interface DashboardSummaryProps {
  salesData: {
    totalRevenue: number;
    approvedSales: number;
    pendingSales: number;
    totalSales: number;
  } | null;
}

const SummaryCard = ({ icon, label, value }) => (
  <div
    style={{
      backgroundColor: '#09090B',
      border: '1px solid #1A0938',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      minWidth: '280px',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
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
    </div>
  </div>
);

const SkeletonCard = () => (
    <div style={{
        backgroundColor: '#09090B',
        border: '1px solid #1A0938',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        minWidth: '280px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#1F2937', borderRadius: '50%' }}></div>
        <div style={{ flex: 1 }}>
            <div style={{ height: '20px', backgroundColor: '#1F2937', borderRadius: '0.25rem', width: '75%', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '30px', backgroundColor: '#1F2937', borderRadius: '0.25rem', width: '50%' }}></div>
        </div>
    </div>
)


export default function DashboardSummary({ salesData }: DashboardSummaryProps) {
  if (!salesData) {
    return (
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const summaryItems = [
    {
      icon: <FaWallet size={26} />, 
      label: 'Faturamento', 
      value: `R$ ${salesData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      icon: <FaShoppingCart size={26} />, 
      label: 'Checkouts Iniciados (IC)', 
      value: salesData.totalSales,
    },
    {
      icon: <FaTasks size={26} />,
      label: 'Total de Vendas Aprovadas',
      value: salesData.approvedSales,
    },
    {
      icon: <FaReceipt size={26} />,
      label: 'Total de Vendas Pendentes',
      value: salesData.pendingSales,
    }
  ];

  return (
    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
      {summaryItems.map((item, idx) => (
        <SummaryCard
          key={idx}
          icon={item.icon}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
} 