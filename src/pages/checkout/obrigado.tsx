import Link from 'next/link';

export default function Obrigado() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-green-700">Pagamento aprovado!</h1>
        <p className="mb-4 text-lg">Obrigado pela sua compra. Seu pagamento foi confirmado com sucesso.</p>
        <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-lg">Voltar ao painel</Link>
      </div>
    </div>
  );
} 