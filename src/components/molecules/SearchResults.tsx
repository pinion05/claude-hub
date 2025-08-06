import React, { useEffect } from 'react';
import { Extension } from '@/types';
import { ExtensionCard } from './ExtensionCard';
import { Skeleton } from '@/components/atoms/Skeleton';
import { LiveRegion, StatusMessage } from '@/components/atoms/LiveRegion';
import { ScreenReaderOnly } from '@/components/atoms/VisuallyHidden';
import { cn } from '@/utils/classNames';

interface SearchResultsProps {
  extensions: Extension[];
  loading: boolean;
  query: string;
  onExtensionClick: (extension: Extension) => void;
  className?: string;
  emptyStateMessage?: string;
  showFilters?: boolean;
  variant?: 'grid' | 'list';
}

/**
 * SearchResults component with enhanced accessibility
 * Includes ARIA live regions for dynamic content updates
 */
export function SearchResults({
  extensions,
  loading,
  query,
  onExtensionClick,
  className,
  emptyStateMessage,
  showFilters = false,
  variant = 'grid'
}: SearchResultsProps) {
  const [previousResultsCount, setPreviousResultsCount] = React.useState<number | null>(null);
  const [announceResults, setAnnounceResults] = React.useState(false);

  // Update results count and trigger announcement
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (!loading && previousResultsCount !== null && previousResultsCount !== extensions.length) {
      setAnnounceResults(true);
      timer = setTimeout(() => setAnnounceResults(false), 100);
    }
    if (!loading) {
      setPreviousResultsCount(extensions.length);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [extensions.length, loading, previousResultsCount]);

  // Generate status message for screen readers
  const getStatusMessage = () => {
    if (loading) {
      return `Searching for "${query}"...`;
    }
    
    if (extensions.length === 0 && query) {
      return `No results found for "${query}". Try different search terms.`;
    }
    
    if (extensions.length > 0) {
      return `${extensions.length} ${extensions.length === 1 ? 'extension' : 'extensions'} found${query ? ` for "${query}"` : ''}`;
    }
    
    return '';
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <LiveRegion>
          Searching for extensions...
        </LiveRegion>
        
        <div 
          className={cn(
            variant === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          )}
          role="status"
          aria-label="Loading search results"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="p-6 bg-card rounded-xl border border-border">
              <div className="flex items-start gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (extensions.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <StatusMessage>
          {getStatusMessage()}
        </StatusMessage>
        
        <div 
          className="mx-auto max-w-md"
          role="status"
          aria-live="polite"
        >
          <div className="text-6xl mb-4 opacity-50">🔍</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {query ? `No results for "${query}"` : 'No extensions found'}
          </h2>
          <p className="text-foreground/70 mb-6">
            {emptyStateMessage || 
             (query 
               ? "Try adjusting your search terms or browse all extensions."
               : "Start by searching for extensions or browse by category."
             )}
          </p>
          
          {query && (
            <div className="space-y-2 text-sm text-foreground/60">
              <p>Suggestions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spelling</li>
                <li>Try different keywords</li>
                <li>Use more general terms</li>
                <li>Browse by category instead</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results announcement for screen readers */}
      {announceResults && (
        <StatusMessage>
          {getStatusMessage()}
        </StatusMessage>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {query ? `Search Results for "${query}"` : 'All Extensions'}
          </h2>
          <p className="text-sm text-foreground/70" role="status">
            {extensions.length} {extensions.length === 1 ? 'extension' : 'extensions'} found
          </p>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            {/* Filter controls would go here */}
            <ScreenReaderOnly>
              Filters and sorting options available
            </ScreenReaderOnly>
          </div>
        )}
      </div>

      {/* Results grid/list */}
      <div 
        className={cn(
          variant === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        )}
        role="feed"
        aria-label={`Extension search results${query ? ` for ${query}` : ''}`}
        aria-busy={loading}
      >
        {extensions.map((extension, index) => (
          <div
            key={extension.id}
            role="article"
            aria-posinset={index + 1}
            aria-setsize={extensions.length}
          >
            <ExtensionCard
              extension={extension}
              onClick={onExtensionClick}
              index={index}
              variant={variant === 'list' ? 'compact' : 'default'}
            />
          </div>
        ))}
      </div>

      {/* Additional navigation hints for screen readers */}
      <ScreenReaderOnly>
        <p>
          Use Tab to navigate through extensions, Enter or Space to view details.
          Use arrow keys for faster navigation when focused on an extension.
        </p>
      </ScreenReaderOnly>
    </div>
  );
}