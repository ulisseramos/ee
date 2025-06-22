import { ClipboardCopy, Trash2, Edit, RefreshCw, CheckCircle2, ChevronDown, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Link copiado para a área de transferência!');
};

// Mock function for now
const clearCache = () => {
  toast.success('Cache limpo!');
}

const ProductRow = ({ product, onDeleteProduct }) => {
  const [isHovered, setIsHovered] = useState(false);

  const actionButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <tr 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ backgroundColor: isHovered ? '#0E0725' : 'transparent', transition: 'background-color 0.2s ease-in-out' }}
    >
      <td style={{ padding: '1rem', color: 'white', fontWeight: 500 }}>{product.name}</td>
      <td style={{ padding: '1rem' }}>
        <div 
          onClick={() => copyToClipboard(`${window.location.origin}/checkout/${product.id}`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#111827',
            border: '1px solid #1A0938',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            color: '#D1D5DB',
            cursor: 'pointer',
            boxShadow: 'inset 0 1px 2px 0 rgba(0,0,0,0.5)'
          }}
        >
          <span>http://localhost:3001/che...</span>
          <ClipboardCopy size={14} />
        </div>
      </td>
      <td style={{ padding: '1rem', color: '#9CA3AF' }}>
        {new Date(product.created_at).toLocaleDateString('pt-BR')} - {new Date(product.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </td>
      <td style={{ padding: '1rem' }}>
        <CheckCircle2 style={{ color: '#22C55E' }} />
      </td>
      <td style={{ padding: '1rem' }}>
        <button style={{...actionButtonStyle, color: '#9CA3AF' }} title="Editar">
          <Edit size={16} />
        </button>
      </td>
      <td style={{ padding: '1rem' }}>
        <button onClick={() => onDeleteProduct(product.id)} style={{ ...actionButtonStyle, color: '#EF4444' }} title="Excluir">
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}

export default function ProductList({ products, loading, onDeleteProduct }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem', color: '#9CA3AF' }}>
        <Loader2 className="animate-spin" style={{ marginRight: '0.5rem' }} />
        Carregando produtos...
      </div>
    );
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.')) {
      return;
    }
    await onDeleteProduct(productId);
    toast.success('Produto deletado com sucesso!');
  };

  return (
    <div style={{ backgroundColor: '#030712', borderRadius: '0.75rem', border: '3px solid #0E0725', padding: '0 1.5rem' }}>
      {(!products || products.length === 0) ? (
        <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '4rem 0' }}>
          <p>Nenhum produto encontrado.</p>
        </div>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: '0 1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #0E0725' }}>
              <th style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Oferta <ChevronDown size={16}/></th>
              <th style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 500 }}>Link Checkout</th>
              <th style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Criado em:
                <button style={{ background: 'none', border: '1px solid #374151', borderRadius: '0.375rem', color: '#9CA3AF', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CalendarIcon size={14} />
                  Data
                </button>
              </th>
              <th style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Publicado
                <select style={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '0.375rem', color: '#9CA3AF', padding: '0.25rem 0.5rem' }}>
                  <option>Todos</option>
                </select>
              </th>
              <th style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 500 }}>Editar</th>
              <th style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 500 }}>Excluir</th>
            </tr>
          </thead>
          <tbody style={{ borderTop: '1px solid #0E0725' }}>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} onDeleteProduct={onDeleteProduct} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 