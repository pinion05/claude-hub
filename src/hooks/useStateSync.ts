import { useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAppStore } from '@/stores';

// URL과 상태 동기화
export const useURLStateSync = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const {
    query,
    category,
    sortBy,
    sortOrder,
    tags,
    setQuery,
    setCategory,
    setSortBy,
    setSortOrder,
    setTags,
    setShowResults,
  } = useAppStore();
  
  const isInitialized = useRef(false);

  // URL에서 상태 읽기
  useEffect(() => {
    if (!isInitialized.current) {
      const urlQuery = searchParams.get('q') || '';
      const urlCategory = searchParams.get('category') as any;
      const urlSortBy = searchParams.get('sortBy') as any;
      const urlSortOrder = searchParams.get('sortOrder') as any;
      const urlTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
      
      if (urlQuery) {
        setQuery(urlQuery);
        setShowResults(true);
      }
      if (urlCategory) setCategory(urlCategory);
      if (urlSortBy) setSortBy(urlSortBy);
      if (urlSortOrder) setSortOrder(urlSortOrder);
      if (urlTags.length) setTags(urlTags);
      
      isInitialized.current = true;
    }
  }, [searchParams, setQuery, setCategory, setSortBy, setSortOrder, setTags, setShowResults]);

  // 상태 변화를 URL에 반영
  useEffect(() => {
    if (!isInitialized.current) return;

    const params = new URLSearchParams();
    
    if (query.trim()) params.set('q', query);
    if (category) params.set('category', category);
    if (sortBy !== 'name') params.set('sortBy', sortBy);
    if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);
    if (tags.length) params.set('tags', tags.join(','));
    
    const newURL = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    
    if (window.location.pathname + window.location.search !== newURL) {
      router.replace(newURL, { scroll: false });
    }
  }, [query, category, sortBy, sortOrder, tags, pathname, router]);

  const updateURL = useCallback((newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    const newURL = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  }, [pathname, router, searchParams]);

  return { updateURL };
};

// 로컬 스토리지와 상태 동기화
export const useLocalStorageSync = () => {
  const {
    theme,
    sidebarOpen,
    minStars,
    tags,
    setTheme,
    setSidebarOpen,
    setMinStars,
    setTags,
  } = useAppStore();

  const syncKey = 'claude-hub-preferences';

  // 로컬 스토리지에서 설정 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(syncKey);
      if (stored) {
        const preferences = JSON.parse(stored);
        
        if (preferences.theme) setTheme(preferences.theme);
        if (typeof preferences.sidebarOpen === 'boolean') setSidebarOpen(preferences.sidebarOpen);
        if (typeof preferences.minStars === 'number') setMinStars(preferences.minStars);
        if (Array.isArray(preferences.tags)) setTags(preferences.tags);
      }
    } catch (error) {
      console.error('Error loading preferences from localStorage:', error);
    }
  }, [setTheme, setSidebarOpen, setMinStars, setTags]);

  // 설정 변화를 로컬 스토리지에 저장
  useEffect(() => {
    try {
      const preferences = {
        theme,
        sidebarOpen,
        minStars,
        tags,
      };
      
      localStorage.setItem(syncKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  }, [theme, sidebarOpen, minStars, tags]);

  const clearPreferences = useCallback(() => {
    try {
      localStorage.removeItem(syncKey);
      // 기본값으로 리셋
      setTheme('dark');
      setSidebarOpen(false);
      setMinStars(0);
      setTags([]);
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }, [setTheme, setSidebarOpen, setMinStars, setTags]);

  return { clearPreferences };
};

// 세션 스토리지와 상태 동기화 (검색 히스토리)
export const useSessionStorageSync = () => {
  const { query } = useAppStore();
  const syncKey = 'claude-hub-search-history';
  const maxHistorySize = 10;

  // 검색 히스토리 저장
  useEffect(() => {
    if (!query.trim()) return;

    try {
      const stored = sessionStorage.getItem(syncKey);
      const history: string[] = stored ? JSON.parse(stored) : [];
      
      // 중복 제거 및 최신 검색어를 맨 앞에 추가
      const newHistory = [
        query,
        ...history.filter(item => item !== query)
      ].slice(0, maxHistorySize);
      
      sessionStorage.setItem(syncKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [query]);

  const getSearchHistory = useCallback((): string[] => {
    try {
      const stored = sessionStorage.getItem(syncKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }, []);

  const clearSearchHistory = useCallback(() => {
    try {
      sessionStorage.removeItem(syncKey);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  return { getSearchHistory, clearSearchHistory };
};

// 크로스 탭 동기화
export const useCrossTabSync = () => {
  const store = useAppStore();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'claude-hub-preferences' && e.newValue) {
        try {
          const preferences = JSON.parse(e.newValue);
          
          // 다른 탭에서 변경된 설정을 현재 탭에 적용
          if (preferences.theme && preferences.theme !== store.theme) {
            store.setTheme(preferences.theme);
          }
          if (typeof preferences.sidebarOpen === 'boolean' && preferences.sidebarOpen !== store.sidebarOpen) {
            store.setSidebarOpen(preferences.sidebarOpen);
          }
        } catch (error) {
          console.error('Error syncing cross-tab preferences:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [store]);

  // 현재 탭 포커스 시 다른 탭의 변경사항 동기화
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        try {
          const stored = localStorage.getItem('claude-hub-preferences');
          if (stored) {
            const preferences = JSON.parse(stored);
            
            if (preferences.theme !== store.theme) {
              store.setTheme(preferences.theme);
            }
            if (preferences.sidebarOpen !== store.sidebarOpen) {
              store.setSidebarOpen(preferences.sidebarOpen);
            }
          }
        } catch (error) {
          console.error('Error syncing on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [store]);
};

// 통합 상태 동기화 훅
export const useStateSync = () => {
  useURLStateSync();
  useLocalStorageSync();
  useSessionStorageSync();
  useCrossTabSync();
};