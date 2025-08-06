import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Extension } from '@/types';
import { searchExtensions, getSuggestions } from '@/utils/search';
import { debounce } from '@/utils/debounce';
import { AppStore } from './types';

// 초기 상태
const initialState = {
  // Search State
  query: '',
  suggestions: [],
  selectedSuggestionIndex: -1,
  isSearching: false,
  showSuggestions: false,
  showResults: false,
  filteredExtensions: [],
  debounceDelay: 300,

  // UI State
  isSearchSticky: false,
  searchSectionHeight: 0,
  selectedExtension: null,
  modalOpen: false,
  theme: 'dark' as const,
  sidebarOpen: false,

  // Filter State
  category: undefined,
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
  tags: [],
  minStars: 0,
  dateRange: undefined,

  // App Data State
  extensions: [],
  suggestions: [],
  categories: [
    'Development',
    'API', 
    'Browser',
    'Productivity',
    'Terminal',
    'Data',
    'Mobile',
    'DevOps',
    'CMS',
    'E-commerce',
    'Education'
  ],
  isLoading: false,
  error: null,
} as const;

// Debounced 검색 함수
let debouncedSearch: ((query: string, extensions: Extension[], suggestions: string[]) => void) | null = null;

export const useAppStore = create<AppStore>()(
  devtools(
    immer((set, get) => {
      // Debounced 검색 함수 초기화
      if (!debouncedSearch) {
        debouncedSearch = debounce((query: string, extensions: Extension[], suggestionList: string[]) => {
          const state = get();
          
          // 필터 적용
          let filtered = extensions;
          
          // 카테고리 필터
          if (state.category) {
            filtered = filtered.filter(ext => ext.category === state.category);
          }

          // 태그 필터
          if (state.tags.length > 0) {
            filtered = filtered.filter(ext => 
              state.tags.some(tag => ext.tags?.includes(tag))
            );
          }

          // 최소 스타 필터
          if (state.minStars > 0) {
            filtered = filtered.filter(ext => (ext.stars ?? 0) >= state.minStars);
          }

          // 날짜 범위 필터
          if (state.dateRange) {
            filtered = filtered.filter(ext => {
              if (!ext.lastUpdated) return false;
              const date = new Date(ext.lastUpdated);
              return date >= state.dateRange!.start && date <= state.dateRange!.end;
            });
          }

          // 검색 적용
          if (query) {
            filtered = searchExtensions(filtered, query);
          }

          // 정렬 적용
          filtered = [...filtered].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (state.sortBy) {
              case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
              case 'stars':
                aValue = a.stars ?? 0;
                bValue = b.stars ?? 0;
                break;
              case 'downloads':
                aValue = a.downloads ?? 0;
                bValue = b.downloads ?? 0;
                break;
              case 'lastUpdated':
                aValue = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
                bValue = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
                break;
              default:
                return 0;
            }

            if (state.sortOrder === 'asc') {
              return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
          });

          const filteredSuggestions = getSuggestions(query, suggestionList);
          
          set((draft) => {
            draft.filteredExtensions = filtered;
            draft.isSearching = false;
            
            // 결과가 표시 중이 아닐 때만 제안 업데이트
            if (!draft.showResults && query) {
              draft.suggestions = filteredSuggestions;
              draft.showSuggestions = filteredSuggestions.length > 0;
            }
          });
        }, initialState.debounceDelay);
      }

      return {
        // 초기 상태
        ...initialState,

        // Search Actions
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
          const state = get();
          
          set((draft) => {
            draft.query = query;
            draft.selectedSuggestionIndex = -1;
            if (query) {
              draft.isSearching = true;
            } else {
              draft.suggestions = [];
              draft.showSuggestions = false;
              draft.isSearching = false;
              draft.filteredExtensions = state.extensions;
            }
          });

          if (debouncedSearch) {
            debouncedSearch(query, state.extensions, state.suggestions);
          }
        },

        handleSuggestionSelect: (suggestion: string) => {
          const state = get();
          
          set((draft) => {
            draft.query = suggestion;
            draft.showSuggestions = false;
            draft.selectedSuggestionIndex = -1;
            draft.suggestions = [];
            draft.isSearching = true;
          });

          if (debouncedSearch) {
            debouncedSearch(suggestion, state.extensions, state.suggestions);
          }
        },

        handleKeyDown: (e: React.KeyboardEvent) => {
          const state = get();
          const { suggestions, selectedSuggestionIndex } = state;

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
                state.handleSuggestionSelect(suggestions[selectedSuggestionIndex]!);
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
          set((draft) => {
            draft.showResults = true;
            draft.showSuggestions = false;
          });
        },

        resetSearch: () => {
          const state = get();
          set((draft) => {
            draft.query = '';
            draft.suggestions = [];
            draft.selectedSuggestionIndex = -1;
            draft.isSearching = false;
            draft.showSuggestions = false;
            draft.showResults = false;
            draft.filteredExtensions = state.extensions;
          });
        },

        // UI Actions
        setSearchSticky: (sticky: boolean) => {
          set((state) => {
            state.isSearchSticky = sticky;
          });
        },

        setSearchSectionHeight: (height: number) => {
          set((state) => {
            state.searchSectionHeight = height;
          });
        },

        setSelectedExtension: (extension: Extension | null) => {
          set((state) => {
            state.selectedExtension = extension;
            if (extension) {
              state.modalOpen = true;
            }
          });
        },

        setModalOpen: (open: boolean) => {
          set((state) => {
            state.modalOpen = open;
            if (!open) {
              state.selectedExtension = null;
            }
          });
        },

        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set((state) => {
            state.theme = theme;
          });

          // 시스템 테마 적용 로직
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', systemTheme === 'dark');
          } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }
        },

        setSidebarOpen: (open: boolean) => {
          set((state) => {
            state.sidebarOpen = open;
          });
        },

        toggleModal: () => {
          const state = get();
          set((draft) => {
            draft.modalOpen = !state.modalOpen;
            if (!draft.modalOpen) {
              draft.selectedExtension = null;
            }
          });
        },

        toggleSidebar: () => {
          const state = get();
          set((draft) => {
            draft.sidebarOpen = !state.sidebarOpen;
          });
        },

        // Filter Actions
        setCategory: (category) => {
          const state = get();
          set((draft) => {
            draft.category = category;
          });
          
          // 필터 변경 시 검색 재실행
          if (debouncedSearch) {
            debouncedSearch(state.query, state.extensions, state.suggestions);
          }
        },

        setSortBy: (sortBy) => {
          const state = get();
          set((draft) => {
            draft.sortBy = sortBy;
          });
          
          if (debouncedSearch) {
            debouncedSearch(state.query, state.extensions, state.suggestions);
          }
        },

        setSortOrder: (order) => {
          const state = get();
          set((draft) => {
            draft.sortOrder = order;
          });
          
          if (debouncedSearch) {
            debouncedSearch(state.query, state.extensions, state.suggestions);
          }
        },

        setTags: (tags) => {
          const state = get();
          set((draft) => {
            draft.tags = tags;
          });
          
          if (debouncedSearch) {
            debouncedSearch(state.query, state.extensions, state.suggestions);
          }
        },

        setMinStars: (stars) => {
          const state = get();
          set((draft) => {
            draft.minStars = Math.max(0, stars);
          });
          
          if (debouncedSearch) {
            debouncedSearch(state.query, state.extensions, state.suggestions);
          }
        },

        setDateRange: (range) => {
          const state = get();
          set((draft) => {
            draft.dateRange = range;
          });
          
          if (debouncedSearch) {
            debouncedSearch(state.query, state.extensions, state.suggestions);
          }
        },

        addTag: (tag: string) => {
          const state = get();
          if (!state.tags.includes(tag)) {
            set((draft) => {
              draft.tags.push(tag);
            });
            
            if (debouncedSearch) {
              debouncedSearch(state.query, state.extensions, state.suggestions);
            }
          }
        },

        removeTag: (tag: string) => {
          const state = get();
          set((draft) => {
            draft.tags = draft.tags.filter(t => t !== tag);
          });
          
          if (debouncedSearch) {
            debouncedSearch(state.query, state.extensions, state.suggestions);
          }
        },

        resetFilters: () => {
          const state = get();
          set((draft) => {
            draft.category = undefined;
            draft.sortBy = 'name';
            draft.sortOrder = 'asc';
            draft.tags = [];
            draft.minStars = 0;
            draft.dateRange = undefined;
          });
          
          if (debouncedSearch) {
            debouncedSearch(state.query, state.extensions, state.suggestions);
          }
        },

        // App Data Actions
        setExtensions: (extensions: Extension[]) => {
          set((state) => {
            state.extensions = extensions;
            if (!state.query) {
              state.filteredExtensions = extensions;
            }
          });
        },

        setSuggestionsList: (suggestions: string[]) => {
          set((state) => {
            state.suggestions = suggestions;
          });
        },

        setCategories: (categories) => {
          set((state) => {
            state.categories = categories;
          });
        },

        setIsLoading: (loading: boolean) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
          });
        },

        loadExtensions: async () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            // API 호출 대신 정적 데이터 로드
            const { extensions } = await import('@/data/extensions');
            
            set((state) => {
              state.extensions = extensions;
              state.filteredExtensions = extensions;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Extensions 로드 실패';
              state.isLoading = false;
            });
          }
        },

        loadSuggestions: async () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            // API 호출 대신 정적 데이터 로드
            const { suggestions } = await import('@/data/suggestions');
            
            set((state) => {
              state.suggestions = suggestions;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Suggestions 로드 실패';
              state.isLoading = false;
            });
          }
        },
      };
    }),
    {
      name: 'app-store',
    }
  )
);