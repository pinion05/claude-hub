import React from 'react';
import { Extension } from '@/types';
import { ExtensionCard } from '@/components/molecules/ExtensionCard';
import { Skeleton } from '@/components/atoms/Skeleton';
import { cn } from '@/utils/classNames';

export interface ExtensionGridProps {
  extensions: Extension[];
  onExtensionClick: (extension: Extension) => void;
  isLoading?: boolean;
  searchQuery?: string;
  className?: string;
}

export const ExtensionGrid: React.FC<ExtensionGridProps> = ({
  extensions,
  onExtensionClick,
  isLoading = false,
  searchQuery = '',
  className
}) => {
  const renderSkeletons = () => (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`skeleton-${index}`} className="bg-card border border-border rounded-lg p-6">
          <Skeleton variant="text" height="24px" width="70%" className="mb-2" />
          <Skeleton variant="text" height="16px" className="mb-1" />
          <Skeleton variant="text" height="16px" width="90%" className="mb-4" />
          <Skeleton variant="rectangular" height="24px" width="80px" />
        </div>
      ))}
    </>
  );

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {renderSkeletons()}
      </div>
    );
  }

  if (extensions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-mono">
          {searchQuery ? `No extensions found for "${searchQuery}"` : 'No extensions available'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {extensions.map((extension, index) => (
        <ExtensionCard
          key={extension.id}
          extension={extension}
          onClick={onExtensionClick}
          index={index}
        />
      ))}
    </div>
  );
};