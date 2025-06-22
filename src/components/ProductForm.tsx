import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { PackagePlus, X } from 'lucide-react';

type FormData = {
  name: string;
  price: number;
  description: string;
};

export default function ProductForm({ onProductCreated, onCancel }: { onProductCreated: () => void, onCancel: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();
  const { user } = useAuth();

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('Você precisa estar logado para criar um produto.');
      return;
    }

    try {
      const response = await fetch('/api/pushinpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: data.name,
          productPrice: data.price,
          description: data.description,
          user_id: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao criar o produto.');
      }

      toast.success('Produto criado com sucesso!');
      reset();
      onProductCreated();

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Ocorreu um erro ao criar o produto.');
    }
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: 'white',
    outline: 'none'
  };

  return (
    <div style={{ backgroundColor: '#030712', borderRadius: '0.75rem', border: '3px solid #0E0725', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '3rem', height: '3rem', borderRadius: '9999px', backgroundColor: 'rgba(126, 34, 206, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #7E22CE' }}>
            <PackagePlus style={{ color: '#A78BFA' }} size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Criar Novo Produto</h2>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9CA3AF', marginBottom: '0.5rem' }}>
            Nome do Produto
          </label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Nome é obrigatório' })}
            style={inputStyle}
            placeholder="Ex: Ebook de Receitas"
          />
          {errors.name && <p style={{ color: '#F87171', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="price" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9CA3AF', marginBottom: '0.5rem' }}>
            Preço (R$)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { 
              required: 'Preço é obrigatório', 
              valueAsNumber: true, 
              min: { value: 0.01, message: 'O preço deve ser positivo' } 
            })}
            style={inputStyle}
            placeholder="29.90"
          />
          {errors.price && <p style={{ color: '#F87171', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.price.message}</p>}
        </div>

        <div>
          <label htmlFor="description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9CA3AF', marginBottom: '0.5rem' }}>
            Descrição (Opcional)
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            style={{...inputStyle, resize: 'none'}}
            placeholder="Descreva seu produto..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              backgroundColor: '#7E22CE', 
              color: 'white', 
              fontWeight: 'bold', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.5rem', 
              border: 'none', 
              cursor: 'pointer',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Criando...
              </>
            ) : (
              <>
                <PackagePlus size={20} />
                Criar Produto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}