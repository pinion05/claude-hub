/**
 * @swagger
 * /api/v1/users/preferences:
 *   get:
 *     tags:
 *       - User
 *     summary: 사용자 설정 조회
 *     description: 현재 사용자의 설정을 조회합니다.
 *     security:
 *       - bearerAuth: []
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
 *                   $ref: '#/components/schemas/UserPreferences'
 *       401:
 *         description: 인증 필요
 */

import { NextRequest } from 'next/server';
import { userPreferencesSchema } from '@/lib/api/schemas';
import { withMiddleware, createSuccessResponse } from '@/lib/api/middleware';
import type { RequestContext, UserPreferences } from '@/lib/api/types';

async function handleGetPreferences(context: RequestContext) {
  const { user } = context;
  
  if (!user) {
    throw new Error('Authentication required');
  }

  // TODO: 실제 데이터베이스에서 사용자 설정 조회
  // 현재는 기본 설정 반환
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

  return createSuccessResponse(defaultPreferences, {
    cache: {
      ttl: 300, // 5분 캐시
    },
  });
}

/**
 * @swagger
 * /api/v1/users/preferences:
 *   put:
 *     tags:
 *       - User
 *     summary: 사용자 설정 수정
 *     description: 사용자의 설정을 수정합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: 설정 수정됨
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 */
async function handleUpdatePreferences(context: RequestContext) {
  const { req, user } = context;
  
  if (!user) {
    throw new Error('Authentication required');
  }

  const body = await req.json();
  
  // 요청 데이터 검증
  const validatedPreferences = userPreferencesSchema.parse(body);

  // TODO: 실제 데이터베이스에 저장
  const updatedPreferences: UserPreferences = {
    id: 'pref-' + user.id,
    userId: user.id,
    ...validatedPreferences,
  };

  return createSuccessResponse(updatedPreferences, {});
}

export const GET = withMiddleware(handleGetPreferences, {
  requireAuth: true,
  rateLimit: 'GENERAL',
});

export const PUT = withMiddleware(handleUpdatePreferences, {
  requireAuth: true,
  rateLimit: 'GENERAL',
});