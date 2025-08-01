import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/classNames';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 bg-black/80 backdrop-blur-sm',
        'flex items-center justify-center z-50 p-6',
        'animate-[fadeIn_0.2s_ease-out]',
        overlayClassName
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'bg-card border border-accent/50 rounded-lg',
          'max-w-2xl w-full max-h-[80vh] overflow-auto',
          'p-8 glow-coral',
          'animate-[fadeIn_0.2s_ease-out]',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};