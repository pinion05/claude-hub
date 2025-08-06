/**
 * Performance utilities for Claude Hub
 * Provides Web Vitals monitoring and optimization helpers
 */

// Web Vitals thresholds
export const PERFORMANCE_THRESHOLDS = {
  LCP: 2500,  // Largest Contentful Paint
  FID: 100,   // First Input Delay  
  CLS: 0.1,   // Cumulative Layout Shift
  INP: 200,   // Interaction to Next Paint
} as const;

// Performance observer for Core Web Vitals
export function observeWebVitals(callback: (metric: WebVitalMetric) => void) {
  if (typeof window === 'undefined') return;

  // LCP - Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        callback({
          name: 'LCP',
          value: lastEntry.startTime,
          rating: lastEntry.startTime <= PERFORMANCE_THRESHOLDS.LCP ? 'good' : 'needs-improvement'
        });
      }
    });

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Browser doesn't support this metric
    }

    // FID - First Input Delay  
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as any[];
      entries.forEach((entry) => {
        const delay = entry.processingStart - entry.startTime;
        callback({
          name: 'FID',
          value: delay,
          rating: delay <= PERFORMANCE_THRESHOLDS.FID ? 'good' : 'needs-improvement'
        });
      });
    });

    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch {
      // Browser doesn't support this metric
    }

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as any[];
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      callback({
        name: 'CLS',
        value: clsValue,
        rating: clsValue <= PERFORMANCE_THRESHOLDS.CLS ? 'good' : 'needs-improvement'
      });
    });

    try {
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Browser doesn't support this metric
    }
  }
}

// Performance metric interface
export interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

// Performance timing helpers
export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  return fn().then((result) => {
    const duration = performance.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⏱️ ${name}: ${Math.round(duration)}ms`);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Analytics integration would go here
      (window as any).gtag?.('event', 'timing_complete', {
        name,
        value: Math.round(duration)
      });
    }
    
    return result;
  });
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100,
    totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100,
    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100,
  };
}

// Resource timing analysis
export function analyzeResourceTiming() {
  if (typeof window === 'undefined') return [];

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  return resources
    .map((resource) => ({
      name: resource.name.split('/').pop() || 'unknown',
      type: resource.initiatorType,
      size: resource.transferSize,
      duration: Math.round(resource.duration),
      startTime: Math.round(resource.startTime),
    }))
    .filter((resource) => resource.duration > 0)
    .sort((a, b) => b.duration - a.duration);
}

// Performance budget checker
export function checkPerformanceBudget(budget: PerformanceBudget) {
  const results = {
    passed: true,
    violations: [] as string[],
  };

  // Check bundle size if available
  if (budget.maxBundleSize) {
    // This would typically be measured during build time
    const bundleSize = getBundleSize();
    if (bundleSize && bundleSize > budget.maxBundleSize) {
      results.passed = false;
      results.violations.push(`Bundle size (${bundleSize}KB) exceeds budget (${budget.maxBundleSize}KB)`);
    }
  }

  // Check resource count
  if (budget.maxResources) {
    const resourceCount = performance.getEntriesByType('resource').length;
    if (resourceCount > budget.maxResources) {
      results.passed = false;
      results.violations.push(`Resource count (${resourceCount}) exceeds budget (${budget.maxResources})`);
    }
  }

  return results;
}

// Performance budget interface
interface PerformanceBudget {
  maxBundleSize?: number; // KB
  maxResources?: number;
  maxImageSize?: number; // KB
  maxLoadTime?: number; // ms
}

// Bundle size helper (would be populated during build)
function getBundleSize(): number | null {
  // This would typically be injected during build time
  return typeof window !== 'undefined' && (window as any).__BUNDLE_SIZE__ || null;
}

// Performance reporting
export function reportPerformance(metrics: Record<string, number>) {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Send to analytics service
    Object.entries(metrics).forEach(([name, value]) => {
      (window as any).gtag?.('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_map: { dimension1: name }
      });
    });
  }
}

// Performance optimization helpers
export const performanceHelpers = {
  // Preload critical resources
  preloadResource: (href: string, as: string) => {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Prefetch next page resources
  prefetchResource: (href: string) => {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },

  // Lazy load images
  lazyLoadImages: () => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }
};
