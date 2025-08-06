import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/utils/classNames';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  useEffect(() => {
    // Trigger entrance animation
    const entranceTimer = setTimeout(() => setIsVisible(true), 10);

    if (duration > 0 && !isPaused) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / duration) * 50;
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 50);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearTimeout(entranceTimer);
        clearInterval(progressInterval);
      };
    }

    return () => {
      clearTimeout(entranceTimer);
    };
  }, [duration, isPaused, handleClose]);

  const typeConfig = {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      colors: 'bg-success/10 border-success/20 text-success',
      glowColor: 'glow-success'
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      colors: 'bg-error/10 border-error/20 text-error',
      glowColor: 'glow-error'
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      colors: 'bg-warning/10 border-warning/20 text-warning',
      glowColor: 'glow-warning'
    },
    info: {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      colors: 'bg-info/10 border-info/20 text-info',
      glowColor: 'glow-info'
    }
  };

  const positionClasses = {
    'top-right': 'animate-slideLeft',
    'top-left': 'animate-slideRight',
    'bottom-right': 'animate-slideLeft',
    'bottom-left': 'animate-slideRight',
    'top-center': 'animate-slideDown',
    'bottom-center': 'animate-slideUp'
  };

  const config = typeConfig[type];

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-lg',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        'max-w-sm w-full group',
        config.colors,
        config.glowColor,
        isVisible ? positionClasses[position] : 'animate-slideRight opacity-0'
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 p-1 rounded-lg transition-transform duration-200',
        'group-hover:scale-110',
        config.colors
      )}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground">
          {title}
        </div>
        {message && (
          <div className="text-xs text-foreground/70 mt-1 line-clamp-2">
            {message}
          </div>
        )}
        
        {/* Action button */}
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              'mt-2 text-xs font-medium px-3 py-1 rounded-lg',
              'hover:bg-white/10 transition-colors duration-200',
              'focus-accent'
            )}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={cn(
          'flex-shrink-0 p-1 rounded-lg',
          'text-foreground/40 hover:text-foreground',
          'hover:bg-white/10 transition-all duration-200',
          'focus-accent'
        )}
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-50 ease-linear',
              type === 'success' && 'bg-success',
              type === 'error' && 'bg-error',
              type === 'warning' && 'bg-warning',
              type === 'info' && 'bg-info'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Glow effect */}
      <div className={cn(
        'absolute inset-0 -z-10 rounded-xl blur-lg opacity-0 transition-opacity duration-300',
        'group-hover:opacity-50',
        config.colors
      )} />
    </div>
  );
};