import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

export interface WebVitalsMetrics {
  CLS: number | null;
  FID: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface PerformanceThresholds {
  CLS: { good: number; needsImprovement: number };
  FID: { good: number; needsImprovement: number };
  FCP: { good: number; needsImprovement: number };
  LCP: { good: number; needsImprovement: number };
  TTFB: { good: number; needsImprovement: number };
}

// Performance thresholds based on Core Web Vitals
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 }
};

/**
 * Web Vitals monitoring and reporting
 */
class WebVitalsMonitor {
  private metrics: Partial<WebVitalsMetrics> = {};
  private listeners: ((metrics: WebVitalsMetrics) => void)[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.isInitialized) return;

    this.metrics = {
      CLS: null,
      FID: null,
      FCP: null,
      LCP: null,
      TTFB: null,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Collect Core Web Vitals
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));

    this.isInitialized = true;
  }

  private handleMetric(metric: Metric) {
    this.metrics[metric.name as keyof WebVitalsMetrics] = metric.value;
    
    // Notify listeners
    if (this.isComplete()) {
      const completeMetrics = this.metrics as WebVitalsMetrics;
      this.listeners.forEach(listener => listener(completeMetrics));
    }

    // Send to analytics if available
    this.sendToAnalytics(metric);
  }

  private isComplete(): boolean {
    return Object.values(this.metrics).every(value => value !== null);
  }

  private sendToAnalytics(metric: Metric) {
    // Send to Google Analytics 4 if available
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: this.getMetricRating(metric),
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      this.reportToEndpoint(metric);
    }
  }

  private getMetricRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = PERFORMANCE_THRESHOLDS[metric.name as keyof PerformanceThresholds];
    if (!thresholds) return 'good';

    if (metric.value <= thresholds.good) return 'good';
    if (metric.value <= thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  private async reportToEndpoint(metric: Metric) {
    try {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: this.getMetricRating(metric),
        delta: metric.delta,
        id: metric.id,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connection: this.getConnectionInfo(),
        deviceInfo: this.getDeviceInfo()
      });

      // Use sendBeacon if available for reliability
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon('/api/analytics/web-vitals', body);
      } else {
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          body,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        }).catch(error => {
          console.warn('Failed to send web vitals:', error);
        });
      }
    } catch (_error) {
      console.warn('Error reporting web vitals:', _error);
    }
  }

  private getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
    return null;
  }

  private getDeviceInfo() {
    return {
      deviceMemory: (navigator as any).deviceMemory || null,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      screen: {
        width: screen.width,
        height: screen.height,
        pixelDepth: screen.pixelDepth
      }
    };
  }

  public onMetrics(callback: (metrics: WebVitalsMetrics) => void) {
    this.listeners.push(callback);
  }

  public getMetrics(): Partial<WebVitalsMetrics> {
    return { ...this.metrics };
  }

  public getPerformanceScore(): number {
    if (!this.isComplete()) return 0;

    const scores = Object.entries(this.metrics)
      .filter(([key]) => key !== 'timestamp' && key !== 'url' && key !== 'userAgent')
      .map(([name, value]) => {
        if (value === null) return 0;
        const rating = this.getMetricRating({ name, value } as Metric);
        switch (rating) {
          case 'good': return 100;
          case 'needs-improvement': return 50;
          case 'poor': return 0;
          default: return 0;
        }
      });

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  }
}

// Singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();

/**
 * Hook for monitoring Web Vitals in React components
 */
export function useWebVitals() {
  const [metrics, setMetrics] = React.useState<Partial<WebVitalsMetrics>>({});
  const [performanceScore, setPerformanceScore] = React.useState<number>(0);

  React.useEffect(() => {
    const updateMetrics = (newMetrics: WebVitalsMetrics) => {
      setMetrics(newMetrics);
      setPerformanceScore(webVitalsMonitor.getPerformanceScore());
    };

    webVitalsMonitor.onMetrics(updateMetrics);

    // Get current metrics
    setMetrics(webVitalsMonitor.getMetrics());
    setPerformanceScore(webVitalsMonitor.getPerformanceScore());
  }, []);

  return {
    metrics,
    performanceScore,
    isComplete: Object.values(metrics).every(value => value !== null)
  };
}

/**
 * Performance observer for additional metrics
 */
export class PerformanceObserver {
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initObservers();
    }
  }

  private initObservers() {
    // Long tasks observer
    this.observeLongTasks();
    
    // Resource timing observer
    this.observeResources();
    
    // Navigation timing
    this.observeNavigation();
    
    // Layout shift observer (for debugging)
    this.observeLayoutShifts();
  }

  private observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
          
          // Report to analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'long_task', {
              event_category: 'Performance',
              value: Math.round(entry.duration),
              non_interaction: true
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (_error) {
      console.warn('Long task observer not supported');
    }
  }

  private observeResources() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Log slow resources
          if (resourceEntry.duration > 1000) {
            console.warn('Slow resource:', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              transferSize: resourceEntry.transferSize
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (_error) {
      console.warn('Resource observer not supported');
    }
  }

  private observeNavigation() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          
          const metrics = {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            ssl: navEntry.connectEnd - navEntry.secureConnectionStart,
            ttfb: navEntry.responseStart - navEntry.requestStart,
            download: navEntry.responseEnd - navEntry.responseStart,
            domParse: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            domReady: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
            load: navEntry.loadEventEnd - navEntry.navigationStart
          };
          
          console.error('Navigation metrics:', metrics);
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (_error) {
      console.warn('Navigation observer not supported');
    }
  }

  private observeLayoutShifts() {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const layoutShift = entry as any;
          
          if (!layoutShift.hadRecentInput && layoutShift.value > 0.1) {
            console.warn('Significant layout shift:', {
              value: layoutShift.value,
              sources: layoutShift.sources?.map((s: any) => s.node?.tagName || 'unknown')
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (_error) {
      console.warn('Layout shift observer not supported');
    }
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance observer instance
export const performanceObserver = new PerformanceObserver();