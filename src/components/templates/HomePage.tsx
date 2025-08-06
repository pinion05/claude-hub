'use client';

import React, { useRef } from 'react';
import { Extension } from '@/types';
import { Header } from '@/components/organisms/Header';
import { SearchSection } from '@/components/organisms/SearchSection';
import { ExtensionGrid } from '@/components/organisms/ExtensionGrid';
import { ExtensionModal } from '@/components/organisms/ExtensionModal';
import { useAppStore } from '@/stores';
import { useScrollSticky } from '@/hooks/useScrollSticky';

export interface HomePageProps {
  // Props가 더 이상 필요하지 않음 - 스토어에서 관리
  className?: string;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // 스토어에서 상태와 액션 직접 가져오기
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
    resetSearch,
    selectedExtension,
    modalOpen,
    isSearchSticky,
    setSelectedExtension,
    setModalOpen,
    setSearchSticky,
    setSearchSectionHeight
  } = useAppStore();

  const { isSticky, sectionHeight, sectionRef } = useScrollSticky({
    threshold: 200,
    enabled: !showResults
  });

  // 스티키 상태를 스토어에 동기화
  React.useEffect(() => {
    if (isSticky !== isSearchSticky) {
      setSearchSticky(isSticky);
    }
    if (sectionHeight) {
      setSearchSectionHeight(sectionHeight);
    }
  }, [isSticky, sectionHeight, isSearchSticky, setSearchSticky, setSearchSectionHeight]);

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

  const handleExtensionClick = (extension: Extension) => {
    setSelectedExtension(extension);
  };

  const handleModalClose = () => {
    setModalOpen(false);
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
              onExtensionClick={handleExtensionClick}
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
              onExtensionClick={handleExtensionClick}
              isLoading={isSearching}
              searchQuery={query}
            />
          </div>
        </main>
      )}
      
      {/* Extension details modal */}
      <ExtensionModal
        extension={selectedExtension}
        isOpen={modalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};