import React, { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'search';
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-14 px-6 text-base'
    };

    const variantClasses = {
      default: 'bg-card border border-border',
      search: 'bg-transparent'
    };

    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg outline-none font-mono placeholder-gray-500',
          'transition-all duration-200',
          'focus:ring-2 focus:ring-accent/20',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';