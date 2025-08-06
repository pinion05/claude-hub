import { renderHook, act } from '@testing-library/react';
import { useScrollSticky } from './useScrollSticky';

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
});

// Mock HTMLElement offsetHeight
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 100,
});

describe('useScrollSticky', () => {
  beforeEach(() => {
    // Reset scroll position
    (window as any).scrollY = 0;
    // Clear event listeners
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    window.removeEventListener('scroll', jest.fn());
  });

  // 기본 초기화 테스트
  describe('initialization', () => {
    it('initializes with default props', () => {
      const { result } = renderHook(() => useScrollSticky());

      expect(result.current.isSticky).toBe(false);
      expect(result.current.sectionHeight).toBe(0);
      expect(result.current.sectionRef).toBeDefined();
      expect(result.current.sectionRef.current).toBe(null);
    });

    it('initializes with custom threshold', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 100 }));

      expect(result.current.isSticky).toBe(false);
      expect(result.current.sectionHeight).toBe(0);
    });

    it('initializes with enabled set to false', () => {
      const { result } = renderHook(() => useScrollSticky({ enabled: false }));

      expect(result.current.isSticky).toBe(false);
      expect(result.current.sectionHeight).toBe(0);
    });

    it('adds scroll event listener when enabled', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useScrollSticky({ enabled: true }));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );

      addEventListenerSpy.mockRestore();
    });

    it('does not add scroll event listener when disabled', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useScrollSticky({ enabled: false }));

      expect(addEventListenerSpy).not.toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );

      addEventListenerSpy.mockRestore();
    });
  });

  // Scroll 동작 테스트
  describe('scroll behavior', () => {
    it('sets isSticky to true when scrollY exceeds threshold', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 200 }));

      // Simulate scroll beyond threshold
      act(() => {
        (window as any).scrollY = 250;
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.isSticky).toBe(true);
    });

    it('sets isSticky to false when scrollY is below threshold', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 200 }));

      // First scroll beyond threshold
      act(() => {
        (window as any).scrollY = 250;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);

      // Then scroll back below threshold
      act(() => {
        (window as any).scrollY = 150;
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.isSticky).toBe(false);
    });

    it('handles scroll at exactly threshold value', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 200 }));

      // Scroll to exactly threshold
      act(() => {
        (window as any).scrollY = 200;
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.isSticky).toBe(false);

      // Scroll one pixel beyond threshold
      act(() => {
        (window as any).scrollY = 201;
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.isSticky).toBe(true);
    });

    it('uses default threshold of 200px', () => {
      const { result } = renderHook(() => useScrollSticky());

      // Scroll to 199px (below default threshold)
      act(() => {
        (window as any).scrollY = 199;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(false);

      // Scroll to 201px (above default threshold)
      act(() => {
        (window as any).scrollY = 201;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);
    });

    it('does not update isSticky when disabled', () => {
      const { result } = renderHook(() => useScrollSticky({ enabled: false, threshold: 200 }));

      act(() => {
        (window as any).scrollY = 250;
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.isSticky).toBe(false);
    });

    it('handles rapid scroll events efficiently', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 200 }));

      // Simulate rapid scrolling
      for (let i = 0; i < 100; i++) {
        act(() => {
          (window as any).scrollY = i * 10;
          window.dispatchEvent(new Event('scroll'));
        });
      }

      // Should be sticky as final position is well above threshold
      expect(result.current.isSticky).toBe(true);
    });
  });

  // Section height 측정 테스트
  describe('section height measurement', () => {
    it('has section height initially at 0', () => {
      const { result } = renderHook(() => useScrollSticky());

      // Initially height should be 0
      expect(result.current.sectionHeight).toBe(0);

      // Ref should be available
      expect(result.current.sectionRef).toBeDefined();
    });

    it('does not measure section height when sticky', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 100 }));

      // First make it sticky
      act(() => {
        (window as any).scrollY = 150;
        window.dispatchEvent(new Event('scroll'));
      });

      const mockElement = {
        offsetHeight: 200,
      } as HTMLDivElement;

      act(() => {
        // Attach ref while sticky
        result.current.sectionRef.current = mockElement;
      });

      // Height should not be measured while sticky
      expect(result.current.sectionHeight).toBe(0);
    });

    it('measures section height when becoming non-sticky', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 100 }));

      const mockElement = {
        offsetHeight: 180,
      } as HTMLDivElement;

      // Attach ref and make sticky first
      act(() => {
        result.current.sectionRef.current = mockElement;
        (window as any).scrollY = 150;
        window.dispatchEvent(new Event('scroll'));
      });

      // Then scroll back to make it non-sticky
      act(() => {
        (window as any).scrollY = 50;
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.sectionHeight).toBe(180);
    });

    it('does not measure height when disabled', () => {
      const { result } = renderHook(() => useScrollSticky({ enabled: false }));

      const mockElement = {
        offsetHeight: 120,
      } as HTMLDivElement;

      act(() => {
        result.current.sectionRef.current = mockElement;
      });

      expect(result.current.sectionHeight).toBe(0);
    });
  });

  // Enabled/disabled 토글 테스트
  describe('enabled/disabled toggling', () => {
    it('disables sticky behavior when enabled becomes false', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useScrollSticky({ threshold: 100, enabled }),
        { initialProps: { enabled: true } }
      );

      // First scroll to make it sticky
      act(() => {
        (window as any).scrollY = 150;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);

      // Disable the hook
      rerender({ enabled: false });
      expect(result.current.isSticky).toBe(false);

      // Scrolling should not affect sticky state
      act(() => {
        (window as any).scrollY = 200;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(false);
    });

    it('enables sticky behavior when enabled becomes true', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useScrollSticky({ threshold: 100, enabled }),
        { initialProps: { enabled: false } }
      );

      // Scroll while disabled
      act(() => {
        (window as any).scrollY = 150;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(false);

      // Enable the hook
      rerender({ enabled: true });

      // Now scrolling should affect sticky state
      act(() => {
        (window as any).scrollY = 200;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);
    });
  });

  // Threshold 변경 테스트
  describe('threshold changes', () => {
    it('responds to threshold changes', () => {
      const { result, rerender } = renderHook(
        ({ threshold }) => useScrollSticky({ threshold }),
        { initialProps: { threshold: 200 } }
      );

      // Scroll to position between old and new thresholds
      act(() => {
        (window as any).scrollY = 150;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(false);

      // Change threshold to lower value
      rerender({ threshold: 100 });

      // Same scroll position should now be sticky
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);
    });

    it('handles zero threshold', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 0 }));

      // Any scroll should make it sticky
      act(() => {
        (window as any).scrollY = 1;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);

      // Back to top should make it non-sticky
      act(() => {
        (window as any).scrollY = 0;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(false);
    });

    it('handles very large threshold', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 10000 }));

      act(() => {
        (window as any).scrollY = 5000;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(false);

      act(() => {
        (window as any).scrollY = 15000;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);
    });
  });

  // Event listener 관리 테스트
  describe('event listener management', () => {
    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useScrollSticky());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('re-adds event listener when enabled changes from false to true', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { rerender } = renderHook(
        ({ enabled }) => useScrollSticky({ enabled }),
        { initialProps: { enabled: false } }
      );

      // Should not have added listener initially
      expect(addEventListenerSpy).not.toHaveBeenCalled();

      // Enable the hook
      rerender({ enabled: true });

      // Should now add the listener
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('removes event listener when enabled changes from true to false', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { rerender } = renderHook(
        ({ enabled }) => useScrollSticky({ enabled }),
        { initialProps: { enabled: true } }
      );

      // Disable the hook
      rerender({ enabled: false });

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('uses passive event listener for performance', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useScrollSticky());

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      );

      addEventListenerSpy.mockRestore();
    });
  });

  // 함수 안정성 테스트
  describe('function stability', () => {
    it('maintains stable function references', () => {
      const { result, rerender } = renderHook(
        ({ threshold }) => useScrollSticky({ threshold }),
        { initialProps: { threshold: 200 } }
      );

      const initialSectionRef = result.current.sectionRef;

      // Re-render with same threshold
      rerender({ threshold: 200 });

      expect(result.current.sectionRef).toBe(initialSectionRef);
    });

    it('updates callback when threshold changes', () => {
      const { result, rerender } = renderHook(
        ({ threshold }) => useScrollSticky({ threshold }),
        { initialProps: { threshold: 200 } }
      );

      // Scroll to position between old and new thresholds
      act(() => {
        (window as any).scrollY = 150;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(false);

      // Change threshold
      rerender({ threshold: 100 });

      // Same scroll position should now trigger different behavior
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);
    });
  });

  // Edge cases 테스트
  describe('edge cases', () => {
    it('handles negative scroll positions', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 100 }));

      act(() => {
        (window as any).scrollY = -50;
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.isSticky).toBe(false);
    });

    it('handles negative threshold', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: -100 }));

      act(() => {
        (window as any).scrollY = 0;
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current.isSticky).toBe(true);
    });

    it('handles fractional scroll positions and thresholds', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 100.5 }));

      act(() => {
        (window as any).scrollY = 100.4;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(false);

      act(() => {
        (window as any).scrollY = 100.6;
        window.dispatchEvent(new Event('scroll'));
      });
      expect(result.current.isSticky).toBe(true);
    });

    it('handles missing sectionRef element gracefully', () => {
      const { result } = renderHook(() => useScrollSticky());

      expect(() => {
        act(() => {
          result.current.sectionRef.current = null;
        });
      }).not.toThrow();

      expect(result.current.sectionHeight).toBe(0);
    });

    it('handles element without offsetHeight', () => {
      const { result } = renderHook(() => useScrollSticky());

      const mockElement = {} as HTMLDivElement; // No offsetHeight

      expect(() => {
        act(() => {
          result.current.sectionRef.current = mockElement;
        });
      }).not.toThrow();

      expect(result.current.sectionHeight).toBe(0);
    });
  });

  // 성능 테스트
  describe('performance considerations', () => {
    it('throttles rapid scroll events naturally with passive listener', () => {
      const { result } = renderHook(() => useScrollSticky({ threshold: 100 }));

      let callCount = 0;
      const _originalSetIsSticky = result.current.isSticky;

      // Simulate very rapid scrolling
      for (let i = 0; i < 1000; i++) {
        act(() => {
          (window as any).scrollY = i;
          window.dispatchEvent(new Event('scroll'));
          callCount++;
        });
      }

      // Should handle all events without errors
      expect(callCount).toBe(1000);
      expect(result.current.isSticky).toBe(true);
    });

    it('minimizes re-renders with useCallback', () => {
      let renderCount = 0;

      const { rerender } = renderHook(
        ({ threshold }) => {
          renderCount++;
          return useScrollSticky({ threshold });
        },
        { initialProps: { threshold: 100 } }
      );

      const initialRenderCount = renderCount;

      // Scroll events shouldn't cause hook rerenders
      act(() => {
        (window as any).scrollY = 200;
        window.dispatchEvent(new Event('scroll'));
      });

      // Only state changes should trigger rerenders, not the scroll handler
      expect(renderCount).toBe(initialRenderCount + 1); // +1 for state change

      // Rerender with same props shouldn't cause additional renders
      rerender({ threshold: 100 });
      expect(renderCount).toBe(initialRenderCount + 2); // +1 for rerender
    });
  });
});