import { Extension, ExtensionCategory } from '@/types';

// 검색 상태 인터페이스
export interface SearchState {
  query: string;
  suggestions: string[];
  selectedSuggestionIndex: number;
  isSearching: boolean;
  showSuggestions: boolean;
  showResults: boolean;
  filteredExtensions: Extension[];
  debounceDelay: number;
}

// 검색 액션 인터페이스
export interface SearchActions {
  setQuery: (query: string) => void;
  setSuggestions: (suggestions: string[]) => void;
  setSelectedSuggestionIndex: (index: number) => void;
  setIsSearching: (isSearching: boolean) => void;
  setShowSuggestions: (show: boolean) => void;
  setShowResults: (show: boolean) => void;
  setFilteredExtensions: (extensions: Extension[]) => void;
  handleSearchChange: (query: string) => void;
  handleSuggestionSelect: (suggestion: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleShowResults: () => void;
  resetSearch: () => void;
}

// UI 상태 인터페이스
export interface UIState {
  isSearchSticky: boolean;
  searchSectionHeight: number;
  selectedExtension: Extension | null;
  modalOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
}

// UI 액션 인터페이스
export interface UIActions {
  setSearchSticky: (sticky: boolean) => void;
  setSearchSectionHeight: (height: number) => void;
  setSelectedExtension: (extension: Extension | null) => void;
  setModalOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  toggleModal: () => void;
  toggleSidebar: () => void;
}

// 필터 상태 인터페이스
export interface FilterState {
  category?: ExtensionCategory;
  sortBy: 'name' | 'stars' | 'downloads' | 'lastUpdated';
  sortOrder: 'asc' | 'desc';
  tags: string[];
  minStars: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 필터 액션 인터페이스
export interface FilterActions {
  setCategory: (category?: ExtensionCategory) => void;
  setSortBy: (sortBy: 'name' | 'stars' | 'downloads' | 'lastUpdated') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setTags: (tags: string[]) => void;
  setMinStars: (stars: number) => void;
  setDateRange: (range?: { start: Date; end: Date }) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  resetFilters: () => void;
}

// 앱 데이터 상태 인터페이스
export interface AppDataState {
  extensions: Extension[];
  suggestions: string[];
  categories: ExtensionCategory[];
  isLoading: boolean;
  error: string | null;
}

// 앱 데이터 액션 인터페이스
export interface AppDataActions {
  setExtensions: (extensions: Extension[]) => void;
  setSuggestionsList: (suggestions: string[]) => void;
  setCategories: (categories: ExtensionCategory[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadExtensions: () => Promise<void>;
  loadSuggestions: () => Promise<void>;
}

// 전체 스토어 타입
export interface AppStore extends 
  SearchState, 
  SearchActions,
  UIState,
  UIActions,
  FilterState,
  FilterActions,
  AppDataState,
  AppDataActions {}