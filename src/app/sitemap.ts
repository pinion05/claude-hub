import type { MetadataRoute } from 'next';
import { getExtensions, getExtensionCategories, getExtensionStats } from '@/lib/server/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://claude-hub.vercel.app';
  const currentDate = new Date();
  
  try {
    // Fetch data for dynamic sitemap generation
    const extensions = await getExtensions();
    const categories = getExtensionCategories();
    const _stats = getExtensionStats(extensions);

    const routes: MetadataRoute.Sitemap = [
      // Main pages
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1,
        alternates: {
          languages: {
            en: `${baseUrl}`,
            ko: `${baseUrl}/ko`, // 미래 다국어 지원 준비
          }
        }
      },
      {
        url: `${baseUrl}/extensions`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/about`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.5
      },
    ];

    // Category pages
    categories.forEach(category => {
      routes.push({
        url: `${baseUrl}/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7
      });
    });

    // Extension pages (if individual extension pages exist)
    extensions.forEach(extension => {
      routes.push({
        url: `${baseUrl}/extension/${encodeURIComponent(extension.name.toLowerCase().replace(/\s+/g, '-'))}`,
        lastModified: extension.lastUpdated ? new Date(extension.lastUpdated) : currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
        images: extension.icon ? [`${baseUrl}${extension.icon}`] : undefined
      });
    });

    // API routes (for programmatic access)
    routes.push({
      url: `${baseUrl}/api/extensions`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.3
    });

    return routes;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback sitemap if data fetching fails
    return [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1
      }
    ];
  }
}