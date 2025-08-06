import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Extension, SearchState } from '@/types';
import { searchExtensions, getSuggestions } from '@/utils/search';
import { debounce } from '@/utils/debounce';

interface UseSearchProps {
  extensions: Extension[];
  suggestions: string[];
  debounceDelay?: number;
  initialQuery?: string;
}

interface UseSearchReturn extends SearchState {
  filteredExtensions: Extension[];
  handleSearchChange: (query: string) => void;
  handleSuggestionSelect: (suggestion: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleShowResults: () => void;
  resetSearch: () => void;
}

export const useSearch = ({
  extensions,
  suggestions,
  debounceDelay = 300,
  initialQuery = ''
}: UseSearchProps): UseSearchReturn => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: initialQuery,
    suggestions: [],
    selectedSuggestionIndex: -1,
    isSearching: false,
    showSuggestions: false,
    showResults: false
  });

  const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>(extensions);
  
  // Flag to prevent showing suggestions after selection
  const suppressSuggestionsRef = useRef(false);
  
  // Use refs to track values without causing re-renders
  const currentQueryRef = useRef(searchState.query);
  const currentExtensionsRef = useRef(extensions);
  const currentSuggestionsRef = useRef(suggestions);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((query: string, exts: Extension[]) => {
      const results = searchExtensions(exts, query);
      setFilteredExtensions(results);
      setSearchState(prev => ({ ...prev, isSearching: false }));
    }, debounceDelay),
    [debounceDelay]
  );

  // Update refs when values change
  useEffect(() => {
    currentQueryRef.current = searchState.query;
  }, [searchState.query]);

  useEffect(() => {
    currentExtensionsRef.current = extensions;
  }, [extensions]);

  useEffect(() => {
    currentSuggestionsRef.current = suggestions;
  }, [suggestions]);

  // Handle search logic
  useEffect(() => {
    const query = currentQueryRef.current;
    const exts = currentExtensionsRef.current;
    const suggs = currentSuggestionsRef.current;
    
    if (!query) {
      setFilteredExtensions(exts);
      setSearchState(prev => ({
        ...prev,
        suggestions: [],
        showSuggestions: false,
        isSearching: false
      }));
    } else {
      setSearchState(prev => ({ ...prev, isSearching: true }));
      debouncedSearch(query, exts);
      
      // Only show suggestions if we're not suppressing them
      setSearchState(prev => {
        if (prev.showResults || suppressSuggestionsRef.current) {
          return prev; // Don't update suggestions when results are showing or suppressed
        }
        
        const filteredSuggestions = getSuggestions(query, suggs);
        return {
          ...prev,
          suggestions: filteredSuggestions,
          showSuggestions: filteredSuggestions.length > 0
        };
      });
    }
  }, [searchState.query, debouncedSearch]);

  const handleSearchChange = useCallback((query: string) => {
    suppressSuggestionsRef.current = false; // Reset suppression when search changes
    setSearchState(prev => ({
      ...prev,
      query,
      selectedSuggestionIndex: -1
    }));
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    suppressSuggestionsRef.current = true; // Suppress suggestions after selection
    setSearchState(prev => ({
      ...prev,
      query: suggestion,
      showSuggestions: false,
      selectedSuggestionIndex: -1,
      suggestions: [] // Clear suggestions when one is selected
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
        suppressSuggestionsRef.current = true; // Suppress suggestions when showing results
        setSearchState(prev => ({
          ...prev,
          showResults: true,
          showSuggestions: false,
          suggestions: [] // Clear suggestions when showing results
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