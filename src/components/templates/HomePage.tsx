'use client';

import React, { useRef, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Extension, ExtensionCategory } from '@/types';
import { Header } from '@/components/organisms/Header';
import { SearchSection } from '@/components/organisms/SearchSection';
import { ExtensionGrid } from '@/components/organisms/ExtensionGrid';
import { CategoryFilter } from '@/components/molecules/CategoryFilter';
import { useSearch } from '@/hooks/useSearch';
import { useScrollSticky } from '@/hooks/useScrollSticky';
import { useModal } from '@/hooks/useModal';
import { categoryLabels } from '@/data/categories';
import { Skeleton } from '@/components/atoms/Skeleton';

// Lazy load ExtensionModal since it's not immediately needed
const ExtensionModal = lazy(() => import('@/components/organisms/ExtensionModal').then(module => ({
  default: module.ExtensionModal
})));

/**
 * HomePage Props
 * @property {Extension[]} extensions - List of all available extensions
 * @property {string[]} suggestions - Search suggestions for autocomplete
 */
export interface HomePageProps {
  extensions: Extension[];
  suggestions: string[];
}

/**
 * HomePage Component
 * 
 * Main landing page component that handles search, filtering, and display of Claude extensions.
 * Features two view modes: initial centered search and results view with sticky header.
 * 
 * @component
 * @param {HomePageProps} props - Component props
 * @returns {JSX.Element} Rendered HomePage
 */
export const HomePage: React.FC<HomePageProps> = ({
  extensions,
  suggestions
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExtensionCategory | 'all'>('all');
  
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

  // Get unique categories from extensions
  const categories = useMemo(() => {
    const uniqueCategories = new Set(extensions.map(ext => ext.category));
    return Array.from(uniqueCategories).sort();
  }, [extensions]);

  // Count extensions per category
  const categoryExtensionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    extensions.forEach(ext => {
      counts[ext.category] = (counts[ext.category] || 0) + 1;
    });
    return counts;
  }, [extensions]);

  // Apply category filter to search results
  const categoryFilteredExtensions = useMemo(() => {
    if (selectedCategory === 'all') {
      return filteredExtensions;
    }
    return filteredExtensions.filter(ext => ext.category === selectedCategory);
  }, [filteredExtensions, selectedCategory]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSuggestionSelect(suggestion);
    handleShowResults();
  }, [handleSuggestionSelect, handleShowResults]);

  const handleSearchFocus = useCallback(() => {
    if (query && filteredSuggestions.length > 0) {
      // Re-show suggestions on focus if there's a query
    }
  }, [query, filteredSuggestions.length]);

  const handleLogoClick = useCallback(() => {
    resetSearch();
    searchInputRef.current?.focus();
  }, [resetSearch]);

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
              <h2 className="text-3xl font-bold mb-2">
                {selectedCategory === 'all' ? 'All Extensions' : `${categoryLabels[selectedCategory]} Extensions`}
              </h2>
              <p className="text-gray-400">
                {query ? 
                  `${categoryFilteredExtensions.length} results for "${query}"` : 
                  `${categoryFilteredExtensions.length} extensions available`
                }
              </p>
            </div>
            
            {/* Category Filter for initial view */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories as ExtensionCategory[]}
              extensionCounts={categoryExtensionCounts}
            />
            
            <ExtensionGrid
              extensions={categoryFilteredExtensions}
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
              <h2 className="text-3xl font-bold mb-2">
                {selectedCategory === 'all' ? 'All Extensions' : `${categoryLabels[selectedCategory]} Extensions`}
              </h2>
              <p className="text-gray-400">
                {query ? 
                  `${categoryFilteredExtensions.length} results for "${query}"` : 
                  `${categoryFilteredExtensions.length} extensions available`
                }
              </p>
            </div>
            
            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories as ExtensionCategory[]}
              extensionCounts={categoryExtensionCounts}
            />
            
            <ExtensionGrid
              extensions={categoryFilteredExtensions}
              onExtensionClick={extensionModal.open}
              isLoading={isSearching}
              searchQuery={query}
            />
          </div>
        </main>
      )}
      
      {/* Extension details modal - lazy loaded */}
      <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><Skeleton className="w-96 h-96" /></div>}>
        <ExtensionModal
          extension={extensionModal.data}
          isOpen={extensionModal.isOpen}
          onClose={extensionModal.close}
        />
      </Suspense>
    </div>
  );
};