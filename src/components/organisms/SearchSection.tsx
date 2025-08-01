import React, { forwardRef } from 'react';
import { Logo } from '@/components/atoms/Logo';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SuggestionList } from '@/components/molecules/SuggestionList';
import { cn } from '@/utils/classNames';

export interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent) => void;
  onSearchFocus: () => void;
  onSearchClear: () => void;
  onLogoClick: () => void;
  showSuggestions: boolean;
  suggestions: string[];
  selectedSuggestionIndex: number;
  onSuggestionSelect: (suggestion: string) => void;
  isSticky: boolean;
  sectionRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export const SearchSection = forwardRef<HTMLInputElement, SearchSectionProps>(({
  searchQuery,
  onSearchChange,
  onSearchKeyDown,
  onSearchFocus,
  onSearchClear,
  onLogoClick,
  showSuggestions,
  suggestions,
  selectedSuggestionIndex,
  onSuggestionSelect,
  isSticky,
  sectionRef,
  className
}, ref) => {
  return (
    <div
      ref={sectionRef}
      className={cn(
        isSticky && 'fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-50',
        className
      )}
    >
      <div className={cn(
        isSticky ? 'h-[73px] flex items-center border-b border-border' : 'pt-32 pb-16'
      )}>
        <div className={cn('w-full', isSticky && 'px-6')}>
          {!isSticky && (
            <div className="text-center mb-8">
              <Logo size="xl" onClick={onLogoClick} className="mb-4" />
              <p className="text-gray-400 text-lg">Discover extensions for Claude</p>
            </div>
          )}
          
          <div className={cn(
            isSticky ? 'max-w-6xl mx-auto flex items-center' : 'max-w-2xl mx-auto px-6'
          )}>
            {isSticky && (
              <Logo size="md" onClick={onLogoClick} className="mr-8 flex-shrink-0" />
            )}
            
            <div className={cn('relative', isSticky ? 'max-w-md' : '', 'w-full')}>
              <SearchBar
                ref={ref}
                value={searchQuery}
                onChange={onSearchChange}
                onKeyDown={onSearchKeyDown}
                onFocus={onSearchFocus}
                onClear={onSearchClear}
                placeholder="Search for Claude extensions..."
                size={isSticky ? 'md' : 'lg'}
                showPrompt
              />
              
              {showSuggestions && (
                <SuggestionList
                  suggestions={suggestions}
                  selectedIndex={selectedSuggestionIndex}
                  onSelect={onSuggestionSelect}
                  isCompact={isSticky}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SearchSection.displayName = 'SearchSection';