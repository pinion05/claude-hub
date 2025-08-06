'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Extension } from '@/types';
import { ExtensionCard } from '@/components/molecules/ExtensionCard';

interface VirtualizedGridProps {
  extensions: Extension[];
  onExtensionClick: (extension: Extension) => void;
  isLoading?: boolean;
  searchQuery?: string;
  itemHeight?: number;
  containerHeight?: number;
  columns?: number;
}

/**
 * High-performance virtualized grid for large extension lists
 * Only renders visible items to improve performance with thousands of extensions
 */
export const VirtualizedGrid = React.memo<VirtualizedGridProps>(({
  extensions,
  onExtensionClick,
  isLoading = false,
  searchQuery = '',
  itemHeight = 320,
  containerHeight = 600,
  columns = 3
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate visible range
  const { startIndex, totalHeight, visibleItems } = useMemo(() => {
    if (extensions.length === 0) {
      return { startIndex: 0, totalHeight: 0, visibleItems: [] };
    }

    const rowHeight = itemHeight + 24; // item height + gap
    const totalRows = Math.ceil(extensions.length / columns);
    const totalHeightCalc = totalRows * rowHeight;
    
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerSize.height) / rowHeight)
    );
    
    const startIdx = startRow * columns;
    const endIdx = Math.min(extensions.length - 1, (endRow + 1) * columns - 1);
    
    const visibleItems = extensions.slice(startIdx, endIdx + 1);
    
    return {
      startIndex: startIdx,
      endIndex: endIdx,
      totalHeight: totalHeightCalc,
      visibleItems
    };
  }, [extensions, scrollTop, containerSize.height, itemHeight, columns]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized item renderer
  const renderItem = useCallback((extension: Extension, index: number) => {
    const row = Math.floor((startIndex + index) / columns);
    const col = (startIndex + index) % columns;
    const top = row * (itemHeight + 24);
    const leftPercent = col * (100 / columns);
    const widthPercent = 100 / columns;
    
    return (
      <div
        key={extension.id}
        className="absolute"
        style={{
          top: `${top}px`,
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          height: `${itemHeight}px`,
          paddingRight: col < columns - 1 ? '12px' : '0',
          paddingBottom: '24px'
        }}
      >
        <ExtensionCard
          extension={extension}
          onClick={onExtensionClick}
        />
      </div>
    );
  }, [startIndex, columns, itemHeight, onExtensionClick]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-lg p-6 animate-pulse"
            style={{ height: `${itemHeight}px` }}
          >
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (extensions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No extensions found</h3>
        <p className="text-gray-400">
          {searchQuery 
            ? `No results for "${searchQuery}". Try different keywords.`
            : 'No extensions available at the moment.'
          }
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      style={{ height: `${containerHeight}px` }}
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{ height: `${totalHeight}px` }}
      >
        {visibleItems.map((extension, index) => renderItem(extension, index))}
      </div>
    </div>
  );
});

VirtualizedGrid.displayName = 'VirtualizedGrid';