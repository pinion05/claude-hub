/**
 * UI-related constants
 */

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Scroll thresholds
 */
export const SCROLL_THRESHOLD = {
  STICKY_HEADER: 200,
} as const;

/**
 * Grid layout configurations
 */
export const GRID_CONFIG = {
  /** Number of skeleton cards to show while loading */
  SKELETON_COUNT: 6,
  /** Grid columns for different breakpoints */
  COLUMNS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
  },
} as const;

/**
 * Modal configurations
 */
export const MODAL_CONFIG = {
  /** Maximum width of modal in pixels */
  MAX_WIDTH: 800,
  /** Modal size as percentage of viewport */
  SIZE_PERCENTAGE: 0.8,
} as const;

/**
 * Search configurations
 */
export const SEARCH_CONFIG = {
  /** Minimum query length to trigger search */
  MIN_QUERY_LENGTH: 2,
  /** Maximum suggestions to show */
  MAX_SUGGESTIONS: 5,
} as const;