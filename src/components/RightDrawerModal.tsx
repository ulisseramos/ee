import React from 'react';

interface RightDrawerModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const RightDrawerModal: React.FC<RightDrawerModalProps> = ({ open, onClose, title, children }) => {
  return (
    <>
      {/* Overlay com blur e transição suave */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer moderno */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-[#18181b] shadow-2xl border-l border-[#27272a] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} rounded-l-2xl`}
        style={{ boxShadow: '0 8px 48px #000b', borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#27272a]">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#a1a1aa] hover:text-white text-3xl font-bold focus:outline-none rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-150 hover:bg-zinc-800"
            aria-label="Fechar"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 88px)' }}>
          {children}
        </div>
      </aside>
    </>
  );
};

export default RightDrawerModal; 