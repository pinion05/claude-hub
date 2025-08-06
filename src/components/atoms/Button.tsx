import React, { forwardRef } from 'react';
import { cn } from '@/utils/classNames';

type ButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link' | 'glass' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
  animation?: 'none' | 'bounce' | 'pulse' | 'wiggle' | 'float';
};

type ButtonAsButton = ButtonBaseProps & 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
    as?: 'button';
    disabled?: boolean;
  };

type ButtonAsAnchor = ButtonBaseProps & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'a';
    disabled?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  as = 'button', 
  loading = false,
  leftIcon,
  rightIcon,
  glow = false,
  animation = 'none',
  disabled,
  ...props 
}, ref) => {
  const sizeClasses = {
    xs: 'h-6 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg'
  };

  const variantClasses = {
    primary: [
      'bg-accent text-white border border-transparent',
      'hover:bg-accent-hover active:bg-accent-active',
      'shadow-md hover:shadow-lg active:shadow-sm',
      'hover:-translate-y-0.5 active:translate-y-0',
      'focus-accent'
    ].join(' '),
    secondary: [
      'bg-card border border-border text-foreground',
      'hover:border-accent hover:bg-surface-1',
      'active:bg-surface-2',
      'shadow-sm hover:shadow-md',
      'focus-accent'
    ].join(' '),
    ghost: [
      'bg-transparent border border-transparent text-foreground',
      'hover:bg-surface-1 hover:border-border',
      'active:bg-surface-2',
      'focus-accent'
    ].join(' '),
    glass: [
      'glass backdrop-blur-lg text-foreground',
      'hover:bg-glass-medium active:bg-glass-heavy',
      'shadow-glass-light hover:shadow-glass-medium',
      'focus-accent'
    ].join(' '),
    gradient: [
      'bg-gradient-to-r from-accent to-info text-white border border-transparent',
      'hover:from-accent-hover hover:to-info shadow-glow-md',
      'active:scale-95',
      'focus-accent'
    ].join(' '),
    link: [
      'text-accent hover:text-accent-hover underline-offset-4',
      'hover:underline active:text-accent-active',
      'p-0 h-auto bg-transparent border-none shadow-none',
      'focus-accent'
    ].join(' ')
  };

  const animationClasses = {
    none: '',
    bounce: 'hover:animate-bounce-in',
    pulse: 'animate-pulse-medium',
    wiggle: 'hover:animate-wiggle',
    float: 'animate-float'
  };

  const classes = cn(
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'font-mono font-medium',
    'rounded-xl transition-all duration-300 ease-out',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'relative overflow-hidden',
    
    // Size styles
    variant !== 'link' && sizeClasses[size],
    
    // Variant styles
    variantClasses[variant],
    
    // Glow effect
    glow && !disabled && 'glow-accent hover:shadow-glow-lg',
    
    // Animation
    !disabled && animationClasses[animation],
    
    // Loading state
    loading && 'cursor-wait',
    
    className
  );

  const content = (
    <>
      {loading && (
        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {!loading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span className={cn(
        'flex-1 truncate',
        loading && 'opacity-70'
      )}>
        {children}
      </span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
      
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 -z-10 bg-white/20 transform scale-0 transition-transform duration-300 rounded-xl group-active:scale-100" />
    </>
  );

  if (as === 'a') {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cn(classes, 'group')}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(classes, 'group')}
      disabled={disabled || loading}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';