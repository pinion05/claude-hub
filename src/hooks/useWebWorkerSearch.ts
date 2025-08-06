'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Extension } from '@/types';

interface SearchState {
  results: Extension[];
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
}

interface UseWebWorkerSearchReturn extends SearchState {
  search: (query: string) => void;
  getSuggestions: (query: string) => void;
  filterAndSort: (options: FilterOptions) => void;
  clearResults: () => void;
}

interface FilterOptions {
  category?: string;
  sortBy?: 'name' | 'stars' | 'downloads' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

/**
 * High-performance search hook using Web Workers
 * Offloads heavy search computations from the main thread
 */
export function useWebWorkerSearch(extensions: Extension[]): UseWebWorkerSearchReturn {
  const [state, setState] = useState<SearchState>({
    results: extensions,
    suggestions: [],
    isLoading: false,
    error: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        workerRef.current = new Worker('/workers/search-worker.js');
        
        workerRef.current.onmessage = (e) => {
          const { type, payload } = e.data;
          
          switch (type) {
            case 'SEARCH_RESULTS':
              setState(prev => ({
                ...prev,
                results: payload,
                isLoading: false,
                error: null,
              }));
              break;
              
            case 'SUGGESTIONS_RESULTS':
              setState(prev => ({
                ...prev,
                suggestions: payload,
                error: null,
              }));
              break;
              
            case 'FILTER_SORT_RESULTS':
              setState(prev => ({
                ...prev,
                results: payload,
                isLoading: false,
                error: null,
              }));
              break;
              
            case 'ERROR':
              setState(prev => ({
                ...prev,
                isLoading: false,
                error: payload,
              }));
              break;
              
            case 'WORKER_READY':
              console.log('Search worker is ready');
              break;
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Search worker error:', error);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Search worker failed',
          }));
        };
      } catch (error) {
        console.error('Failed to create search worker:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  // Search function with debouncing
  const search = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (!query.trim()) {
        setState(prev => ({
          ...prev,
          results: extensions,
          isLoading: false,
        }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'SEARCH',
          payload: { query, items: extensions }
        });
      } else {
        // Fallback to main thread search
        const normalizedQuery = query.toLowerCase();
        const results = extensions.filter(ext =>
          ext.name.toLowerCase().includes(normalizedQuery) ||
          ext.description.toLowerCase().includes(normalizedQuery) ||
          ext.category.toLowerCase().includes(normalizedQuery)
        );
        
        setState(prev => ({
          ...prev,
          results,
          isLoading: false,
        }));
      }
    }, 300); // 300ms debounce
  }, [extensions]);

  // Get suggestions with debouncing
  const getSuggestions = useCallback((query: string) => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    suggestionsTimeoutRef.current = setTimeout(() => {
      if (!query.trim() || query.length < 2) {
        setState(prev => ({ ...prev, suggestions: [] }));
        return;
      }

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'SUGGESTIONS',
          payload: { query, items: extensions }
        });
      } else {
        // Fallback to simple suggestions
        const normalizedQuery = query.toLowerCase();
        const suggestions = Array.from(new Set(
          extensions
            .filter(ext => ext.name.toLowerCase().includes(normalizedQuery))
            .map(ext => ext.name)
            .slice(0, 5)
        ));
        
        setState(prev => ({ ...prev, suggestions }));
      }
    }, 150); // 150ms debounce for suggestions
  }, [extensions]);

  // Filter and sort function
  const filterAndSort = useCallback((options: FilterOptions) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'FILTER_SORT',
        payload: { items: extensions, options }
      });
    } else {
      // Fallback to main thread filtering
      let filtered = [...extensions];
      
      if (options.category && options.category !== 'All') {
        filtered = filtered.filter(item => item.category === options.category);
      }
      
      if (options.sortBy) {
        filtered.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (options.sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'stars':
              aValue = a.stars || 0;
              bValue = b.stars || 0;
              break;
            case 'downloads':
              aValue = a.downloads || 0;
              bValue = b.downloads || 0;
              break;
            case 'lastUpdated':
              aValue = new Date(a.lastUpdated || 0);
              bValue = new Date(b.lastUpdated || 0);
              break;
            default:
              return 0;
          }
          
          if (options.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }
      
      setState(prev => ({
        ...prev,
        results: filtered,
        isLoading: false,
      }));
    }
  }, [extensions]);

  // Clear results
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: extensions,
      suggestions: [],
      isLoading: false,
      error: null,
    }));
  }, [extensions]);

  return {
    ...state,
    search,
    getSuggestions,
    filterAndSort,
    clearResults,
  };
}