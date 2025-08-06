// 통합 스토어
export { useAppStore } from './appStore';

// 개별 스토어 (필요시 사용)
export { useSearchStore } from './searchStore';
export { useUIStore } from './uiStore';
export { useFilterStore } from './filterStore';
export { useAppDataStore } from './appDataStore';

// 타입들
export type * from './types';

// 선택적 구독을 위한 셀렉터들
export const searchSelectors = {
  // 검색 관련 상태만 선택
  search: (state: any) => ({
    query: state.query,
    suggestions: state.suggestions,
    selectedSuggestionIndex: state.selectedSuggestionIndex,
    isSearching: state.isSearching,
    showSuggestions: state.showSuggestions,
    showResults: state.showResults,
    filteredExtensions: state.filteredExtensions,
  }),
  
  // 검색 액션만 선택
  searchActions: (state: any) => ({
    handleSearchChange: state.handleSearchChange,
    handleSuggestionSelect: state.handleSuggestionSelect,
    handleKeyDown: state.handleKeyDown,
    handleShowResults: state.handleShowResults,
    resetSearch: state.resetSearch,
  }),
};

export const uiSelectors = {
  // UI 상태만 선택
  ui: (state: any) => ({
    isSearchSticky: state.isSearchSticky,
    searchSectionHeight: state.searchSectionHeight,
    selectedExtension: state.selectedExtension,
    modalOpen: state.modalOpen,
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
  }),
  
  // UI 액션만 선택
  uiActions: (state: any) => ({
    setSearchSticky: state.setSearchSticky,
    setSearchSectionHeight: state.setSearchSectionHeight,
    setSelectedExtension: state.setSelectedExtension,
    setModalOpen: state.setModalOpen,
    setTheme: state.setTheme,
    setSidebarOpen: state.setSidebarOpen,
    toggleModal: state.toggleModal,
    toggleSidebar: state.toggleSidebar,
  }),
};

export const filterSelectors = {
  // 필터 상태만 선택
  filter: (state: any) => ({
    category: state.category,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    tags: state.tags,
    minStars: state.minStars,
    dateRange: state.dateRange,
  }),
  
  // 필터 액션만 선택
  filterActions: (state: any) => ({
    setCategory: state.setCategory,
    setSortBy: state.setSortBy,
    setSortOrder: state.setSortOrder,
    setTags: state.setTags,
    setMinStars: state.setMinStars,
    setDateRange: state.setDateRange,
    addTag: state.addTag,
    removeTag: state.removeTag,
    resetFilters: state.resetFilters,
  }),
};