import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://claude-hub.vercel.app';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/extensions',
          '/api/search'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/static/',
          '/coverage/',
          '/node_modules/',
          '/*.json$',
          '/*.log$'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1
      }
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
    host: baseUrl
  };
}