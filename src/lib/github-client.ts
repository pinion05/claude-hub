// 클라이언트사이드에서 사용할 GitHub API 클라이언트
// 서버의 API Route를 통해 GitHub API를 호출합니다

import { clientCache } from './cache';

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license?: {
    name: string;
    spdx_id: string;
  };
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
}

interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface GitHubRepoDetails extends GitHubRepo {
  releases?: GitHubRelease[];
  contributors?: GitHubContributor[];
  readme?: string;
}

class GitHubClientAPI {
  private apiUrl = '/api/github';
  private readonly CACHE_TTL = {
    repository: 10 * 60 * 1000, // 10 minutes for basic repo info
    releases: 5 * 60 * 1000,     // 5 minutes for releases
    contributors: 15 * 60 * 1000, // 15 minutes for contributors
    readme: 30 * 60 * 1000,       // 30 minutes for readme
  };

  private async fetchAPI(path: string, ttl?: number) {
    const cacheKey = `api:${path}`;
    
    // Check cache first
    const cached = clientCache.get(cacheKey);
    if (cached) {
      // Cache hit - return cached data
      return cached;
    }
    
    // Cache miss - fetch from API
    const response = await fetch(`${this.apiUrl}/${path}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Store in cache with TTL
    if (ttl) {
      clientCache.set(cacheKey, data, ttl);
    }
    
    return data;
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.fetchAPI(`repos/${owner}/${repo}`, this.CACHE_TTL.repository);
  }

  async getRepositoryFromUrl(repoUrl: string): Promise<GitHubRepo> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    const [, owner, repo] = match;
    return this.getRepository(owner!, repo!);
  }

  async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
    try {
      return await this.fetchAPI(`repos/${owner}/${repo}/releases/latest`, this.CACHE_TTL.releases);
    } catch {
      // No releases found
      return null;
    }
  }

  async getReleases(owner: string, repo: string, limit = 5): Promise<GitHubRelease[]> {
    try {
      const releases = await this.fetchAPI(
        `repos/${owner}/${repo}/releases?per_page=${limit}`,
        this.CACHE_TTL.releases
      );
      return releases || [];
    } catch {
      return [];
    }
  }

  async getContributors(owner: string, repo: string, limit = 10): Promise<GitHubContributor[]> {
    try {
      const contributors = await this.fetchAPI(
        `repos/${owner}/${repo}/contributors?per_page=${limit}`,
        this.CACHE_TTL.contributors
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
        this.CACHE_TTL.readme
      );
      return response.content || null;
    } catch {
      return null;
    }
  }

  async getFullRepositoryDetails(repoUrl: string): Promise<GitHubRepoDetails> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    const [, owner, repo] = match;

    const [repoData, releases, contributors] = await Promise.all([
      this.getRepository(owner!, repo!),
      this.getReleases(owner!, repo!, 3),
      this.getContributors(owner!, repo!, 5),
    ]);

    return {
      ...repoData,
      releases,
      contributors,
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