import { useState, useEffect } from 'react';
import { githubClient, GitHubRepoDetails } from '@/lib/github-client';

interface UseGitHubRepoResult {
  data: GitHubRepoDetails | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useGitHubRepo(repoUrl: string | undefined): UseGitHubRepoResult {
  const [data, setData] = useState<GitHubRepoDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRepo = async () => {
    if (!repoUrl) return;

    setLoading(true);
    setError(null);

    try {
      const repoData = await githubClient.getFullRepositoryDetails(repoUrl);
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

export function useGitHubRepoBasic(repoUrl: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!repoUrl) return;

    const fetchRepo = async () => {
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

    fetchRepo();
  }, [repoUrl]);

  return { data, loading, error };
}