import React, { forwardRef, memo } from 'react';
import { cn } from '@/utils/classNames';

type ButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
};

type ButtonAsButton = ButtonBaseProps & 
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
  };

type ButtonAsAnchor = ButtonBaseProps & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'a';
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const ButtonComponent = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({ className, variant = 'primary', size = 'md', children, as = 'button', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    };

    const variantClasses = {
      primary: 'bg-accent text-white hover:bg-accent/80',
      secondary: 'bg-card border border-border hover:border-accent/50',
      ghost: 'hover:bg-accent/10',
      link: 'text-accent hover:underline p-0 h-auto'
    };

    const classes = cn(
      'inline-flex items-center justify-center rounded-lg font-mono',
      'transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variant !== 'link' && sizeClasses[size],
      variantClasses[variant],
      className
    );

    if (as === 'a') {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);

ButtonComponent.displayName = 'Button';

export const Button = memo(ButtonComponent);