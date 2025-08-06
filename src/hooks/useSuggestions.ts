import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { suggestionAPI, mockAPI } from '@/lib/api';

// 모든 제안 조회
export const useSuggestions = () => {
  return useQuery({
    queryKey: queryKeys.suggestions.list(),
    queryFn: () => suggestionAPI.getAll(),
    select: (data) => data.suggestions,
    staleTime: 30 * 60 * 1000, // 30분
  });
};

// Mock 제안 데이터 조회 (정적 데이터)
export const useSuggestionsMock = () => {
  return useQuery({
    queryKey: queryKeys.suggestions.all,
    queryFn: mockAPI.getSuggestions,
    staleTime: Infinity, // 정적 데이터이므로 무한 캐시
    gcTime: Infinity,
  });
};

// 검색 제안 조회
export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: queryKeys.suggestions.search(query),
    queryFn: () => suggestionAPI.search(query),
    enabled: !!query.trim(),
    select: (data) => data.suggestions,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 제안 필터링 훅 (클라이언트 사이드)
export const useFilteredSuggestions = (suggestions: string[], query: string) => {
  return useQuery({
    queryKey: ['filtered-suggestions', query, suggestions],
    queryFn: async () => {
      if (!query.trim() || !suggestions.length) return [];
      
      const { getSuggestions } = await import('@/utils/search');
      return getSuggestions(query, suggestions);
    },
    enabled: !!query.trim() && suggestions.length > 0,
    staleTime: 1 * 60 * 1000, // 1분
  });
};