import React from 'react';
import { Extension } from '@/types';
import { Modal } from '@/components/molecules/Modal';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { CategoryIcon } from '@/components/atoms/CategoryIcon';
import { useGitHubRepo } from '@/hooks/useGitHubRepo';
import { categoryLabels } from '@/data/extensions';
import { Skeleton } from '@/components/atoms/Skeleton';

export interface ExtensionModalProps {
  extension: Extension | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  extension,
  isOpen,
  onClose
}) => {
  const { data: repoData, loading } = useGitHubRepo(extension?.githubUrl);
  
  if (!extension) return null;

  const displayStars = repoData?.stargazers_count || extension.stars;
  const displayDescription = repoData?.description || extension.description;
  const lastUpdated = repoData?.pushed_at ? new Date(repoData.pushed_at).toLocaleDateString() : extension.lastUpdated;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-3">
          {repoData?.owner?.avatar_url ? (
            <img 
              src={repoData.owner.avatar_url} 
              alt={repoData.owner.login}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <CategoryIcon category={extension.category} className="text-3xl" />
          )}
          <div>
            <h2 className="text-2xl font-bold text-accent">{extension.name}</h2>
            {repoData?.owner?.login && (
              <a 
                href={repoData.owner.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-accent transition-colors"
              >
                by {repoData.owner.login}
              </a>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-accent transition-colors text-2xl"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
      
      <p className="text-gray-300 mb-6">{displayDescription}</p>
      
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Badge variant="accent">
          {categoryLabels[extension.category] || extension.category}
        </Badge>
        
        {displayStars && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>⭐</span>
            <span>{displayStars.toLocaleString()} stars</span>
          </div>
        )}
        
        {repoData?.forks_count !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>🔱</span>
            <span>{repoData.forks_count.toLocaleString()} forks</span>
          </div>
        )}
        
        {repoData?.open_issues_count !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>📝</span>
            <span>{repoData.open_issues_count} issues</span>
          </div>
        )}
        
        {lastUpdated && (
          <div className="text-sm text-gray-400">
            Updated: {lastUpdated}
          </div>
        )}
      </div>
      
      {/* Repository Details */}
      {loading ? (
        <div className="space-y-4 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        <>
          {repoData?.language && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Language</h3>
              <Badge variant="default" size="sm">
                {repoData.language}
              </Badge>
            </div>
          )}

          {repoData?.license && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">License</h3>
              <span className="text-sm text-gray-300">{repoData.license.name}</span>
            </div>
          )}

          {/* Contributors */}
          {repoData?.contributors && repoData.contributors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Top Contributors</h3>
              <div className="flex flex-wrap gap-3">
                {repoData.contributors.map((contributor) => (
                  <a
                    key={contributor.login}
                    href={contributor.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <img 
                      src={contributor.avatar_url} 
                      alt={contributor.login}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-300">{contributor.login}</span>
                    <span className="text-xs text-gray-500">({contributor.contributions})</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Latest Releases */}
          {repoData?.releases && repoData.releases.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Releases</h3>
              <div className="space-y-2">
                {repoData.releases.map((release) => (
                  <a
                    key={release.tag_name}
                    href={release.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 bg-gray-900 rounded hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-accent">{release.name || release.tag_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(release.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    {release.prerelease && (
                      <Badge variant="default" size="sm" className="mt-1">
                        Pre-release
                      </Badge>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Topics/Tags */}
          {(repoData?.topics?.length || extension.tags?.length) ? (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {(repoData?.topics || extension.tags || []).map((tag) => (
                  <Badge key={tag} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
      
      <div className="flex gap-3">
        <Button
          as="a"
          href={extension.githubUrl || extension.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          className="inline-flex items-center gap-2"
        >
          View on GitHub →
        </Button>
        {repoData?.html_url && (
          <Button
            as="a"
            href={`${repoData.html_url}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="inline-flex items-center gap-2"
          >
            View Issues
          </Button>
        )}
      </div>
    </Modal>
  );
};