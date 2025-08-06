/**
 * @swagger
 * /api/v1/users/bookmarks:
 *   get:
 *     tags:
 *       - User
 *     summary: 사용자 북마크 목록 조회
 *     description: 현재 사용자의 북마크된 확장 프로그램 목록을 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: 북마크 태그로 필터링
 *     responses:
 *       200:
 *         description: 성공
 *       401:
 *         description: 인증 필요
 */

import { NextRequest } from 'next/server';
import { paginationSchema } from '@/lib/api/schemas';
import { withMiddleware, createSuccessResponse, createPaginationMeta } from '@/lib/api/middleware';
import type { RequestContext, Bookmark } from '@/lib/api/types';
import { z } from 'zod';

// 북마크 쿼리 스키마
const bookmarkQuerySchema = paginationSchema.extend({
  tags: z.union([
    z.string().transform(val => [val]),
    z.array(z.string())
  ]).optional(),
});

async function handleGetBookmarks(context: RequestContext) {
  const { req, user } = context;
  
  if (!user) {
    throw new Error('Authentication required');
  }

  const { searchParams } = new URL(req.url);
  const { page, limit, tags } = bookmarkQuerySchema.parse(
    Object.fromEntries(searchParams.entries())
  );

  // TODO: 실제 데이터베이스에서 북마크 조회
  // 현재는 mock 데이터 반환
  const mockBookmarks: Bookmark[] = [
    {
      id: '1',
      userId: user.id,
      extensionId: 1,
      createdAt: new Date().toISOString(),
      tags: ['useful', 'development'],
      notes: '매우 유용한 확장프로그램',
    },
    {
      id: '2',
      userId: user.id,
      extensionId: 5,
      createdAt: new Date().toISOString(),
      tags: ['api'],
    },
  ];

  // 태그로 필터링
  let filteredBookmarks = mockBookmarks;
  if (tags && tags.length > 0) {
    filteredBookmarks = mockBookmarks.filter(bookmark =>
      bookmark.tags?.some(tag => 
        tags.some(filterTag => 
          tag.toLowerCase().includes(filterTag.toLowerCase())
        )
      )
    );
  }

  // 페이지네이션 적용
  const total = filteredBookmarks.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBookmarks = filteredBookmarks.slice(startIndex, endIndex);

  return createSuccessResponse(paginatedBookmarks, {
    pagination: createPaginationMeta(page, limit, total),
  });
}

/**
 * @swagger
 * /api/v1/users/bookmarks:
 *   post:
 *     tags:
 *       - User
 *     summary: 북마크 추가
 *     description: 확장 프로그램을 북마크에 추가합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - extensionId
 *             properties:
 *               extensionId:
 *                 type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: 북마크 추가됨
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 *       409:
 *         description: 이미 북마크된 확장 프로그램
 */
async function handleCreateBookmark(context: RequestContext) {
  const { req, user } = context;
  
  if (!user) {
    throw new Error('Authentication required');
  }

  const body = await req.json();
  const { extensionId, tags = [], notes } = body;

  if (!extensionId) {
    throw new Error('extensionId is required');
  }

  // TODO: 확장 프로그램 존재 여부 확인
  // TODO: 이미 북마크했는지 확인
  // TODO: 실제 데이터베이스에 저장

  const newBookmark: Bookmark = {
    id: Date.now().toString(),
    userId: user.id,
    extensionId,
    createdAt: new Date().toISOString(),
    tags,
    notes,
  };

  return createSuccessResponse(newBookmark, {});
}

export const GET = withMiddleware(handleGetBookmarks, {
  requireAuth: true,
  rateLimit: 'GENERAL',
});

export const POST = withMiddleware(handleCreateBookmark, {
  requireAuth: true,
  rateLimit: 'GENERAL',
});