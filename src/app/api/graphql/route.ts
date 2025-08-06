import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { NextRequest } from 'next/server';
import { typeDefs } from '@/lib/graphql/schema';
import { resolvers } from '@/lib/graphql/resolvers';
import { authMiddleware } from '@/lib/api/middleware';
import type { GraphQLContext } from '@/lib/api/types';

// GraphQL 스키마 생성
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Apollo Server 설정
const server = new ApolloServer<GraphQLContext>({
  schema,
  // 개발 환경에서만 GraphQL Playground 활성화
  introspection: process.env.NODE_ENV === 'development',
  
  // 에러 포맷팅
  formatError: (error) => {
    // 개발 환경에서는 전체 에러 스택 표시
    if (process.env.NODE_ENV === 'development') {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code,
        locations: error.locations,
        path: error.path,
        stack: error.stack,
      };
    }

    // 프로덕션 환경에서는 민감한 정보 제거
    return {
      message: error.message,
      code: error.extensions?.code,
    };
  },

  // 플러그인 설정
  plugins: [
    // 성능 모니터링 플러그인
    {
      requestDidStart() {
        return {
          willSendResponse(requestContext) {
            const { request, response } = requestContext;
            
            // 실행 시간 로깅
            if (process.env.NODE_ENV === 'development') {
              console.log(`GraphQL ${request.operationName}: ${response.http.body}`);
            }
          },
        };
      },
    },
    
    // Rate limiting 플러그인 (필요시 구현)
    {
      requestDidStart() {
        return {
          async didResolveOperation({ request, operationName }) {
            // 복잡한 쿼리에 대한 제한 로직
            const complexity = calculateQueryComplexity(request.query);
            if (complexity > 1000) {
              throw new Error('Query too complex');
            }
          },
        };
      },
    },
  ],
});

// 쿼리 복잡도 계산 (간단한 구현)
function calculateQueryComplexity(query: any): number {
  // TODO: 실제 복잡도 계산 로직 구현
  // 현재는 단순히 쿼리 길이로 추정
  return query?.toString().length || 0;
}

// Context 생성 함수
async function createContext(req: NextRequest): Promise<GraphQLContext> {
  // 인증 정보 추출
  const user = authMiddleware(req);
  
  return {
    req,
    user,
    dataSources: {
      // TODO: 데이터 소스 추가 (예: 데이터베이스 커넥션)
      extensionAPI: {},
    },
  };
}

// Next.js 핸들러 생성
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: createContext,
});

// CORS 헤더 추가
async function withCors(request: NextRequest) {
  const response = await handler(request);
  
  // CORS 헤더 추가
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// HTTP 메소드 핸들러들
export async function GET(request: NextRequest) {
  return withCors(request);
}

export async function POST(request: NextRequest) {
  return withCors(request);
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}