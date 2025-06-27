import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { X, PackagePlus, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Cursos',
  'E-Books',
  'Produtos Físicos',
  'Consultoria',
  'Outro',
];

export default function ProductForm({ onProductCreated = () => { }, onCancel = () => { } }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file && file.size <= 15 * 1024 * 1024) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.size <= 15 * 1024 * 1024) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function onSubmit(data) {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Usuário não autenticado.');
      return;
    }
    // Remover category do objeto enviado
    const { category, ...rest } = data;
    const productData = {
      ...rest,
      user_id: user.id,
      // Se quiser salvar a categoria, pode concatenar na descrição:
      // description: `[${category}] ${data.description || ''}`,
    };
    const { error } = await supabase
      .from('products')
      .insert([productData]);
    if (error) {
      setErrorMsg('Erro ao criar produto: ' + error.message);
      return;
    }
    onProductCreated();
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '300px',
        width: 'calc(100vw - 300px)',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(3,7,18,0.98)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 2000,
          margin: '0 auto',
          padding: '48px 32px',
          overflow: 'visible',
          background: '#030712',
          borderRadius: 8,
          boxShadow: '0 80px 40px rgba(0,0,0,0.25)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            background: 'none',
            border: 'none',
            color: '#A78BFA',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Voltar
        </button>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'white',
          marginBottom: 32,
          textAlign: 'center',
          borderBottom: '2px solid #1B0C37',
          paddingBottom: 16,
          position: 'relative',
        }}>Criar Novo Produto</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8" style={{ width: '100%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: 64,
            marginBottom: 40,
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {/* Imagem do Produto */}
            <div
              style={{
                borderRadius: 20,
                border: '1.5px solid #1B0C37',
                background: '#1B0C37',
                overflow: 'hidden',
                transition: 'all 0.3s',
                minWidth: 300,
                maxWidth: 430,
                width: '100%',
                padding: 20,
              }}
            >
              <div style={{ padding: 0, borderBottom: '3px #1B0C37', marginBottom: 32 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#A78BFA',
                  margin: 0,
                  padding: 0,
                }}>Imagem do Produto</h3>
              </div>
              <div style={{ padding: 24, paddingTop: 0 }}>
                <div
                  onClick={() => fileInputRef.current.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  style={{
                    border: '1.5px solid #1B0C37',
                    borderRadius: 12,
                    background: '#030712',
                    minHeight: 210,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    marginBottom: 10,
                    padding: 24,
                    textAlign: 'center',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'border 0.2s',
                  }}
                  tabIndex={0}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 10, marginBottom: 8 }} />
                  ) : (
                    <>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(126,34,206,0.1)', borderRadius: '50%', padding: 12, marginBottom: 8 }}>
                        <UploadCloud size={28} style={{ color: '#1B0C37' }} />
                      </span>
                      <div style={{ color: 'white', fontWeight: 500, fontSize: 15 }}>Arraste e solte um arquivo aqui</div>
                      <div style={{ color: '#a1a1aa', fontSize: 13 }}>ou clique para selecionar</div>
                      <div style={{ color: '#a1a1aa', fontSize: 12, marginTop: 8 }}>Máximo 15.00MB</div>
                      <div style={{ color: '#a1a1aa', fontSize: 12 }}>Tamanho recomendado: 1920px × 1080px (proporção 16:9)</div>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
            {/* Detalhes do Produto */}
            <div
              style={{
                borderRadius: 16,
                border: '1.5px solid #1B0C37',
                background: '#030712',
                overflow: 'hidden',
                transition: 'all 0.3s',
                minWidth: 300,
                maxWidth: 430,
                width: '100%',
                padding: 20,
              }}
            >
              <div style={{ padding: 0, borderBottom: '1px solid #7E22CE22', marginBottom: 10 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#A78BFA',
                  margin: 0,
                  padding: 0,
                }}>Detalhes do Produto</h3>
              </div>
              <div style={{ padding: 24, paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ color: '#A78BFA', fontWeight: 600, fontSize: 15 }}>Nome do Produto</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Nome é obrigatório' })}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: '1.5px solid #7E22CE33',
                      borderRadius: 8,
                      color: 'white',
                      padding: '8px 10px',
                      fontSize: 14,
                      outline: 'none',
                      marginTop: 4,
                    }}
                    placeholder="Ex: Ebook de Receitas"
                  />
                  {typeof errors.name?.message === 'string' && (
                    <p style={{ color: '#F87171', fontSize: 13, marginTop: 4 }}>{errors.name.message}</p>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ color: '#A78BFA', fontWeight: 600, fontSize: 15 }}>Categoria</label>
                    <select
                      {...register('category', { required: 'Selecione uma categoria' })}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: '1.5px solid #7E22CE33',
                        borderRadius: 8,
                        color: 'white',
                        padding: '8px 10px',
                        fontSize: 14,
                        outline: 'none',
                        marginTop: 4,
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Selecione a categoria</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {typeof errors.category?.message === 'string' && (
                    <p style={{ color: '#F87171', fontSize: 13, marginTop: 4 }}>{errors.category.message}</p>
                  )}
                  </div>
                  <div>
                    <label style={{ color: '#A78BFA', fontWeight: 600, fontSize: 15 }}>Preço</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { required: 'Preço é obrigatório', valueAsNumber: true, min: { value: 0.01, message: 'O preço deve ser positivo' } })}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: '1.5px solid #7E22CE33',
                        borderRadius: 8,
                        color: 'white',
                        padding: '8px 10px',
                        fontSize: 14,
                        outline: 'none',
                        marginTop: 4,
                      }}
                      placeholder="29.90"
                    />
                    {typeof errors.price?.message === 'string' && (
                    <p style={{ color: '#F87171', fontSize: 13, marginTop: 4 }}>{errors.price.message}</p>
                  )}
                  </div>
                </div>
                <div>
                  <label style={{ color: '#A78BFA', fontWeight: 600, fontSize: 15 }}>Descrição do Produto</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: '1.5px solid #7E22CE33',
                      borderRadius: 8,
                      color: 'white',
                      padding: '8px 10px',
                      fontSize: 14,
                      outline: 'none',
                      marginTop: 4,
                      resize: 'none',
                    }}
                    placeholder="Descreva seu produto..."
                    maxLength={500}
                  />
                </div>
              </div>
            </div>
          </div>
          {errorMsg && (
            <div style={{ color: '#F87171', background: '#1B0C37', border: '1px solid #7E22CE', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}
          {/* Botões */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, paddingTop: 24 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#A78BFA',
                fontWeight: 700,
                padding: '0.75rem 1.5rem',
                borderRadius: 10,
                background: 'none',
                border: '2px solid #A78BFA',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: 15,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={22} />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#1B0C37',
                color: 'white',
                fontWeight: 'bold',
                padding: '0.75rem 1.5rem',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                fontSize: 16,
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 10px rgba(126, 34, 206, 0.3)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
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
    </div>
  );
} 