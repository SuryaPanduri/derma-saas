import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto-dismiss after 3.5 seconds (including animation)
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast('success', message), [showToast]);
  const error = useCallback((message: string) => showToast('error', message), [showToast]);
  const info = useCallback((message: string) => showToast('info', message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[1000] flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Inline ToastItem for clean implementation
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  return (
    <div 
      className={`
        flex items-center gap-4 min-w-[320px] max-w-md p-5 rounded-[2rem] border shadow-2xl backdrop-blur-xl
        animate-in slide-in-from-right-full slide-in-from-bottom-4 fade-in duration-500
        ${toast.type === 'success' ? 'bg-white/70 border-emerald-100' : 
          toast.type === 'error' ? 'bg-rose-50/70 border-rose-100' : 'bg-white/70 border-[#D4C8BC]/30'}
      `}
    >
      <div className={`p-2 rounded-xl flex-shrink-0
        ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
          toast.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-[#FAF8F4] text-[#8A6F5F]'}
      `}>
        {toast.type === 'success' ? <CheckCircle2 size={20} /> : 
         toast.type === 'error' ? <XCircle size={20} /> : <Info size={20} />}
      </div>
      
      <div className="flex-1">
        <p className="font-['Playfair_Display'] text-[15px] font-bold text-[#191919] leading-tight">
          {toast.message}
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4C8BC] mt-1">
          {toast.type.toUpperCase()}
        </p>
      </div>

      <button 
        onClick={onClose}
        className="text-[#D4C8BC] hover:text-[#8A6F5F] transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};
