import React from 'react';
import { cn } from '@/utils/classNames';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'image';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'skeleton' | 'none';
  lines?: number; // For text variant
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  gradient?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
  lines = 1,
  rounded,
  gradient = false,
  style,
  ...props
}) => {
  const variantClasses = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
    avatar: 'rounded-full',
    image: 'rounded-lg'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md', 
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const animationClasses = {
    pulse: 'animate-pulse-medium',
    wave: 'animate-shimmer',
    shimmer: 'animate-shimmer-accent',
    skeleton: 'animate-skeleton',
    none: ''
  };

  const defaultDimensions = {
    text: { width: '100%', height: '1em' },
    circular: { width: '40px', height: '40px' },
    rectangular: { width: '100%', height: '100px' },
    card: { width: '100%', height: '200px' },
    avatar: { width: '48px', height: '48px' },
    image: { width: '100%', height: '160px' }
  };

  const finalWidth = width || defaultDimensions[variant].width;
  const finalHeight = height || defaultDimensions[variant].height;
  const finalRounded = rounded || variantClasses[variant];

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-surface-2',
              gradient && 'bg-gradient-to-r from-surface-1 via-surface-2 to-surface-1',
              finalRounded,
              animationClasses[animation],
              // Make last line shorter for more realistic appearance
              i === lines - 1 && 'w-3/4'
            )}
            style={{
              width: i === lines - 1 ? '75%' : finalWidth,
              height: finalHeight,
              animationDelay: `${i * 150}ms`
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-surface-2 relative overflow-hidden',
        gradient && 'bg-gradient-to-r from-surface-1 via-surface-2 to-surface-1',
        rounded ? roundedClasses[rounded] : finalRounded,
        animationClasses[animation],
        className
      )}
      style={{
        width: finalWidth,
        height: finalHeight,
        ...style
      }}
      {...props}
    >
      {/* Enhanced shimmer overlay for better effect */}
      {animation === 'shimmer' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
      )}
      
      {/* Pulse glow effect */}
      {animation === 'pulse' && (
        <div className="absolute inset-0 bg-accent/5 animate-pulse-glow" />
      )}
      
      {/* Wave effect */}
      {animation === 'wave' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-shimmer-reverse" />
      )}
    </div>
  );
};

// Skeleton Card Component for complex layouts
export const SkeletonCard: React.FC<{
  className?: string;
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
  actions?: boolean;
}> = ({
  className,
  showAvatar = false,
  showImage = false,
  lines = 2,
  actions = false
}) => {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      {/* Header with avatar */}
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton variant="avatar" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="120px" height="16px" />
            <Skeleton variant="text" width="80px" height="14px" />
          </div>
        </div>
      )}

      {/* Image */}
      {showImage && (
        <Skeleton variant="image" height="200px" />
      )}

      {/* Content lines */}
      <div className="space-y-2">
        <Skeleton variant="text" height="20px" width="90%" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text" 
            height="16px"
            width={i === lines - 1 ? "70%" : "100%"}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex space-x-2 pt-2">
          <Skeleton variant="rectangular" width="80px" height="32px" />
          <Skeleton variant="rectangular" width="100px" height="32px" />
        </div>
      )}
    </div>
  );
};