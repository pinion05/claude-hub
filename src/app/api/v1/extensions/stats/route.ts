/**
 * @swagger
 * /api/v1/extensions/stats:
 *   get:
 *     tags:
 *       - Extensions
 *     summary: 확장 프로그램 통계 조회
 *     description: 전체 확장 프로그램에 대한 통계 정보를 조회합니다.
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: 통계 기간
 *       - in: query
 *         name: categories
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Development, API, Browser, Productivity, Terminal, Data, Mobile, DevOps, CMS, E-commerce, Education]
 *         description: 특정 카테고리들만 포함
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 상세 정보 포함 여부
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ExtensionStats'
 */

import { getAllExtensions, getExtensionsByCategory } from '@/lib/server/data';
import { statsQuerySchema } from '@/lib/api/schemas';
import { withMiddleware, createSuccessResponse } from '@/lib/api/middleware';
import type { RequestContext, StatsResponse } from '@/lib/api/types';
import type { ExtensionCategory } from '@/types';

async function handleGetStats(context: RequestContext) {
  const { req } = context;
  const { searchParams } = new URL(req.url);
  
  // 쿼리 파라미터 검증
  const { period, categories, includeDetails } = statsQuerySchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  // 기본 통계 조회
  const allExtensions = await getAllExtensions();

  // 카테고리별 통계 계산
  const categoryCounts: Record<ExtensionCategory, number> = {} as Record<ExtensionCategory, number>;
  
  // 모든 카테고리에 대해 초기화
  const allCategories: ExtensionCategory[] = [
    'Development', 'API', 'Browser', 'Productivity', 'Terminal', 
    'Data', 'Mobile', 'DevOps', 'CMS', 'E-commerce', 'Education'
  ];
  
  for (const category of allCategories) {
    const extensions = await getExtensionsByCategory(category);
    categoryCounts[category] = extensions.length;
  }

  // 필터링된 카테고리가 있다면 적용
  if (categories && categories.length > 0) {
    for (const category of Object.keys(categoryCounts) as ExtensionCategory[]) {
      if (!categories.includes(category)) {
        delete categoryCounts[category];
      }
    }
  }

  // 총 스타 수 및 다운로드 수 계산
  const totalStars = allExtensions.reduce((sum, ext) => sum + (ext.stars || 0), 0);
  const totalDownloads = allExtensions.reduce((sum, ext) => sum + (ext.downloads || 0), 0);

  // 최근 확장 프로그램 (최근 30일 내 업데이트)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentExtensions = allExtensions
    .filter(ext => ext.lastUpdated && new Date(ext.lastUpdated) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime())
    .slice(0, 5);

  // 인기 확장 프로그램 (스타 수 기준)
  const trendingExtensions = allExtensions
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 10);

  // 인기 태그 계산
  const tagCounts: Record<string, number> = {};
  allExtensions.forEach(ext => {
    ext.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const popularTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));

  // 응답 데이터 구성
  const statsData: StatsResponse = {
    totalExtensions: allExtensions.length,
    categoryCounts,
    totalStars,
    totalDownloads,
    recentExtensions: includeDetails ? recentExtensions : recentExtensions.slice(0, 3),
    trendingExtensions: includeDetails ? trendingExtensions : trendingExtensions.slice(0, 5),
    popularTags: includeDetails ? popularTags : popularTags.slice(0, 10),
  };

  return createSuccessResponse(statsData, {
    cache: {
      ttl: 600, // 10분 캐시
      etag: `stats-${period}-${Date.now()}`,
    },
    executionTime: Date.now(),
  });
}

export const GET = withMiddleware(handleGetStats, {
  rateLimit: 'EXTENSIONS',
});