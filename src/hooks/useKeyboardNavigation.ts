import { useState, useEffect, useRef, useCallback } from 'react';

export interface KeyboardNavigationOptions {
  enabled?: boolean;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  onSelect?: (index: number) => void;
  onEscape?: () => void;
  trapFocus?: boolean;
  autoFocus?: boolean;
}

export function useKeyboardNavigation<T extends HTMLElement = HTMLElement>(
  items: T[] | number,
  options: KeyboardNavigationOptions = {}
) {
  const {
    enabled = true,
    loop = true,
    orientation = 'vertical',
    onSelect,
    onEscape,
    trapFocus = false,
    autoFocus = false,
  } = options;

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<T[]>([]);
  const previousActiveElement = useRef<Element | null>(null);

  const itemCount = typeof items === 'number' ? items : items.length;

  // Update items refs
  useEffect(() => {
    if (Array.isArray(items)) {
      itemsRef.current = items;
    } else {
      // If items is a number, get elements from container
      if (containerRef.current) {
        itemsRef.current = Array.from(
          containerRef.current.querySelectorAll('[data-keyboard-nav]')
        ) as T[];
      }
    }
  }, [items]);

  // Auto focus first item
  useEffect(() => {
    if (autoFocus && enabled && itemsRef.current.length > 0 && activeIndex === -1) {
      setActiveIndex(0);
    }
  }, [autoFocus, enabled, activeIndex]);

  // Focus management
  useEffect(() => {
    if (!enabled) return;

    const currentItem = itemsRef.current[activeIndex];
    if (currentItem) {
      currentItem.focus();
      // Scroll into view if needed
      currentItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [activeIndex, enabled]);

  // Trap focus
  useEffect(() => {
    if (!trapFocus || !enabled) return;

    const handleFocusOut = (event: FocusEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const relatedTarget = event.relatedTarget as Element;
      if (!relatedTarget || !container.contains(relatedTarget)) {
        // Focus is leaving the container, bring it back
        const activeItem = itemsRef.current[activeIndex];
        if (activeItem) {
          activeItem.focus();
        } else if (itemsRef.current.length > 0) {
          setActiveIndex(0);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('focusout', handleFocusOut);
      // Store the previously active element
      previousActiveElement.current = document.activeElement;
      
      return () => {
        container.removeEventListener('focusout', handleFocusOut);
        // Restore focus when unmounting
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [trapFocus, enabled, activeIndex]);

  const moveNext = useCallback(() => {
    setActiveIndex(prevIndex => {
      if (prevIndex >= itemCount - 1) {
        return loop ? 0 : prevIndex;
      }
      return prevIndex + 1;
    });
  }, [itemCount, loop]);

  const movePrevious = useCallback(() => {
    setActiveIndex(prevIndex => {
      if (prevIndex <= 0) {
        return loop ? itemCount - 1 : prevIndex;
      }
      return prevIndex - 1;
    });
  }, [itemCount, loop]);

  const moveToIndex = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      setActiveIndex(index);
    }
  }, [itemCount]);

  const selectActive = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < itemCount) {
      onSelect?.(activeIndex);
    }
  }, [activeIndex, itemCount, onSelect]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enabled) return;

    const { key, ctrlKey, metaKey, shiftKey } = event;

    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          moveNext();
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          movePrevious();
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          moveNext();
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          movePrevious();
        }
        break;

      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setActiveIndex(itemCount - 1);
        break;

      case 'PageDown':
        event.preventDefault();
        setActiveIndex(prevIndex => 
          Math.min(itemCount - 1, prevIndex + 10)
        );
        break;

      case 'PageUp':
        event.preventDefault();
        setActiveIndex(prevIndex => 
          Math.max(0, prevIndex - 10)
        );
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        selectActive();
        break;

      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;

      case 'Tab':
        // Handle tab navigation within container
        if (trapFocus) {
          event.preventDefault();
          if (shiftKey) {
            movePrevious();
          } else {
            moveNext();
          }
        }
        break;

      default:
        // Handle character navigation (jump to item starting with character)
        if (!ctrlKey && !metaKey && !shiftKey && key.length === 1) {
          const char = key.toLowerCase();
          const startIndex = (activeIndex + 1) % itemCount;
          
          // Find next item that starts with the character
          for (let i = 0; i < itemCount; i++) {
            const index = (startIndex + i) % itemCount;
            const item = itemsRef.current[index];
            const text = item?.textContent?.toLowerCase() || '';
            
            if (text.startsWith(char)) {
              setActiveIndex(index);
              break;
            }
          }
        }
        break;
    }
  }, [enabled, orientation, moveNext, movePrevious, selectActive, onEscape, activeIndex, itemCount, trapFocus]);

  // Mouse interaction handlers
  const handleMouseEnter = useCallback((index: number) => {
    if (enabled) {
      setActiveIndex(index);
    }
  }, [enabled]);

  const handleMouseLeave = useCallback(() => {
    if (enabled && !trapFocus) {
      setActiveIndex(-1);
    }
  }, [enabled, trapFocus]);

  const handleClick = useCallback((index: number) => {
    if (enabled) {
      setActiveIndex(index);
      onSelect?.(index);
    }
  }, [enabled, onSelect]);

  return {
    activeIndex,
    setActiveIndex,
    moveNext,
    movePrevious,
    moveToIndex,
    selectActive,
    handleKeyDown,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    containerRef,
    isActive: (index: number) => index === activeIndex,
    // Utility functions
    getItemProps: (index: number) => ({
      'data-keyboard-nav': true,
      'data-active': index === activeIndex,
      tabIndex: index === activeIndex ? 0 : -1,
      role: 'option',
      'aria-selected': index === activeIndex,
      onMouseEnter: () => handleMouseEnter(index),
      onClick: () => handleClick(index),
    }),
    getContainerProps: () => ({
      ref: containerRef,
      role: 'listbox',
      'aria-activedescendant': activeIndex >= 0 ? `item-${activeIndex}` : undefined,
      onKeyDown: handleKeyDown,
      onMouseLeave: handleMouseLeave,
    }),
  };
}