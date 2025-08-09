import React, { memo } from 'react';
import { Skeleton } from '@/components/atoms/Skeleton';
import { cn } from '@/utils/classNames';

interface LoadingStateProps {
  variant?: 'grid' | 'list' | 'card' | 'text';
  count?: number;
  className?: string;
}

const LoadingStateComponent: React.FC<LoadingStateProps> = ({
  variant = 'grid',
  count = 6,
  className
}) => {
  if (variant === 'grid') {
    return (
      <div className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-32 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  // Text variant
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
};

export const LoadingState = memo(LoadingStateComponent);