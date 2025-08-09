/**
 * API-related constants
 */

/**
 * Cache TTL values in milliseconds
 */
export const CACHE_TTL = {
  /** Cache duration for repository info (10 minutes) */
  REPOSITORY: 10 * 60 * 1000,
  /** Cache duration for releases (5 minutes) */
  RELEASES: 5 * 60 * 1000,
  /** Cache duration for contributors (15 minutes) */
  CONTRIBUTORS: 15 * 60 * 1000,
  /** Cache duration for README content (30 minutes) */
  README: 30 * 60 * 1000,
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  GITHUB_BASE: 'https://api.github.com',
  INTERNAL_API: '/api/github',
} as const;

/**
 * API request headers
 */
export const API_HEADERS = {
  GITHUB_ACCEPT: 'application/vnd.github.v3+json',
} as const;

/**
 * API limits
 */
export const API_LIMITS = {
  /** Maximum releases to fetch */
  MAX_RELEASES: 5,
  /** Maximum contributors to show */
  MAX_CONTRIBUTORS: 10,
  /** Debounce delay for search in milliseconds */
  SEARCH_DEBOUNCE: 300,
} as const;

/**
 * Server-side revalidation time in seconds
 */
export const REVALIDATE_TIME = 600; // 10 minutes