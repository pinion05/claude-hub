export interface Extension {
  id: number;
  name: string;
  description: string;
  category: ExtensionCategory;
  repoUrl: string;
  githubUrl: string;
  author: string;
  tags?: string[];
  stars?: number;
  lastUpdated?: string;
  downloads?: number;
  version?: string;
  highlights?: string[];
  rank?: number;
  commitActivity?: CommitActivity;
}

export interface CommitActivity {
  lastCommit?: string;
  commitsLastMonth?: number;
  commitsLastWeek?: number;
  activityLevel?: 'very-active' | 'active' | 'moderate' | 'low' | 'inactive';
}

export type ExtensionCategory = 
  | 'ide-integration'
  | 'agents-orchestration'
  | 'monitoring-analytics'
  | 'proxy-routing'
  | 'resources-guides'
  | 'gui-desktop'
  | 'integration-extension'
  | 'advanced-features'
  | 'utilities';

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
  sortBy?: 'name' | 'stars' | 'downloads' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}