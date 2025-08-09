/**
 * Web Vitals metric types based on web-vitals library
 */

export interface Metric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
}

export interface CLSMetric extends Metric {
  name: 'CLS';
}

export interface FCPMetric extends Metric {
  name: 'FCP';
}

export interface FIDMetric extends Metric {
  name: 'FID';
}

export interface INPMetric extends Metric {
  name: 'INP';
}

export interface LCPMetric extends Metric {
  name: 'LCP';
}

export interface TTFBMetric extends Metric {
  name: 'TTFB';
}

export type WebVitalMetric = CLSMetric | FCPMetric | FIDMetric | INPMetric | LCPMetric | TTFBMetric;