import { useState, Fragment } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { useProducts } from '../hooks/useProducts';
import { Plus, Search, User, Users, UserCheck, Bell, ChevronDown, Calendar, Edit, Trash2, RefreshCw, X } from 'lucide-react';

export default function ProductsPage() {
  const { products, loading, fetchProducts, deleteProduct } = useProducts();
  const [showProductForm, setShowProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(0);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Responsividade para o modal lateral
  const modalWidth = typeof window !== 'undefined' && window.innerWidth < 900 ? '100vw' : '800px';
  
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', overflowX: 'auto', paddingLeft: 300, paddingTop: '2rem', minHeight: '100vh', background: '#030712' }}>
      {/* Formulário simples para criar produto */}
      {showProductForm && (
        <div style={{
          maxWidth: 800,
          margin: '40px auto',
          background: '#030712',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <ProductForm 
            onProductCreated={() => { setShowProductForm(false); fetchProducts(); }}
            onCancel={() => setShowProductForm(false)}
          />
        </div>
      )}
      {/* Conteúdo principal */}
      {!showProductForm && (
        <div style={{
          paddingRight: '2.5rem',
          paddingBottom: '2rem',
          minHeight: '100vh',
        }}>
          <div style={{
              maxWidth: 1400,
              margin: '0 auto',
            }}>
            {/* Título e botão */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 2 }}>Produtos</h1>
                <p style={{ fontSize: 16, color: '#a1a1aa', fontWeight: 400, marginBottom: 0 }}>Visualize e gerencie todos seus produtos.</p>
              </div>
              <button onClick={() => setShowProductForm(true)} style={{
                background: '#030712',
                color: '#fff',
                border: '1.5px solid #1A0938',
                borderRadius: 8,
                padding: '0.7rem 1.5rem',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'none',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#030712';
                e.currentTarget.style.border = '1.5px solid #FFFFFF';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#030712';
                e.currentTarget.style.border = '1.5px solid #1A0938';
              }}
              >
                <Plus size={18} /> Criar produto
              </button>
            </div>

            {/* Bloco único: busca + filtros + tabs + sininho */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#030712',
                borderRadius: 16,
                border: '2px solid #1A0938',
                boxShadow: '0 2px 12px 0 rgba(126,34,206,0.10)',
                marginBottom: 32,
                flexWrap: 'wrap',
                flexDirection: 'row',
                padding: '10px 18px',
                gap: 12,
                minHeight: 40,
              }}
            >
              {/* Busca */}
              <div style={{
                position: 'relative',
                flex: 1,
                minWidth: 180,
                maxWidth: 320,
                background: '#030712',
                borderRadius: 10,
                border: '2px solid #1A0938',
                display: 'flex',
                alignItems: 'center',
                height: 40,
              }}>
                <span style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a1aa',
                  pointerEvents: 'none',
                  fontSize: 18,
                  fontWeight: 600,
                }}>
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    padding: '0.4rem 0.8rem 0.4rem 2.2rem',
                    width: '100%',
                    outline: 'none',
                    height: 40,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              {/* Filtros premium */}
              <button
                style={{
                  background: '#030712',
                  color: '#FFFFFF',
                  border: '2px solid #1A0938',
                  borderRadius: 10,
                  padding: '0.4rem 1.1rem',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  height: 40,
                  boxShadow: '0 1px 4px 0 rgba(126,34,206,0.10)',
                  transition: 'background 0.18s, color 0.18s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#1A0938';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#030712';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                Oferta <ChevronDown size={16} style={{ marginLeft: 4 }} />
              </button>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#030712',
                borderRadius: 10,
                padding: '0.4rem 1.1rem',
                color: '#a78bfa',
                fontWeight: 700,
                fontSize: 15,
                border: '2px solid #1A0938',
                height: 40,
              }}>
                <Calendar size={16} /> Data
              </div>
              <button
                style={{
                  background: '#030712',
                  color: '#a78bfa',
                  border: '2px solid #1A0938',
                  borderRadius: 10,
                  padding: '0.4rem 1.1rem',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  height: 40,
                  boxShadow: '0 1px 4px 0 rgba(126,34,206,0.10)',
                  transition: 'background 0.18s, color 0.18s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#1A0938';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#030712';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                Publicado <ChevronDown size={16} style={{ marginLeft: 4 }} />
              </button>
              {/* Sininho */}
              <div style={{
                marginLeft: 'auto',
                color: '#a1a1aa',
                cursor: 'pointer',
                background: '#23243a',
                border: '2px solid #1A0938',
                borderRadius: 10,
                height: 40,
                width: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px 0 rgba(126,34,206,0.10)',
                fontSize: 18,
              }}>
                <Bell size={18} />
              </div>
            </div>

            {/* Lista de produtos */}
            <ProductList 
              products={filteredProducts} 
              loading={loading}
              onDeleteProduct={deleteProduct} 
            />
          </div>
        </div>
      )}
    </div>
  );
} 