'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { 
  searchExtensions as serverSearchExtensions,
  getFilteredSuggestions,
  filterExtensions,
  getAllExtensions 
} from '@/lib/server/data';
import { ExtensionCategory, FilterOptions } from '@/types';

/**
 * Server Actions for Claude Hub
 * These functions run on the server and can be called from client components
 */

export async function searchExtensions(query: string) {
  try {
    if (!query.trim()) {
      return {
        extensions: await getAllExtensions(),
        suggestions: [],
        total: 0,
        query: ''
      };
    }

    const [extensions, suggestions] = await Promise.all([
      serverSearchExtensions(query),
      getFilteredSuggestions(query)
    ]);

    return {
      extensions,
      suggestions,
      total: extensions.length,
      query
    };
  } catch (error) {
    console.error('Search action error:', error);
    throw new Error('Failed to search extensions');
  }
}

export async function filterExtensionsAction(
  category?: ExtensionCategory,
  sortBy?: FilterOptions['sortBy'],
  sortOrder?: FilterOptions['sortOrder']
) {
  try {
    const filterOptions: FilterOptions = {
      ...(category && { category }),
      ...(sortBy && { sortBy }),
      sortOrder: sortOrder || 'desc'
    };

    const extensions = await filterExtensions(filterOptions);
    
    return {
      extensions,
      total: extensions.length,
      filters: filterOptions
    };
  } catch (error) {
    console.error('Filter action error:', error);
    throw new Error('Failed to filter extensions');
  }
}

export async function getSuggestions(query?: string) {
  try {
    const suggestions = query 
      ? await getFilteredSuggestions(query)
      : [];

    return { suggestions };
  } catch (error) {
    console.error('Suggestions action error:', error);
    throw new Error('Failed to get suggestions');
  }
}

/**
 * Search with advanced filters
 */
export async function advancedSearch(formData: FormData) {
  const query = formData.get('query') as string;
  const category = formData.get('category') as ExtensionCategory;
  const sortBy = formData.get('sortBy') as FilterOptions['sortBy'];
  const sortOrder = formData.get('sortOrder') as FilterOptions['sortOrder'];

  try {
    let extensions = await serverSearchExtensions(query || '');

    if (category || sortBy) {
      const filterOptions: FilterOptions = {
        ...(category && { category }),
        ...(sortBy && { sortBy }),
        sortOrder: sortOrder || 'desc'
      };

      extensions = await filterExtensions(filterOptions);
    }

    // Revalidate the current path to update the UI
    revalidatePath('/');

    return {
      extensions,
      total: extensions.length,
      query,
      filters: { category, sortBy, sortOrder }
    };
  } catch (error) {
    console.error('Advanced search action error:', error);
    throw new Error('Failed to perform advanced search');
  }
}

/**
 * Navigate to extension details
 */
export async function navigateToExtension(extensionId: number) {
  redirect(`/extension/${extensionId}`);
}

/**
 * Reset search - clear all filters and return to home
 */
export async function resetSearch() {
  revalidatePath('/');
  redirect('/');
}

/**
 * Toggle favorite extension (future feature)
 */
export async function toggleFavorite(extensionId: number) {
  // This would update user preferences in a database
  // For now, just revalidate the path
  revalidatePath('/');
  
  return { success: true, extensionId };
}

/**
 * Submit search analytics (future feature)
 */
export async function trackSearch(query: string, resultCount: number) {
  try {
    // This would log search analytics to a service
    console.log(`Search tracked: "${query}" - ${resultCount} results`);
    
    return { tracked: true };
  } catch (error) {
    console.error('Search tracking error:', error);
    // Don't throw error for analytics - fail silently
    return { tracked: false };
  }
}