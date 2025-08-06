/**
 * API 문서 엔드포인트
 * Swagger UI와 OpenAPI 스펙을 제공합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import swaggerJSDoc from 'swagger-jsdoc';

// OpenAPI 3.0 스펙 정의
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Claude Hub API',
      version: '1.0.0',
      description: `
        Claude Hub API는 Claude 확장 프로그램들을 관리하고 검색할 수 있는 RESTful API입니다.
        
        ## 인증
        
        API는 두 가지 인증 방식을 지원합니다:
        
        1. **Bearer Token (JWT)**: 사용자 인증
           \`\`\`
           Authorization: Bearer <jwt_token>
           \`\`\`
        
        2. **API Key**: 서버 간 통신
           \`\`\`
           X-API-Key: <api_key>
           \`\`\`
        
        ## Rate Limiting
        
        API는 다음과 같은 속도 제한을 적용합니다:
        
        - **일반**: 15분당 1000회
        - **검색**: 1분당 60회  
        - **확장 프로그램**: 1분당 100회
        
        Rate limit 정보는 응답 헤더에 포함됩니다:
        - \`X-RateLimit-Remaining\`: 남은 요청 수
        - \`X-RateLimit-Reset\`: 제한 재설정 시간
        
        ## 에러 처리
        
        모든 에러는 다음 형식으로 반환됩니다:
        
        \`\`\`json
        {
          "success": false,
          "error": {
            "code": "ERROR_CODE",
            "message": "에러 메시지",
            "details": {},
            "timestamp": "2023-12-25T00:00:00.000Z",
            "path": "/api/v1/extensions",
            "method": "GET"
          }
        }
        \`\`\`
        
        ## 페이지네이션
        
        목록 API는 커서 기반 페이지네이션을 사용합니다:
        
        \`\`\`json
        {
          "success": true,
          "data": [...],
          "meta": {
            "pagination": {
              "page": 1,
              "limit": 20,
              "total": 100,
              "totalPages": 5,
              "hasNextPage": true,
              "hasPrevPage": false
            }
          }
        }
        \`\`\`
      `,
      contact: {
        name: 'Claude Hub API Support',
        url: 'https://github.com/your-org/claude-hub',
        email: 'support@claudehub.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: '개발 서버',
      },
      {
        url: 'https://claude-hub.vercel.app/api',
        description: '프로덕션 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Extension: {
          type: 'object',
          required: ['id', 'name', 'description', 'category', 'repoUrl'],
          properties: {
            id: {
              type: 'integer',
              description: '확장 프로그램 고유 ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: '확장 프로그램 이름',
              example: 'Claude GitHub Integration',
            },
            description: {
              type: 'string',
              description: '확장 프로그램 설명',
              example: 'GitHub 저장소와 Claude를 연동하는 확장 프로그램',
            },
            category: {
              $ref: '#/components/schemas/ExtensionCategory',
            },
            repoUrl: {
              type: 'string',
              format: 'uri',
              description: 'GitHub 저장소 URL',
              example: 'https://github.com/user/claude-github',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: '태그 목록',
              example: ['github', 'integration', 'development'],
            },
            stars: {
              type: 'integer',
              minimum: 0,
              description: 'GitHub 스타 수',
              example: 42,
            },
            downloads: {
              type: 'integer',
              minimum: 0,
              description: '다운로드 수',
              example: 1500,
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: '최종 업데이트 일시',
              example: '2023-12-25T10:30:00Z',
            },
            author: {
              type: 'string',
              description: '작성자',
              example: 'johndoe',
            },
            version: {
              type: 'string',
              pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9-]+)?$',
              description: 'SemVer 버전',
              example: '1.2.3',
            },
          },
        },
        ExtensionCategory: {
          type: 'string',
          enum: [
            'Development',
            'API',
            'Browser',
            'Productivity',
            'Terminal',
            'Data',
            'Mobile',
            'DevOps',
            'CMS',
            'E-commerce',
            'Education',
          ],
          description: '확장 프로그램 카테고리',
          example: 'Development',
        },
        CreateExtension: {
          type: 'object',
          required: ['name', 'description', 'category', 'repoUrl'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: '확장 프로그램 이름',
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
              description: '확장 프로그램 설명',
            },
            category: {
              $ref: '#/components/schemas/ExtensionCategory',
            },
            repoUrl: {
              type: 'string',
              format: 'uri',
              description: 'GitHub 또는 GitLab 저장소 URL',
            },
            tags: {
              type: 'array',
              maxItems: 10,
              items: {
                type: 'string',
                minLength: 1,
                maxLength: 50,
              },
              description: '태그 목록 (최대 10개)',
            },
            author: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: '작성자명',
            },
            version: {
              type: 'string',
              pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9-]+)?$',
              description: 'SemVer 형식의 버전',
            },
          },
        },
        UpdateExtension: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
            },
            description: {
              type: 'string',
              minLength: 10,
              maxLength: 1000,
            },
            category: {
              $ref: '#/components/schemas/ExtensionCategory',
            },
            tags: {
              type: 'array',
              maxItems: 10,
              items: {
                type: 'string',
                minLength: 1,
                maxLength: 50,
              },
            },
            author: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
            },
            version: {
              type: 'string',
              pattern: '^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9-]+)?$',
            },
          },
          description: '확장 프로그램 업데이트 데이터 (모든 필드 선택적)',
        },
        ApiResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: '요청 성공 여부',
            },
            data: {
              description: '응답 데이터',
            },
            error: {
              $ref: '#/components/schemas/ApiError',
            },
            meta: {
              $ref: '#/components/schemas/ResponseMeta',
            },
          },
        },
        ApiError: {
          type: 'object',
          required: ['code', 'message', 'timestamp', 'path', 'method'],
          properties: {
            code: {
              type: 'string',
              description: '에러 코드',
              example: 'VALIDATION_ERROR',
            },
            message: {
              type: 'string',
              description: '에러 메시지',
              example: '요청 데이터 검증에 실패했습니다.',
            },
            details: {
              type: 'object',
              description: '에러 상세 정보',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '에러 발생 시간',
            },
            path: {
              type: 'string',
              description: '요청 경로',
              example: '/api/v1/extensions',
            },
            method: {
              type: 'string',
              description: 'HTTP 메소드',
              example: 'GET',
            },
          },
        },
        ResponseMeta: {
          type: 'object',
          properties: {
            pagination: {
              $ref: '#/components/schemas/PaginationMeta',
            },
            rateLimit: {
              $ref: '#/components/schemas/RateLimitMeta',
            },
            cache: {
              $ref: '#/components/schemas/CacheMeta',
            },
            executionTime: {
              type: 'number',
              description: '실행 시간 (밀리초)',
              example: 123,
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPrevPage'],
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: '현재 페이지',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: '페이지당 항목 수',
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: '전체 항목 수',
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: '전체 페이지 수',
            },
            hasNextPage: {
              type: 'boolean',
              description: '다음 페이지 존재 여부',
            },
            hasPrevPage: {
              type: 'boolean',
              description: '이전 페이지 존재 여부',
            },
          },
        },
        RateLimitMeta: {
          type: 'object',
          required: ['remaining', 'resetTime', 'limit'],
          properties: {
            remaining: {
              type: 'integer',
              minimum: 0,
              description: '남은 요청 수',
            },
            resetTime: {
              type: 'integer',
              description: '제한 재설정 시간 (Unix timestamp)',
            },
            limit: {
              type: 'integer',
              description: '최대 요청 수',
            },
          },
        },
        CacheMeta: {
          type: 'object',
          properties: {
            cached: {
              type: 'boolean',
              description: '캐시된 응답 여부',
            },
            cacheKey: {
              type: 'string',
              description: '캐시 키',
            },
            ttl: {
              type: 'integer',
              description: 'TTL (초)',
            },
            etag: {
              type: 'string',
              description: 'ETag',
            },
          },
        },
        SearchResult: {
          type: 'object',
          properties: {
            extensions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Extension',
              },
              description: '검색된 확장 프로그램 목록',
            },
            suggestions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: '검색 제안',
            },
            totalResults: {
              type: 'integer',
              description: '전체 검색 결과 수',
            },
            searchTime: {
              type: 'number',
              description: '검색 실행 시간 (초)',
            },
            query: {
              type: 'string',
              description: '검색 쿼리',
            },
          },
        },
        ExtensionStats: {
          type: 'object',
          properties: {
            totalExtensions: {
              type: 'integer',
              description: '전체 확장 프로그램 수',
            },
            categoryCounts: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              description: '카테고리별 개수',
            },
            totalStars: {
              type: 'integer',
              description: '전체 스타 수',
            },
            totalDownloads: {
              type: 'integer',
              description: '전체 다운로드 수',
            },
            recentExtensions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Extension',
              },
              description: '최근 확장 프로그램들',
            },
            trendingExtensions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Extension',
              },
              description: '인기 확장 프로그램들',
            },
            popularTags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tag: {
                    type: 'string',
                  },
                  count: {
                    type: 'integer',
                  },
                },
              },
              description: '인기 태그들',
            },
          },
        },
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
          description: '페이지 번호',
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
          description: '페이지당 항목 수',
        },
        CategoryParam: {
          name: 'category',
          in: 'query',
          schema: {
            $ref: '#/components/schemas/ExtensionCategory',
          },
          description: '카테고리 필터',
        },
        SortByParam: {
          name: 'sortBy',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['name', 'stars', 'downloads', 'lastUpdated'],
            default: 'name',
          },
          description: '정렬 기준',
        },
        SortOrderParam: {
          name: 'sortOrder',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc',
          },
          description: '정렬 순서',
        },
        ExtensionIdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'integer',
          },
          description: '확장 프로그램 ID',
        },
      },
      responses: {
        NotFound: {
          description: '리소스를 찾을 수 없음',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    properties: {
                      success: { example: false },
                      error: {
                        type: 'object',
                        properties: {
                          code: { example: 'NOT_FOUND' },
                          message: { example: '요청하신 리소스를 찾을 수 없습니다.' },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        ValidationError: {
          description: '요청 데이터 검증 실패',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    properties: {
                      success: { example: false },
                      error: {
                        type: 'object',
                        properties: {
                          code: { example: 'VALIDATION_ERROR' },
                          message: { example: '요청 데이터 검증에 실패했습니다.' },
                          details: {
                            type: 'object',
                            properties: {
                              issues: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    path: { type: 'string', example: 'name' },
                                    message: { type: 'string', example: 'Required' },
                                    code: { type: 'string', example: 'invalid_type' },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        Unauthorized: {
          description: '인증 실패',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    properties: {
                      success: { example: false },
                      error: {
                        type: 'object',
                        properties: {
                          code: { example: 'UNAUTHORIZED' },
                          message: { example: '인증이 필요합니다.' },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        RateLimited: {
          description: '요청 속도 제한',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiResponse' },
                  {
                    properties: {
                      success: { example: false },
                      error: {
                        type: 'object',
                        properties: {
                          code: { example: 'RATE_LIMITED' },
                          message: { example: '요청 속도 제한을 초과했습니다.' },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Extensions',
        description: '확장 프로그램 관련 API',
      },
      {
        name: 'Search',
        description: '검색 관련 API',
      },
      {
        name: 'Stats',
        description: '통계 관련 API',
      },
      {
        name: 'Users',
        description: '사용자 관련 API (인증 필요)',
      },
      {
        name: 'Admin',
        description: '관리자 API (관리자 권한 필요)',
      },
    ],
  },
  apis: [
    './src/app/api/v1/**/*.ts',
  ],
};

// Swagger 스펙 생성
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// GET 요청 - OpenAPI JSON 스펙 반환
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  if (format === 'yaml') {
    // YAML 형식 반환
    const yaml = require('yaml');
    const yamlSpec = yaml.stringify(swaggerSpec);
    
    return new NextResponse(yamlSpec, {
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
      },
    });
  }

  // JSON 형식 반환 (기본값)
  return NextResponse.json(swaggerSpec, {
    headers: {
      'Cache-Control': 'public, max-age=3600', // 1시간 캐시
    },
  });
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}