import { Extension, ExtensionCategory } from '@/types';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// HTTP 클라이언트 유틸리티
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API 클라이언트 인스턴스
export const apiClient = new APIClient(API_BASE_URL);

// API Response 타입들
export interface ExtensionResponse {
  extensions: Extension[];
  total: number;
  page: number;
  limit: number;
}

export interface SuggestionResponse {
  suggestions: string[];
}

export interface SearchParams {
  query?: string;
  category?: ExtensionCategory;
  tags?: string[];
  minStars?: number;
  sortBy?: 'name' | 'stars' | 'downloads' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Extension API 함수들
export const extensionAPI = {
  // 모든 확장 조회
  getAll: async (params?: SearchParams): Promise<ExtensionResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/extensions${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<ExtensionResponse>(endpoint);
  },

  // 특정 확장 조회
  getById: async (id: number): Promise<Extension> => {
    return apiClient.get<Extension>(`/extensions/${id}`);
  },

  // 확장 검색
  search: async (query: string, params?: Omit<SearchParams, 'query'>): Promise<ExtensionResponse> => {
    const searchParams = new URLSearchParams({ query });
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }

    return apiClient.get<ExtensionResponse>(`/search?${searchParams.toString()}`);
  },

  // 인기 확장 조회
  getPopular: async (limit: number = 10): Promise<Extension[]> => {
    return apiClient.get<Extension[]>(`/extensions/popular?limit=${limit}`);
  },

  // 트렌딩 확장 조회
  getTrending: async (limit: number = 10): Promise<Extension[]> => {
    return apiClient.get<Extension[]>(`/extensions/trending?limit=${limit}`);
  },
};

// Suggestion API 함수들
export const suggestionAPI = {
  // 모든 제안 조회
  getAll: async (): Promise<SuggestionResponse> => {
    return apiClient.get<SuggestionResponse>('/suggestions');
  },

  // 검색 제안 조회
  search: async (query: string): Promise<SuggestionResponse> => {
    return apiClient.get<SuggestionResponse>(`/suggestions/search?q=${encodeURIComponent(query)}`);
  },
};

// Category API 함수들
export const categoryAPI = {
  // 모든 카테고리 조회
  getAll: async (): Promise<ExtensionCategory[]> => {
    return apiClient.get<ExtensionCategory[]>('/categories');
  },

  // 카테고리별 확장 수 조회
  getStats: async (): Promise<Record<ExtensionCategory, number>> => {
    return apiClient.get<Record<ExtensionCategory, number>>('/categories/stats');
  },
};

// Mock API 함수들 (정적 데이터 사용)
export const mockAPI = {
  // 확장 데이터 로드
  getExtensions: async (): Promise<Extension[]> => {
    // 정적 데이터를 비동기로 로드 (실제 API 호출 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 500));
    const { extensions } = await import('@/data/extensions');
    return extensions;
  },

  // 제안 데이터 로드
  getSuggestions: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const { suggestions } = await import('@/data/suggestions');
    return suggestions;
  },

  // 검색 수행
  searchExtensions: async (query: string, extensions: Extension[]): Promise<Extension[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const { searchExtensions } = await import('@/utils/search');
    return searchExtensions(extensions, query);
  },
};