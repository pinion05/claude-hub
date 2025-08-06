import { CACHE_DURATIONS } from '@/lib/api/constants';
import crypto from 'crypto';

// 캐시 항목 인터페이스
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  tags?: string[];
}

// 메모리 캐시 클래스
export class MemoryCache {
  private cache: Map<string, CacheItem> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs: number = 60000) { // 1분마다 정리
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  // 캐시 저장
  set<T>(key: string, data: T, ttlSeconds?: number, options?: {
    etag?: string;
    tags?: string[];
  }): void {
    const ttl = (ttlSeconds || 300) * 1000; // 기본 5분
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      etag: options?.etag,
      tags: options?.tags,
    };
    
    this.cache.set(key, item);
  }

  // 캐시 조회
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // 만료 확인
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  // 캐시 존재 여부 확인
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // 만료 확인
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // ETag 조회
  getETag(key: string): string | null {
    const item = this.cache.get(key);
    return item?.etag || null;
  }

  // 캐시 삭제
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // 태그별 캐시 무효화
  invalidateByTag(tag: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (item.tags && item.tags.includes(tag)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
  }

  // 패턴별 캐시 무효화
  invalidateByPattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
  }

  // 만료된 캐시 정리
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
    
    if (keysToDelete.length > 0) {
      console.log(`캐시 정리: ${keysToDelete.length}개 항목 삭제`);
    }
  }

  // 캐시 통계
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    let totalSize = 0;
    
    this.cache.forEach((item) => {
      totalSize += JSON.stringify(item.data).length;
      
      if (now - item.timestamp > item.ttl) {
        expiredCount++;
      } else {
        validCount++;
      }
    });
    
    return {
      totalKeys: this.cache.size,
      validKeys: validCount,
      expiredKeys: expiredCount,
      estimatedSize: totalSize,
    };
  }

  // 캐시 초기화
  clear(): void {
    this.cache.clear();
  }

  // 메모리 해제
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// 글로벌 캐시 인스턴스
let globalCache: MemoryCache | null = null;

export function getCache(): MemoryCache {
  if (!globalCache) {
    globalCache = new MemoryCache();
  }
  return globalCache;
}

// 캐시 키 생성 헬퍼
export class CacheKeyBuilder {
  private parts: string[] = [];

  constructor(prefix?: string) {
    if (prefix) {
      this.parts.push(prefix);
    }
  }

  add(part: string | number): this {
    this.parts.push(String(part));
    return this;
  }

  addIf(condition: boolean, part: string | number): this {
    if (condition) {
      this.add(part);
    }
    return this;
  }

  addObject(obj: Record<string, any>): this {
    const sortedKeys = Object.keys(obj).sort();
    sortedKeys.forEach(key => {
      if (obj[key] !== undefined && obj[key] !== null) {
        this.parts.push(`${key}:${obj[key]}`);
      }
    });
    return this;
  }

  build(): string {
    return this.parts.join(':');
  }
}

// 캐시 데코레이터 (함수 결과 캐싱)
export function cached<T extends (...args: any[]) => any>(
  keyGenerator: (...args: Parameters<T>) => string,
  ttlSeconds?: number,
  tags?: string[]
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args: Parameters<T>) {
      const cache = getCache();
      const key = keyGenerator(...args);
      
      // 캐시에서 조회
      const cachedResult = cache.get<ReturnType<T>>(key);
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      // 실제 메소드 실행
      const result = await method.apply(this, args);
      
      // 결과를 캐시에 저장
      cache.set(key, result, ttlSeconds, { tags });
      
      return result;
    };
  };
}

// API 응답 캐싱 헬퍼
export class ApiCache {
  private cache = getCache();

  // 확장 프로그램 목록 캐싱
  cacheExtensions(key: string, extensions: any[], ttl: number = CACHE_DURATIONS.EXTENSIONS) {
    this.cache.set(key, extensions, ttl, {
      tags: ['extensions'],
      etag: this.generateETag(extensions),
    });
  }

  // 검색 결과 캐싱
  cacheSearchResults(query: string, results: any[], ttl: number = CACHE_DURATIONS.SEARCH_RESULTS) {
    const key = new CacheKeyBuilder('search').add(query).build();
    this.cache.set(key, results, ttl, {
      tags: ['search', 'extensions'],
      etag: this.generateETag(results),
    });
  }

  // 통계 캐싱
  cacheStats(stats: any, ttl: number = CACHE_DURATIONS.STATS) {
    const key = 'stats:global';
    this.cache.set(key, stats, ttl, {
      tags: ['stats'],
      etag: this.generateETag(stats),
    });
  }

  // 카테고리별 캐싱
  cacheCategoryData(category: string, data: any[], ttl: number = CACHE_DURATIONS.CATEGORIES) {
    const key = new CacheKeyBuilder('category').add(category).build();
    this.cache.set(key, data, ttl, {
      tags: ['categories', 'extensions'],
      etag: this.generateETag(data),
    });
  }

  // 캐시 무효화
  invalidateExtensions() {
    this.cache.invalidateByTag('extensions');
  }

  invalidateStats() {
    this.cache.invalidateByTag('stats');
  }

  invalidateSearch() {
    this.cache.invalidateByTag('search');
  }

  invalidateAll() {
    this.cache.clear();
  }

  // ETag 생성
  private generateETag(data: any): string {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  }

  // 조건부 요청 처리
  checkETag(key: string, clientETag?: string): { notModified: boolean; etag: string | null } {
    const serverETag = this.cache.getETag(key);
    
    if (serverETag && clientETag === serverETag) {
      return { notModified: true, etag: serverETag };
    }
    
    return { notModified: false, etag: serverETag };
  }
}

// 글로벌 API 캐시 인스턴스
let apiCache: ApiCache | null = null;

export function getApiCache(): ApiCache {
  if (!apiCache) {
    apiCache = new ApiCache();
  }
  return apiCache;
}

// 캐시 워밍업 함수들
export async function warmupCache() {
  console.log('캐시 워밍업 시작...');
  
  try {
    const { getAllExtensions, getExtensionStats } = await import('@/lib/server/data');
    const apiCache = getApiCache();
    
    // 전체 확장 프로그램 캐싱
    const extensions = await getAllExtensions();
    apiCache.cacheExtensions('extensions:all', extensions);
    
    // 통계 캐싱
    const stats = await getExtensionStats();
    apiCache.cacheStats(stats);
    
    console.log('캐시 워밍업 완료');
  } catch (error) {
    console.error('캐시 워밍업 실패:', error);
  }
}

// 캐시 미들웨어 헬퍼
export function createCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(part => part !== undefined).map(String).join(':');
}