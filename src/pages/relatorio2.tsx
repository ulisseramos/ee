import React from 'react';

export default function Relatorio2Page() {
  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="heading-1 mb-8">Página de Teste Relatório 2</h1>
      <div className="card-neon mb-8">
        <div className="icon-corner">🎉</div>
        <div>
          <div className="label">Card de Teste</div>
          <div className="value">123</div>
          <div className="subtext">Se você está vendo este card estilizado, o CSS está funcionando!</div>
        </div>
      </div>
      <p className="text-gray-300">Se este texto estiver branco/cinza e o card roxo, o CSS está funcionando. Se não, o CSS não está sendo carregado.</p>
    </div>
  );
} 