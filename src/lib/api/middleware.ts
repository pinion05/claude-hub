import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
// Rate limiting will be implemented with in-memory store
// JWT auth will be implemented later
import {
  HTTP_STATUS,
  API_ERROR_CODES,
  RATE_LIMITS,
  CORS_ORIGINS,
  CORS_METHODS,
  CORS_HEADERS,
  API_HEADERS,
} from './constants';
import type { 
  ApiResponse, 
  ApiError, 
  RequestContext, 
  AuthenticatedUser, 
  RateLimitMeta 
} from './types';

// CORS 미들웨어
export function corsMiddleware(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const method = request.method;

  // Preflight 요청 처리
  if (method === 'OPTIONS') {
    return new NextResponse(null, {
      status: HTTP_STATUS.OK,
      headers: {
        'Access-Control-Allow-Origin': origin && CORS_ORIGINS.includes(origin) ? origin : '',
        'Access-Control-Allow-Methods': CORS_METHODS.join(', '),
        'Access-Control-Allow-Headers': CORS_HEADERS.join(', '),
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  return null;
}

// Rate Limiting 미들웨어 - In-memory implementation
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimitMiddleware(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMITS = 'GENERAL'
): Promise<{ allowed: boolean; rateLimitInfo: RateLimitMeta }> {
  const config = RATE_LIMITS[endpoint];
  const ip = request.ip ?? 'anonymous';
  
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || { count: 0, resetTime: now + config.windowMs };
  
  if (now > userRequests.resetTime) {
    userRequests.count = 0;
    userRequests.resetTime = now + config.windowMs;
  }
  
  userRequests.count++;
  requestCounts.set(ip, userRequests);
  
  const allowed = userRequests.count <= config.max;
  
  return {
    allowed,
    rateLimitInfo: {
      remaining: Math.max(0, config.max - userRequests.count),
      resetTime: userRequests.resetTime,
      limit: config.max,
    },
  };
}

// 인증 미들웨어
export function authMiddleware(request: NextRequest): AuthenticatedUser | null {
  const authHeader = request.headers.get(API_HEADERS.AUTHORIZATION);
  const apiKey = request.headers.get(API_HEADERS.API_KEY);

  // JWT 토큰 검증 - 추후 구현
  if (authHeader?.startsWith('Bearer ')) {
    // TODO: Implement JWT verification
    return null;
  }

  // API 키 검증 (단순한 구현 - 실제로는 데이터베이스에서 확인)
  if (apiKey) {
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') ?? [];
    if (validApiKeys.includes(apiKey)) {
      return {
        id: 'api-user',
        role: 'user',
        permissions: ['read'],
      };
    }
  }

  return null;
}

// 에러 핸들링 미들웨어
export function createErrorResponse(
  error: unknown,
  request: NextRequest,
  context: Partial<RequestContext> = {}
): NextResponse<ApiResponse> {
  const timestamp = new Date().toISOString();
  const path = request.nextUrl.pathname;
  const method = request.method;

  let apiError: ApiError;
  let status = HTTP_STATUS.INTERNAL_SERVER_ERROR;

  if (error instanceof ZodError) {
    status = HTTP_STATUS.BAD_REQUEST;
    apiError = {
      code: API_ERROR_CODES.VALIDATION_ERROR,
      message: '요청 데이터 검증에 실패했습니다.',
      details: {
        issues: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      },
      timestamp,
      path,
      method,
    };
  } else if (error instanceof Error) {
    // 특정 에러 타입에 따른 분류
    if (error.message.includes('not found')) {
      status = HTTP_STATUS.NOT_FOUND;
      apiError = {
        code: API_ERROR_CODES.NOT_FOUND,
        message: '요청하신 리소스를 찾을 수 없습니다.',
        timestamp,
        path,
        method,
      };
    } else if (error.message.includes('unauthorized')) {
      status = HTTP_STATUS.UNAUTHORIZED;
      apiError = {
        code: API_ERROR_CODES.UNAUTHORIZED,
        message: '인증이 필요합니다.',
        timestamp,
        path,
        method,
      };
    } else {
      apiError = {
        code: API_ERROR_CODES.INTERNAL_ERROR,
        message: '내부 서버 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? { 
          originalError: error.message,
          stack: error.stack,
        } : undefined,
        timestamp,
        path,
        method,
      };
    }
  } else {
    apiError = {
      code: API_ERROR_CODES.INTERNAL_ERROR,
      message: '알 수 없는 오류가 발생했습니다.',
      timestamp,
      path,
      method,
    };
  }

  // 에러 로깅 (실제 환경에서는 적절한 로깅 서비스 사용)
  console.error(`[API Error] ${method} ${path}:`, {
    error: apiError,
    context,
    originalError: error,
  });

  const response: ApiResponse = {
    success: false,
    error: apiError,
    meta: context.rateLimitInfo ? {
      rateLimit: context.rateLimitInfo,
    } : undefined,
  };

  return NextResponse.json(response, { status });
}

// 성공 응답 생성
export function createSuccessResponse<T>(
  data: T,
  meta?: Partial<RequestContext['rateLimitInfo']> & {
    pagination?: any;
    cache?: any;
    executionTime?: number;
  }
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta,
  };

  const headers: HeadersInit = {};

  // Rate limit 헤더 추가
  if (meta?.rateLimit) {
    headers[API_HEADERS.RATE_LIMIT_REMAINING] = meta.rateLimit.remaining.toString();
    headers[API_HEADERS.RATE_LIMIT_RESET] = meta.rateLimit.resetTime.toString();
  }

  // Cache 헤더 추가
  if (meta?.cache) {
    headers[API_HEADERS.CACHE_CONTROL] = `public, max-age=${meta.cache.ttl || 300}`;
    if (meta.cache.etag) {
      headers[API_HEADERS.ETAG] = meta.cache.etag;
    }
  }

  // CORS 헤더 추가
  headers['Access-Control-Allow-Origin'] = '*';
  headers['Access-Control-Allow-Methods'] = CORS_METHODS.join(', ');

  return NextResponse.json(response, { headers });
}

// 페이지네이션 헬퍼
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// API 미들웨어 체인
export async function withMiddleware(
  handler: (context: RequestContext) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimit?: keyof typeof RATE_LIMITS;
  } = {}
) {
  return async (request: NextRequest, params?: { params: Record<string, string> }) => {
    const startTime = Date.now();

    try {
      // CORS 처리
      const corsResponse = corsMiddleware(request);
      if (corsResponse) return corsResponse;

      // Rate limiting
      const { allowed, rateLimitInfo } = await rateLimitMiddleware(
        request,
        options.rateLimit
      );

      if (!allowed) {
        return createErrorResponse(
          new Error('Rate limit exceeded'),
          request,
          { rateLimitInfo }
        );
      }

      // 인증
      const user = authMiddleware(request);
      if (options.requireAuth && !user) {
        return createErrorResponse(
          new Error('Authentication required'),
          request,
          { rateLimitInfo }
        );
      }

      // Request context 생성
      const context: RequestContext = {
        req: request,
        params: params?.params,
        user,
        rateLimitInfo,
      };

      // 핸들러 실행
      const result = await handler(context);
      
      // 실행 시간 추가
      const executionTime = Date.now() - startTime;
      
      // 기존 응답에 메타데이터 추가
      if (result.headers.get('content-type')?.includes('application/json')) {
        try {
          const body = await result.json();
          if (body.meta) {
            body.meta.executionTime = executionTime;
          }
          return NextResponse.json(body, {
            status: result.status,
            headers: result.headers,
          });
        } catch {
          // JSON 파싱 실패 시 원본 응답 반환
          return result;
        }
      }

      return result;

    } catch (error) {
      return createErrorResponse(error, request);
    }
  };
}