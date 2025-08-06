'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { Extension } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { CategoryIcon } from '@/components/atoms/CategoryIcon';
import { cn } from '@/utils/classNames';

export interface OptimizedExtensionCardProps {
  extension: Extension;
  onClick: (extension: Extension) => void;
  index?: number;
  searchQuery?: string;
  isPriority?: boolean;
}

/**
 * High-performance ExtensionCard with search highlighting and optimized rendering
 */
const OptimizedExtensionCard = memo<OptimizedExtensionCardProps>(({
  extension,
  onClick,
  index = 0,
  searchQuery = '',
  isPriority = false
}) => {
  // Memoized click handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    onClick(extension);
  }, [onClick, extension]);

  // Memoized keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(extension);
    }
  }, [onClick, extension]);

  // Memoized search highlighting
  const highlightedText = useMemo(() => {
    if (!searchQuery) return null;
    
    const highlightText = (text: string, query: string) => {
      if (!query) return text;
      
      const regex = new RegExp('(' + query + ')', 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-accent/20 text-accent rounded px-1">
            {part}
          </mark>
        ) : part
      );
    };

    return {
      name: highlightText(extension.name, searchQuery),
      description: highlightText(extension.description, searchQuery),
    };
  }, [extension.name, extension.description, searchQuery]);

  // Memoized stats calculation
  const stats = useMemo(() => {
    const items = [];
    
    if (extension.stars) {
      const starsLabel = extension.stars >= 1000 
        ? Math.round(extension.stars / 100) / 10 + 'k'
        : extension.stars.toString();
      items.push({
        label: starsLabel,
        icon: '⭐',
        value: extension.stars
      });
    }
    
    if (extension.downloads) {
      const downloadsLabel = extension.downloads >= 1000
        ? Math.round(extension.downloads / 100) / 10 + 'k'
        : extension.downloads.toString();
      items.push({
        label: downloadsLabel,
        icon: '📥',
        value: extension.downloads
      });
    }

    return items;
  }, [extension.stars, extension.downloads]);

  // Memoized category badge
  const categoryBadge = useMemo(() => (
    <Badge variant="default" size="sm" className="text-xs">
      {extension.category}
    </Badge>
  ), [extension.category]);

  // Animation delay calculation
  const animationDelay = useMemo(() => 
    isPriority ? '0ms' : Math.min(index * 50, 500) + 'ms'
  , [index, isPriority]);

  return (
    <article
      className={cn(
        'card-3d bg-card border border-border rounded-lg p-6',
        'cursor-pointer hover:border-accent/50 hover:glow-coral',
        'transition-all duration-200 transform hover:scale-[1.02]',
        'opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]',
        'will-change-transform' // Optimize for animations
      )}
      style={{ 
        animationDelay: animationDelay,
        // Use transform3d for GPU acceleration
        transform: 'translate3d(0, 0, 0)',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={'View details for ' + extension.name}
    >
      <div className="flex flex-col h-full">
        {/* Header section */}
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <CategoryIcon 
              category={extension.category} 
              className="text-2xl mt-1 flex-shrink-0" 
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-accent line-clamp-1 break-words">
                {highlightedText?.name || extension.name}
              </h3>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2 break-words">
            {highlightedText?.description || extension.description}
          </p>
        </div>

        {/* Footer section */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          {categoryBadge}
          
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {stats.map((stat, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="opacity-70">{stat.icon}</span>
                <span className="font-mono">{stat.label}</span>
              </span>
            ))}
            
            {/* Last updated indicator */}
            {extension.lastUpdated && (
              <span className="flex items-center gap-1">
                <span className="opacity-70">🕒</span>
                <time 
                  dateTime={extension.lastUpdated}
                  className="font-mono"
                >
                  {new Date(extension.lastUpdated).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </time>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

// Set display name for debugging
OptimizedExtensionCard.displayName = 'OptimizedExtensionCard';

export default OptimizedExtensionCard;