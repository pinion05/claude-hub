import { QueryClient } from '@tanstack/react-query';

// Query Client 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 캐시 유지
      staleTime: 5 * 60 * 1000,
      // 5분간 inactive 상태에서도 캐시 유지
      gcTime: 5 * 60 * 1000,
      // 재시도 정책
      retry: (failureCount, error) => {
        // 404나 403 같은 클라이언트 에러는 재시도 안함
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        // 최대 3회까지 재시도
        return failureCount < 3;
      },
      // 네트워크 재연결 시 자동 refetch
      refetchOnReconnect: 'always',
      // 윈도우 포커스 시 refetch (개발 시에만)
      refetchOnWindowFocus: process.env.NODE_ENV === 'development',
    },
    mutations: {
      // 뮤테이션 재시도 정책
      retry: 1,
    },
  },
});

// Query Keys 상수 정의 (타입 안전한 쿼리 키)
export const queryKeys = {
  // Extension 관련
  extensions: {
    all: ['extensions'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.extensions.all, 'list', filters] as const,
    detail: (id: number) => 
      [...queryKeys.extensions.all, 'detail', id] as const,
    search: (query: string, filters?: Record<string, any>) => 
      [...queryKeys.extensions.all, 'search', query, filters] as const,
  },
  
  // Suggestion 관련
  suggestions: {
    all: ['suggestions'] as const,
    list: () => [...queryKeys.suggestions.all, 'list'] as const,
    search: (query: string) => 
      [...queryKeys.suggestions.all, 'search', query] as const,
  },
  
  // Category 관련
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },
  
  // Analytics 관련 (미래 확장)
  analytics: {
    all: ['analytics'] as const,
    popular: (timeframe: string) => 
      [...queryKeys.analytics.all, 'popular', timeframe] as const,
    trending: () => [...queryKeys.analytics.all, 'trending'] as const,
  },
} as const;

// Error handling 유틸리티
export const handleQueryError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
};