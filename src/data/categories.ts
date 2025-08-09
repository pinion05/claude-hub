import { ExtensionCategory } from '@/types';

export interface CategoryInfo {
  icon: string;
  label: string;
  description: string;
}

export const categoryInfo: Record<ExtensionCategory, CategoryInfo> = {
  'ide-integration': {
    icon: '💻',
    label: 'IDE Integration',
    description: 'IDE 및 에디터 통합 도구'
  },
  'agents-orchestration': {
    icon: '🤖',
    label: 'Agents & Orchestration',
    description: 'AI 에이전트 및 워크플로우 오케스트레이션'
  },
  'monitoring-analytics': {
    icon: '📊',
    label: 'Monitoring & Analytics',
    description: '사용량 모니터링 및 분석 도구'
  },
  'proxy-routing': {
    icon: '🔀',
    label: 'Proxy & Routing',
    description: '프록시 및 라우팅 솔루션'
  },
  'resources-guides': {
    icon: '📚',
    label: 'Resources & Guides',
    description: '가이드, 템플릿 및 학습 자료'
  },
  'gui-desktop': {
    icon: '🖥️',
    label: 'GUI & Desktop',
    description: '데스크톱 GUI 애플리케이션'
  },
  'integration-extension': {
    icon: '🔌',
    label: 'Integration & Extension',
    description: '통합 및 확장 기능'
  },
  'advanced-features': {
    icon: '⚡',
    label: 'Advanced Features',
    description: '고급 기능 및 실험적 도구'
  },
  'utilities': {
    icon: '🛠️',
    label: 'Utilities',
    description: '유틸리티 및 헬퍼 도구'
  }
};

// Helper functions
export const getCategoryIcon = (category: ExtensionCategory): string => {
  return categoryInfo[category]?.icon || '📦';
};

export const getCategoryLabel = (category: ExtensionCategory): string => {
  return categoryInfo[category]?.label || category;
};

export const getCategoryDescription = (category: ExtensionCategory): string => {
  return categoryInfo[category]?.description || '';
};

// For backward compatibility
export const categoryLabels: Record<ExtensionCategory, string> = Object.entries(categoryInfo).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [key]: `${value.icon} ${value.label}`
  }),
  {} as Record<ExtensionCategory, string>
);