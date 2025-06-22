import { useState, Fragment } from 'react';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { useProducts } from '../hooks/useProducts';
import { Plus, Search } from 'lucide-react';

export default function ProductsPage() {
  const { products, loading, fetchProducts, deleteProduct } = useProducts();
  const [showProductForm, setShowProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Fragment>
      {showProductForm ? (
        <ProductForm 
          onProductCreated={() => {
            fetchProducts();
            setShowProductForm(false);
          }} 
          onCancel={() => setShowProductForm(false)}
        />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Checkouts Gerados</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={20} />
                <input
                  type="text"
                  placeholder="Pesquise por: id, e-mail, telefone ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #475569', 
                    borderRadius: '0.5rem', 
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    color: 'white',
                    width: '350px'
                  }}
                />
              </div>
              <button
                onClick={() => setShowProductForm(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  backgroundColor: '#4C1D95', 
                  color: 'white', 
                  fontWeight: '500', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus size={20} />
                Novo checkout
              </button>
            </div>
      </div>
        <ProductList 
            products={filteredProducts} 
          loading={loading}
          onDeleteProduct={deleteProduct} 
        />
        </>
      )}
    </Fragment>
  );
} 