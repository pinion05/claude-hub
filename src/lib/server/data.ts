import { Extension, ExtensionCategory, FilterOptions } from '@/types';
import { extensions as extensionsData } from '@/data/extensions';
import { defaultSuggestions } from '@/data/suggestions';

/**
 * Server-side data access layer for extensions
 */

/**
 * Get all extensions from the server
 * This simulates server-side data fetching
 */
export async function getAllExtensions(): Promise<Extension[]> {
  // In a real app, this would fetch from a database
  // Adding artificial delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return extensionsData;
}

/**
 * Get extensions by category
 */
export async function getExtensionsByCategory(category: ExtensionCategory): Promise<Extension[]> {
  const extensions = await getAllExtensions();
  return extensions.filter(ext => ext.category === category);
}

/**
 * Search extensions based on query
 */
export async function searchExtensions(query: string): Promise<Extension[]> {
  const extensions = await getAllExtensions();
  
  if (!query.trim()) {
    return extensions;
  }

  const lowerQuery = query.toLowerCase();
  
  return extensions.filter(extension => {
    const matchesName = extension.name.toLowerCase().includes(lowerQuery);
    const matchesDescription = extension.description.toLowerCase().includes(lowerQuery);
    const matchesTags = extension.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    const matchesCategory = extension.category.toLowerCase().includes(lowerQuery);
    
    return matchesName || matchesDescription || matchesTags || matchesCategory;
  });
}

/**
 * Filter and sort extensions
 */
export async function filterExtensions(options: FilterOptions): Promise<Extension[]> {
  let extensions = await getAllExtensions();
  
  // Apply category filter
  if (options.category) {
    extensions = extensions.filter(ext => ext.category === options.category);
  }
  
  // Apply sorting
  if (options.sortBy) {
    extensions.sort((a, b) => {
      const order = options.sortOrder === 'desc' ? -1 : 1;
      
      switch (options.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * order;
        case 'stars':
          return ((a.stars || 0) - (b.stars || 0)) * order;
        case 'downloads':
          return ((a.downloads || 0) - (b.downloads || 0)) * order;
        case 'lastUpdated':
          const dateA = new Date(a.lastUpdated || 0);
          const dateB = new Date(b.lastUpdated || 0);
          return (dateA.getTime() - dateB.getTime()) * order;
        default:
          return 0;
      }
    });
  }
  
  return extensions;
}

/**
 * Get extension by ID
 */
export async function getExtensionById(id: number): Promise<Extension | null> {
  const extensions = await getAllExtensions();
  return extensions.find(ext => ext.id === id) || null;
}

/**
 * Get featured extensions (top by stars)
 */
export async function getFeaturedExtensions(limit: number = 10): Promise<Extension[]> {
  const extensions = await getAllExtensions();
  return extensions
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, limit);
}

/**
 * Get extension categories with counts
 */
export async function getExtensionCategoriesWithCounts(): Promise<Array<{ category: ExtensionCategory; count: number }>> {
  const extensions = await getAllExtensions();
  
  const categoryCounts = extensions.reduce((acc, ext) => {
    acc[ext.category] = (acc[ext.category] || 0) + 1;
    return acc;
  }, {} as Record<ExtensionCategory, number>);
  
  return Object.entries(categoryCounts).map(([category, count]) => ({
    category: category as ExtensionCategory,
    count
  }));
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(): Promise<string[]> {
  return defaultSuggestions;
}

/**
 * Get filtered suggestions based on query
 */
export async function getFilteredSuggestions(query: string): Promise<string[]> {
  const suggestions = await getSearchSuggestions();
  
  if (!query.trim()) {
    return suggestions;
  }
  
  const lowerQuery = query.toLowerCase();
  return suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get extension statistics
 */
export async function getExtensionStats() {
  const extensions = await getAllExtensions();
  
  const totalExtensions = extensions.length;
  const totalStars = extensions.reduce((sum, ext) => sum + (ext.stars || 0), 0);
  const totalDownloads = extensions.reduce((sum, ext) => sum + (ext.downloads || 0), 0);
  const categories = new Set(extensions.map(ext => ext.category)).size;
  
  return {
    totalExtensions,
    totalStars,
    totalDownloads,
    categories
  };
}

/**
 * Get extensions (alias for getAllExtensions for sitemap compatibility)
 */
export async function getExtensions(): Promise<Extension[]> {
  return getAllExtensions();
}

/**
 * Get extension categories as array
 */
export function getExtensionCategories(): ExtensionCategory[] {
  // Extract unique categories from the extensions data
  const categories = Array.from(new Set(extensionsData.map(ext => ext.category)));
  return categories;
}


/**
 * Cache utilities for server-side data
 */
export const dataCache = {
  extensions: null as Extension[] | null,
  lastFetch: 0,
  TTL: 5 * 60 * 1000, // 5 minutes
  
  async get(): Promise<Extension[]> {
    const now = Date.now();
    if (!this.extensions || (now - this.lastFetch) > this.TTL) {
      this.extensions = await getAllExtensions();
      this.lastFetch = now;
    }
    return this.extensions;
  },
  
  clear() {
    this.extensions = null;
    this.lastFetch = 0;
  }
};