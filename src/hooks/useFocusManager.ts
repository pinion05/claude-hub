import { useRef, useEffect, useCallback } from 'react';

export interface FocusManagerOptions {
  autoFocus?: boolean;
  restoreFocus?: boolean;
  preventScroll?: boolean;
  selectTextOnFocus?: boolean;
}

/**
 * Hook for managing focus in components
 * Provides utilities for focus management, restoration, and trapping
 */
export function useFocusManager(options: FocusManagerOptions = {}) {
  const {
    autoFocus = false,
    restoreFocus = true,
    preventScroll = false,
    selectTextOnFocus = false
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);
  const focusedOnMount = useRef(false);

  // Store the previously focused element on mount
  useEffect(() => {
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement;
    }
  }, [restoreFocus]);

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && elementRef.current && !focusedOnMount.current) {
      elementRef.current.focus({ preventScroll });
      focusedOnMount.current = true;
      
      if (selectTextOnFocus && elementRef.current instanceof HTMLInputElement) {
        elementRef.current.select();
      }
    }
  }, [autoFocus, preventScroll, selectTextOnFocus]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreFocus && previouslyFocusedElement.current instanceof HTMLElement) {
        // Use requestAnimationFrame to ensure the element is still in the DOM
        requestAnimationFrame(() => {
          if (previouslyFocusedElement.current instanceof HTMLElement) {
            try {
              previouslyFocusedElement.current.focus({ preventScroll });
            } catch {
              // Element might have been removed from DOM
            }
          }
        });
      }
    };
  }, [restoreFocus, preventScroll]);

  const focusElement = useCallback((element?: HTMLElement | null) => {
    const targetElement = element || elementRef.current;
    if (targetElement) {
      targetElement.focus({ preventScroll });
      
      if (selectTextOnFocus && targetElement instanceof HTMLInputElement) {
        targetElement.select();
      }
    }
  }, [preventScroll, selectTextOnFocus]);

  const blurElement = useCallback((element?: HTMLElement | null) => {
    const targetElement = element || elementRef.current;
    if (targetElement) {
      targetElement.blur();
    }
  }, []);

  return {
    elementRef,
    focusElement,
    blurElement,
    previouslyFocusedElement: previouslyFocusedElement.current,
  };
}

/**
 * Hook for trapping focus within a container
 * Useful for modals, dropdowns, and other overlay components
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'details summary',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors))
      .filter(el => {
        // Additional checks for visibility and interactivity
        const element = el as HTMLElement;
        return (
          !element.hidden &&
          element.offsetWidth > 0 &&
          element.offsetHeight > 0 &&
          window.getComputedStyle(element).visibility !== 'hidden'
        );
      }) as HTMLElement[];
  }, []);

  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forward)
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [isActive, getFocusableElements]);

  // Setup focus trap
  useEffect(() => {
    if (!isActive) return;

    // Store previously focused element
    previouslyFocusedElement.current = document.activeElement;

    // Focus first element
    requestAnimationFrame(() => {
      focusFirstElement();
    });

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus
      if (previouslyFocusedElement.current instanceof HTMLElement) {
        requestAnimationFrame(() => {
          if (previouslyFocusedElement.current instanceof HTMLElement) {
            try {
              previouslyFocusedElement.current.focus();
            } catch {
              // Element might have been removed
            }
          }
        });
      }
    };
  }, [isActive, handleKeyDown, focusFirstElement]);

  return {
    containerRef,
    focusFirstElement,
    focusLastElement,
    getFocusableElements,
  };
}

/**
 * Hook for managing roving tabindex
 * Useful for widget patterns like toolbars, menus, and grids
 */
export function useRovingTabIndex<T extends HTMLElement = HTMLElement>(
  items: T[],
  activeIndex: number = 0
) {
  const updateTabIndex = useCallback(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);

  useEffect(() => {
    updateTabIndex();
  }, [updateTabIndex]);

  const getItemProps = useCallback((index: number) => ({
    tabIndex: index === activeIndex ? 0 : -1,
    role: 'button',
    'aria-selected': index === activeIndex,
  }), [activeIndex]);

  return {
    getItemProps,
    updateTabIndex,
  };
}