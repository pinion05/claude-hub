export interface Extension {
  id: number;
  name: string;
  description: string;
  category: ExtensionCategory;
  repoUrl: string;
  tags?: string[];
  stars?: number;
  lastUpdated?: string;
  author?: string;
  downloads?: number;
  version?: string;
}

export type ExtensionCategory = 
  | 'Development' 
  | 'API' 
  | 'Browser' 
  | 'Productivity' 
  | 'Terminal' 
  | 'Data' 
  | 'Mobile' 
  | 'DevOps' 
  | 'CMS' 
  | 'E-commerce' 
  | 'Education';

export interface SearchState {
  query: string;
  suggestions: string[];
  selectedSuggestionIndex: number;
  isSearching: boolean;
  showSuggestions: boolean;
  showResults: boolean;
}

export interface UIState {
  isSearchSticky: boolean;
  searchSectionHeight: number;
  selectedExtension: Extension | null;
}

export interface FilterOptions {
  category?: ExtensionCategory;
  sortBy?: 'name' | 'stars' | 'downloads' | 'lastUpdated' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}