/**
 * @swagger
 * /api/v1/search/suggestions:
 *   get:
 *     tags:
 *       - Search
 *     summary: 검색 제안 조회
 *     description: 입력한 키워드에 기반한 검색 제안을 조회합니다.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: 검색 키워드 (없으면 기본 제안 반환)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: 제안 개수 제한
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
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     query:
 *                       type: string
 *                     total:
 *                       type: integer
 */

import { getSearchSuggestions, getFilteredSuggestions, getAllExtensions } from '@/lib/server/data';
import { withMiddleware, createSuccessResponse } from '@/lib/api/middleware';
import type { RequestContext } from '@/lib/api/types';
import { z } from 'zod';

// 검색 제안 쿼리 스키마
const suggestionsQuerySchema = z.object({
  q: z.string().min(1).max(100).trim().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

async function handleGetSuggestions(context: RequestContext) {
  const { req } = context;
  const { searchParams } = new URL(req.url);
  
  // 쿼리 파라미터 검증
  const { q, limit } = suggestionsQuerySchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  let suggestions: string[];

  if (q) {
    // 키워드 기반 제안
    const filteredSuggestions = await getFilteredSuggestions(q);
    
    // 확장 프로그램 이름에서도 제안 생성
    const extensions = await getAllExtensions();
    const extensionSuggestions = extensions
      .filter(ext => 
        ext.name.toLowerCase().includes(q.toLowerCase()) ||
        ext.description.toLowerCase().includes(q.toLowerCase()) ||
        ext.tags?.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
      )
      .map(ext => ext.name)
      .slice(0, 5);

    // 태그에서 제안 생성
    const tagSuggestions: string[] = [];
    extensions.forEach(ext => {
      ext.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(q.toLowerCase()) && !tagSuggestions.includes(tag)) {
          tagSuggestions.push(tag);
        }
      });
    });

    // 모든 제안을 합치고 중복 제거
    const allSuggestions = [
      ...filteredSuggestions,
      ...extensionSuggestions,
      ...tagSuggestions.slice(0, 3),
    ];

    // 중복 제거 및 제한
    suggestions = Array.from(new Set(allSuggestions)).slice(0, limit);
  } else {
    // 기본 제안 (인기 검색어 등)
    const defaultSuggestions = await getSearchSuggestions();
    
    // 인기 태그 추가
    const extensions = await getAllExtensions();
    const tagCounts: Record<string, number> = {};
    
    extensions.forEach(ext => {
      ext.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    suggestions = [
      ...defaultSuggestions,
      ...popularTags,
    ].slice(0, limit);
  }

  const responseData = {
    suggestions,
    query: q || '',
    total: suggestions.length,
  };

  return createSuccessResponse(responseData, {
    cache: {
      ttl: q ? 60 : 300, // 키워드 기반은 1분, 기본 제안은 5분 캐시
      etag: `suggestions-${q || 'default'}-${limit}`,
    },
  });
}

export const GET = withMiddleware(handleGetSuggestions, {
  rateLimit: 'SEARCH',
});