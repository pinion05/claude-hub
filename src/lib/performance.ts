import type { WebVitalMetric } from '@/types/web-vitals';

export const measurePerformance = (name: string, fn: () => void): void => {
  if (typeof window === 'undefined' || !window.performance) return;
  
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  const measureName = `${name}-duration`;
  
  performance.mark(startMark);
  fn();
  performance.mark(endMark);
  
  performance.measure(measureName, startMark, endMark);
  
  const measure = performance.getEntriesByName(measureName)[0];
  if (measure && process.env.NODE_ENV === 'development') {
    console.log(`${name} took ${measure.duration.toFixed(2)}ms`);
  }
};

export const reportWebVitals = (metric: WebVitalMetric): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // Here you could send metrics to analytics service
  // Example: sendToAnalytics(metric)
};