import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Extension } from '@/types';
import { queryKeys } from '@/lib/query-client';
import { extensionAPI, mockAPI, SearchParams } from '@/lib/api';

// 모든 확장 조회
export const useExtensions = (params?: SearchParams) => {
  return useQuery({
    queryKey: queryKeys.extensions.list(params),
    queryFn: () => extensionAPI.getAll(params),
    select: (data) => data.extensions,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// Mock 확장 데이터 조회 (정적 데이터)
export const useExtensionsMock = () => {
  return useQuery({
    queryKey: queryKeys.extensions.all,
    queryFn: mockAPI.getExtensions,
    staleTime: Infinity, // 정적 데이터이므로 무한 캐시
    gcTime: Infinity,
  });
};

// 특정 확장 조회
export const useExtension = (id: number) => {
  return useQuery({
    queryKey: queryKeys.extensions.detail(id),
    queryFn: () => extensionAPI.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 확장 검색
export const useExtensionSearch = (query: string, params?: Omit<SearchParams, 'query'>) => {
  return useQuery({
    queryKey: queryKeys.extensions.search(query, params),
    queryFn: () => extensionAPI.search(query, params),
    enabled: !!query.trim(),
    select: (data) => data.extensions,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// Mock 확장 검색 (정적 데이터)
export const useExtensionSearchMock = (query: string, extensions: Extension[]) => {
  return useQuery({
    queryKey: queryKeys.extensions.search(query),
    queryFn: () => mockAPI.searchExtensions(query, extensions),
    enabled: !!query.trim() && extensions.length > 0,
    staleTime: 30 * 1000, // 30초
  });
};

// 인기 확장 조회
export const usePopularExtensions = (limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.analytics.popular('all-time'),
    queryFn: () => extensionAPI.getPopular(limit),
    staleTime: 30 * 60 * 1000, // 30분
  });
};

// 트렌딩 확장 조회
export const useTrendingExtensions = (limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.analytics.trending(),
    queryFn: () => extensionAPI.getTrending(limit),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 확장 데이터 prefetch 유틸리티
export const usePrefetchExtensions = () => {
  const queryClient = useQueryClient();
  
  const prefetchExtension = (id: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.extensions.detail(id),
      queryFn: () => extensionAPI.getById(id),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchSearch = (query: string, params?: Omit<SearchParams, 'query'>) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.extensions.search(query, params),
      queryFn: () => extensionAPI.search(query, params),
      staleTime: 2 * 60 * 1000,
    });
  };

  return { prefetchExtension, prefetchSearch };
};

// 확장 데이터 뮤테이션 (미래 확장용)
export const useExtensionMutations = () => {
  const queryClient = useQueryClient();

  // 확장 즐겨찾기 토글
  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: number; isFavorite: boolean }) => {
      // API 호출
      return { id, isFavorite: !isFavorite };
    },
    onMutate: async ({ id, isFavorite }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: queryKeys.extensions.detail(id) });
      
      const previousExtension = queryClient.getQueryData(queryKeys.extensions.detail(id));
      
      queryClient.setQueryData(queryKeys.extensions.detail(id), (old: Extension | undefined) => {
        if (!old) return old;
        return { ...old, isFavorite: !isFavorite };
      });

      return { previousExtension };
    },
    onError: (_err, variables, context) => {
      // 에러 시 이전 상태로 복원
      if (context?.previousExtension) {
        queryClient.setQueryData(queryKeys.extensions.detail(variables.id), context.previousExtension);
      }
    },
    onSettled: (_data, _error, variables) => {
      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.extensions.detail(variables.id) });
    },
  });

  // 확장 평점 등록
  const submitRating = useMutation({
    mutationFn: async ({ id, rating }: { id: number; rating: number }) => {
      // API 호출
      return { id, rating };
    },
    onSuccess: (data) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.extensions.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.extensions.list() });
    },
  });

  return {
    toggleFavorite,
    submitRating,
  };
};