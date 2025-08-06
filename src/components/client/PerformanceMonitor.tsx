'use client';

import { useEffect } from 'react';

/**
 * Client Component for monitoring performance metrics
 */
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Web Vitals monitoring
    const observeWebVitals = () => {
      // Monitor Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              console.warn('LCP:', entry.startTime);
              // Send to analytics service
            }
          });
        });
        
        try {
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {
          // Browser doesn't support this entry type
        }
      }
    };

    // Monitor First Input Delay (FID)
    const observeFirstInput = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'first-input') {
              const fid = (entry as any).processingStart - entry.startTime;
              console.warn('FID:', fid);
              // Send to analytics service
            }
          });
        });
        
        try {
          observer.observe({ type: 'first-input', buffered: true });
        } catch {
          // Browser doesn't support this entry type
        }
      }
    };

    // Monitor Cumulative Layout Shift (CLS)
    const observeLayoutShift = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const clsEntries: any[] = [];

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              clsEntries.push(entry);
            }
          });
          
          console.warn('CLS:', clsValue);
        });
        
        try {
          observer.observe({ type: 'layout-shift', buffered: true });
        } catch {
          // Browser doesn't support this entry type
        }
      }
    };

    // Only run in production
    if (process.env.NODE_ENV === 'production') {
      observeWebVitals();
      observeFirstInput();
      observeLayoutShift();
    }

    // Cleanup is not needed as observers are passive
  }, []);

  // This component doesn't render anything
  return null;
}