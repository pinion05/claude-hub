import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/classNames';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'switch';
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  variant = 'button',
  showLabels = false
}) => {
  const { theme, toggleTheme, isDark, isSystem } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm', 
    lg: 'w-12 h-12 text-base'
  };

  const getIcon = () => {
    if (isSystem) {
      return (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
      );
    }
    
    if (isDark) {
      return (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      );
    }
    
    return (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
        />
      </svg>
    );
  };

  const getLabel = () => {
    switch (theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';  
      case 'system': return 'Auto';
      default: return 'Theme';
    }
  };

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {showLabels && (
          <span className="text-sm font-medium text-foreground">
            {getLabel()}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className={cn(
            'relative inline-flex items-center rounded-full transition-all duration-300',
            'focus-accent',
            isDark 
              ? 'bg-accent' 
              : 'bg-border',
            size === 'sm' && 'h-5 w-9',
            size === 'md' && 'h-6 w-11',
            size === 'lg' && 'h-7 w-13'
          )}
          role="switch"
          aria-checked={isDark}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          <span
            className={cn(
              'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-300',
              'flex items-center justify-center',
              size === 'sm' && 'h-4 w-4 text-[10px]',
              size === 'md' && 'h-5 w-5 text-xs',
              size === 'lg' && 'h-6 w-6 text-sm',
              isDark 
                ? size === 'sm' ? 'translate-x-4' : size === 'md' ? 'translate-x-5' : 'translate-x-6'
                : 'translate-x-0.5'
            )}
          >
            {getIcon()}
          </span>
        </button>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center justify-center rounded-xl',
          'text-foreground/80 hover:text-accent',
          'hover:bg-surface-1 active:bg-surface-2',
          'transition-all duration-200',
          'focus-accent',
          sizeClasses[size],
          className
        )}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
        title={`Current: ${getLabel()}`}
      >
        <div className="relative">
          {getIcon()}
          {isSystem && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-info rounded-full" />
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-3 py-2',
        'bg-card border border-border rounded-xl',
        'text-foreground/80 hover:text-accent',
        'hover:border-accent/50 hover:bg-surface-1',
        'active:bg-surface-2 active:scale-95',
        'transition-all duration-200',
        'focus-accent',
        size === 'sm' && 'text-xs px-2 py-1',
        size === 'lg' && 'text-base px-4 py-3',
        className
      )}
      aria-label={`Switch theme. Current: ${getLabel()}`}
    >
      <div className={cn(
        'flex-shrink-0',
        size === 'sm' && 'w-3 h-3',
        size === 'md' && 'w-4 h-4', 
        size === 'lg' && 'w-5 h-5'
      )}>
        {getIcon()}
      </div>
      {showLabels && (
        <span className="font-medium">
          {getLabel()}
        </span>
      )}
      {isSystem && (
        <div className={cn(
          'w-1.5 h-1.5 bg-info rounded-full',
          size === 'sm' && 'w-1 h-1',
          size === 'lg' && 'w-2 h-2'
        )} />
      )}
    </button>
  );
};