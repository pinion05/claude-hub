import React from 'react';
import { Toast, ToastProps } from '@/components/atoms/Toast';
import { cn } from '@/utils/classNames';

interface ToastContainerProps {
  toasts: (Omit<ToastProps, 'onClose'> & { onClose: (id: string) => void })[];
  position?: ToastProps['position'];
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
  className
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4 items-end',
    'top-left': 'top-4 left-4 items-start',
    'bottom-right': 'bottom-4 right-4 items-end flex-col-reverse',
    'bottom-left': 'bottom-4 left-4 items-start flex-col-reverse',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center flex-col-reverse'
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-tooltip flex flex-col gap-2 pointer-events-none',
        positionClasses[position],
        className
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} position={position} />
        </div>
      ))}
    </div>
  );
};