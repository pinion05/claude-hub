import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # 스칼라 타입
  scalar Date
  scalar JSON

  # 확장 프로그램 카테고리
  enum ExtensionCategory {
    DEVELOPMENT
    API
    BROWSER
    PRODUCTIVITY
    TERMINAL
    DATA
    MOBILE
    DEVOPS
    CMS
    E_COMMERCE
    EDUCATION
  }

  # 정렬 순서
  enum SortOrder {
    ASC
    DESC
  }

  # 정렬 기준
  enum ExtensionSortBy {
    NAME
    STARS
    DOWNLOADS
    LAST_UPDATED
    RELEVANCE
  }

  # 확장 프로그램 타입
  type Extension {
    id: Int!
    name: String!
    description: String!
    category: ExtensionCategory!
    repoUrl: String!
    tags: [String!]
    stars: Int
    downloads: Int
    lastUpdated: Date
    author: String
    version: String
    # 관련 데이터
    bookmarked: Boolean
    averageRating: Float
    reviewCount: Int
    reviews(first: Int, after: String): ReviewConnection
  }

  # 북마크 타입
  type Bookmark {
    id: ID!
    extension: Extension!
    tags: [String!]
    notes: String
    createdAt: Date!
  }

  # 리뷰 타입
  type Review {
    id: ID!
    extension: Extension!
    user: User
    rating: Int!
    comment: String
    helpful: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  # 사용자 타입
  type User {
    id: ID!
    email: String
    role: String!
    bookmarks(first: Int, after: String): BookmarkConnection
    reviews(first: Int, after: String): ReviewConnection
    preferences: UserPreferences
  }

  # 사용자 설정 타입
  type UserPreferences {
    id: ID!
    theme: String!
    language: String!
    searchHistory: Boolean!
    notifications: NotificationSettings!
    favoriteCategories: [ExtensionCategory!]!
  }

  # 알림 설정 타입
  type NotificationSettings {
    newExtensions: Boolean!
    updates: Boolean!
    trending: Boolean!
  }

  # 통계 타입
  type ExtensionStats {
    totalExtensions: Int!
    categoryCounts: JSON!
    totalStars: Int!
    totalDownloads: Int!
    recentExtensions: [Extension!]!
    trendingExtensions: [Extension!]!
    popularTags: [TagCount!]!
  }

  # 태그 카운트 타입
  type TagCount {
    tag: String!
    count: Int!
  }

  # 페이지네이션을 위한 Connection 타입들
  type ExtensionConnection {
    edges: [ExtensionEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ExtensionEdge {
    node: Extension!
    cursor: String!
  }

  type BookmarkConnection {
    edges: [BookmarkEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type BookmarkEdge {
    node: Bookmark!
    cursor: String!
  }

  type ReviewConnection {
    edges: [ReviewEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ReviewEdge {
    node: Review!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # 검색 결과 타입
  type SearchResult {
    extensions: ExtensionConnection!
    suggestions: [String!]!
    totalResults: Int!
    searchTime: Float!
    query: String!
  }

  # 입력 타입들
  input ExtensionFilter {
    category: ExtensionCategory
    tags: [String!]
    minStars: Int
    maxStars: Int
    dateFrom: Date
    dateTo: Date
    author: String
    hasDownloads: Boolean
  }

  input ExtensionSort {
    field: ExtensionSortBy!
    order: SortOrder!
  }

  input CreateExtensionInput {
    name: String!
    description: String!
    category: ExtensionCategory!
    repoUrl: String!
    tags: [String!]
    author: String
    version: String
  }

  input UpdateExtensionInput {
    name: String
    description: String
    category: ExtensionCategory
    repoUrl: String
    tags: [String!]
    author: String
    version: String
  }

  input CreateBookmarkInput {
    extensionId: Int!
    tags: [String!]
    notes: String
  }

  input UpdateBookmarkInput {
    tags: [String!]
    notes: String
  }

  input CreateReviewInput {
    extensionId: Int!
    rating: Int!
    comment: String
  }

  input UpdateReviewInput {
    rating: Int
    comment: String
  }

  input UserPreferencesInput {
    theme: String
    language: String
    searchHistory: Boolean
    notifications: NotificationSettingsInput
    favoriteCategories: [ExtensionCategory!]
  }

  input NotificationSettingsInput {
    newExtensions: Boolean
    updates: Boolean
    trending: Boolean
  }

  # 쿼리 타입
  type Query {
    # 확장 프로그램 관련
    extensions(
      first: Int = 20
      after: String
      filter: ExtensionFilter
      sort: ExtensionSort
    ): ExtensionConnection!
    
    extension(id: Int!): Extension
    
    featuredExtensions(limit: Int = 10): [Extension!]!
    
    popularExtensions(limit: Int = 10): [Extension!]!
    
    # 검색
    search(
      query: String!
      first: Int = 20
      after: String
      filter: ExtensionFilter
      sort: ExtensionSort
    ): SearchResult!
    
    searchSuggestions(query: String, limit: Int = 10): [String!]!
    
    # 통계
    stats: ExtensionStats!
    
    # 사용자 관련 (인증 필요)
    me: User
    myBookmarks(first: Int = 20, after: String): BookmarkConnection!
    myReviews(first: Int = 20, after: String): ReviewConnection!
    myPreferences: UserPreferences
    
    # 카테고리
    categories: [ExtensionCategory!]!
    categoryStats: JSON!
  }

  # 뮤테이션 타입
  type Mutation {
    # 확장 프로그램 관리 (관리자 권한 필요)
    createExtension(input: CreateExtensionInput!): Extension!
    updateExtension(id: Int!, input: UpdateExtensionInput!): Extension!
    deleteExtension(id: Int!): Boolean!
    
    # 북마크 관리 (인증 필요)
    createBookmark(input: CreateBookmarkInput!): Bookmark!
    updateBookmark(id: ID!, input: UpdateBookmarkInput!): Bookmark!
    deleteBookmark(id: ID!): Boolean!
    
    # 리뷰 관리 (인증 필요)
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
    
    # 사용자 설정 (인증 필요)
    updatePreferences(input: UserPreferencesInput!): UserPreferences!
    
    # 관리자 기능
    featureExtension(id: Int!): Extension!
    unfeatureExtension(id: Int!): Extension!
  }

  # 구독 타입 (실시간 업데이트)
  type Subscription {
    extensionAdded: Extension!
    extensionUpdated: Extension!
    extensionDeleted: Int!
    statsUpdated: ExtensionStats!
    userActivity(userId: ID!): JSON!
  }
`;