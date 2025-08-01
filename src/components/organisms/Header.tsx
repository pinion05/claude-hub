import React, { forwardRef } from 'react';
import { Logo } from '@/components/atoms/Logo';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SuggestionList } from '@/components/molecules/SuggestionList';
import { cn } from '@/utils/classNames';

export interface HeaderProps {
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
  className?: string;
}

export const Header = forwardRef<HTMLInputElement, HeaderProps>(({
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
  className
}, ref) => {
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0',
      'bg-background/95 backdrop-blur-sm z-50',
      'py-4 border-b border-border',
      'animate-[slideDown_0.3s_ease-out]',
      className
    )}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-8">
        <Logo size="md" onClick={onLogoClick} />
        
        <div className="relative w-full max-w-md">
          <SearchBar
            ref={ref}
            value={searchQuery}
            onChange={onSearchChange}
            onKeyDown={onSearchKeyDown}
            onFocus={onSearchFocus}
            onClear={onSearchClear}
            placeholder="Search extensions..."
            size="md"
            showPrompt
          />
          
          {showSuggestions && (
            <SuggestionList
              suggestions={suggestions}
              selectedIndex={selectedSuggestionIndex}
              onSelect={onSuggestionSelect}
              isCompact
            />
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';