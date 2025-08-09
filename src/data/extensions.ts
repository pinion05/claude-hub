import { Extension } from '@/types';
import { GitHubAPIError, RateLimitError, ValidationError, ErrorHandler } from '@/lib/errors';
import { API_HEADERS, REVALIDATE_TIME } from '@/constants/api';
import repositoriesData from '../../storage/claude-hub-repositories/all-repositories.json';

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
      ...(version && { version })
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

// For immediate rendering, provide basic data
export const extensions: Extension[] = extensionsBase.map((ext) => ({
  ...ext,
  description: 'Loading...',
  stars: 0,
  author: ext.name.split('/')[0] || 'unknown'
}));

export const topExtensions: Extension[] = [
  {
    id: 1,
    name: "cline/cline",
    description: "IDE 내 자율 AI 코딩 에이전트",
    category: "ide-integration",
    repoUrl: "https://github.com/cline/cline",
    githubUrl: "https://github.com/cline/cline",
    tags: ["ide", "agent", "coding", "vscode"],
    stars: 48900,
    lastUpdated: "2025.08.09",
    version: "v3.23.0",
    author: "cline",
    highlights: ["가장 인기 있는 Claude Code 관련 프로젝트", "VS Code 완벽 통합", "자율 코딩 에이전트"],
    rank: 1
  },
  {
    id: 2,
    name: "eyaltoledano/claude-task-master",
    description: "AI 기반 태스크 관리 시스템",
    category: "agents-orchestration",
    repoUrl: "https://github.com/eyaltoledano/claude-task-master",
    githubUrl: "https://github.com/eyaltoledano/claude-task-master",
    tags: ["agent", "task-management", "workflow"],
    stars: 20200,
    lastUpdated: "2025.07.29",
    author: "eyaltoledano",
    highlights: ["고급 태스크 관리", "AI 기반 워크플로우 자동화"],
    rank: 2
  },
  {
    id: 3,
    name: "sst/opencode",
    description: "터미널 기반 AI 코딩 에이전트",
    category: "integration-extension",
    repoUrl: "https://github.com/sst/opencode",
    githubUrl: "https://github.com/sst/opencode",
    tags: ["terminal", "cli", "agent", "coding"],
    stars: 18400,
    lastUpdated: "2025.08.09",
    version: "v0.4.2",
    author: "sst",
    highlights: ["터미널 환경 최적화", "최신 업데이트 활발"],
    rank: 3
  },
  {
    id: 4,
    name: "musistudio/claude-code-router",
    description: "Claude Code 요청을 다른 모델로 라우팅",
    category: "proxy-routing",
    repoUrl: "https://github.com/musistudio/claude-code-router",
    githubUrl: "https://github.com/musistudio/claude-code-router",
    tags: ["proxy", "routing", "multi-model"],
    stars: 11600,
    lastUpdated: "2025.08",
    author: "musistudio",
    highlights: ["멀티 모델 지원", "유연한 라우팅 시스템"],
    rank: 4
  },
  {
    id: 5,
    name: "getAsterisk/claudia",
    description: "Claude Code용 GUI 데스크톱 앱",
    category: "gui-desktop",
    repoUrl: "https://github.com/getAsterisk/claudia",
    githubUrl: "https://github.com/getAsterisk/claudia",
    tags: ["gui", "desktop", "electron"],
    stars: 11200,
    lastUpdated: "2025.08.01",
    version: "v0.1.0",
    author: "getAsterisk",
    highlights: ["직관적인 GUI", "크로스 플랫폼 데스크톱 앱"],
    rank: 5
  },
  {
    id: 6,
    name: "hesreallyhim/awesome-claude-code",
    description: "Claude Code 리소스 큐레이션",
    category: "resources-guides",
    repoUrl: "https://github.com/hesreallyhim/awesome-claude-code",
    githubUrl: "https://github.com/hesreallyhim/awesome-claude-code",
    tags: ["resources", "guide", "curated-list"],
    stars: 9500,
    lastUpdated: "2025.07.30",
    author: "hesreallyhim",
    highlights: ["종합 리소스 허브", "커뮤니티 큐레이션"],
    rank: 6
  },
  {
    id: 7,
    name: "asgeirtj/system_prompts_leaks",
    description: "AI 챗봇 시스템 프롬프트 컬렉션",
    category: "resources-guides",
    repoUrl: "https://github.com/asgeirtj/system_prompts_leaks",
    githubUrl: "https://github.com/asgeirtj/system_prompts_leaks",
    tags: ["prompts", "system-prompts", "collection"],
    stars: 8200,
    lastUpdated: "2025.05",
    author: "asgeirtj",
    highlights: ["시스템 프롬프트 연구", "다양한 AI 모델 포함"],
    rank: 7
  },
  {
    id: 8,
    name: "wshobson/agents",
    description: "58개 전문 서브에이전트 컬렉션",
    category: "agents-orchestration",
    repoUrl: "https://github.com/wshobson/agents",
    githubUrl: "https://github.com/wshobson/agents",
    tags: ["agents", "subagents", "collection"],
    stars: 7600,
    lastUpdated: "2025.08.04",
    author: "wshobson",
    highlights: ["대규모 에이전트 컬렉션", "다양한 전문 분야"],
    rank: 8
  },
  {
    id: 9,
    name: "ryoppippi/ccusage",
    description: "Claude Code 토큰 사용량 분석",
    category: "monitoring-analytics",
    repoUrl: "https://github.com/ryoppippi/ccusage",
    githubUrl: "https://github.com/ryoppippi/ccusage",
    tags: ["monitoring", "analytics", "token-usage", "cost"],
    stars: 6200,
    lastUpdated: "2025.08.09",
    version: "v15.9.1",
    author: "ryoppippi",
    highlights: ["상세한 사용량 분석", "비용 최적화 도구"],
    rank: 9
  },
  {
    id: 10,
    name: "ruvnet/claude-flow",
    description: "엔터프라이즈 AI 오케스트레이션",
    category: "agents-orchestration",
    repoUrl: "https://github.com/ruvnet/claude-flow",
    githubUrl: "https://github.com/ruvnet/claude-flow",
    tags: ["orchestration", "enterprise", "workflow"],
    stars: 5600,
    lastUpdated: "2025.07",
    version: "v2.0.0-alpha",
    author: "ruvnet",
    highlights: ["엔터프라이즈급 솔루션", "고급 오케스트레이션 기능"],
    rank: 10
  }
];

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