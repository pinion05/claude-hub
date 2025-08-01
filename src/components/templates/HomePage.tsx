'use client';

import React, { useRef } from 'react';
import { Extension } from '@/types';
import { Header } from '@/components/organisms/Header';
import { SearchSection } from '@/components/organisms/SearchSection';
import { ExtensionGrid } from '@/components/organisms/ExtensionGrid';
import { ExtensionModal } from '@/components/organisms/ExtensionModal';
import { useSearch } from '@/hooks/useSearch';
import { useScrollSticky } from '@/hooks/useScrollSticky';
import { useModal } from '@/hooks/useModal';

export interface HomePageProps {
  extensions: Extension[];
  suggestions: string[];
}

export const HomePage: React.FC<HomePageProps> = ({
  extensions,
  suggestions
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    query,
    showSuggestions,
    suggestions: filteredSuggestions,
    selectedSuggestionIndex,
    showResults,
    isSearching,
    filteredExtensions,
    handleSearchChange,
    handleSuggestionSelect,
    handleKeyDown,
    handleShowResults,
    resetSearch
  } = useSearch({
    extensions,
    suggestions,
    debounceDelay: 300
  });

  const { isSticky, sectionHeight, sectionRef } = useScrollSticky({
    threshold: 200,
    enabled: !showResults
  });

  const extensionModal = useModal<Extension>();

  const handleSuggestionClick = (suggestion: string) => {
    handleSuggestionSelect(suggestion);
    handleShowResults();
  };

  const handleSearchFocus = () => {
    if (query && filteredSuggestions.length > 0) {
      // Re-show suggestions on focus if there's a query
    }
  };

  const handleLogoClick = () => {
    resetSearch();
    searchInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - only visible when showing results */}
      {showResults && (
        <Header
          ref={searchInputRef}
          searchQuery={query}
          onSearchChange={handleSearchChange}
          onSearchKeyDown={handleKeyDown}
          onSearchFocus={handleSearchFocus}
          onSearchClear={resetSearch}
          onLogoClick={handleLogoClick}
          showSuggestions={showSuggestions}
          suggestions={filteredSuggestions}
          selectedSuggestionIndex={selectedSuggestionIndex}
          onSuggestionSelect={handleSuggestionClick}
        />
      )}
      
      {/* Main content */}
      {!showResults ? (
        <div className="min-h-screen">
          {/* Search section with sticky behavior */}
          <div style={{ height: isSticky && sectionHeight ? `${sectionHeight}px` : 'auto' }}>
            <SearchSection
              ref={searchInputRef}
              searchQuery={query}
              onSearchChange={handleSearchChange}
              onSearchKeyDown={handleKeyDown}
              onSearchFocus={handleSearchFocus}
              onSearchClear={resetSearch}
              onLogoClick={handleLogoClick}
              showSuggestions={showSuggestions}
              suggestions={filteredSuggestions}
              selectedSuggestionIndex={selectedSuggestionIndex}
              onSuggestionSelect={handleSuggestionClick}
              isSticky={isSticky}
              sectionRef={sectionRef}
            />
          </div>
          
          {/* Initial extension grid */}
          <div className="max-w-6xl mx-auto px-6 pb-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">All Extensions</h2>
              <p className="text-gray-400">
                {query ? 
                  `${filteredExtensions.length} results for "${query}"` : 
                  `${filteredExtensions.length} extensions available`
                }
              </p>
            </div>
            
            <ExtensionGrid
              extensions={filteredExtensions}
              onExtensionClick={extensionModal.open}
              isLoading={isSearching}
              searchQuery={query}
            />
          </div>
        </div>
      ) : (
        /* Results view */
        <main className="pt-24 pb-12 animate-[fadeIn_0.3s_ease-out]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">All Extensions</h2>
              <p className="text-gray-400">
                {query ? 
                  `${filteredExtensions.length} results for "${query}"` : 
                  `${filteredExtensions.length} extensions available`
                }
              </p>
            </div>
            
            <ExtensionGrid
              extensions={filteredExtensions}
              onExtensionClick={extensionModal.open}
              isLoading={isSearching}
              searchQuery={query}
            />
          </div>
        </main>
      )}
      
      {/* Extension details modal */}
      <ExtensionModal
        extension={extensionModal.data}
        isOpen={extensionModal.isOpen}
        onClose={extensionModal.close}
      />
    </div>
  );
};