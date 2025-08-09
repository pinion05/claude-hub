import { useState, useEffect, useCallback, useMemo } from 'react';
import { Extension, SearchState } from '@/types';
import { searchExtensions, getSuggestions } from '@/utils/search';
import { debounce } from '@/utils/debounce';
import { API_LIMITS } from '@/constants/api';

/**
 * Props for useSearch hook
 * @interface UseSearchProps
 * @property {Extension[]} extensions - Available extensions to search through
 * @property {string[]} suggestions - Search suggestions for autocomplete
 * @property {number} [debounceDelay=300] - Milliseconds to wait before executing search
 */
interface UseSearchProps {
  extensions: Extension[];
  suggestions: string[];
  debounceDelay?: number;
}

/**
 * Return type for useSearch hook
 * @interface UseSearchReturn
 * @extends SearchState
 */
interface UseSearchReturn extends SearchState {
  filteredExtensions: Extension[];
  handleSearchChange: (query: string) => void;
  handleSuggestionSelect: (suggestion: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleShowResults: () => void;
  resetSearch: () => void;
}

/**
 * Custom hook for managing search functionality
 * 
 * Handles search input, suggestions, keyboard navigation, and debounced filtering.
 * Integrates with extension data to provide real-time search results.
 * 
 * @param {UseSearchProps} props - Hook configuration
 * @returns {UseSearchReturn} Search state and handlers
 */
export const useSearch = ({
  extensions,
  suggestions,
  debounceDelay = API_LIMITS.SEARCH_DEBOUNCE
}: UseSearchProps): UseSearchReturn => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    suggestions: [],
    selectedSuggestionIndex: -1,
    isSearching: false,
    showSuggestions: false,
    showResults: false
  });

  const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>(extensions);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      const results = searchExtensions(extensions, query);
      setFilteredExtensions(results);
      setSearchState(prev => ({ ...prev, isSearching: false }));
    }, debounceDelay),
    [extensions, debounceDelay]
  );

  useEffect(() => {
    if (searchState.query) {
      setSearchState(prev => ({ ...prev, isSearching: true }));
      debouncedSearch(searchState.query);
      
      const filteredSuggestions = getSuggestions(searchState.query, suggestions);
      setSearchState(prev => ({
        ...prev,
        suggestions: filteredSuggestions,
        showSuggestions: filteredSuggestions.length > 0
      }));
    } else {
      setFilteredExtensions(extensions);
      setSearchState(prev => ({
        ...prev,
        suggestions: [],
        showSuggestions: false,
        isSearching: false
      }));
    }
  }, [searchState.query, extensions, suggestions, debouncedSearch]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      selectedSuggestionIndex: -1
    }));
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchState(prev => ({
      ...prev,
      query: suggestion,
      showSuggestions: false,
      selectedSuggestionIndex: -1
    }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { suggestions: currentSuggestions, selectedSuggestionIndex } = searchState;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSearchState(prev => ({
          ...prev,
          selectedSuggestionIndex: Math.min(
            prev.selectedSuggestionIndex + 1,
            currentSuggestions.length - 1
          )
        }));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSearchState(prev => ({
          ...prev,
          selectedSuggestionIndex: Math.max(prev.selectedSuggestionIndex - 1, -1)
        }));
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && currentSuggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(currentSuggestions[selectedSuggestionIndex]!);
        }
        setSearchState(prev => ({
          ...prev,
          showResults: true,
          showSuggestions: false
        }));
        break;

      case 'Escape':
        setSearchState(prev => ({
          ...prev,
          showSuggestions: false,
          selectedSuggestionIndex: -1
        }));
        break;
    }
  }, [searchState, handleSuggestionSelect]);

  const handleShowResults = useCallback(() => {
    setSearchState(prev => ({ ...prev, showResults: true }));
  }, []);

  const resetSearch = useCallback(() => {
    setSearchState({
      query: '',
      suggestions: [],
      selectedSuggestionIndex: -1,
      isSearching: false,
      showSuggestions: false,
      showResults: false
    });
    setFilteredExtensions(extensions);
  }, [extensions]);

  return {
    ...searchState,
    filteredExtensions,
    handleSearchChange,
    handleSuggestionSelect,
    handleKeyDown,
    handleShowResults,
    resetSearch
  };
};