import { ClipboardCopy, Trash2, Edit, Loader2, CheckCircle2, XCircle, Plus } from 'lucide-react';
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
        <button
          onClick={() => copyToClipboard(product.checkout_url || `${window.location.origin}/checkout/${product.id}`, setCopied)}
          title="Copiar link do checkout"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#18122B',
            border: '1.5px solid #1A0938',
            borderRadius: 8,
            padding: '0.4rem 0.9rem',
            fontSize: '0.97rem',
            color: copied ? '#a78bfa' : '#a1a1aa',
            cursor: 'pointer',
            fontWeight: 500,
            minWidth: 120,
            maxWidth: 180,
            overflow: 'hidden',
            transition: 'color 0.15s, border 0.15s, background 0.18s',
            borderColor: copied ? '#a78bfa' : '#1A0938',
            outline: copied ? '2px solid #a78bfa' : 'none',
            boxShadow: copied ? '0 0 0 2px #a78bfa33' : 'none',
          }}
        >
          <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.checkout_url || `${window.location.origin}/checkout/${product.id}`}</span>
          <ClipboardCopy size={18} />
        </button>
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
            background: '#18122B',
            border: '1.5px solid #1A0938',
            color: '#a1a1aa',
            borderRadius: '8px',
            padding: '0.4rem 0.7rem',
            cursor: 'pointer',
            transition: 'background 0.18s, color 0.18s, border 0.18s',
            fontSize: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Editar produto"
          onMouseOver={e => {
            e.currentTarget.style.background = '#23233a';
            e.currentTarget.style.color = '#a78bfa';
            e.currentTarget.style.borderColor = '#a78bfa';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#18122B';
            e.currentTarget.style.color = '#a1a1aa';
            e.currentTarget.style.borderColor = '#1A0938';
          }}
        >
          <Edit size={20} />
        </button>
      </td>
      <td style={{ padding: '0.9rem 0.7rem', textAlign: 'center' }}>
        <button
          onClick={() => onDeleteProduct(product.id)}
          style={{
            background: '#18122B',
            border: '1.5px solid #1A0938',
            color: '#ef4444',
            borderRadius: '8px',
            padding: '0.4rem 0.7rem',
            cursor: 'pointer',
            transition: 'background 0.18s, color 0.18s, border 0.18s',
            fontSize: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Excluir produto"
          onMouseOver={e => {
            e.currentTarget.style.background = '#2a0a1a';
            e.currentTarget.style.color = '#ff4d4f';
            e.currentTarget.style.borderColor = '#ff4d4f';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#18122B';
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = '#1A0938';
          }}
        >
          <Trash2 size={20} />
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
      {/* Barra de ações aprimorada */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 28,
        gap: 16,
        background: 'linear-gradient(90deg, #18122B 60%, #1e293b 100%)',
        borderRadius: 12,
        boxShadow: '0 2px 16px 0 #a78bfa22, 0 0 0 2px #a78bfa33',
        border: '1.5px solid #a78bfa',
        padding: '1.1rem 1.5rem',
        position: 'relative',
      }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          style={{
            background: 'rgba(24,18,43,0.95)',
            border: '1.5px solid #a78bfa',
            borderRadius: 8,
            color: '#fff',
            padding: '0.8rem 1.2rem',
            fontSize: 16,
            outline: 'none',
            minWidth: 260,
            transition: 'border 0.18s, box-shadow 0.18s',
            boxShadow: '0 1px 8px #a78bfa22',
            fontWeight: 500,
            letterSpacing: 0.2,
          }}
        />
        <button
          style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #a78bfa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.8rem 1.5rem',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 12px #2563eb33',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'background 0.18s',
            textShadow: '0 1px 8px #2563eb44',
          }}
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>
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