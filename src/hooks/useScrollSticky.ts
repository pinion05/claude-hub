import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollStickyProps {
  threshold?: number;
  enabled?: boolean;
}

interface UseScrollStickyReturn {
  isSticky: boolean;
  sectionHeight: number;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

export const useScrollSticky = ({
  threshold = 200,
  enabled = true
}: UseScrollStickyProps = {}): UseScrollStickyReturn => {
  const [isSticky, setIsSticky] = useState(false);
  const [sectionHeight, setSectionHeight] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!enabled) return;
    
    const scrollY = window.scrollY;
    setIsSticky(scrollY > threshold);
  }, [threshold, enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsSticky(false);
      return;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, enabled]);

  useEffect(() => {
    if (sectionRef.current && !isSticky && enabled) {
      const height = sectionRef.current.offsetHeight;
      setSectionHeight(height);
    }
  }, [isSticky, enabled]);

  return {
    isSticky,
    sectionHeight,
    sectionRef
  };
};