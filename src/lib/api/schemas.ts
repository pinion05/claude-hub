import { z } from 'zod';
import { PAGINATION } from './constants';

// 공통 스키마
const positiveIntSchema = z.coerce.number().int().positive();
const nonNegativeIntSchema = z.coerce.number().int().min(0);

// 페이지네이션 스키마
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

// 확장 카테고리 스키마
export const extensionCategorySchema = z.enum([
  'Development',
  'API', 
  'Browser',
  'Productivity',
  'Terminal',
  'Data',
  'Mobile',
  'DevOps',
  'CMS',
  'E-commerce',
  'Education'
]);

// 정렬 스키마
export const sortSchema = z.object({
  sortBy: z.enum(['name', 'stars', 'downloads', 'lastUpdated', 'relevance']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 확장 프로그램 스키마
export const extensionSchema = z.object({
  id: positiveIntSchema,
  name: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(1000).trim(),
  category: extensionCategorySchema,
  repoUrl: z.string().url(),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
  stars: nonNegativeIntSchema.optional(),
  downloads: nonNegativeIntSchema.optional(),
  lastUpdated: z.string().datetime().optional(),
  author: z.string().min(1).max(100).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/).optional(),
});

// 검색 쿼리 스키마
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200).trim().optional(),
  category: extensionCategorySchema.optional(),
  tags: z.union([
    z.string().transform(val => [val]),
    z.array(z.string().min(1).max(50))
  ]).optional(),
  minStars: nonNegativeIntSchema.optional(),
  maxStars: nonNegativeIntSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  featured: z.coerce.boolean().optional(),
  hasDownloads: z.coerce.boolean().optional(),
  author: z.string().min(1).max(100).optional(),
  ...sortSchema.shape,
  ...paginationSchema.shape,
}).refine(
  data => !data.dateFrom || !data.dateTo || new Date(data.dateFrom) <= new Date(data.dateTo),
  { message: '시작 날짜는 종료 날짜보다 이전이어야 합니다' }
).refine(
  data => !data.minStars || !data.maxStars || data.minStars <= data.maxStars,
  { message: '최소 스타 수는 최대 스타 수보다 작거나 같아야 합니다' }
);

// 확장 프로그램 생성/수정 스키마
export const createExtensionSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().min(10).max(1000).trim(),
  category: extensionCategorySchema,
  repoUrl: z.string().url().refine(
    url => url.includes('github.com') || url.includes('gitlab.com'),
    { message: 'GitHub 또는 GitLab 저장소 URL만 허용됩니다' }
  ),
  tags: z.array(z.string().min(1).max(50).trim()).max(10).default([]),
  author: z.string().min(2).max(100).trim().optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/).optional(),
});

export const updateExtensionSchema = createExtensionSchema.partial();

// 확장 프로그램 ID 파라미터 스키마
export const extensionIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// 북마크 스키마
export const bookmarkSchema = z.object({
  extensionId: positiveIntSchema,
  tags: z.array(z.string().min(1).max(50)).max(5).default([]),
  notes: z.string().max(500).trim().optional(),
});

// 사용자 설정 스키마
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('dark'),
  language: z.enum(['ko', 'en']).default('ko'),
  searchHistory: z.boolean().default(true),
  notifications: z.object({
    newExtensions: z.boolean().default(true),
    updates: z.boolean().default(true),
    trending: z.boolean().default(false),
  }).default({}),
  favoriteCategories: z.array(extensionCategorySchema).max(5).default([]),
});

// 리뷰 스키마
export const reviewSchema = z.object({
  extensionId: positiveIntSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).trim().optional(),
});

export const updateReviewSchema = reviewSchema.omit({ extensionId: true }).partial();

// 피드백 스키마
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other']).default('other'),
  title: z.string().min(5).max(200).trim(),
  description: z.string().min(10).max(2000).trim(),
  email: z.string().email().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  extensionId: positiveIntSchema.optional(),
});

// API 키 생성 스키마
export const apiKeySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  permissions: z.array(z.string()).min(1).max(10),
  rateLimit: z.object({
    rpm: z.number().int().min(1).max(10000).default(60),
    rpd: z.number().int().min(1).max(100000).default(10000),
  }).default({}),
});

// 통계 쿼리 스키마
export const statsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  categories: z.array(extensionCategorySchema).optional(),
  includeDetails: z.coerce.boolean().default(false),
});

// 배치 작업 스키마
export const batchExtensionSchema = z.object({
  ids: z.array(positiveIntSchema).min(1).max(100),
  operation: z.enum(['delete', 'feature', 'unfeature', 'updateCategory']),
  data: z.record(z.unknown()).optional(),
});

// WebSocket 연결 스키마
export const websocketConnectionSchema = z.object({
  channels: z.array(z.enum([
    'extensions',
    'stats',
    'user_activity',
    'system'
  ])).min(1).max(4),
  userId: z.string().optional(),
});

// 내보내기 스키마 유형들
export type PaginationSchema = z.infer<typeof paginationSchema>;
export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;
export type CreateExtensionSchema = z.infer<typeof createExtensionSchema>;
export type UpdateExtensionSchema = z.infer<typeof updateExtensionSchema>;
export type ExtensionIdSchema = z.infer<typeof extensionIdSchema>;
export type BookmarkSchema = z.infer<typeof bookmarkSchema>;
export type UserPreferencesSchema = z.infer<typeof userPreferencesSchema>;
export type ReviewSchema = z.infer<typeof reviewSchema>;
export type UpdateReviewSchema = z.infer<typeof updateReviewSchema>;
export type FeedbackSchema = z.infer<typeof feedbackSchema>;
export type ApiKeySchema = z.infer<typeof apiKeySchema>;
export type StatsQuerySchema = z.infer<typeof statsQuerySchema>;
export type BatchExtensionSchema = z.infer<typeof batchExtensionSchema>;
export type WebSocketConnectionSchema = z.infer<typeof websocketConnectionSchema>;