import React, { forwardRef, useId } from 'react';
import { Input } from '@/components/atoms/Input';
import { cn } from '@/utils/classNames';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'glass' | 'elevated' | 'terminal';
  showPrompt?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  className?: string;
  loading?: boolean;
  suggestions?: string[];
  icon?: React.ReactNode;
  glow?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  resultCount?: number;
  hasResults?: boolean;
  isExpanded?: boolean;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    placeholder = 'Search extensions...',
    size = 'md',
    variant = 'default',
    showPrompt = true,
    showClearButton = true,
    onClear,
    className,
    loading = false,
    icon,
    glow = false,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    resultCount,
    hasResults,
    isExpanded = false
  }, ref) => {
    const searchId = useId();
    const descriptionId = useId();
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-14 px-6 text-lg',
      xl: 'h-16 px-8 text-xl'
    };

    const promptSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-lg',
      xl: 'text-xl'
    };

    const variantClasses = {
      default: [
        'bg-card border border-border',
        'hover:border-accent/60 focus-within:border-accent',
        'focus-within:ring-2 focus-within:ring-accent/30',
        'shadow-sm hover:shadow-md focus-within:shadow-lg',
        'transition-all duration-300'
      ].join(' '),
      glass: [
        'glass backdrop-blur-xl',
        'hover:bg-glass-medium focus-within:bg-glass-heavy',
        'hover:border-accent/40 focus-within:border-accent/60',
        'focus-within:ring-2 focus-within:ring-accent/30',
        'shadow-glass-light hover:shadow-glass-medium focus-within:shadow-glass-heavy',
        'transition-all duration-300'
      ].join(' '),
      elevated: [
        'bg-card border border-border',
        'hover:border-accent/60 focus-within:border-accent',
        'focus-within:ring-2 focus-within:ring-accent/30',
        'shadow-lg hover:shadow-xl focus-within:shadow-2xl',
        'hover:-translate-y-1 focus-within:-translate-y-2',
        'transition-all duration-300'
      ].join(' '),
      terminal: [
        'bg-background border border-accent/30',
        'hover:border-accent/60 focus-within:border-accent',
        'focus-within:ring-2 focus-within:ring-accent/30',
        'font-mono shadow-inner',
        'transition-all duration-300'
      ].join(' ')
    };

    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    // Generate accessible description
    const statusDescription = loading 
      ? 'Searching...' 
      : resultCount !== undefined 
        ? `${resultCount} results found` 
        : hasResults 
          ? 'Results available' 
          : value.length > 0 
            ? 'No results found' 
            : 'Enter search terms';

    return (
      <div 
        className={cn(
          'relative flex items-center rounded-xl',
          sizeClasses[size],
          variantClasses[variant],
          glow && 'glow-accent',
          loading && 'animate-pulse-medium',
          className
        )}
        role="search"
        aria-label={ariaLabel || 'Search extensions'}
      >
        {/* Hidden description for screen readers */}
        <div id={descriptionId} className="sr-only">
          {statusDescription}
        </div>
        
        {/* Terminal prompt */}
        {showPrompt && variant === 'terminal' && (
          <span 
            className={cn(
              'terminal-prompt flex-shrink-0 mr-3 font-mono font-bold',
              promptSizeClasses[size]
            )}
            aria-hidden="true"
          >
            {'>'}
          </span>
        )}

        {/* Icon */}
        {icon && !loading && (
          <span className="flex-shrink-0 mr-3 text-foreground/60" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex-shrink-0 mr-3" role="status" aria-label="Searching">
            <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />
            <div className="sr-only">Loading search results...</div>
          </div>
        )}

        {/* Search input */}
        <Input
          ref={ref}
          id={searchId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          variant="search"
          size={size}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isExpanded}
          aria-describedby={`${descriptionId} ${ariaDescribedBy || ''}`.trim()}
          aria-label={ariaLabel || `Search extensions. ${statusDescription}`}
          autoComplete="off"
          className={cn(
            'flex-1 bg-transparent border-none shadow-none',
            'focus:ring-0 focus:outline-none',
            size === 'lg' && value === '' && variant === 'terminal' && 'terminal-cursor',
            size === 'xl' && value === '' && variant === 'terminal' && 'terminal-cursor'
          )}
        />

        {/* Clear button */}
        {showClearButton && value && !loading && (
          <button
            onClick={handleClear}
            className={cn(
              'flex-shrink-0 ml-2 p-1',
              'text-foreground/40 hover:text-accent',
              'hover:bg-accent/10 rounded-lg',
              'transition-all duration-200',
              'focus-accent'
            )}
            type="button"
            aria-label="Clear search"
          >
            <svg 
              className="w-4 h-4" 
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

        {/* Keyboard shortcut hint */}
        {variant !== 'terminal' && !value && (
          <div 
            className="flex-shrink-0 ml-2 hidden sm:flex items-center gap-1 text-xs text-foreground/30"
            aria-hidden="true"
          >
            <span className="px-1.5 py-0.5 bg-surface-1 border border-border rounded text-[10px] font-mono">
              /
            </span>
          </div>
        )}

        {/* Animated underline effect */}
        {variant === 'terminal' && (
          <div className={cn(
            'absolute bottom-0 left-0 h-0.5 bg-accent',
            'transform scale-x-0 transition-transform duration-300 origin-left',
            'group-focus-within:scale-x-100'
          )} />
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';