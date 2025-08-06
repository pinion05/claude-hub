'use client';

import React, { useState, useTransition, useCallback } from 'react';
import { Extension } from '@/types';
import { Header } from '@/components/organisms/Header';
import { SearchSection } from '@/components/organisms/SearchSection';
import { ExtensionGrid } from '@/components/organisms/ExtensionGrid';
import { ExtensionModal } from '@/components/organisms/ExtensionModal';
import { searchExtensions, getSuggestions } from '@/lib/server/actions';
import { useScrollSticky } from '@/hooks/useScrollSticky';
import { useModal } from '@/hooks/useModal';

interface SearchInterfaceProps {
  initialExtensions: Extension[];
  initialSuggestions: string[];
}

/**
 * Client Component that handles all search interactions
 * Contains the interactive parts that require client-side state
 */
export function SearchInterface({ 
  initialExtensions, 
  initialSuggestions: _initialSuggestions 
}: SearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [extensions, setExtensions] = useState(initialExtensions);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { isSticky, sectionHeight, sectionRef } = useScrollSticky({
    threshold: 200,
    enabled: !showResults
  });

  const extensionModal = useModal<Extension>();

  // Handle search input changes
  const handleSearchChange = useCallback(async (newQuery: string) => {
    setQuery(newQuery);
    setSelectedSuggestionIndex(-1);

    if (newQuery.trim()) {
      startTransition(async () => {
        try {
          const [searchResult, suggestionResult] = await Promise.all([
            searchExtensions(newQuery),
            getSuggestions(newQuery)
          ]);
          
          setExtensions(searchResult.extensions);
          setSuggestions(suggestionResult.suggestions);
          setShowSuggestions(suggestionResult.suggestions.length > 0);
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } else {
      setExtensions(initialExtensions);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [initialExtensions]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    startTransition(async () => {
      try {
        const result = await searchExtensions(suggestion);
        setExtensions(result.extensions);
      } catch (error) {
        console.error('Search error:', error);
      }
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          Math.min(prev + 1, suggestions.length - 1)
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => Math.max(prev - 1, -1));
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]!);
        }
        setShowResults(true);
        setShowSuggestions(false);
        break;

      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [suggestions, selectedSuggestionIndex, handleSuggestionSelect]);

  const handleShowResults = useCallback(() => {
    setShowResults(true);
  }, []);

  const resetSearch = useCallback(() => {
    setQuery('');
    setExtensions(initialExtensions);
    setSuggestions([]);
    setShowSuggestions(false);
    setShowResults(false);
    setSelectedSuggestionIndex(-1);
  }, [initialExtensions]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSuggestionSelect(suggestion);
    handleShowResults();
  }, [handleSuggestionSelect, handleShowResults]);

  const handleSearchFocus = useCallback(() => {
    if (query && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [query, suggestions]);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoClick = useCallback(() => {
    resetSearch();
    searchInputRef.current?.focus();
  }, [resetSearch]);

  return (
    <>
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
          suggestions={suggestions}
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
              suggestions={suggestions}
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
                  `${extensions.length} results for "${query}"` : 
                  `${extensions.length} extensions available`
                }
              </p>
            </div>
            
            <ExtensionGrid
              extensions={extensions}
              onExtensionClick={extensionModal.open}
              isLoading={isPending}
              searchQuery={query}
            />
          </div>
        </div>
      ) : (
        /* Results view */
        <main className="pt-24 pb-12 animate-[fadeIn_0.3s_ease-out]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Search Results</h2>
              <p className="text-gray-400">
                {query ? 
                  `${extensions.length} results for "${query}"` : 
                  `${extensions.length} extensions available`
                }
              </p>
            </div>
            
            <ExtensionGrid
              extensions={extensions}
              onExtensionClick={extensionModal.open}
              isLoading={isPending}
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
    </>
  );
}