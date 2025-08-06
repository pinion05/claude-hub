import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/lib/graphql/schema.ts',
  documents: [
    './src/**/*.{ts,tsx}',
    './src/lib/graphql/**/*.graphql',
  ],
  ignoreNoDocuments: true,
  generates: {
    // TypeScript 타입 생성
    './src/lib/graphql/generated/types.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-resolvers',
      ],
      config: {
        useIndexSignature: true,
        federation: false,
        contextType: '@/lib/api/types#GraphQLContext',
        mapperTypeSuffix: 'Entity',
        mappers: {
          Extension: '@/types#Extension',
          ExtensionCategory: '@/types#ExtensionCategory',
        },
        scalars: {
          Date: 'string',
          JSON: 'Record<string, any>',
        },
        enumValues: {
          ExtensionCategory: '@/types#ExtensionCategory',
        },
        // 타입 안전성 향상
        strictScalars: true,
        namingConvention: {
          transformUnderscore: true,
        },
        // 선택적 필드에 대한 타입 처리
        maybeValue: 'T | null | undefined',
        // 기본값 설정
        defaultScalarType: 'unknown',
        // Resolver 타입 생성
        makeResolverTypeCallable: true,
        // 입력 타입 접두사 제거
        typesPrefix: '',
        // 인터페이스보다 타입 선호
        declarationKind: 'type',
      },
    },

    // React Query 훅 생성
    './src/lib/graphql/generated/hooks.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-query',
      ],
      config: {
        fetcher: {
          endpoint: '/api/graphql',
          fetchParams: {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        },
        exposeDocument: true,
        exposeFetcher: true,
        exposeQueryKeys: true,
        addSuspenseQuery: true,
        addInfiniteQuery: true,
        reactQueryVersion: 5,
      },
    },

    // GraphQL 스키마 검증용 JSON
    './src/lib/graphql/generated/schema.json': {
      plugins: ['introspection'],
      config: {
        minify: false,
      },
    },

    // Fragment matcher (Apollo Client용 - 필요시)
    './src/lib/graphql/generated/fragment-matcher.ts': {
      plugins: ['fragment-matcher'],
      config: {
        apolloClientVersion: 3,
      },
    },
  ],
  hooks: {
    afterAllFileWrite: [
      'prettier --write',
      // ESLint 수정
      'eslint --fix',
    ],
  },
  config: {
    // 전역 설정
    skipTypename: false,
    withHooks: true,
    withComponent: false,
    withHOC: false,
    withRefetchFn: false,
    apolloReactCommonImportFrom: '@apollo/client',
    apolloReactHooksImportFrom: '@apollo/client',
    reactQueryImportFrom: '@tanstack/react-query',
    // 타입 안전성
    strictScalars: true,
    scalars: {
      Date: {
        input: 'string | Date',
        output: 'string',
      },
      JSON: {
        input: 'Record<string, any>',
        output: 'Record<string, any>',
      },
    },
  },
};

export default config;