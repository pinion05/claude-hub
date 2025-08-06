/**
 * @swagger
 * /api/v1/extensions/{id}:
 *   get:
 *     tags:
 *       - Extensions
 *     summary: 특정 확장 프로그램 조회
 *     description: ID로 특정 확장 프로그램을 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 확장 프로그램 ID
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
 *                   $ref: '#/components/schemas/Extension'
 *       404:
 *         description: 확장 프로그램을 찾을 수 없음
 */

import { NextRequest } from 'next/server';
import { getExtensionById } from '@/lib/server/data';
import { extensionIdSchema } from '@/lib/api/schemas';
import { withMiddleware, createSuccessResponse } from '@/lib/api/middleware';
import type { RequestContext } from '@/lib/api/types';
import { API_ERROR_CODES } from '@/lib/api/constants';

async function handleGetExtension(context: RequestContext) {
  const { params } = context;
  
  // 파라미터 검증
  const { id } = extensionIdSchema.parse(params);
  
  // 확장 프로그램 조회
  const extension = await getExtensionById(id);
  
  if (!extension) {
    throw new Error(`Extension with id ${id} not found`);
  }

  return createSuccessResponse(extension, {
    cache: {
      ttl: 300, // 5분 캐시
      etag: `extension-${id}-${extension.lastUpdated || 'unknown'}`,
    },
  });
}

/**
 * @swagger
 * /api/v1/extensions/{id}:
 *   put:
 *     tags:
 *       - Extensions
 *     summary: 확장 프로그램 정보 수정
 *     description: 특정 확장 프로그램의 정보를 수정합니다. (관리자 권한 필요)
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 확장 프로그램 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExtension'
 *     responses:
 *       200:
 *         description: 수정됨
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 확장 프로그램을 찾을 수 없음
 */
async function handleUpdateExtension(context: RequestContext) {
  const { params } = context;
  const { id } = extensionIdSchema.parse(params);
  
  // TODO: 실제 업데이트 로직 구현
  return createSuccessResponse(
    { message: `확장 프로그램 ${id} 수정 기능은 아직 구현되지 않았습니다.` },
    {}
  );
}

/**
 * @swagger
 * /api/v1/extensions/{id}:
 *   delete:
 *     tags:
 *       - Extensions
 *     summary: 확장 프로그램 삭제
 *     description: 특정 확장 프로그램을 삭제합니다. (관리자 권한 필요)
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 확장 프로그램 ID
 *     responses:
 *       204:
 *         description: 삭제됨
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 확장 프로그램을 찾을 수 없음
 */
async function handleDeleteExtension(context: RequestContext) {
  const { params } = context;
  const { id } = extensionIdSchema.parse(params);
  
  // TODO: 실제 삭제 로직 구현
  return createSuccessResponse(
    { message: `확장 프로그램 ${id} 삭제 기능은 아직 구현되지 않았습니다.` },
    {}
  );
}

// 핸들러들 내보내기
export const GET = withMiddleware(handleGetExtension, {
  rateLimit: 'EXTENSIONS',
});

export const PUT = withMiddleware(handleUpdateExtension, {
  requireAuth: true,
  rateLimit: 'EXTENSIONS',
});

export const DELETE = withMiddleware(handleDeleteExtension, {
  requireAuth: true,
  rateLimit: 'EXTENSIONS',
});