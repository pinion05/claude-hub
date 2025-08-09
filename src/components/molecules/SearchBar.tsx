import React, { forwardRef, memo } from 'react';
import { Input } from '@/components/atoms/Input';
import { cn } from '@/utils/classNames';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  showPrompt?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  className?: string;
}

const SearchBarComponent = forwardRef<HTMLInputElement, SearchBarProps>(
  ({
    value,
    onChange,
    onKeyDown,
    onFocus,
    placeholder = 'Search...',
    size = 'md',
    showPrompt = true,
    showClearButton = true,
    onClear,
    className
  }, ref) => {
    const containerClasses = {
      sm: 'h-10 px-4',
      md: 'h-10 px-4',
      lg: 'h-14 px-6'
    };

    const promptClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-lg'
    };

    return (
      <div className={cn(
        'flex items-center bg-card border border-border rounded-lg',
        'transition-all duration-200 hover:border-accent/50',
        'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30',
        containerClasses[size],
        className
      )}>
        {showPrompt && (
          <span className={cn(
            'text-accent mr-2 font-mono',
            promptClasses[size]
          )}>
            {'>'}
          </span>
        )}
        
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          placeholder={placeholder}
          variant="search"
          size={size}
          className={cn(
            'flex-1',
            size === 'lg' && value === '' && 'terminal-cursor'
          )}
        />
        
        {showClearButton && value && (
          <button
            onClick={onClear}
            className="ml-2 text-gray-500 hover:text-accent transition-colors"
            type="button"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

SearchBarComponent.displayName = 'SearchBar';

export const SearchBar = memo(SearchBarComponent);