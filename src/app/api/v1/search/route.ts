/**
 * @swagger
 * /api/v1/search:
 *   get:
 *     tags:
 *       - Search
 *     summary: 확장 프로그램 검색
 *     description: 키워드를 이용해 확장 프로그램을 검색합니다.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *         description: 검색 키워드
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Development, API, Browser, Productivity, Terminal, Data, Mobile, DevOps, CMS, E-commerce, Education]
 *         description: 카테고리 필터
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, stars, downloads, lastUpdated, relevance]
 *           default: relevance
 *         description: 정렬 기준
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
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Extension'
 *                     query:
 *                       type: string
 *                     totalResults:
 *                       type: integer
 *                     searchTime:
 *                       type: number
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 */

import { NextRequest } from 'next/server';
import { searchExtensions, getFilteredSuggestions } from '@/lib/server/data';
import { searchQuerySchema } from '@/lib/api/schemas';
import { withMiddleware, createSuccessResponse, createPaginationMeta } from '@/lib/api/middleware';
import type { RequestContext } from '@/lib/api/types';

async function handleSearch(context: RequestContext) {
  const startTime = Date.now();
  const { req } = context;
  const { searchParams } = new URL(req.url);
  
  // 쿼리 파라미터 검증
  const validatedParams = searchQuerySchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  const { q, page, limit, category, sortBy, sortOrder, ...filters } = validatedParams;

  if (!q) {
    throw new Error('검색 키워드가 필요합니다.');
  }

  // 검색 실행
  const searchResults = await searchExtensions(q);
  
  // 필터 적용
  let filteredResults = searchResults;
  
  if (category) {
    filteredResults = filteredResults.filter(ext => ext.category === category);
  }

  if (filters.minStars !== undefined) {
    filteredResults = filteredResults.filter(ext => (ext.stars || 0) >= filters.minStars!);
  }

  if (filters.maxStars !== undefined) {
    filteredResults = filteredResults.filter(ext => (ext.stars || 0) <= filters.maxStars!);
  }

  if (filters.tags && filters.tags.length > 0) {
    filteredResults = filteredResults.filter(ext => 
      ext.tags?.some(tag => 
        filters.tags!.some(filterTag => 
          tag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
    );
  }

  if (filters.author) {
    filteredResults = filteredResults.filter(ext => 
      ext.author?.toLowerCase().includes(filters.author!.toLowerCase())
    );
  }

  // 날짜 필터
  if (filters.dateFrom || filters.dateTo) {
    filteredResults = filteredResults.filter(ext => {
      if (!ext.lastUpdated) return false;
      
      const extDate = new Date(ext.lastUpdated);
      
      if (filters.dateFrom && extDate < new Date(filters.dateFrom)) {
        return false;
      }
      
      if (filters.dateTo && extDate > new Date(filters.dateTo)) {
        return false;
      }
      
      return true;
    });
  }

  // 정렬
  if (sortBy === 'relevance') {
    // 기본적으로 검색 결과는 이미 관련도 순으로 정렬되어 있음
  } else {
    filteredResults.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stars':
          aValue = a.stars || 0;
          bValue = b.stars || 0;
          break;
        case 'downloads':
          aValue = a.downloads || 0;
          bValue = b.downloads || 0;
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated || 0).getTime();
          bValue = new Date(b.lastUpdated || 0).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });
  }

  const totalResults = filteredResults.length;

  // 페이지네이션 적용
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // 검색 제안 생성
  const suggestions = await getFilteredSuggestions(q);

  const searchTime = Date.now() - startTime;

  // 응답 데이터 구성
  const responseData = {
    results: paginatedResults,
    query: q,
    totalResults,
    searchTime,
    suggestions: suggestions.slice(0, 5), // 최대 5개 제안
    appliedFilters: {
      category,
      minStars: filters.minStars,
      maxStars: filters.maxStars,
      tags: filters.tags,
      author: filters.author,
      dateRange: filters.dateFrom || filters.dateTo ? {
        from: filters.dateFrom,
        to: filters.dateTo,
      } : undefined,
    },
  };

  return createSuccessResponse(responseData, {
    pagination: createPaginationMeta(page, limit, totalResults),
    cache: {
      ttl: 120, // 2분 캐시
      etag: `search-${Buffer.from(q).toString('base64')}-${page}-${limit}`,
    },
    executionTime: searchTime,
  });
}

/**
 * @swagger
 * /api/v1/search:
 *   post:
 *     tags:
 *       - Search
 *     summary: 고급 검색
 *     description: 복합 조건을 이용한 고급 검색을 수행합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: 검색 키워드
 *               filters:
 *                 type: object
 *                 properties:
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   starRange:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: integer
 *                       max:
 *                         type: integer
 *                   dateRange:
 *                     type: object
 *                     properties:
 *                       from:
 *                         type: string
 *                         format: date
 *                       to:
 *                         type: string
 *                         format: date
 *               sort:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     enum: [name, stars, downloads, lastUpdated, relevance]
 *                   order:
 *                     type: string
 *                     enum: [asc, desc]
 *               pagination:
 *                 type: object
 *                 properties:
 *                   page:
 *                     type: integer
 *                   limit:
 *                     type: integer
 *     responses:
 *       200:
 *         description: 성공
 */
async function handleAdvancedSearch(context: RequestContext) {
  const { req } = context;
  const body = await req.json();
  
  // 여기서는 기본 검색과 동일한 로직을 사용하되,
  // POST body에서 더 복잡한 필터 조건을 받을 수 있습니다.
  
  const { query, filters = {}, sort = {}, pagination = {} } = body;
  
  if (!query) {
    throw new Error('검색 키워드가 필요합니다.');
  }

  // URL 파라미터로 변환하여 기존 로직 재사용
  const searchParams = new URLSearchParams();
  searchParams.set('q', query);
  
  if (pagination.page) searchParams.set('page', pagination.page.toString());
  if (pagination.limit) searchParams.set('limit', pagination.limit.toString());
  if (sort.field) searchParams.set('sortBy', sort.field);
  if (sort.order) searchParams.set('sortOrder', sort.order);
  
  if (filters.categories?.length > 0) {
    searchParams.set('category', filters.categories[0]); // 첫 번째 카테고리만 적용
  }
  
  if (filters.starRange?.min !== undefined) {
    searchParams.set('minStars', filters.starRange.min.toString());
  }
  
  if (filters.starRange?.max !== undefined) {
    searchParams.set('maxStars', filters.starRange.max.toString());
  }

  // 새로운 요청 객체 생성
  const newUrl = new URL(req.url);
  newUrl.search = searchParams.toString();
  
  const newReq = new NextRequest(newUrl, {
    method: 'GET',
    headers: req.headers,
  });

  // 기존 GET 핸들러 재사용
  return await handleSearch({
    ...context,
    req: newReq,
  });
}

// 핸들러들 내보내기
export const GET = withMiddleware(handleSearch, {
  rateLimit: 'SEARCH',
});

export const POST = withMiddleware(handleAdvancedSearch, {
  rateLimit: 'SEARCH',
});