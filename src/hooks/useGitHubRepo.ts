import { useState, useEffect } from 'react';
import { githubClient, GitHubRepoDetails, GitHubRepo } from '@/lib/github-client';
import { useGitHubDataContext } from '@/contexts/GitHubDataContext';

/**
 * Result type for full repository details
 */
interface UseGitHubRepoResult {
  data: GitHubRepoDetails | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Result type for basic repository info
 */
interface UseGitHubRepoBasicResult {
  data: GitHubRepo | null;
  loading: boolean;
  error: Error | null;
  refetch?: () => void;
}

/**
 * Fetches full GitHub repository details including releases and contributors
 * 
 * @param {string | undefined} repoUrl - GitHub repository URL
 * @returns {UseGitHubRepoResult} Repository data, loading state, and error
 */
export function useGitHubRepo(repoUrl: string | undefined): UseGitHubRepoResult {
  const [data, setData] = useState<GitHubRepoDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Try to use context if available, fallback to direct API call
  let getRepoData: (url: string) => Promise<GitHubRepoDetails>;
  try {
    const context = useGitHubDataContext();
    getRepoData = context.getRepoData;
  } catch {
    // Context not available, use direct API
    getRepoData = (url: string) => githubClient.getFullRepositoryDetails(url);
  }

  const fetchRepo = async () => {
    if (!repoUrl) return;

    setLoading(true);
    setError(null);

    try {
      const repoData = await getRepoData(repoUrl);
      setData(repoData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch repository'));
      console.error('Error fetching GitHub repo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepo();
  }, [repoUrl]);

  return {
    data,
    loading,
    error,
    refetch: fetchRepo,
  };
}

/**
 * Fetches basic GitHub repository information
 * 
 * This is a lightweight version that only fetches core repository data
 * without additional API calls for releases or contributors.
 * 
 * @param {string | undefined} repoUrl - GitHub repository URL
 * @param {boolean} [fetchOnMount=true] - Whether to fetch immediately on mount
 * @returns {UseGitHubRepoBasicResult} Repository data, loading state, and error
 */
export function useGitHubRepoBasic(
  repoUrl: string | undefined,
  fetchOnMount: boolean = true
): UseGitHubRepoBasicResult {
  const [data, setData] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRepo = async () => {
    if (!repoUrl) return;
    
    setLoading(true);
    setError(null);

    try {
      const repoData = await githubClient.getRepositoryFromUrl(repoUrl);
      setData(repoData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch repository'));
      console.error('Error fetching GitHub repo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchOnMount) {
      fetchRepo();
    }
  }, [repoUrl, fetchOnMount]);

  return { data, loading, error, refetch: fetchRepo };
}