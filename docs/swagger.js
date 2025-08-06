// Swagger/OpenAPI 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Claude Hub API',
      version: '1.0.0',
      description: 'Claude Hub - Claude 확장 프로그램 허브 API 문서',
      contact: {
        name: 'Claude Hub Team',
        email: 'support@claude-hub.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
      {
        url: 'https://claude-hub.vercel.app',
        description: '프로덕션 서버',
      },
    ],
    paths: {},
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
              example: 'Claude Developer Tools',
            },
            description: {
              type: 'string',
              description: '확장 프로그램 설명',
              example: 'Claude와 함께 개발하기 위한 도구 모음',
            },
            category: {
              $ref: '#/components/schemas/ExtensionCategory',
            },
            repoUrl: {
              type: 'string',
              format: 'uri',
              description: '저장소 URL',
              example: 'https://github.com/example/claude-dev-tools',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: '태그 목록',
              example: ['development', 'ai', 'productivity'],
            },
            stars: {
              type: 'integer',
              minimum: 0,
              description: '별점 수',
              example: 142,
            },
            downloads: {
              type: 'integer',
              minimum: 0,
              description: '다운로드 수',
              example: 1543,
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: '마지막 업데이트 날짜',
              example: '2024-01-15T10:30:00Z',
            },
            author: {
              type: 'string',
              description: '작성자',
              example: 'example-user',
            },
            version: {
              type: 'string',
              pattern: '^\\d+\\.\\d+\\.\\d+',
              description: '버전',
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
              items: {
                type: 'string',
                minLength: 1,
                maxLength: 50,
              },
              maxItems: 10,
              description: '태그 목록',
            },
            author: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: '작성자',
            },
            version: {
              type: 'string',
              pattern: '^\\d+\\.\\d+\\.\\d+',
              description: '버전',
            },
          },
        },
        UpdateExtension: {
          allOf: [
            {
              $ref: '#/components/schemas/CreateExtension',
            },
          ],
          description: '확장 프로그램 수정 데이터 (모든 필드 선택적)',
        },
        ExtensionStats: {
          type: 'object',
          properties: {
            totalExtensions: {
              type: 'integer',
              description: '총 확장 프로그램 수',
            },
            categoryCounts: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              description: '카테고리별 확장 프로그램 수',
            },
            totalStars: {
              type: 'integer',
              description: '총 별점 수',
            },
            totalDownloads: {
              type: 'integer',
              description: '총 다운로드 수',
            },
            recentExtensions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Extension',
              },
              description: '최근 업데이트된 확장 프로그램들',
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
        UserPreferences: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '설정 ID',
            },
            userId: {
              type: 'string',
              description: '사용자 ID',
            },
            theme: {
              type: 'string',
              enum: ['light', 'dark', 'auto'],
              description: '테마 설정',
            },
            language: {
              type: 'string',
              enum: ['ko', 'en'],
              description: '언어 설정',
            },
            searchHistory: {
              type: 'boolean',
              description: '검색 기록 저장 여부',
            },
            notifications: {
              type: 'object',
              properties: {
                newExtensions: {
                  type: 'boolean',
                  description: '새 확장 프로그램 알림',
                },
                updates: {
                  type: 'boolean',
                  description: '업데이트 알림',
                },
                trending: {
                  type: 'boolean',
                  description: '인기 확장 프로그램 알림',
                },
              },
            },
            favoriteCategories: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ExtensionCategory',
              },
              description: '선호 카테고리 목록',
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
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: '현재 페이지',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              description: '페이지당 항목 수',
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: '총 항목 수',
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: '총 페이지 수',
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
          properties: {
            remaining: {
              type: 'integer',
              description: '남은 요청 수',
            },
            resetTime: {
              type: 'integer',
              description: '리셋 시간 (타임스탬프)',
            },
            limit: {
              type: 'integer',
              description: '제한 수',
            },
          },
        },
        CacheMeta: {
          type: 'object',
          properties: {
            cached: {
              type: 'boolean',
              description: '캐시 여부',
            },
            ttl: {
              type: 'integer',
              description: '캐시 유효 시간 (초)',
            },
            etag: {
              type: 'string',
              description: 'ETag',
            },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
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
                  description: 'API 경로',
                },
                method: {
                  type: 'string',
                  description: 'HTTP 메소드',
                },
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
        name: 'User',
        description: '사용자 관련 API',
      },
      {
        name: 'Analytics',
        description: '분석 및 통계 API',
      },
    ],
  },
  apis: [
    // API 라우트 파일들
    './src/app/api/v1/**/*.ts',
    './src/app/api/**/*.ts',
  ],
};

module.exports = swaggerOptions;