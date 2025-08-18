import { Extension } from '@/types';
import { GitHubAPIError, RateLimitError, ValidationError, ErrorHandler } from '@/lib/errors';
import { API_HEADERS, REVALIDATE_TIME } from '@/constants/api';
import repositoriesData from '../../all-repositories.json';

// Basic extensions data from JSON
export const extensionsBase: Omit<Extension, 'description' | 'stars' | 'lastUpdated' | 'version' | 'author'>[] = repositoriesData.repositories
  .map((repo, index) => ({
    id: index + 1,
    name: repo.name,
    category: repo.category as Extension['category'],
    repoUrl: repo.github_url,
    githubUrl: repo.github_url,
    tags: repo.tags
  }));

/**
 * Fetches complete extension data including GitHub API information
 * 
 * Enriches basic extension data with real-time GitHub stats including
 * stars, description, last updated date, and latest version tag.
 * Implements error handling and fallback values for API failures.
 * 
 * @async
 * @param {typeof extensionsBase[0]} extension - Basic extension data
 * @returns {Promise<Extension>} Complete extension with GitHub data
 * @throws {GitHubAPIError} When GitHub API returns error status
 * @throws {RateLimitError} When GitHub rate limit is exceeded
 * @throws {ValidationError} When GitHub URL is invalid
 */
export async function fetchExtensionWithGitHubData(
  extension: typeof extensionsBase[0]
): Promise<Extension> {
  try {
    // Extract owner and repo from GitHub URL
    const match = extension.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new ValidationError(`Invalid GitHub URL: ${extension.githubUrl}`);
    }
    const [, owner, repo] = match;
    
    // Use direct GitHub API for server-side fetching
    const headers: HeadersInit = {
      'Accept': API_HEADERS.GITHUB_ACCEPT,
    };
    
    // Add GitHub token if available (server-side only)
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    if (token && token !== 'YOUR_GITHUB_TOKEN_HERE') {
      headers['Authorization'] = `token ${token}`;
    }
    
    // Fetch repository data
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: REVALIDATE_TIME }
    });
    
    // Check for rate limiting
    if (repoResponse.status === 429) {
      throw RateLimitError.fromGitHubHeaders(repoResponse.headers);
    }
    
    if (!repoResponse.ok) {
      const errorBody = await repoResponse.json().catch(() => null);
      throw GitHubAPIError.fromResponse(repoResponse, errorBody);
    }
    
    const repoData = await repoResponse.json();
    
    // Try to fetch latest release
    let version: string | undefined;
    try {
      const releaseResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
        { 
          headers,
          next: { revalidate: REVALIDATE_TIME }
        }
      );
      
      if (releaseResponse.ok) {
        const releaseData = await releaseResponse.json();
        version = releaseData.tag_name;
      }
    } catch {
      // Ignore release fetch errors - releases are optional
    }
    
    // Try to fetch commit activity stats
    let commitActivity: Extension['commitActivity'] | undefined;
    try {
      const statsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
        { 
          headers,
          next: { revalidate: REVALIDATE_TIME }
        }
      );
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        if (statsData && Array.isArray(statsData) && statsData.length > 0) {
          // Calculate activity level based on recent commits
          const lastFourWeeks = statsData.slice(-4);
          const commitsLastMonth = lastFourWeeks.reduce((sum: number, week: any) => sum + (week.c || 0), 0);
          const commitsLastWeek = lastFourWeeks[lastFourWeeks.length - 1]?.c || 0;
          
          let activityLevel: 'very-active' | 'active' | 'moderate' | 'low' | 'inactive';
          if (commitsLastMonth >= 50) activityLevel = 'very-active';
          else if (commitsLastMonth >= 20) activityLevel = 'active';
          else if (commitsLastMonth >= 10) activityLevel = 'moderate';
          else if (commitsLastMonth >= 1) activityLevel = 'low';
          else activityLevel = 'inactive';
          
          commitActivity = {
            lastCommit: repoData.pushed_at,
            commitsLastMonth,
            commitsLastWeek,
            activityLevel
          };
        }
      }
      
      // If stats API failed or returned no data, fallback to pushed_at date
      if (!commitActivity && repoData.pushed_at) {
        const lastPushDate = new Date(repoData.pushed_at);
        const daysSinceLastPush = Math.floor((Date.now() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let activityLevel: 'very-active' | 'active' | 'moderate' | 'low' | 'inactive';
        if (daysSinceLastPush <= 7) {
          activityLevel = 'active';
        } else if (daysSinceLastPush <= 30) {
          activityLevel = 'moderate';
        } else if (daysSinceLastPush <= 90) {
          activityLevel = 'low';
        } else {
          activityLevel = 'inactive';
        }
        
        commitActivity = {
          lastCommit: repoData.pushed_at,
          commitsLastMonth: 0,
          commitsLastWeek: 0,
          activityLevel
        };
      }
    } catch {
      // Ignore commit activity fetch errors - it's optional
    }
    
    const baseResult: Extension = {
      ...extension,
      description: repoData.description || 'No description available',
      stars: repoData.stargazers_count,
      author: repoData.owner.login
    };
    
    // Add optional fields only if they have values
    const lastUpdatedDate = repoData.updated_at 
      ? new Date(repoData.updated_at).toISOString().split('T')[0]
      : undefined;
    
    return {
      ...baseResult,
      ...(lastUpdatedDate && { lastUpdated: lastUpdatedDate }),
      ...(version && { version }),
      ...(commitActivity && { commitActivity })
    };
  } catch (error) {
    ErrorHandler.log(error);
    
    // Return with default values if GitHub API fails
    return {
      ...extension,
      description: 'Loading...',
      stars: 0,
      author: extension.name.split('/')[0] || 'unknown'
    };
  }
}

/**
 * Fetches all extensions with GitHub data in parallel
 * 
 * Uses Promise.allSettled to handle partial failures gracefully.
 * Filters out failed fetches and sorts results by star count.
 * 
 * @async
 * @returns {Promise<Extension[]>} Array of extensions sorted by popularity
 */
export async function fetchAllExtensions(): Promise<Extension[]> {
  const results = await Promise.allSettled(
    extensionsBase.map(ext => fetchExtensionWithGitHubData(ext))
  );
  
  return results
    .filter((result): result is PromiseFulfilledResult<Extension> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value)
    .filter(ext => ext.stars && ext.stars > 0) // Filter out failed fetches
    .sort((a, b) => (b.stars || 0) - (a.stars || 0)); // Sort by stars
}

// For immediate rendering, provide basic data with loading placeholders
export const extensions: Extension[] = extensionsBase.map((ext) => ({
  ...ext,
  description: 'Loading...',
  stars: 0,
  author: ext.name.split('/')[0] || 'unknown'
}));

// Re-export from categories.ts for backward compatibility
export { categoryLabels } from './categories';

export const getExtensionsByCategory = (category: Extension['category']): Extension[] => {
  return extensions.filter(ext => ext.category === category);
};

export const searchExtensions = (query: string): Extension[] => {
  const lowerQuery = query.toLowerCase();
  return extensions.filter(ext => 
    ext.name.toLowerCase().includes(lowerQuery) ||
    ext.description.toLowerCase().includes(lowerQuery) ||
    ext.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    ext.category.toLowerCase().includes(lowerQuery)
  );
};