interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ClientCache {
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

  constructor() {
    this.cache = new Map();
    
    // Load from localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('github_api_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        
        // Restore non-expired items
        Object.entries(parsed).forEach(([key, item]) => {
          const cacheItem = item as CacheItem<any>;
          if (cacheItem.expiresAt > now) {
            this.cache.set(key, cacheItem);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    try {
      const cacheObject: Record<string, CacheItem<any>> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      localStorage.setItem('github_api_cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl || this.DEFAULT_TTL);
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
    });
    
    this.saveToLocalStorage();
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.saveToLocalStorage();
      return null;
    }
    
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.saveToLocalStorage();
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.saveToLocalStorage();
  }

  clear(): void {
    this.cache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('github_api_cache');
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    let hasChanges = false;
    
    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.saveToLocalStorage();
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    entries: Array<{ key: string; size: number; age: number; ttl: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      size: JSON.stringify(item.data).length,
      age: now - item.timestamp,
      ttl: item.expiresAt - now,
    }));
    
    return {
      size: entries.reduce((sum, e) => sum + e.size, 0),
      entries,
    };
  }
}

// Singleton instance
export const clientCache = new ClientCache();

// Cleanup expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup();
  }, 60 * 1000); // Clean up every minute
}