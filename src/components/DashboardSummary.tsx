import { FaWallet, FaHourglassHalf, FaShoppingCart, FaReceipt, FaTasks, FaRegCalendarAlt } from 'react-icons/fa';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DashboardSummaryProps {
  salesData: {
    totalRevenue: number;
    approvedSales: number;
    pendingSales: number;
    totalSales: number;
  } | null;
  showValues?: boolean;
  children?: React.ReactNode;
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const SummaryCard = ({ icon, label, value }: SummaryCardProps) => (
  <div
    style={{
      backgroundColor: '#030712',
      border: '1px solid #1A0938',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      flex: '1 1 340px',
      minWidth: 260,
      width: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      boxSizing: 'border-box',
      height: '100%',
    }}
  >
    <div style={{ color: '#8b5cf6', marginTop: 2 }}>{icon}</div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', height: '100%' }}>
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
        backgroundColor: '#030712',
        border: '1px solid #1A0938',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        flex: '1 1 340px',
        minWidth: 260,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        boxSizing: 'border-box',
    }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#1F2937', borderRadius: '50%' }}></div>
        <div style={{ flex: 1 }}>
            <div style={{ height: '20px', backgroundColor: '#1F2937', borderRadius: '0.25rem', width: '75%', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '30px', backgroundColor: '#1F2937', borderRadius: '0.25rem', width: '50%' }}></div>
        </div>
    </div>
)

// Componente para o seletor de intervalo de datas funcional
const DateRangeSelector = ({ startDate, endDate, onChange }: { startDate: Date; endDate: Date; onChange: (dates: [Date | null, Date | null]) => void }) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#030712',
      borderRadius: '1rem',
      padding: '0.5rem 1.25rem',
      color: 'white',
      fontWeight: 700,
      fontSize: '1rem',
      gap: '0.75rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      border: '1.5px solid #1A0938',
      marginBottom: '1.5rem',
      width: 'fit-content',
      maxWidth: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    }}>
      <FaRegCalendarAlt style={{ fontSize: 20, color: '#a78bfa', opacity: 1, marginRight: 4 }} />
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        dateFormat="dd 'de' MMM 'de' yyyy"
        locale="pt-BR"
        customInput={<CustomInput />}
        calendarClassName="date-range-calendar"
      />
    </div>
  );
};

// Custom input para exibir o intervalo no padrão do painel
const CustomInput = React.forwardRef<
  HTMLButtonElement,
  { value?: string; onClick?: () => void }
>(({ value, onClick }, ref) => (
  <button
    onClick={onClick}
    ref={ref}
    style={{
      background: 'none',
      border: 'none',
      color: 'white',
      fontWeight: 700,
      fontSize: '1rem',
      cursor: 'pointer',
      padding: 0,
      outline: 'none',
    }}
  >
    {value || 'Selecione o período'}
  </button>
));

export default function DashboardSummary({ salesData, showValues = true, children }: DashboardSummaryProps) {
  // Estado para o intervalo de datas
  const [dateRange, setDateRange] = useState([new Date(new Date().setDate(new Date().getDate() - 16)), new Date()]);
  const [startDate, endDate] = dateRange;

  if (!salesData) {
    return (
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '1.5rem',
        }}>
          <DateRangeSelector startDate={startDate} endDate={endDate} onChange={(dates) => {
            if (Array.isArray(dates) && dates[0] && dates[1]) setDateRange(dates as [Date, Date]);
          }} />
          {children}
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%',
          justifyContent: 'flex-start',
          marginBottom: '2rem',
          alignItems: 'stretch',
        }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  const summaryItems = [
    {
      icon: <FaWallet size={26} />, 
      label: 'Faturamento', 
      value: showValues ? `R$ ${salesData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••',
    },
    {
      icon: <FaShoppingCart size={26} />, 
      label: 'Checkouts Iniciados (IC)', 
      value: showValues ? salesData.totalSales : '••••',
    },
    {
      icon: <FaTasks size={26} />,
      label: 'Total de Vendas Aprovadas',
      value: showValues ? salesData.approvedSales : '••••',
    },
    {
      icon: <FaReceipt size={26} />,
      label: 'Total de Vendas Pendentes',
      value: showValues ? salesData.pendingSales : '••••',
    }
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '1.5rem',
      }}>
        <DateRangeSelector startDate={startDate} endDate={endDate} onChange={(dates) => {
          if (Array.isArray(dates) && dates[0] && dates[1]) setDateRange(dates as [Date, Date]);
        }} />
        {children}
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        width: '100%',
        justifyContent: 'flex-start',
        marginBottom: '2rem',
        alignItems: 'stretch',
      }}>
        {summaryItems.map((item, idx) => (
          <SummaryCard
            key={idx}
            icon={item.icon}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
} 