'use client';

import React, { useEffect, useState } from 'react';

interface AccessibilityMonitorProps {
  enabled?: boolean;
  showUI?: boolean;
  reportViolations?: boolean;
}

interface AxeViolation {
  id: string;
  description: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  tags: string[];
  nodes: Array<{
    target: string[];
    html: string;
    failureSummary: string;
  }>;
}

interface AxeResults {
  violations: AxeViolation[];
  passes: any[];
  incomplete: any[];
  timestamp: number;
  url: string;
}

/**
 * Client-side accessibility monitoring component
 * Uses axe-core for runtime accessibility checking in development
 */
export function AccessibilityMonitor({
  enabled = process.env.NODE_ENV === 'development',
  showUI = false,
  reportViolations = true
}: AccessibilityMonitorProps) {
  const [violations, setViolations] = useState<AxeViolation[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let axeCore: any;
    
    // Dynamically import axe-core only in development
    const loadAxe = async () => {
      try {
        const { default: axe } = await import('@axe-core/react');
        axeCore = axe;
        
        // Initialize axe-core with React
        axeCore(React, React, 1000, {
          rules: {
            // Customize rules for runtime checking
            'color-contrast': { enabled: true },
            'keyboard-trap': { enabled: true },
            'focus-order-semantics': { enabled: true },
            'aria-hidden-focus': { enabled: true },
            'landmark-unique': { enabled: true },
          },
          tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
        });

        // Run initial scan after a delay to allow page to render
        setTimeout(() => runAccessibilityScan(), 2000);

        // Set up mutation observer to re-run scans on DOM changes
        if (reportViolations) {
          setupMutationObserver();
        }
      } catch (error) {
        console.warn('Failed to load axe-core:', error);
      }
    };

    const runAccessibilityScan = async () => {
      if (!axeCore || isRunning) return;

      setIsRunning(true);
      
      try {
        // Run axe on the entire document
        const results = await axeCore.run(document, {
          reporter: 'v2',
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
          },
          resultTypes: ['violations', 'incomplete'],
        });

        const scanResults: AxeResults = {
          violations: results.violations,
          passes: results.passes || [],
          incomplete: results.incomplete || [],
          timestamp: Date.now(),
          url: window.location.href,
        };

        setViolations(scanResults.violations);
        setLastScan(new Date());

        // Report violations to console in development
        if (reportViolations && scanResults.violations.length > 0) {
          console.group('🚨 Accessibility Violations Found');
          scanResults.violations.forEach(violation => {
            console.error(`${violation.id}: ${violation.description}`, {
              impact: violation.impact,
              tags: violation.tags,
              nodes: violation.nodes.map(node => ({
                target: node.target,
                html: node.html.substring(0, 100) + '...',
              })),
            });
          });
          console.groupEnd();
        }

        // Send to analytics endpoint if configured
        if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
          try {
            await fetch('/api/analytics/accessibility', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                violations: scanResults.violations.map(v => ({
                  id: v.id,
                  impact: v.impact,
                  count: v.nodes.length,
                })),
                url: window.location.href,
                timestamp: scanResults.timestamp,
                userAgent: navigator.userAgent,
              }),
            });
          } catch (error) {
            console.warn('Failed to report accessibility data:', error);
          }
        }
      } catch (error) {
        console.error('Accessibility scan failed:', error);
      } finally {
        setIsRunning(false);
      }
    };

    const setupMutationObserver = () => {
      const observer = new MutationObserver((mutations) => {
        // Debounce scans to avoid running too frequently
        const hasSignificantChange = mutations.some(mutation => 
          mutation.type === 'childList' && mutation.addedNodes.length > 0
        );
        
        if (hasSignificantChange) {
          setTimeout(() => runAccessibilityScan(), 1000);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });

      return observer;
    };

    loadAxe();

    // Cleanup
    return () => {
      // Disconnect observer if it exists
    };
  }, [enabled, reportViolations, isRunning]);

  // Don't render anything if not enabled or no UI requested
  if (!enabled || (!showUI && violations.length === 0)) {
    return null;
  }

  const criticalViolations = violations.filter(v => v.impact === 'critical');
  const seriousViolations = violations.filter(v => v.impact === 'serious');
  const moderateViolations = violations.filter(v => v.impact === 'moderate');
  const minorViolations = violations.filter(v => v.impact === 'minor');

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-500';
      case 'serious': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      case 'minor': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactBg = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'serious': return 'bg-orange-500/10 border-orange-500/20';
      case 'moderate': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'minor': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      {/* Summary Card */}
      <div className="bg-black/90 text-white p-3 rounded-lg text-xs font-mono backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold flex items-center gap-2">
            <span role="img" aria-label="Accessibility">♿</span>
            A11Y Monitor
          </div>
          <div className="flex items-center gap-2">
            {isRunning && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-white/60 hover:text-white transition-colors"
              aria-label={showDetails ? 'Hide details' : 'Show details'}
            >
              {showDetails ? '−' : '+'}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">
              {violations.length}
            </div>
            <div className="text-white/60">Violations</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {violations.length === 0 ? '✓' : '!'}
            </div>
            <div className="text-white/60">Status</div>
          </div>
        </div>

        {violations.length > 0 && (
          <div className="flex gap-2 text-xs">
            {criticalViolations.length > 0 && (
              <span className="text-red-400">{criticalViolations.length} critical</span>
            )}
            {seriousViolations.length > 0 && (
              <span className="text-orange-400">{seriousViolations.length} serious</span>
            )}
            {moderateViolations.length > 0 && (
              <span className="text-yellow-400">{moderateViolations.length} moderate</span>
            )}
            {minorViolations.length > 0 && (
              <span className="text-blue-400">{minorViolations.length} minor</span>
            )}
          </div>
        )}

        {lastScan && (
          <div className="text-white/40 text-xs mt-2">
            Last scan: {lastScan.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Detailed Violations */}
      {showDetails && violations.length > 0 && (
        <div className="mt-2 max-h-96 overflow-y-auto space-y-2">
          {violations.map((violation, index) => (
            <div
              key={`${violation.id}-${index}`}
              className={`p-3 rounded-lg text-xs border ${getImpactBg(violation.impact)}`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className={`font-semibold ${getImpactColor(violation.impact)}`}>
                  {violation.id}
                </div>
                <div className={`text-xs uppercase ${getImpactColor(violation.impact)}`}>
                  {violation.impact}
                </div>
              </div>
              
              <div className="text-white/80 mb-2 text-xs leading-relaxed">
                {violation.description}
              </div>
              
              <div className="text-white/60 text-xs">
                {violation.nodes.length} element{violation.nodes.length !== 1 ? 's' : ''} affected
              </div>
              
              {/* Show first affected element */}
              {violation.nodes[0] && (
                <div className="mt-2 p-2 bg-black/40 rounded text-xs font-mono text-white/70">
                  {violation.nodes[0].target[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}