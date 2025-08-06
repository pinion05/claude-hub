import { Locale } from './config';

/**
 * Translation keys and messages
 * This will be the foundation for full internationalization
 */

export interface TranslationKeys {
  // Common UI elements
  'common.loading': string;
  'common.error': string;
  'common.retry': string;
  'common.cancel': string;
  'common.save': string;
  'common.close': string;
  'common.search': string;
  'common.filter': string;
  'common.sort': string;
  'common.share': string;
  'common.copy': string;
  'common.copied': string;

  // Navigation
  'nav.home': string;
  'nav.extensions': string;
  'nav.categories': string;
  'nav.about': string;
  'nav.skipToContent': string;

  // Search
  'search.placeholder': string;
  'search.noResults': string;
  'search.resultsFound': string;
  'search.loading': string;
  'search.suggestions': string;
  'search.clearSearch': string;

  // Extensions
  'extension.viewDetails': string;
  'extension.stars': string;
  'extension.downloads': string;
  'extension.category': string;
  'extension.author': string;
  'extension.lastUpdated': string;
  'extension.repository': string;
  'extension.website': string;
  'extension.free': string;
  'extension.openSource': string;

  // Categories
  'category.development': string;
  'category.api': string;
  'category.browser': string;
  'category.productivity': string;
  'category.automation': string;
  'category.gaming': string;
  'category.education': string;
  'category.communication': string;
  'category.entertainment': string;
  'category.utility': string;
  'category.business': string;

  // Meta
  'meta.title': string;
  'meta.description': string;
  'meta.keywords': string;

  // Accessibility
  'a11y.screenReader.searchResults': string;
  'a11y.screenReader.navigation': string;
  'a11y.screenReader.keyboard': string;
  'a11y.keyboard.shortcuts': string;
  'a11y.keyboard.instructions': string;

  // Errors
  'error.notFound': string;
  'error.serverError': string;
  'error.networkError': string;
  'error.retry': string;
  'error.goHome': string;

  // Performance
  'performance.score': string;
  'performance.loading': string;
  'performance.webVitals': string;
}

export type TranslationNamespace = keyof TranslationKeys;

const translations: Record<Locale, TranslationKeys> = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.share': 'Share',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',

    // Navigation
    'nav.home': 'Home',
    'nav.extensions': 'Extensions',
    'nav.categories': 'Categories',
    'nav.about': 'About',
    'nav.skipToContent': 'Skip to main content',

    // Search
    'search.placeholder': 'Search extensions...',
    'search.noResults': 'No results found',
    'search.resultsFound': '{count} results found',
    'search.loading': 'Searching...',
    'search.suggestions': 'Search suggestions',
    'search.clearSearch': 'Clear search',

    // Extensions
    'extension.viewDetails': 'View details for {name}',
    'extension.stars': 'Stars',
    'extension.downloads': 'Downloads',
    'extension.category': 'Category',
    'extension.author': 'Author',
    'extension.lastUpdated': 'Last updated',
    'extension.repository': 'Repository',
    'extension.website': 'Website',
    'extension.free': 'Free',
    'extension.openSource': 'Open Source',

    // Categories
    'category.development': 'Development',
    'category.api': 'API',
    'category.browser': 'Browser',
    'category.productivity': 'Productivity',
    'category.automation': 'Automation',
    'category.gaming': 'Gaming',
    'category.education': 'Education',
    'category.communication': 'Communication',
    'category.entertainment': 'Entertainment',
    'category.utility': 'Utility',
    'category.business': 'Business',

    // Meta
    'meta.title': 'Claude Hub - Discover Claude AI Extensions',
    'meta.description': 'Explore and discover extensions, tools, and integrations for Claude AI. Find development tools, browser extensions, productivity apps, and more.',
    'meta.keywords': 'Claude AI, Extensions, Tools, Integrations, Plugins, Development, Productivity',

    // Accessibility
    'a11y.screenReader.searchResults': 'Search results region',
    'a11y.screenReader.navigation': 'Main navigation',
    'a11y.screenReader.keyboard': 'Keyboard navigation available',
    'a11y.keyboard.shortcuts': 'Keyboard shortcuts',
    'a11y.keyboard.instructions': 'Use Tab to navigate, Enter to select, arrow keys for options',

    // Errors
    'error.notFound': 'Page not found',
    'error.serverError': 'Server error occurred',
    'error.networkError': 'Network error',
    'error.retry': 'Try again',
    'error.goHome': 'Go to homepage',

    // Performance
    'performance.score': 'Performance score',
    'performance.loading': 'Measuring performance...',
    'performance.webVitals': 'Web Vitals',
  },

  ko: {
    // Common
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.retry': '다시 시도',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.close': '닫기',
    'common.search': '검색',
    'common.filter': '필터',
    'common.sort': '정렬',
    'common.share': '공유',
    'common.copy': '복사',
    'common.copied': '복사됨!',

    // Navigation
    'nav.home': '홈',
    'nav.extensions': '확장 프로그램',
    'nav.categories': '카테고리',
    'nav.about': '소개',
    'nav.skipToContent': '주요 콘텐츠로 건너뛰기',

    // Search
    'search.placeholder': '확장 프로그램 검색...',
    'search.noResults': '결과를 찾을 수 없습니다',
    'search.resultsFound': '{count}개의 결과를 찾았습니다',
    'search.loading': '검색 중...',
    'search.suggestions': '검색 제안',
    'search.clearSearch': '검색 지우기',

    // Extensions
    'extension.viewDetails': '{name} 세부 정보 보기',
    'extension.stars': '별점',
    'extension.downloads': '다운로드',
    'extension.category': '카테고리',
    'extension.author': '작성자',
    'extension.lastUpdated': '최종 업데이트',
    'extension.repository': '저장소',
    'extension.website': '웹사이트',
    'extension.free': '무료',
    'extension.openSource': '오픈 소스',

    // Categories
    'category.development': '개발',
    'category.api': 'API',
    'category.browser': '브라우저',
    'category.productivity': '생산성',
    'category.automation': '자동화',
    'category.gaming': '게임',
    'category.education': '교육',
    'category.communication': '커뮤니케이션',
    'category.entertainment': '엔터테인먼트',
    'category.utility': '유틸리티',
    'category.business': '비즈니스',

    // Meta
    'meta.title': 'Claude Hub - Claude AI 확장 프로그램 발견',
    'meta.description': 'Claude AI를 위한 확장 프로그램, 도구 및 통합을 탐색하고 발견하세요. 개발 도구, 브라우저 확장 프로그램, 생산성 앱 등을 찾아보세요.',
    'meta.keywords': 'Claude AI, 확장 프로그램, 도구, 통합, 플러그인, 개발, 생산성',

    // Accessibility
    'a11y.screenReader.searchResults': '검색 결과 영역',
    'a11y.screenReader.navigation': '주요 네비게이션',
    'a11y.screenReader.keyboard': '키보드 네비게이션 사용 가능',
    'a11y.keyboard.shortcuts': '키보드 단축키',
    'a11y.keyboard.instructions': 'Tab으로 탐색, Enter로 선택, 화살표 키로 옵션 선택',

    // Errors
    'error.notFound': '페이지를 찾을 수 없습니다',
    'error.serverError': '서버 오류가 발생했습니다',
    'error.networkError': '네트워크 오류',
    'error.retry': '다시 시도',
    'error.goHome': '홈페이지로 이동',

    // Performance
    'performance.score': '성능 점수',
    'performance.loading': '성능 측정 중...',
    'performance.webVitals': '웹 바이탈',
  },

  // Placeholder translations for other languages (to be completed)
  ja: {} as TranslationKeys,
  zh: {} as TranslationKeys,
  es: {} as TranslationKeys,
  fr: {} as TranslationKeys,
  de: {} as TranslationKeys,
};

/**
 * Get translation for a key in the specified locale
 */
export function t(key: TranslationNamespace, locale: Locale = 'en', params?: Record<string, string | number>): string {
  const localeTranslations = translations[locale];
  
  // Fallback to English if translation not found
  const translation = localeTranslations?.[key] || translations.en[key] || key;
  
  // Simple parameter replacement
  if (params) {
    return Object.entries(params).reduce((str, [param, value]) => {
      return str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
    }, translation);
  }
  
  return translation;
}

/**
 * Get all translations for a locale
 */
export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations.en;
}

/**
 * Check if translation exists for a key in locale
 */
export function hasTranslation(key: TranslationNamespace, locale: Locale): boolean {
  return !!(translations[locale]?.[key]);
}

/**
 * Get completion percentage for a locale
 */
export function getTranslationCompleteness(locale: Locale): number {
  if (locale === 'en') return 100;
  
  const englishKeys = Object.keys(translations.en);
  const localeKeys = Object.keys(translations[locale] || {});
  const completedKeys = localeKeys.filter(key => translations[locale][key as TranslationNamespace]);
  
  return Math.round((completedKeys.length / englishKeys.length) * 100);
}

/**
 * Generate SEO-friendly translated content
 */
export function generateTranslatedSeoContent(locale: Locale) {
  return {
    title: t('meta.title', locale),
    description: t('meta.description', locale),
    keywords: t('meta.keywords', locale).split(', '),
    navigation: {
      home: t('nav.home', locale),
      extensions: t('nav.extensions', locale),
      categories: t('nav.categories', locale),
      about: t('nav.about', locale),
    },
    search: {
      placeholder: t('search.placeholder', locale),
      noResults: t('search.noResults', locale),
      loading: t('search.loading', locale),
    },
  };
}

export { translations };