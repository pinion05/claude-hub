import React, { useState, useRef, useCallback } from 'react';
import { Extension } from '@/types';
import { SearchBar } from '@/components/molecules/SearchBar';
import { SuggestionList } from '@/components/molecules/SuggestionList';
import { SearchResults } from '@/components/molecules/SearchResults';
import { LiveRegion, StatusMessage } from '@/components/atoms/LiveRegion';
import { SkipToContent } from '@/components/atoms/VisuallyHidden';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useFocusManager } from '@/hooks/useFocusManager';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/utils/classNames';

interface AccessibleSearchSectionProps {
  extensions: Extension[];
  onExtensionClick: (extension: Extension) => void;
  initialQuery?: string;
  className?: string;
  variant?: 'default' | 'terminal' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFilters?: boolean;
}

/**
 * Fully accessible search section with keyboard navigation and ARIA support
 */
export function AccessibleSearchSection({
  extensions,
  onExtensionClick,
  initialQuery = '',
  className,
  variant = 'default',
  size = 'lg',
  showFilters = true
}: AccessibleSearchSectionProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [_selectedSuggestionIndex, _setSelectedSuggestionIndex] = useState(-1);
  const [announceMessage, setAnnounceMessage] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search functionality
  const {
    query,
    suggestions,
    filteredExtensions,
    isSearching: isLoading,
    handleSearchChange,
    handleSuggestionSelect
  } = useSearch({
    extensions,
    suggestions: [],
    debounceDelay: 300,
    initialQuery
  });

  // Focus management
  const { focusElement } = useFocusManager({
    autoFocus: false,
    restoreFocus: true
  });

  // Keyboard navigation for suggestions
  const {
    activeIndex: activeSuggestionIndex,
    handleKeyDown: _handleSuggestionKeyDown,
    moveNext: moveToNextSuggestion,
    movePrevious: moveToPreviousSuggestion,
    selectActive: selectActiveSuggestion,
    setActiveIndex: setSuggestionIndex
  } = useKeyboardNavigation(suggestions.length, {
    onSelect: (index) => {
      if (suggestions[index]) {
        handleSearchChange(suggestions[index]);
        setIsSearchFocused(false);
        announceToScreenReader(`Selected suggestion: ${suggestions[index]}`);
      }
    },
    onEscape: () => {
      setIsSearchFocused(false);
      focusElement(searchInputRef.current);
    }
  });

  // Announce messages to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    setAnnounceMessage(message);
    setTimeout(() => setAnnounceMessage(''), 1000);
  }, []);

  // Handle search input changes
  const handleSearchInputChange = useCallback((value: string) => {
    handleSearchChange(value);
    if (value.length > 0 && !isSearchFocused) {
      setIsSearchFocused(true);
    }
  }, [handleSearchChange, isSearchFocused]);

  // Handle search input key events
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { key } = e;

    // Handle suggestions navigation
    if (isSearchFocused && suggestions.length > 0) {
      switch (key) {
        case 'ArrowDown':
          e.preventDefault();
          moveToNextSuggestion();
          announceToScreenReader(`Suggestion ${activeSuggestionIndex + 1} of ${suggestions.length}: ${suggestions[activeSuggestionIndex + 1] || suggestions[0]}`);
          break;

        case 'ArrowUp':
          e.preventDefault();
          moveToPreviousSuggestion();
          const prevIndex = activeSuggestionIndex - 1;
          const suggestion = prevIndex >= 0 ? suggestions[prevIndex] : suggestions[suggestions.length - 1];
          announceToScreenReader(`Suggestion ${prevIndex >= 0 ? prevIndex + 1 : suggestions.length} of ${suggestions.length}: ${suggestion}`);
          break;

        case 'Enter':
          if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
            e.preventDefault();
            selectActiveSuggestion();
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsSearchFocused(false);
          setSuggestionIndex(-1);
          break;

        case 'Tab':
          // Close suggestions on tab
          setIsSearchFocused(false);
          break;
      }
    }

    // Global keyboard shortcuts
    if (key === '/' && !isSearchFocused) {
      e.preventDefault();
      focusElement(searchInputRef.current);
      announceToScreenReader('Search focused');
    }
  }, [
    isSearchFocused,
    suggestions,
    activeSuggestionIndex,
    moveToNextSuggestion,
    moveToPreviousSuggestion,
    selectActiveSuggestion,
    setSuggestionIndex,
    focusElement,
    announceToScreenReader
  ]);

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    if (query.length > 0 && suggestions.length > 0) {
      announceToScreenReader(`${suggestions.length} suggestions available. Use arrow keys to navigate.`);
    }
  }, [query.length, suggestions.length, announceToScreenReader]);

  // Handle search input blur
  const handleSearchBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setIsSearchFocused(false);
      setSuggestionIndex(-1);
    }, 150);
  }, [setSuggestionIndex]);

  // Handle suggestion selection
  const handleSuggestionSelection = useCallback((suggestion: string) => {
    handleSuggestionSelect(suggestion);
    setIsSearchFocused(false);
    focusElement(searchInputRef.current);
    announceToScreenReader(`Search updated to: ${suggestion}`);
  }, [handleSuggestionSelect, focusElement, announceToScreenReader]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    handleSearchChange('');
    setIsSearchFocused(false);
    focusElement(searchInputRef.current);
    announceToScreenReader('Search cleared');
  }, [handleSearchChange, focusElement, announceToScreenReader]);

  const showSuggestions = isSearchFocused && suggestions.length > 0 && query.length > 0;
  const hasResults = filteredExtensions.length > 0;
  const showResults = query.length > 0 || filteredExtensions.length > 0;

  return (
    <section 
      className={cn('relative space-y-6', className)}
      role="search"
      aria-label="Extension search"
    >
      {/* Skip link for keyboard navigation */}
      <SkipToContent targetId="search-results">
        Skip to search results
      </SkipToContent>

      {/* Live regions for announcements */}
      {announceMessage && (
        <StatusMessage>
          {announceMessage}
        </StatusMessage>
      )}

      <LiveRegion>
        {isLoading ? 'Searching...' : 
         hasResults ? `${filteredExtensions.length} extensions found` : 
         query ? 'No extensions found' : ''}
      </LiveRegion>

      {/* Search input section */}
      <div className="relative">
        <SearchBar
          ref={searchInputRef}
          value={query}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchKeyDown}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onClear={handleClearSearch}
          variant={variant}
          size={size}
          loading={isLoading}
          placeholder="Search extensions..."
          aria-label="Search for Claude AI extensions"
          aria-describedby="search-help"
          isExpanded={showSuggestions}
          resultCount={filteredExtensions.length}
          hasResults={hasResults}
        />

        {/* Search help text */}
        <div id="search-help" className="sr-only">
          {showSuggestions 
            ? `${suggestions.length} suggestions available. Use arrow keys to navigate, Enter to select, Escape to close.`
            : 'Type to search extensions. Use / key to focus search from anywhere.'
          }
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2">
            <SuggestionList
              suggestions={suggestions}
              onSelect={handleSuggestionSelection}
            />
          </div>
        )}
      </div>

      {/* Search results */}
      {showResults && (
        <div id="search-results" tabIndex={-1}>
          <SearchResults
            extensions={filteredExtensions}
            loading={isLoading}
            query={query}
            onExtensionClick={onExtensionClick}
            showFilters={showFilters}
            variant="grid"
          />
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="sr-only" role="complementary" aria-label="Keyboard shortcuts">
        <h3>Keyboard shortcuts:</h3>
        <ul>
          <li>/ - Focus search from anywhere</li>
          <li>Arrow keys - Navigate suggestions</li>
          <li>Enter - Select suggestion or extension</li>
          <li>Escape - Close suggestions</li>
          <li>Tab - Move to next element</li>
        </ul>
      </div>
    </section>
  );
}