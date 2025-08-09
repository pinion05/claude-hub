import React, { memo, useState } from 'react';
import { Extension } from '@/types';
import { Badge } from '@/components/atoms/Badge';
import { CategoryIcon } from '@/components/atoms/CategoryIcon';
import { cn } from '@/utils/classNames';
import { useGitHubRepoBasic } from '@/hooks/useGitHubRepo';
import { categoryLabels } from '@/data/extensions';

export interface ExtensionCardProps {
  extension: Extension;
  onClick: (extension: Extension) => void;
  index?: number;
}

export const ExtensionCard = memo<ExtensionCardProps>(({
  extension,
  onClick,
  index = 0
}) => {
  const { data: repoData, loading } = useGitHubRepoBasic(extension.githubUrl);
  const [isImageError, setIsImageError] = useState(false);

  const displayStars = repoData?.stargazers_count || extension.stars;
  const displayDescription = repoData?.description || extension.description;
  const lastUpdated = repoData?.pushed_at ? new Date(repoData.pushed_at).toLocaleDateString() : extension.lastUpdated;

  return (
    <article
      className={cn(
        'card-3d bg-card border border-border rounded-lg p-6',
        'cursor-pointer hover:border-accent/50 hover:glow-coral',
        'transition-all duration-200',
        'opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]',
        'relative overflow-hidden'
      )}
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
      onClick={() => onClick(extension)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(extension);
        }
      }}
      aria-label={`View details for ${extension.name}`}
    >
      {loading && (
        <div className="absolute inset-0 bg-card/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            {repoData?.owner?.avatar_url && !isImageError ? (
              <img 
                src={repoData.owner.avatar_url} 
                alt={repoData.owner.login}
                className="w-10 h-10 rounded-full flex-shrink-0"
                onError={() => setIsImageError(true)}
              />
            ) : (
              <CategoryIcon category={extension.category} className="text-2xl mt-1 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-accent line-clamp-1">
                {extension.name}
              </h3>
              {repoData?.owner?.login && (
                <p className="text-xs text-gray-500">by {repoData.owner.login}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {displayDescription}
          </p>

          {/* Additional GitHub Info */}
          {repoData && (
            <div className="flex flex-wrap gap-2 mb-3">
              {repoData.language && (
                <span className="text-xs px-2 py-1 bg-gray-800 rounded">
                  {repoData.language}
                </span>
              )}
              {repoData.forks_count > 0 && (
                <span className="text-xs px-2 py-1 bg-gray-800 rounded flex items-center gap-1">
                  <span>🔱</span> {repoData.forks_count}
                </span>
              )}
              {repoData.open_issues_count > 0 && (
                <span className="text-xs px-2 py-1 bg-gray-800 rounded flex items-center gap-1">
                  <span>📝</span> {repoData.open_issues_count} issues
                </span>
              )}
            </div>
          )}

          {/* Topics/Tags */}
          {(repoData?.topics?.length || extension.tags?.length) ? (
            <div className="flex flex-wrap gap-1 mb-3">
              {(repoData?.topics || extension.tags || []).slice(0, 3).map((tag: string, i: number) => (
                <span key={i} className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-900 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <Badge variant="accent" size="sm">
            {categoryLabels[extension.category] || extension.category}
          </Badge>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {displayStars && (
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{displayStars.toLocaleString()}</span>
              </div>
            )}
            {lastUpdated && (
              <span className="text-gray-600">
                {lastUpdated}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

ExtensionCard.displayName = 'ExtensionCard';