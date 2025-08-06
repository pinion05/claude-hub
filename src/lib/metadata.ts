import type { Metadata } from 'next';
import { Extension } from '@/types';
import { Locale, defaultLocale, generateAlternateUrls, generateCanonicalUrl, getLocaleConfig } from '@/lib/i18n/config';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://claude-hub.vercel.app';

interface MetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  extensions?: Extension[];
  locale?: Locale;
}

/**
 * Generate comprehensive metadata for pages
 */
export function generateMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  keywords = [],
  extensions,
  locale = defaultLocale
}: MetadataOptions = {}): Metadata {
  const fullTitle = title 
    ? `${title} | Claude Hub`
    : 'Claude Hub - Discover Claude AI Extensions';
    
  const metaDescription = description || 
    'Explore and discover extensions, tools, and integrations for Claude AI. Find development tools, browser extensions, productivity apps, and more.';
    
  const localeConfig = getLocaleConfig(locale);
  const canonicalUrl = generateCanonicalUrl(path, locale);
  const alternateUrls = generateAlternateUrls(path, locale);
  const imageUrl = image ? `${baseUrl}${image}` : `${baseUrl}/og-image.png`;
  
  // Generate dynamic keywords
  const allKeywords = [
    'Claude AI',
    'Extensions',
    'Tools',
    'Integrations',
    'Plugins',
    'Development',
    'Productivity',
    'Browser Extensions',
    ...keywords
  ];

  // Add extension-specific keywords
  if (extensions) {
    extensions.forEach(ext => {
      allKeywords.push(ext.name, ext.category);
      if (ext.tags) {
        allKeywords.push(...ext.tags);
      }
    });
  }

  const metadata: Metadata = {
    title: fullTitle,
    description: metaDescription,
    keywords: Array.from(new Set(allKeywords)), // Remove duplicates
    authors: [{ name: 'Claude Hub Team' }],
    creator: 'Claude Hub',
    publisher: 'Claude Hub',
    
    robots: noIndex ? {
      index: false,
      follow: false
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: alternateUrls
    },
    
    openGraph: {
      type,
      title: fullTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'Claude Hub',
      locale: localeConfig?.code === 'ko' ? 'ko_KR' : 
              localeConfig?.code === 'ja' ? 'ja_JP' :
              localeConfig?.code === 'zh' ? 'zh_CN' :
              localeConfig?.code === 'es' ? 'es_ES' :
              localeConfig?.code === 'fr' ? 'fr_FR' :
              localeConfig?.code === 'de' ? 'de_DE' :
              'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        }
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime })
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [imageUrl],
      creator: '@claudehub',
      site: '@claudehub'
    },
    
    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE || 'your-google-verification-code',
      other: {
        'bing': process.env.BING_VERIFICATION_CODE || '',
        'yandex': process.env.YANDEX_VERIFICATION_CODE || '',
      }
    },

    category: type === 'article' ? 'technology' : undefined,
    
    // Additional structured metadata
    other: {
      'theme-color': '#FF6B6B',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    }
  };

  return metadata;
}

/**
 * Generate metadata for extension detail pages
 */
export function generateExtensionMetadata(extension: Extension): Metadata {
  const keywords = [
    extension.name,
    extension.category,
    ...(extension.tags || []),
    'Claude AI extension',
    'AI tool'
  ];

  return generateMetadata({
    title: `${extension.name} - Claude AI Extension`,
    description: extension.description,
    path: `/extension/${encodeURIComponent(extension.name.toLowerCase().replace(/\s+/g, '-'))}`,
    image: extension.icon ? `/extensions${extension.icon}` : undefined,
    type: 'article',
    keywords,
    modifiedTime: extension.lastUpdated,
    extensions: [extension]
  });
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(category: string, extensions: Extension[]): Metadata {
  const extensionCount = extensions.length;
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  return generateMetadata({
    title: `${categoryTitle} Extensions for Claude AI`,
    description: `Discover ${extensionCount} ${category.toLowerCase()} extensions and tools for Claude AI. Find the best ${category.toLowerCase()} integrations and plugins.`,
    path: `/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
    keywords: [category, `${category} extensions`, `Claude AI ${category}`, `${category} tools`],
    extensions
  });
}

/**
 * Generate metadata for search results pages
 */
export function generateSearchMetadata(query: string, resultCount: number): Metadata {
  return generateMetadata({
    title: `Search Results for "${query}"`,
    description: `Found ${resultCount} Claude AI extensions matching "${query}". Explore tools, integrations, and plugins.`,
    path: `/search?q=${encodeURIComponent(query)}`,
    keywords: [query, 'search', 'Claude AI extensions', 'tools'],
    noIndex: resultCount === 0 // Don't index empty search results
  });
}

/**
 * Generate JSON-LD structured data for extensions
 */
export function generateExtensionStructuredData(extension: Extension) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: extension.name,
    description: extension.description,
    applicationCategory: extension.category,
    operatingSystem: 'Any',
    url: extension.repoUrl,
    downloadUrl: extension.repoUrl,
    author: {
      '@type': 'Organization',
      name: extension.author || 'Community'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    ...(extension.stars && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Math.min(5, Math.max(1, extension.stars / 1000)),
        bestRating: 5,
        worstRating: 1,
        ratingCount: extension.stars
      }
    }),
    ...(extension.lastUpdated && {
      dateModified: extension.lastUpdated
    }),
    ...(extension.tags && {
      keywords: extension.tags.join(', ')
    })
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}