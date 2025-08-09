'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { githubClient, GitHubRepoDetails } from '@/lib/github-client';

interface GitHubDataCache {
  [url: string]: {
    data: GitHubRepoDetails;
    timestamp: number;
  };
}

interface GitHubDataContextType {
  getRepoData: (url: string) => Promise<GitHubRepoDetails>;
  clearCache: () => void;
  getCacheSize: () => number;
}

const GitHubDataContext = createContext<GitHubDataContextType | undefined>(undefined);

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function GitHubDataProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<GitHubDataCache>({});
  const pendingRequests = useRef<Map<string, Promise<GitHubRepoDetails>>>(new Map());

  const getRepoData = useCallback(async (url: string): Promise<GitHubRepoDetails> => {
    // Check cache first
    const cached = cache[url];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Check if request is already pending
    const pending = pendingRequests.current.get(url);
    if (pending) {
      return pending;
    }

    // Make new request
    const request = githubClient.getFullRepositoryDetails(url);
    pendingRequests.current.set(url, request);

    try {
      const data = await request;
      
      // Update cache
      setCache(prev => ({
        ...prev,
        [url]: {
          data,
          timestamp: Date.now()
        }
      }));

      return data;
    } finally {
      pendingRequests.current.delete(url);
    }
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache({});
    pendingRequests.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return Object.keys(cache).length;
  }, [cache]);

  return (
    <GitHubDataContext.Provider value={{ getRepoData, clearCache, getCacheSize }}>
      {children}
    </GitHubDataContext.Provider>
  );
}

export function useGitHubDataContext() {
  const context = useContext(GitHubDataContext);
  if (!context) {
    throw new Error('useGitHubDataContext must be used within GitHubDataProvider');
  }
  return context;
}