// API 상수 정의
export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API 에러 코드
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INVALID_API_KEY: 'INVALID_API_KEY',
  EXTENSION_NOT_FOUND: 'EXTENSION_NOT_FOUND',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  SEARCH_ERROR: 'SEARCH_ERROR',
} as const;

// Rate Limiting 설정
export const RATE_LIMITS = {
  SEARCH: {
    windowMs: 60 * 1000, // 1분
    max: 60, // 분당 60회
  },
  EXTENSIONS: {
    windowMs: 60 * 1000, // 1분
    max: 100, // 분당 100회
  },
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15분
    max: 1000, // 15분당 1000회
  },
} as const;

// 캐시 설정
export const CACHE_DURATIONS = {
  EXTENSIONS: 5 * 60, // 5분
  CATEGORIES: 30 * 60, // 30분
  SEARCH_RESULTS: 2 * 60, // 2분
  STATS: 10 * 60, // 10분
} as const;

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const;

// API 헤더
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  API_KEY: 'X-API-Key',
  RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  RATE_LIMIT_RESET: 'X-RateLimit-Reset',
  CACHE_CONTROL: 'Cache-Control',
  ETAG: 'ETag',
} as const;

// CORS 설정
export const CORS_ORIGINS = [
  'http://localhost:3000',
  'https://claude-hub.vercel.app',
  // 추가 허용 도메인들
];

export const CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
export const CORS_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-API-Key',
  'X-Requested-With',
];