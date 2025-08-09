// 클라이언트사이드에서 사용할 GitHub API 클라이언트
// 서버의 API Route를 통해 GitHub API를 호출합니다

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

  private async fetchAPI(path: string) {
    const response = await fetch(`${this.apiUrl}/${path}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.fetchAPI(`repos/${owner}/${repo}`);
  }

  async getRepositoryFromUrl(repoUrl: string): Promise<GitHubRepo> {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    const [, owner, repo] = match;
    return this.getRepository(owner, repo);
  }

  async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
    try {
      return await this.fetchAPI(`repos/${owner}/${repo}/releases/latest`);
    } catch (error) {
      // No releases found
      return null;
    }
  }

  async getReleases(owner: string, repo: string, limit = 5): Promise<GitHubRelease[]> {
    try {
      const releases = await this.fetchAPI(`repos/${owner}/${repo}/releases?per_page=${limit}`);
      return releases || [];
    } catch (error) {
      return [];
    }
  }

  async getContributors(owner: string, repo: string, limit = 10): Promise<GitHubContributor[]> {
    try {
      const contributors = await this.fetchAPI(`repos/${owner}/${repo}/contributors?per_page=${limit}`);
      return contributors || [];
    } catch (error) {
      return [];
    }
  }

  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const response = await this.fetchAPI(`repos/${owner}/${repo}/readme`);
      return response.content || null;
    } catch (error) {
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
      this.getRepository(owner, repo),
      this.getReleases(owner, repo, 3),
      this.getContributors(owner, repo, 5),
    ]);

    return {
      ...repoData,
      releases,
      contributors,
    };
  }
}

export const githubClient = new GitHubClientAPI();