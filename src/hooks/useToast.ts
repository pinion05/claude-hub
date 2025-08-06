import { useState, useCallback } from 'react';
import { ToastType } from '@/components/atoms/Toast';

interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Toast extends ToastOptions {
  id: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast: Toast = { ...options, id };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return addToast({ 
      type: 'success', 
      title, 
      ...(message && { message }), 
      ...options 
    });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return addToast({ 
      type: 'error', 
      title, 
      ...(message && { message }), 
      duration: 8000, 
      ...options 
    });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return addToast({ 
      type: 'warning', 
      title, 
      ...(message && { message }), 
      duration: 6000, 
      ...options 
    });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<ToastOptions>) => {
    return addToast({ 
      type: 'info', 
      title, 
      ...(message && { message }), 
      ...options 
    });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  };
}