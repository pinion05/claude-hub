import { Extension } from '@/types';
import repositoriesData from '../../storage/claude-hub-repositories/all-repositories.json';

export const extensions: Extension[] = repositoriesData.repositories
  .filter(repo => repo.stars !== null)
  .map((repo, index) => {
    const ext: Extension = {
      id: index + 1,
      name: repo.name,
      description: repo.description,
      category: repo.category as Extension['category'],
      repoUrl: repo.github_url,
      githubUrl: repo.github_url,
      tags: repo.tags,
      stars: repo.stars as number,
      author: repo.name.split('/')[0] || 'unknown'
    };
    
    if (repo.last_updated) {
      ext.lastUpdated = repo.last_updated;
    }
    
    if (repo.version) {
      ext.version = repo.version;
    }
    
    return ext;
  });

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

export const categoryLabels: Record<Extension['category'], string> = {
  'ide-integration': '💻 IDE Integration',
  'agents-orchestration': '🤖 Agents & Orchestration',
  'monitoring-analytics': '📊 Monitoring & Analytics',
  'proxy-routing': '🔀 Proxy & Routing',
  'resources-guides': '📚 Resources & Guides',
  'gui-desktop': '🖥️ GUI & Desktop',
  'integration-extension': '🔌 Integration & Extension',
  'advanced-features': '⚡ Advanced Features',
  'utilities': '🛠️ Utilities'
};

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