import React from 'react';
import { Extension } from '@/types';
import { ExtensionCard } from '@/components/molecules/ExtensionCard';
import { LoadingState } from '@/components/molecules/LoadingState';
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
  if (isLoading) {
    return <LoadingState variant="grid" count={6} {...(className && { className })} />;
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