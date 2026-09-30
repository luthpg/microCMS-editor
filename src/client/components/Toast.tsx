import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type * as React from 'react';
import { useEffect } from 'react';

export interface ToastData {
  id: string;
  type?: 'success' | 'error' | 'info';
  message: string;
}

interface Props {
  toast: ToastData | null;
  onDismiss: () => void;
}

export const Toast: React.FC<Props> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-center gap-3 rounded-2xl p-3.5 shadow-xl backdrop-blur-md border ${
          isError
            ? 'bg-red-500/90 text-white border-red-400'
            : isInfo
              ? 'bg-slate-800/95 text-white border-slate-700'
              : 'bg-emerald-600/95 text-white border-emerald-500'
        }`}
      >
        {isError ? (
          <AlertCircle className="h-5 w-5 shrink-0" />
        ) : isInfo ? (
          <Info className="h-5 w-5 shrink-0" />
        ) : (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        )}
        <p className="text-xs font-medium flex-1 leading-snug">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-white/80 hover:text-white p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
