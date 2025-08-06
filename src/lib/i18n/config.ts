/**
 * Internationalization configuration for Claude Hub
 * Supports SEO-friendly multi-language setup
 */

export const defaultLocale = 'en' as const;
export const locales = ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de'] as const;

export type Locale = (typeof locales)[number];

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region: string;
  hreflang: string;
  enabled: boolean;
}

export const localeConfig: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    region: 'US',
    hreflang: 'en',
    enabled: true,
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    region: 'KR',
    hreflang: 'ko',
    enabled: true,
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    region: 'JP',
    hreflang: 'ja',
    enabled: false, // Enable when translations are ready
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    region: 'CN',
    hreflang: 'zh',
    enabled: false,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    region: 'ES',
    hreflang: 'es',
    enabled: false,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    region: 'FR',
    hreflang: 'fr',
    enabled: false,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    region: 'DE',
    hreflang: 'de',
    enabled: false,
  },
};

/**
 * Get enabled locales only
 */
export function getEnabledLocales(): LocaleConfig[] {
  return Object.values(localeConfig).filter(locale => locale.enabled);
}

/**
 * Get locale configuration by code
 */
export function getLocaleConfig(locale: string): LocaleConfig | undefined {
  return localeConfig[locale as Locale];
}

/**
 * Check if locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get best matching locale from Accept-Language header
 */
export function getBestMatchingLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return defaultLocale;

  const preferredLanguages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return {
        code: code.toLowerCase().split('-')[0],
        quality: parseFloat(q),
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const lang of preferredLanguages) {
    const matchedLocale = Object.values(localeConfig).find(
      locale => locale.enabled && locale.code === lang.code
    );
    if (matchedLocale) {
      return matchedLocale.code;
    }
  }

  return defaultLocale;
}

/**
 * Generate hreflang links for a given path
 */
export function generateHreflangLinks(
  basePath: string,
  _currentLocale: Locale = defaultLocale
): Array<{ hreflang: string; href: string }> {
  const enabledLocales = getEnabledLocales();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://claude-hub.vercel.app';
  
  const links = enabledLocales.map(locale => ({
    hreflang: locale.hreflang,
    href: locale.code === defaultLocale 
      ? `${baseUrl}${basePath}`
      : `${baseUrl}/${locale.code}${basePath}`,
  }));

  // Add x-default link pointing to default locale
  links.push({
    hreflang: 'x-default',
    href: `${baseUrl}${basePath}`,
  });

  return links;
}

/**
 * Get localized path
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // For default locale, return path as-is
  if (locale === defaultLocale) {
    return `/${cleanPath}`;
  }
  
  // For other locales, prefix with locale code
  return `/${locale}/${cleanPath}`;
}

/**
 * Remove locale prefix from path
 */
export function removeLocaleFromPath(path: string): { locale: Locale; path: string } {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { locale: defaultLocale, path: '/' };
  }
  
  const maybeLocale = segments[0];
  
  if (isValidLocale(maybeLocale) && localeConfig[maybeLocale].enabled) {
    const remainingPath = segments.slice(1).join('/');
    return {
      locale: maybeLocale,
      path: remainingPath ? `/${remainingPath}` : '/',
    };
  }
  
  return { locale: defaultLocale, path };
}

/**
 * SEO-friendly alternate URLs for different locales
 */
export function generateAlternateUrls(
  path: string,
  _currentLocale: Locale = defaultLocale
): Record<string, string> {
  const enabledLocales = getEnabledLocales();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://claude-hub.vercel.app';
  
  const alternates: Record<string, string> = {};
  
  enabledLocales.forEach(locale => {
    const localizedPath = getLocalizedPath(path, locale.code);
    alternates[locale.hreflang] = `${baseUrl}${localizedPath}`;
  });
  
  return alternates;
}

/**
 * Language detection patterns for different regions
 */
export const languagePatterns = {
  // Korean language patterns
  ko: {
    patterns: [/^ko/, /korean/i, /한국/],
    regions: ['KR'],
  },
  
  // Japanese language patterns
  ja: {
    patterns: [/^ja/, /japanese/i, /日本/],
    regions: ['JP'],
  },
  
  // Chinese language patterns
  zh: {
    patterns: [/^zh/, /chinese/i, /中文/, /中国/],
    regions: ['CN', 'TW', 'HK'],
  },
  
  // Spanish language patterns
  es: {
    patterns: [/^es/, /spanish/i, /español/i],
    regions: ['ES', 'MX', 'AR', 'CO', 'VE', 'PE', 'CL'],
  },
  
  // French language patterns
  fr: {
    patterns: [/^fr/, /french/i, /français/i],
    regions: ['FR', 'CA', 'BE', 'CH'],
  },
  
  // German language patterns
  de: {
    patterns: [/^de/, /german/i, /deutsch/i],
    regions: ['DE', 'AT', 'CH'],
  },
} as const;

/**
 * Get locale from URL pathname
 */
export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return defaultLocale;
  }
  
  const maybeLocale = segments[0];
  
  if (isValidLocale(maybeLocale) && localeConfig[maybeLocale].enabled) {
    return maybeLocale;
  }
  
  return defaultLocale;
}

/**
 * Generate canonical URL for a given path and locale
 */
export function generateCanonicalUrl(
  path: string,
  locale: Locale = defaultLocale
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://claude-hub.vercel.app';
  const localizedPath = getLocalizedPath(path, locale);
  return `${baseUrl}${localizedPath}`;
}