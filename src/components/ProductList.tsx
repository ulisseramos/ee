import { ClipboardCopy, Trash2, Edit, RefreshCw, CheckCircle2, XCircle, Loader2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const copyToClipboard = (text, setCopied) => {
  navigator.clipboard.writeText(text);
  setCopied(true);
  toast.success('Link copiado!');
  setTimeout(() => setCopied(false), 1000);
};

const ProductRow = ({ product, onDeleteProduct }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? '#18181b' : 'transparent',
        transition: 'background 0.15s',
        borderRadius: 10,
      }}
    >
      <td style={{ padding: '0.9rem 0.7rem', color: '#fff', fontWeight: 600, fontSize: 16 }}>{product.name}</td>
      <td style={{ padding: '0.9rem 0.7rem' }}>
        <div
          onClick={() => copyToClipboard(product.checkout_url || `${window.location.origin}/checkout/${product.id}`, setCopied)}
          title="Copiar link do checkout"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#030712',
            border: '1px solid #1A0938',
            borderRadius: 8,
            padding: '0.4rem 0.9rem',
            fontSize: '0.97rem',
            color: copied ? '#a78bfa' : '#a1a1aa',
            cursor: 'pointer',
            fontWeight: 500,
            minWidth: 120,
            maxWidth: 180,
            overflow: 'hidden',
            transition: 'color 0.15s, border 0.15s',
            borderColor: copied ? '#a78bfa' : '#1A0938',
          }}
        >
          <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.checkout_url || `${window.location.origin}/checkout/${product.id}`}</span>
          <ClipboardCopy size={18} />
        </div>
      </td>
      <td style={{ padding: '0.9rem 0.7rem', color: '#a1a1aa', fontWeight: 400, fontSize: 15 }}>
        {new Date(product.created_at).toLocaleDateString('pt-BR')}
      </td>
      <td style={{ padding: '0.9rem 0.7rem', textAlign: 'center' }}>
        {product.active ? (
          <CheckCircle2 size={18} style={{ color: '#22C55E' }}  />
        ) : (
          <XCircle size={18} style={{ color: '#fbbf24' }} />
        )}
      </td>
      <td style={{ padding: '0.9rem 0.7rem', textAlign: 'center' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            borderRadius: '50%',
            padding: 8,
            cursor: 'pointer',
            transition: 'background 0.18s, color 0.18s',
            fontSize: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Editar produto"
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(167,139,250,0.12)';
            e.currentTarget.style.color = '#a78bfa';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#a1a1aa';
          }}
        >
          <Edit size={22} />
        </button>
      </td>
      <td style={{ padding: '0.9rem 0.7rem', textAlign: 'center' }}>
        <button
          onClick={() => onDeleteProduct(product.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            borderRadius: '50%',
            padding: 8,
            cursor: 'pointer',
            transition: 'background 0.18s, color 0.18s',
            fontSize: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Excluir produto"
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(255,77,79,0.12)';
            e.currentTarget.style.color = '#ff4d4f';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          <Trash2 size={22} />
        </button>
      </td>
    </tr>
  );
}

export default function ProductList({ products, loading, onDeleteProduct }) {
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '10rem', color: '#9CA3AF', fontSize: 16 }}>
        <Loader2 className="animate-spin" style={{ marginRight: '0.5rem' }} />
        Carregando produtos...
      </div>
    );
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      background: '#030712',
      borderRadius: 18,
      padding: '2.2rem 2rem',
      border: '1.5px solid #1A0938',
      maxWidth: 1300,
      margin: '0 auto',
      boxShadow: '0 8px 32px 0 rgba(30,41,59,0.13)',
      backdropFilter: 'blur(4px)',
    }}>
      {/* Tabela minimalista */}
      <div style={{ overflowX: 'auto', borderRadius: 10 }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: 0, minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '0.9rem 0.7rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, background: 'none' }}>Nome</th>
              <th style={{ padding: '0.9rem 0.7rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, background: 'none' }}>Link</th>
              <th style={{ padding: '0.9rem 0.7rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, background: 'none' }}>Criado em</th>
              <th style={{ padding: '0.9rem 0.7rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, background: 'none', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '0.9rem 0.7rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, background: 'none', textAlign: 'center' }}>Editar</th>
              <th style={{ padding: '0.9rem 0.7rem', color: '#a1a1aa', fontWeight: 700, fontSize: 15, background: 'none', textAlign: 'center' }}>Excluir</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#a1a1aa', padding: '2rem', fontSize: 15 }}>Nenhum produto encontrado.</td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <ProductRow key={product.id} product={product} onDeleteProduct={onDeleteProduct} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 