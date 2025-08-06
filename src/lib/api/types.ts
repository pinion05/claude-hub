import { NextRequest } from 'next/server';
import { Extension, ExtensionCategory } from '@/types';

// API Response 기본 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

// API 에러 타입
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
  method: string;
}

// Response 메타데이터
export interface ResponseMeta {
  pagination?: PaginationMeta;
  rateLimit?: RateLimitMeta;
  cache?: CacheMeta;
  executionTime?: number;
}

// 페이지네이션 메타데이터
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Rate Limit 메타데이터
export interface RateLimitMeta {
  remaining: number;
  resetTime: number;
  limit: number;
}

// 캐시 메타데이터
export interface CacheMeta {
  cached: boolean;
  cacheKey?: string;
  ttl?: number;
  etag?: string;
}

// Request Context
export interface RequestContext {
  req: NextRequest;
  params?: Record<string, string>;
  user?: AuthenticatedUser;
  apiKey?: string;
  rateLimitInfo?: RateLimitMeta;
}

// 인증된 사용자
export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: 'user' | 'admin';
  permissions: string[];
}

// 검색 요청 파라미터
export interface SearchParams {
  q?: string;
  category?: ExtensionCategory;
  tags?: string[];
  sortBy?: 'name' | 'stars' | 'downloads' | 'lastUpdated' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  featured?: boolean;
  minStars?: number;
  dateFrom?: string;
  dateTo?: string;
}

// 확장 프로그램 필터
export interface ExtensionFilters {
  category?: ExtensionCategory;
  tags?: string[];
  minStars?: number;
  maxStars?: number;
  dateRange?: {
    from: Date;
    to: Date;
  };
  author?: string;
  hasDownloads?: boolean;
}

// 통계 응답
export interface StatsResponse {
  totalExtensions: number;
  categoryCounts: Record<ExtensionCategory, number>;
  totalStars: number;
  totalDownloads: number;
  recentExtensions: Extension[];
  trendingExtensions: Extension[];
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}

// 북마크 관련
export interface Bookmark {
  id: string;
  userId: string;
  extensionId: number;
  createdAt: string;
  tags?: string[];
  notes?: string;
}

// 사용자 설정
export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  searchHistory: boolean;
  notifications: {
    newExtensions: boolean;
    updates: boolean;
    trending: boolean;
  };
  favoriteCategories: ExtensionCategory[];
}

// GraphQL Context
export interface GraphQLContext {
  req: NextRequest;
  user?: AuthenticatedUser;
  dataSources: {
    extensionAPI: unknown;
  };
}

// WebSocket 메시지 타입
export interface WebSocketMessage {
  type: 'extension_update' | 'stats_update' | 'user_activity';
  payload: unknown;
  timestamp: string;
}

// 실시간 업데이트 이벤트
export interface RealtimeEvent {
  id: string;
  type: 'extension_added' | 'extension_updated' | 'extension_deleted' | 'stats_changed';
  data: unknown;
  timestamp: string;
  userId?: string;
}

// API 키 정보
export interface ApiKeyInfo {
  key: string;
  name: string;
  permissions: string[];
  rateLimit: {
    rpm: number; // requests per minute
    rpd: number; // requests per day
  };
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

// 피드백/리뷰 타입
export interface Review {
  id: string;
  extensionId: number;
  userId: string;
  rating: number;
  comment?: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

// 확장 프로그램 제출
export interface ExtensionSubmission {
  id: string;
  name: string;
  description: string;
  category: ExtensionCategory;
  repoUrl: string;
  tags: string[];
  author: string;
  version: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}