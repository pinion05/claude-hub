import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  children: React.ReactNode;
  level?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

/**
 * ARIA Live Region component
 * Announces dynamic content changes to screen readers
 */
export function LiveRegion({
  children,
  level = 'polite',
  atomic = true,
  relevant = 'additions',
  className = 'sr-only'
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  const previousContent = useRef<string>('');

  useEffect(() => {
    if (regionRef.current) {
      const currentContent = regionRef.current.textContent || '';
      // Only announce if content has actually changed
      if (currentContent !== previousContent.current && currentContent.trim()) {
        previousContent.current = currentContent;
      }
    }
  });

  return (
    <div
      ref={regionRef}
      className={className}
      aria-live={level}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role="status"
    >
      {children}
    </div>
  );
}

/**
 * Status message component for immediate announcements
 */
export function StatusMessage({ 
  children, 
  className = 'sr-only' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <LiveRegion level="assertive" className={className}>
      {children}
    </LiveRegion>
  );
}

/**
 * Alert message component for urgent announcements
 */
export function AlertMessage({ 
  children, 
  className = 'sr-only' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div
      className={className}
      role="alert"
      aria-live="assertive"
      aria-atomic={true}
    >
      {children}
    </div>
  );
}