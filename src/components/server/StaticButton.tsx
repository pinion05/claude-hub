import React from 'react';
import { cn } from '@/utils/classNames';

type StaticButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
};

type StaticButtonAsButton = StaticButtonBaseProps & 
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
  };

type StaticButtonAsAnchor = StaticButtonBaseProps & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: 'a';
  };

export type StaticButtonProps = StaticButtonAsButton | StaticButtonAsAnchor;

/**
 * Server Component version of Button for static rendering
 * Use this for buttons that don't need client-side interaction
 * For interactive buttons, use the regular Button component
 */
export function StaticButton({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  as = 'button', 
  ...props 
}: StaticButtonProps) {
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
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}