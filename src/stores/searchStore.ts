import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Extension } from '@/types';
import { searchExtensions, getSuggestions } from '@/utils/search';
import { debounce } from '@/utils/debounce';
import { SearchState, SearchActions } from './types';

// 초기 상태
const initialSearchState: SearchState = {
  query: '',
  suggestions: [],
  selectedSuggestionIndex: -1,
  isSearching: false,
  showSuggestions: false,
  showResults: false,
  filteredExtensions: [],
  debounceDelay: 300,
};

// 검색 스토어 타입
interface SearchStore extends SearchState, SearchActions {}

// Debounced 검색 함수를 스토어 외부에서 생성
let debouncedSearchFn: ((query: string, extensions: Extension[], suggestions: string[]) => void) | null = null;

export const useSearchStore = create<SearchStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => {
        // Debounced 검색 함수 초기화
        if (!debouncedSearchFn) {
          debouncedSearchFn = debounce((query: string, extensions: Extension[], suggestions: string[]) => {
            const filteredExtensions = searchExtensions(extensions, query);
            const filteredSuggestions = getSuggestions(query, suggestions);
            
            set((state) => {
              state.filteredExtensions = filteredExtensions;
              state.isSearching = false;
              
              // 결과가 표시 중이거나 억제 상태가 아닐 때만 제안 업데이트
              if (!state.showResults) {
                state.suggestions = filteredSuggestions;
                state.showSuggestions = filteredSuggestions.length > 0 && !!query;
              }
            });
          }, get().debounceDelay);
        }

        return {
          // 상태
          ...initialSearchState,

          // 액션들
          setQuery: (query: string) => {
            set((state) => {
              state.query = query;
              state.selectedSuggestionIndex = -1;
            });
          },

          setSuggestions: (suggestions: string[]) => {
            set((state) => {
              state.suggestions = suggestions;
            });
          },

          setSelectedSuggestionIndex: (index: number) => {
            set((state) => {
              state.selectedSuggestionIndex = index;
            });
          },

          setIsSearching: (isSearching: boolean) => {
            set((state) => {
              state.isSearching = isSearching;
            });
          },

          setShowSuggestions: (show: boolean) => {
            set((state) => {
              state.showSuggestions = show;
            });
          },

          setShowResults: (show: boolean) => {
            set((state) => {
              state.showResults = show;
            });
          },

          setFilteredExtensions: (extensions: Extension[]) => {
            set((state) => {
              state.filteredExtensions = extensions;
            });
          },

          handleSearchChange: (query: string) => {
            const _state = get();
            
            set((draft) => {
              draft.query = query;
              draft.selectedSuggestionIndex = -1;
              if (query) {
                draft.isSearching = true;
              } else {
                draft.suggestions = [];
                draft.showSuggestions = false;
                draft.isSearching = false;
              }
            });

            // 외부 데이터 필요 (extensions, suggestions)
            // 이는 나중에 AppStore에서 통합하여 처리
          },

          handleSuggestionSelect: (suggestion: string) => {
            set((state) => {
              state.query = suggestion;
              state.showSuggestions = false;
              state.selectedSuggestionIndex = -1;
              state.suggestions = [];
            });
          },

          handleKeyDown: (e: React.KeyboardEvent) => {
            const _state = get();
            const { suggestions, selectedSuggestionIndex } = _state;

            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                set((draft) => {
                  draft.selectedSuggestionIndex = Math.min(
                    selectedSuggestionIndex + 1,
                    suggestions.length - 1
                  );
                });
                break;

              case 'ArrowUp':
                e.preventDefault();
                set((draft) => {
                  draft.selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                });
                break;

              case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                  _state.handleSuggestionSelect(suggestions[selectedSuggestionIndex]!);
                }
                set((draft) => {
                  draft.showResults = true;
                  draft.showSuggestions = false;
                  draft.suggestions = [];
                });
                break;

              case 'Escape':
                set((draft) => {
                  draft.showSuggestions = false;
                  draft.selectedSuggestionIndex = -1;
                });
                break;
            }
          },

          handleShowResults: () => {
            set((state) => {
              state.showResults = true;
              state.showSuggestions = false;
            });
          },

          resetSearch: () => {
            set((state) => {
              Object.assign(state, initialSearchState);
            });
          },
        };
      })
    ),
    {
      name: 'search-store',
      partialize: (state) => ({
        query: state.query,
        debounceDelay: state.debounceDelay,
      }),
    }
  )
);