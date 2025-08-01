import React, { memo } from 'react';
import { Extension } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/utils/classNames';

export interface ExtensionCardProps {
  extension: Extension;
  onClick: (extension: Extension) => void;
  index?: number;
}

export const ExtensionCard = memo<ExtensionCardProps>(({
  extension,
  onClick,
  index = 0
}) => {
  return (
    <article
      className={cn(
        'card-3d bg-card border border-border rounded-lg p-6',
        'cursor-pointer hover:border-accent/50 hover:glow-coral',
        'transition-all duration-200',
        'opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]'
      )}
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
      onClick={() => onClick(extension)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(extension);
        }
      }}
      aria-label={`View details for ${extension.name}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-accent line-clamp-1">
            {extension.name}
          </h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {extension.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <Badge variant="accent" size="sm">
            {extension.category}
          </Badge>
          
          {extension.stars && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>⭐</span>
              <span>{extension.stars.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});

ExtensionCard.displayName = 'ExtensionCard';