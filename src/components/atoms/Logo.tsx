import React from 'react';
import { cn } from '@/utils/classNames';

export interface LogoProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  return (
    <h1
      className={cn(
        'font-bold text-accent',
        'cursor-pointer select-none',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      Claude Hub
    </h1>
  );
};