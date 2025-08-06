'use client';

import React, { useEffect, useState } from 'react';
import { webVitalsMonitor, useWebVitals, PerformanceObserver } from '@/lib/performance/webVitals';

interface WebVitalsMonitorProps {
  debug?: boolean;
  showUI?: boolean;
}

/**
 * Client-side Web Vitals monitoring component
 * Automatically tracks Core Web Vitals and sends to analytics
 */
export function WebVitalsMonitor({ debug = false, showUI = false }: WebVitalsMonitorProps) {
  const { metrics, performanceScore, isComplete } = useWebVitals();
  const [observer] = useState(() => new PerformanceObserver());

  useEffect(() => {
    // Initialize monitoring
    webVitalsMonitor.onMetrics((metrics) => {
      if (debug) {
        console.log('Web Vitals collected:', metrics);
      }
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [debug, observer]);

  // Performance feedback for development
  useEffect(() => {
    if (debug && isComplete) {
      const score = performanceScore;
      const feedback = score >= 90 ? 'Excellent' : 
                     score >= 75 ? 'Good' : 
                     score >= 50 ? 'Needs Improvement' : 'Poor';
      
      console.log(`Performance Score: ${score}/100 (${feedback})`);
      
      Object.entries(metrics).forEach(([name, value]) => {
        if (typeof value === 'number') {
          const rating = getRating(name, value);
          console.log(`${name}: ${value} (${rating})`);
        }
      });
    }
  }, [debug, isComplete, performanceScore, metrics]);

  // Don't render anything in production unless showUI is true
  if (!debug && !showUI) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showUI && (
        <div className="bg-black/80 text-white p-3 rounded-lg text-xs font-mono backdrop-blur-sm">
          <div className="mb-2 font-semibold">
            Performance Score: {performanceScore}/100
          </div>
          <div className="space-y-1">
            {Object.entries(metrics).map(([name, value]) => {
              if (typeof value === 'number') {
                const rating = getRating(name, value);
                const color = rating === 'good' ? 'text-green-400' : 
                            rating === 'needs-improvement' ? 'text-yellow-400' : 'text-red-400';
                return (
                  <div key={name} className="flex justify-between gap-2">
                    <span>{name}:</span>
                    <span className={color}>
                      {name === 'CLS' ? value.toFixed(3) : Math.round(value)}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; needsImprovement: number }> = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FID: { good: 100, needsImprovement: 300 },
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 800, needsImprovement: 1800 }
  };

  const threshold = thresholds[metricName];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}