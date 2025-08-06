/**
 * WebSocket API 엔드포인트
 * WebSocket 서버의 상태 조회 및 관리
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWebSocketServer } from '@/lib/websocket/server';
import { withMiddleware, createSuccessResponse } from '@/lib/api/middleware';
import type { RequestContext } from '@/lib/api/types';

// WebSocket 서버 상태 조회
async function handleGetWebSocketStats(context: RequestContext) {
  const { user } = context;
  
  // 관리자만 상세 통계 조회 가능
  if (!user || user.role !== 'admin') {
    return createSuccessResponse({
      status: 'WebSocket server is running',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const wsServer = getWebSocketServer();
    const stats = wsServer.getStats();
    
    return createSuccessResponse({
      status: 'running',
      ...stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return createSuccessResponse({
      status: 'error',
      message: 'WebSocket server not available',
      timestamp: new Date().toISOString(),
    });
  }
}

// 시스템 메시지 브로드캐스트 (관리자 전용)
async function handleBroadcastMessage(context: RequestContext) {
  const { req, user } = context;
  
  if (!user || user.role !== 'admin') {
    throw new Error('Admin privileges required');
  }

  const body = await req.json();
  const { channel, message, userIds } = body;

  if (!message) {
    throw new Error('Message is required');
  }

  try {
    const wsServer = getWebSocketServer();
    
    const broadcastMessage = {
      type: 'system_message',
      payload: {
        message,
        from: 'system',
        priority: body.priority || 'normal',
        timestamp: new Date().toISOString(),
      },
    };

    if (userIds && Array.isArray(userIds)) {
      // 특정 사용자들에게 메시지 전송
      userIds.forEach((userId: string) => {
        wsServer.broadcastToUser(userId, broadcastMessage);
      });
    } else if (channel) {
      // 특정 채널에 메시지 전송
      wsServer.broadcastToChannel(channel, broadcastMessage);
    } else {
      // 모든 클라이언트에게 메시지 전송
      wsServer.broadcastToAll(broadcastMessage);
    }

    return createSuccessResponse({
      message: 'Message broadcasted successfully',
      targets: userIds ? `users: ${userIds.length}` : channel || 'all',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error('Failed to broadcast message');
  }
}

// 확장 프로그램 업데이트 알림 전송
async function handleExtensionUpdate(context: RequestContext) {
  const { req } = context;
  const body = await req.json();
  const { type, extensionId, extensionData } = body;

  if (!type || !extensionId) {
    throw new Error('Type and extensionId are required');
  }

  try {
    const wsServer = getWebSocketServer();
    
    const updateMessage = {
      type: 'extension_update',
      payload: {
        updateType: type, // 'added', 'updated', 'deleted'
        extensionId,
        extension: extensionData || null,
        timestamp: new Date().toISOString(),
      },
    };

    // 확장 프로그램 채널에 업데이트 알림
    wsServer.broadcastToChannel('extensions', updateMessage);

    return createSuccessResponse({
      message: 'Extension update broadcasted',
      type,
      extensionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error('Failed to broadcast extension update');
  }
}

// 통계 업데이트 알림
async function handleStatsUpdate(context: RequestContext) {
  try {
    const wsServer = getWebSocketServer();
    
    // 통계 데이터 조회 (실제 구현에서는 데이터베이스에서 조회)
    const { getExtensionStats } = await import('@/lib/server/data');
    const stats = await getExtensionStats();
    
    const statsMessage = {
      type: 'stats_update',
      payload: {
        stats,
        timestamp: new Date().toISOString(),
      },
    };

    // 통계 채널에 업데이트 알림
    wsServer.broadcastToChannel('stats', statsMessage);

    return createSuccessResponse({
      message: 'Stats update broadcasted',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error('Failed to broadcast stats update');
  }
}

// HTTP 메소드 핸들러들
export const GET = withMiddleware(handleGetWebSocketStats, {
  rateLimit: 'GENERAL',
});

export const POST = withMiddleware(async (context: RequestContext) => {
  const { req } = context;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'broadcast':
      return await handleBroadcastMessage(context);
    case 'extension-update':
      return await handleExtensionUpdate(context);
    case 'stats-update':
      return await handleStatsUpdate(context);
    default:
      throw new Error('Unknown action');
  }
}, {
  requireAuth: true,
  rateLimit: 'GENERAL',
});