import { GraphQLError } from 'graphql';
import { 
  getAllExtensions, 
  getExtensionById, 
  getExtensionsByCategory,
  searchExtensions,
  getSearchSuggestions,
  getFilteredSuggestions,
  getFeaturedExtensions,
  getExtensionStats,
  filterExtensions
} from '@/lib/server/data';
import type { 
  GraphQLContext, 
  Bookmark, 
  Review, 
  UserPreferences 
} from '@/lib/api/types';
import type { Extension, ExtensionCategory } from '@/types';

// 헬퍼 함수들
function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return context.user;
}

function requireAdmin(context: GraphQLContext) {
  const user = requireAuth(context);
  if (user.role !== 'admin') {
    throw new GraphQLError('Admin privileges required', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
  return user;
}

// Connection 헬퍼 함수
function createConnection<T>(
  items: T[],
  first: number = 20,
  after?: string,
  getId: (item: T) => string = (item: any) => item.id?.toString()
) {
  const startIndex = after ? 
    items.findIndex(item => getId(item) === after) + 1 : 
    0;
  
  const endIndex = startIndex + first;
  const selectedItems = items.slice(startIndex, endIndex);
  
  return {
    edges: selectedItems.map(item => ({
      node: item,
      cursor: getId(item),
    })),
    pageInfo: {
      hasNextPage: endIndex < items.length,
      hasPreviousPage: startIndex > 0,
      startCursor: selectedItems.length > 0 ? getId(selectedItems[0]) : null,
      endCursor: selectedItems.length > 0 ? getId(selectedItems[selectedItems.length - 1]) : null,
    },
    totalCount: items.length,
  };
}

// GraphQL enum을 내부 enum으로 변환
function mapExtensionCategory(category: string): ExtensionCategory {
  const mapping: Record<string, ExtensionCategory> = {
    DEVELOPMENT: 'Development',
    API: 'API',
    BROWSER: 'Browser',
    PRODUCTIVITY: 'Productivity',
    TERMINAL: 'Terminal',
    DATA: 'Data',
    MOBILE: 'Mobile',
    DEVOPS: 'DevOps',
    CMS: 'CMS',
    E_COMMERCE: 'E-commerce',
    EDUCATION: 'Education',
  };
  return mapping[category] || 'Development';
}

// Resolvers 정의
export const resolvers = {
  // 스칼라 타입 리졸버
  Date: {
    serialize: (value: Date | string) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    },
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value),
  },

  // Query 리졸버
  Query: {
    // 확장 프로그램 목록 조회
    extensions: async (
      _parent: any,
      args: {
        first?: number;
        after?: string;
        filter?: any;
        sort?: any;
      }
    ) => {
      const { first = 20, after, filter, sort } = args;

      let extensions = await getAllExtensions();

      // 필터 적용
      if (filter) {
        if (filter.category) {
          const category = mapExtensionCategory(filter.category);
          extensions = await getExtensionsByCategory(category);
        }

        if (filter.minStars) {
          extensions = extensions.filter(ext => (ext.stars || 0) >= filter.minStars);
        }

        if (filter.maxStars) {
          extensions = extensions.filter(ext => (ext.stars || 0) <= filter.maxStars);
        }

        if (filter.tags && filter.tags.length > 0) {
          extensions = extensions.filter(ext =>
            ext.tags?.some(tag =>
              filter.tags.some((filterTag: string) =>
                tag.toLowerCase().includes(filterTag.toLowerCase())
              )
            )
          );
        }

        if (filter.author) {
          extensions = extensions.filter(ext =>
            ext.author?.toLowerCase().includes(filter.author.toLowerCase())
          );
        }

        if (filter.hasDownloads) {
          extensions = extensions.filter(ext => (ext.downloads || 0) > 0);
        }

        // 날짜 필터
        if (filter.dateFrom || filter.dateTo) {
          extensions = extensions.filter(ext => {
            if (!ext.lastUpdated) return false;
            
            const extDate = new Date(ext.lastUpdated);
            
            if (filter.dateFrom && extDate < new Date(filter.dateFrom)) {
              return false;
            }
            
            if (filter.dateTo && extDate > new Date(filter.dateTo)) {
              return false;
            }
            
            return true;
          });
        }
      }

      // 정렬
      if (sort) {
        extensions.sort((a, b) => {
          let aValue: any, bValue: any;

          switch (sort.field) {
            case 'NAME':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'STARS':
              aValue = a.stars || 0;
              bValue = b.stars || 0;
              break;
            case 'DOWNLOADS':
              aValue = a.downloads || 0;
              bValue = b.downloads || 0;
              break;
            case 'LAST_UPDATED':
              aValue = new Date(a.lastUpdated || 0).getTime();
              bValue = new Date(b.lastUpdated || 0).getTime();
              break;
            default:
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
          }

          if (sort.order === 'DESC') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      return createConnection(extensions, first, after, (ext) => ext.id.toString());
    },

    // 특정 확장 프로그램 조회
    extension: async (_parent: any, args: { id: number }) => {
      const extension = await getExtensionById(args.id);
      if (!extension) {
        throw new GraphQLError(`Extension with id ${args.id} not found`, {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      return extension;
    },

    // 피처드 확장 프로그램들
    featuredExtensions: async (_parent: any, args: { limit?: number }) => {
      return await getFeaturedExtensions(args.limit || 10);
    },

    // 인기 확장 프로그램들
    popularExtensions: async (_parent: any, args: { limit?: number }) => {
      const extensions = await getAllExtensions();
      return extensions
        .sort((a, b) => (b.stars || 0) - (a.stars || 0))
        .slice(0, args.limit || 10);
    },

    // 검색
    search: async (
      _parent: any,
      args: {
        query: string;
        first?: number;
        after?: string;
        filter?: any;
        sort?: any;
      }
    ) => {
      const startTime = Date.now();
      const { query, first = 20, after, filter, sort } = args;

      const results = await searchExtensions(query);

      // 필터 적용 (extensions 쿼리와 동일한 로직)
      // ... (필터 로직 생략 - 위와 동일)

      const searchTime = Date.now() - startTime;
      const suggestions = await getFilteredSuggestions(query);

      return {
        extensions: createConnection(results, first, after, (ext) => ext.id.toString()),
        suggestions: suggestions.slice(0, 5),
        totalResults: results.length,
        searchTime: searchTime / 1000, // 초 단위로 변환
        query,
      };
    },

    // 검색 제안
    searchSuggestions: async (
      _parent: any,
      args: { query?: string; limit?: number }
    ) => {
      const { query, limit = 10 } = args;

      if (query) {
        const suggestions = await getFilteredSuggestions(query);
        return suggestions.slice(0, limit);
      } else {
        const defaultSuggestions = await getSearchSuggestions();
        return defaultSuggestions.slice(0, limit);
      }
    },

    // 통계
    stats: async () => {
      const baseStats = await getExtensionStats();
      const extensions = await getAllExtensions();

      // 카테고리별 통계
      const categories: ExtensionCategory[] = [
        'Development', 'API', 'Browser', 'Productivity', 'Terminal',
        'Data', 'Mobile', 'DevOps', 'CMS', 'E-commerce', 'Education'
      ];
      
      const categoryCounts: Record<string, number> = {};
      for (const category of categories) {
        const categoryExtensions = await getExtensionsByCategory(category);
        categoryCounts[category] = categoryExtensions.length;
      }

      // 인기 태그
      const tagCounts: Record<string, number> = {};
      extensions.forEach(ext => {
        ext.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const popularTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count }));

      return {
        totalExtensions: extensions.length,
        categoryCounts,
        totalStars: extensions.reduce((sum, ext) => sum + (ext.stars || 0), 0),
        totalDownloads: extensions.reduce((sum, ext) => sum + (ext.downloads || 0), 0),
        recentExtensions: extensions
          .filter(ext => ext.lastUpdated)
          .sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime())
          .slice(0, 5),
        trendingExtensions: extensions
          .sort((a, b) => (b.stars || 0) - (a.stars || 0))
          .slice(0, 10),
        popularTags,
      };
    },

    // 사용자 관련 (인증 필요)
    me: (_parent: any, _args: any, context: GraphQLContext) => {
      return context.user || null;
    },

    myBookmarks: async (
      _parent: any,
      args: { first?: number; after?: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      
      // TODO: 실제 북마크 데이터 조회
      const mockBookmarks: Bookmark[] = [];
      return createConnection(mockBookmarks, args.first, args.after);
    },

    myReviews: async (
      _parent: any,
      args: { first?: number; after?: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      
      // TODO: 실제 리뷰 데이터 조회
      const mockReviews: Review[] = [];
      return createConnection(mockReviews, args.first, args.after);
    },

    myPreferences: async (_parent: any, _args: any, context: GraphQLContext) => {
      const user = requireAuth(context);
      
      // TODO: 실제 사용자 설정 조회
      const defaultPreferences: UserPreferences = {
        id: 'pref-' + user.id,
        userId: user.id,
        theme: 'dark',
        language: 'ko',
        searchHistory: true,
        notifications: {
          newExtensions: true,
          updates: true,
          trending: false,
        },
        favoriteCategories: ['Development', 'API'],
      };
      
      return defaultPreferences;
    },

    // 카테고리
    categories: () => {
      return ['DEVELOPMENT', 'API', 'BROWSER', 'PRODUCTIVITY', 'TERMINAL', 
              'DATA', 'MOBILE', 'DEVOPS', 'CMS', 'E_COMMERCE', 'EDUCATION'];
    },

    categoryStats: async () => {
      const categories: ExtensionCategory[] = [
        'Development', 'API', 'Browser', 'Productivity', 'Terminal',
        'Data', 'Mobile', 'DevOps', 'CMS', 'E-commerce', 'Education'
      ];
      
      const stats: Record<string, number> = {};
      for (const category of categories) {
        const extensions = await getExtensionsByCategory(category);
        stats[category] = extensions.length;
      }
      
      return stats;
    },
  },

  // Mutation 리졸버
  Mutation: {
    // 확장 프로그램 생성 (관리자 권한 필요)
    createExtension: async (
      _parent: any,
      args: { input: any },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      
      // TODO: 실제 확장 프로그램 생성 로직
      throw new GraphQLError('Not implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' }
      });
    },

    // 확장 프로그램 수정
    updateExtension: async (
      _parent: any,
      args: { id: number; input: any },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      
      // TODO: 실제 확장 프로그램 수정 로직
      throw new GraphQLError('Not implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' }
      });
    },

    // 확장 프로그램 삭제
    deleteExtension: async (
      _parent: any,
      args: { id: number },
      context: GraphQLContext
    ) => {
      requireAdmin(context);
      
      // TODO: 실제 확장 프로그램 삭제 로직
      throw new GraphQLError('Not implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' }
      });
    },

    // 북마크 생성
    createBookmark: async (
      _parent: any,
      args: { input: any },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      
      // TODO: 실제 북마크 생성 로직
      throw new GraphQLError('Not implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' }
      });
    },

    // 사용자 설정 업데이트
    updatePreferences: async (
      _parent: any,
      args: { input: any },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      
      // TODO: 실제 사용자 설정 업데이트 로직
      throw new GraphQLError('Not implemented', {
        extensions: { code: 'NOT_IMPLEMENTED' }
      });
    },
  },

  // 중첩 필드 리졸버
  Extension: {
    bookmarked: async (extension: Extension, _args: any, context: GraphQLContext) => {
      if (!context.user) return false;
      
      // TODO: 사용자의 북마크 여부 확인
      return false;
    },

    averageRating: async (extension: Extension) => {
      // TODO: 평균 평점 계산
      return 0;
    },

    reviewCount: async (extension: Extension) => {
      // TODO: 리뷰 개수 계산
      return 0;
    },

    reviews: async (extension: Extension, args: { first?: number; after?: string }) => {
      // TODO: 확장 프로그램의 리뷰 조회
      const mockReviews: Review[] = [];
      return createConnection(mockReviews, args.first, args.after);
    },
  },
};