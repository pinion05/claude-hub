/**
 * @swagger
 * /api/v1/extensions:
 *   get:
 *     tags:
 *       - Extensions
 *     summary: 확장 프로그램 목록 조회
 *     description: 페이지네이션, 정렬, 필터링이 가능한 확장 프로그램 목록을 조회합니다.
 *     parameters:
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
 *           enum: [name, stars, downloads, lastUpdated]
 *           default: name
 *         description: 정렬 기준
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 정렬 순서
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Extension'
 *                 meta:
 *                   $ref: '#/components/schemas/ResponseMeta'
 */

import { NextRequest } from 'next/server';
import { 
  getAllExtensions, 
  getExtensionsByCategory, 
  filterExtensions,
  getExtensionStats 
} from '@/lib/server/data';
import { searchQuerySchema } from '@/lib/api/schemas';
import { withMiddleware, createSuccessResponse, createPaginationMeta } from '@/lib/api/middleware';
import type { RequestContext } from '@/lib/api/types';

async function handleGetExtensions(context: RequestContext) {
  const { req } = context;
  const { searchParams } = new URL(req.url);
  
  // 쿼리 파라미터 검증
  const validatedParams = searchQuerySchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  const { page, limit, category, sortBy, sortOrder, featured, ...filters } = validatedParams;

  let extensions;
  let total = 0;

  // 카테고리별 조회
  if (category) {
    extensions = await getExtensionsByCategory(category);
    total = extensions.length;
  } 
  // 피처드 확장 조회
  else if (featured) {
    const { getFeaturedExtensions } = await import('@/lib/server/data');
    extensions = await getFeaturedExtensions(limit);
    total = extensions.length;
  }
  // 전체 조회 또는 필터 적용
  else {
    if (Object.keys(filters).length > 0 || sortBy !== 'name' || sortOrder !== 'desc') {
      extensions = await filterExtensions({
        sortBy,
        sortOrder,
        category: filters.category,
        ...filters,
      });
    } else {
      extensions = await getAllExtensions();
    }
    total = extensions.length;
  }

  // 페이지네이션 적용
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedExtensions = extensions.slice(startIndex, endIndex);

  // 응답 생성
  return createSuccessResponse(paginatedExtensions, {
    pagination: createPaginationMeta(page, limit, total),
    executionTime: Date.now(),
  });
}

/**
 * @swagger
 * /api/v1/extensions:
 *   post:
 *     tags:
 *       - Extensions
 *     summary: 새 확장 프로그램 등록
 *     description: 새로운 확장 프로그램을 등록합니다. (관리자 권한 필요)
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExtension'
 *     responses:
 *       201:
 *         description: 생성됨
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 */
async function handleCreateExtension(context: RequestContext) {
  // TODO: 실제 데이터베이스에 저장 로직 구현
  // 현재는 정적 데이터를 사용하므로 구현하지 않음
  
  return createSuccessResponse(
    { message: '확장 프로그램 등록 기능은 아직 구현되지 않았습니다.' },
    {}
  );
}

// GET 요청 핸들러
export const GET = withMiddleware(handleGetExtensions, {
  rateLimit: 'EXTENSIONS',
});

// POST 요청 핸들러
export const POST = withMiddleware(handleCreateExtension, {
  requireAuth: true,
  rateLimit: 'EXTENSIONS',
});