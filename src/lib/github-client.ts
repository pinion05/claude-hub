// 클라이언트사이드에서 사용할 GitHub API 클라이언트
// 서버의 API Route를 통해 GitHub API를 호출합니다

import { clientCache } from './cache';
import { GitHubAPIError, NetworkError } from './errors';
import { CACHE_TTL, API_ENDPOINTS, API_LIMITS } from '@/constants/api';

// Simplified types for client use
export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license?: {
    name: string;
    spdx_id: string;
  } | null;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface GitHubRepoDetails extends GitHubRepo {
  releases?: GitHubRelease[];
  contributors?: GitHubContributor[];
  readme?: string;
  commitActivity?: {
    lastCommit?: string;
    commitsLastMonth?: number;
    commitsLastWeek?: number;
    activityLevel?: 'very-active' | 'active' | 'moderate' | 'low' | 'inactive';
  };
}

class GitHubClientAPI {
  private apiUrl = API_ENDPOINTS.INTERNAL_API;

  private async fetchAPI(path: string, ttl?: number) {
    const cacheKey = `api:${path}`;
    
    // Check cache first
    const cached = clientCache.get(cacheKey);
    if (cached) {
      // Cache hit - return cached data
      return cached;
    }
    
    try {
      // Cache miss - fetch from API
      const response = await fetch(`${this.apiUrl}/${path}`);
      
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw GitHubAPIError.fromResponse(response, errorBody);
      }

      const data = await response.json();
      
      // Store in cache with TTL
      if (ttl) {
        clientCache.set(cacheKey, data, ttl);
      }
      
      return data;
    } catch (error) {
      if (error instanceof GitHubAPIError) {
        throw error;
      }
      
      // Network or other errors
      throw new NetworkError(
        'Failed to fetch from GitHub API',
        undefined,
        error
      );
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.fetchAPI(`repos/${owner}/${repo}`, CACHE_TTL.REPOSITORY);
  }

  async getRepositoryFromUrl(repoUrl: string): Promise<GitHubRepo> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new GitHubAPIError('Invalid GitHub URL', 400, { url: repoUrl });
    }
    const [, owner, repo] = match;
    return this.getRepository(owner!, repo!);
  }

  async getRepositoryWithActivity(repoUrl: string): Promise<GitHubRepo & { commitActivity?: GitHubRepoDetails['commitActivity'] }> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new GitHubAPIError('Invalid GitHub URL', 400, { url: repoUrl });
    }
    const [, owner, repo] = match;

    const [repoData, commitActivity] = await Promise.all([
      this.getRepository(owner!, repo!),
      this.getCommitActivity(owner!, repo!),
    ]);

    // Calculate activity level based on recent commits or fallback to push date
    let commitsLastMonth = 0;
    let commitsLastWeek = 0;
    let activityLevel: 'very-active' | 'active' | 'moderate' | 'low' | 'inactive';
    
    if (commitActivity && commitActivity.weeks && commitActivity.weeks.length > 0) {
      // Use actual commit stats if available
      const lastFourWeeks = commitActivity.weeks.slice(-4);
      commitsLastMonth = lastFourWeeks.reduce((sum, week) => sum + (week.c || 0), 0);
      commitsLastWeek = lastFourWeeks[lastFourWeeks.length - 1]?.c || 0;
      
      if (commitsLastMonth >= 50) activityLevel = 'very-active';
      else if (commitsLastMonth >= 20) activityLevel = 'active';
      else if (commitsLastMonth >= 10) activityLevel = 'moderate';
      else if (commitsLastMonth >= 1) activityLevel = 'low';
      else activityLevel = 'inactive';
    } else {
      // Fallback to pushed_at date when commit stats are unavailable
      const lastPushDate = new Date(repoData.pushed_at);
      const daysSinceLastPush = Math.floor((Date.now() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Estimate activity level based on last push
      if (daysSinceLastPush <= 7) {
        activityLevel = 'active'; // Pushed within last week
      } else if (daysSinceLastPush <= 30) {
        activityLevel = 'moderate'; // Pushed within last month
      } else if (daysSinceLastPush <= 90) {
        activityLevel = 'low'; // Pushed within last 3 months
      } else {
        activityLevel = 'inactive'; // No push for over 3 months
      }
    }

    return {
      ...repoData,
      commitActivity: {
        lastCommit: repoData.pushed_at,
        commitsLastMonth,
        commitsLastWeek,
        activityLevel,
      },
    };
  }

  async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
    try {
      return await this.fetchAPI(`repos/${owner}/${repo}/releases/latest`, CACHE_TTL.RELEASES);
    } catch {
      // No releases found
      return null;
    }
  }

  async getReleases(owner: string, repo: string, limit = API_LIMITS.MAX_RELEASES): Promise<GitHubRelease[]> {
    try {
      const releases = await this.fetchAPI(
        `repos/${owner}/${repo}/releases?per_page=${limit}`,
        CACHE_TTL.RELEASES
      );
      return releases || [];
    } catch {
      return [];
    }
  }

  async getContributors(owner: string, repo: string, limit = API_LIMITS.MAX_CONTRIBUTORS): Promise<GitHubContributor[]> {
    try {
      const contributors = await this.fetchAPI(
        `repos/${owner}/${repo}/contributors?per_page=${limit}`,
        CACHE_TTL.CONTRIBUTORS
      );
      return contributors || [];
    } catch {
      return [];
    }
  }

  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const response = await this.fetchAPI(
        `repos/${owner}/${repo}/readme`,
        CACHE_TTL.README
      );
      return response.content || null;
    } catch {
      return null;
    }
  }

  async getCommitActivity(owner: string, repo: string): Promise<{ total: number; weeks: Array<{ w: number; c: number }> } | null> {
    try {
      const stats = await this.fetchAPI(
        `repos/${owner}/${repo}/stats/commit_activity`,
        CACHE_TTL.REPOSITORY
      );
      
      // GitHub API returns 202 when stats are being computed
      // In this case, stats might be null or empty array
      if (!stats || (Array.isArray(stats) && stats.length === 0)) {
        return null;
      }
      
      return stats;
    } catch {
      // Return null to indicate failure, not empty data
      return null;
    }
  }

  async getFullRepositoryDetails(repoUrl: string): Promise<GitHubRepoDetails> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new GitHubAPIError('Invalid GitHub URL', 400, { url: repoUrl });
    }
    const [, owner, repo] = match;

    const [repoData, releases, contributors, commitActivity] = await Promise.all([
      this.getRepository(owner!, repo!),
      this.getReleases(owner!, repo!),
      this.getContributors(owner!, repo!),
      this.getCommitActivity(owner!, repo!),
    ]);

    // Calculate activity level based on recent commits or fallback to push date
    let commitsLastMonth = 0;
    let commitsLastWeek = 0;
    let activityLevel: 'very-active' | 'active' | 'moderate' | 'low' | 'inactive';
    
    if (commitActivity && commitActivity.weeks && commitActivity.weeks.length > 0) {
      // Use actual commit stats if available
      const lastFourWeeks = commitActivity.weeks.slice(-4);
      commitsLastMonth = lastFourWeeks.reduce((sum, week) => sum + (week.c || 0), 0);
      commitsLastWeek = lastFourWeeks[lastFourWeeks.length - 1]?.c || 0;
      
      if (commitsLastMonth >= 50) activityLevel = 'very-active';
      else if (commitsLastMonth >= 20) activityLevel = 'active';
      else if (commitsLastMonth >= 10) activityLevel = 'moderate';
      else if (commitsLastMonth >= 1) activityLevel = 'low';
      else activityLevel = 'inactive';
    } else {
      // Fallback to pushed_at date when commit stats are unavailable
      const lastPushDate = new Date(repoData.pushed_at);
      const daysSinceLastPush = Math.floor((Date.now() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Estimate activity level based on last push
      if (daysSinceLastPush <= 7) {
        activityLevel = 'active'; // Pushed within last week
      } else if (daysSinceLastPush <= 30) {
        activityLevel = 'moderate'; // Pushed within last month
      } else if (daysSinceLastPush <= 90) {
        activityLevel = 'low'; // Pushed within last 3 months
      } else {
        activityLevel = 'inactive'; // No push for over 3 months
      }
      
      // Note: When using fallback, we don't have exact commit counts
      // but we can estimate based on push frequency
    }

    return {
      ...repoData,
      releases,
      contributors,
      commitActivity: {
        lastCommit: repoData.pushed_at,
        commitsLastMonth,
        commitsLastWeek,
        activityLevel,
      },
    };
  }

  // Cache management methods
  clearCache(): void {
    clientCache.clear();
  }

  clearRepositoryCache(repoUrl: string): void {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return;
    
    const [, owner, repo] = match;
    const keys = [
      `api:repos/${owner}/${repo}`,
      `api:repos/${owner}/${repo}/releases/latest`,
      `api:repos/${owner}/${repo}/releases?per_page=3`,
      `api:repos/${owner}/${repo}/releases?per_page=5`,
      `api:repos/${owner}/${repo}/contributors?per_page=5`,
      `api:repos/${owner}/${repo}/contributors?per_page=10`,
      `api:repos/${owner}/${repo}/readme`,
    ];
    
    keys.forEach(key => clientCache.delete(key));
  }

  getCacheStats() {
    return clientCache.getStats();
  }
}

export const githubClient = new GitHubClientAPI();