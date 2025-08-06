import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/classNames';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'glass' | 'elevated' | 'centered';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  title?: string;
  description?: string;
  animation?: 'scale' | 'slide' | 'fade' | 'bounce';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
  size = 'lg',
  variant = 'default',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  title,
  description,
  animation = 'scale'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure DOM is ready for animation
      setTimeout(() => setIsAnimating(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4'
  };

  const variantClasses = {
    default: [
      'bg-card border border-accent/50 shadow-xl',
    ].join(' '),
    glass: [
      'glass-heavy backdrop-blur-2xl shadow-glass-heavy',
      'border-glass-medium'
    ].join(' '),
    elevated: [
      'bg-card border border-border shadow-2xl',
      'shadow-accent/20'
    ].join(' '),
    centered: [
      'bg-card border border-border shadow-xl',
      'mx-auto'
    ].join(' ')
  };

  const animationClasses = {
    scale: {
      overlay: isAnimating ? 'animate-fadeIn' : 'animate-fadeOut',
      modal: isAnimating ? 'animate-scaleIn' : 'animate-scaleOut'
    },
    slide: {
      overlay: isAnimating ? 'animate-fadeIn' : 'animate-fadeOut', 
      modal: isAnimating ? 'animate-slideUp' : 'animate-slideDown'
    },
    fade: {
      overlay: isAnimating ? 'animate-fadeIn' : 'animate-fadeOut',
      modal: isAnimating ? 'animate-fadeIn' : 'animate-fadeOut'
    },
    bounce: {
      overlay: isAnimating ? 'animate-fadeIn' : 'animate-fadeOut',
      modal: isAnimating ? 'animate-bounceIn' : 'animate-scaleOut'
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-modal-backdrop',
        'bg-black/80 backdrop-blur-sm',
        'flex items-center justify-center',
        'p-4 sm:p-6',
        animationClasses[animation].overlay,
        overlayClassName
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        className={cn(
          'relative w-full rounded-2xl',
          'max-h-[90vh] overflow-hidden',
          // Size classes
          sizeClasses[size],
          // Variant classes  
          variantClasses[variant],
          // Animation classes
          animationClasses[animation].modal,
          // Custom glow effect
          variant === 'default' && 'glow-accent',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 
                  id="modal-title"
                  className="text-xl font-bold text-foreground text-gradient-accent"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p 
                  id="modal-description"
                  className="mt-1 text-sm text-foreground/70"
                >
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'flex-shrink-0 ml-4 p-2',
                  'text-foreground/40 hover:text-foreground',
                  'hover:bg-surface-1 rounded-xl',
                  'transition-all duration-200',
                  'focus-accent'
                )}
                aria-label="Close modal"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'overflow-auto scrollbar-thin max-h-full',
          (title || showCloseButton) ? 'px-6 pb-6' : 'p-6'
        )}>
          {children}
        </div>

        {/* Animated border effect */}
        <div className={cn(
          'absolute inset-0 rounded-2xl pointer-events-none',
          'bg-gradient-to-r from-transparent via-accent/20 to-transparent',
          'opacity-0 transition-opacity duration-500',
          variant === 'default' && isAnimating && 'opacity-100'
        )}>
          <div className="absolute inset-0 animate-shimmer-accent rounded-2xl opacity-30" />
        </div>

        {/* Corner accent elements */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-accent/30 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-accent/30 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-accent/30 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-accent/30 rounded-br-lg" />
      </div>
    </div>,
    document.body
  );
};