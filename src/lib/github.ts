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

class GitHubClient {
  private token: string | undefined;
  private apiUrl: string;

  constructor() {
    this.token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    this.apiUrl = process.env.NEXT_PUBLIC_GITHUB_API_URL || 'https://api.github.com';
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token && this.token !== 'YOUR_GITHUB_TOKEN_HERE') {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 403) {
        const remaining = response.headers.get('X-RateLimit-Remaining');
        if (remaining === '0') {
          throw new Error('GitHub API rate limit exceeded. Please add a GitHub token to .env.local');
        }
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    const url = `${this.apiUrl}/repos/${owner}/${repo}`;
    return this.fetchWithAuth(url);
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
      const url = `${this.apiUrl}/repos/${owner}/${repo}/releases/latest`;
      return await this.fetchWithAuth(url);
    } catch {
      // No releases found
      return null;
    }
  }

  async getReleases(owner: string, repo: string, limit = 5): Promise<GitHubRelease[]> {
    try {
      const url = `${this.apiUrl}/repos/${owner}/${repo}/releases?per_page=${limit}`;
      return await this.fetchWithAuth(url);
    } catch {
      return [];
    }
  }

  async getContributors(owner: string, repo: string, limit = 10): Promise<GitHubContributor[]> {
    try {
      const url = `${this.apiUrl}/repos/${owner}/${repo}/contributors?per_page=${limit}`;
      return await this.fetchWithAuth(url);
    } catch {
      return [];
    }
  }

  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const url = `${this.apiUrl}/repos/${owner}/${repo}/readme`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          ...(this.token && this.token !== 'YOUR_GITHUB_TOKEN_HERE' ? {
            'Authorization': `token ${this.token}`
          } : {})
        },
      });

      if (!response.ok) {
        return null;
      }

      return response.text();
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
}

export const githubClient = new GitHubClient();