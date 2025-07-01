import { useState } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { useProducts } from '../hooks/useProducts';
import { Plus } from 'lucide-react';

export default function ProdutosPage() {
  const { products, loading, fetchProducts, deleteProduct } = useProducts();
  const [showProductForm, setShowProductForm] = useState(false);

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 2 }}>Produtos</h1>
            <p style={{ fontSize: 16, color: '#a1a1aa', fontWeight: 400, marginBottom: 0 }}>Visualize e gerencie todos seus produtos.</p>
          </div>
          <button onClick={() => setShowProductForm(true)} style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #a78bfa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '0.8rem 1.5rem',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 2px 16px 0 #a78bfa22',
          }}>
            <Plus size={18} /> Criar produto
          </button>
        </div>
        {showProductForm && (
          <div style={{
            maxWidth: 800,
            margin: '40px auto',
            background: '#18122B',
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
        {!showProductForm && (
          <main style={{ flex: 1, minWidth: 0, padding: '2rem' }}>
            <ProductList 
              products={products} 
              loading={loading}
              onDeleteProduct={deleteProduct} 
            />
          </main>
        )}
      </div>
    </div>
  );
} 