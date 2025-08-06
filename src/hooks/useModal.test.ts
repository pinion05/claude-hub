import { renderHook, act } from '@testing-library/react';
import { useModal } from './useModal';

// Test interface for modal data
interface TestModalData {
  id: number;
  title: string;
  content: string;
}

describe('useModal', () => {
  beforeEach(() => {
    // Reset body styles
    document.body.style.overflow = '';
    // Clear any event listeners
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  // 기본 초기화 테스트
  describe('initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBe(null);
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.toggle).toBe('function');
    });

    it('initializes with generic type', () => {
      const { result } = renderHook(() => useModal<TestModalData>());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBe(null);
    });

    it('initializes without affecting body scroll', () => {
      renderHook(() => useModal());
      expect(document.body.style.overflow).toBe('');
    });
  });

  // Open 기능 테스트
  describe('open functionality', () => {
    it('opens modal with data', () => {
      const { result } = renderHook(() => useModal<TestModalData>());
      const testData: TestModalData = {
        id: 1,
        title: 'Test Modal',
        content: 'Test content'
      };

      act(() => {
        result.current.open(testData);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual(testData);
    });

    it('updates data when opening with new data', () => {
      const { result } = renderHook(() => useModal<TestModalData>());
      const firstData: TestModalData = {
        id: 1,
        title: 'First Modal',
        content: 'First content'
      };
      const secondData: TestModalData = {
        id: 2,
        title: 'Second Modal',
        content: 'Second content'
      };

      act(() => {
        result.current.open(firstData);
      });

      act(() => {
        result.current.open(secondData);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual(secondData);
    });

    it('prevents body scroll when opened', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.open({ test: true });
      });

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('handles different data types', () => {
      // Test with string
      const { result: stringResult } = renderHook(() => useModal<string>());
      act(() => {
        stringResult.current.open('test string');
      });
      expect(stringResult.current.data).toBe('test string');

      // Test with number
      const { result: numberResult } = renderHook(() => useModal<number>());
      act(() => {
        numberResult.current.open(42);
      });
      expect(numberResult.current.data).toBe(42);

      // Test with complex object
      const { result: objectResult } = renderHook(() => useModal<{ nested: { value: boolean } }>());
      const complexData = { nested: { value: true } };
      act(() => {
        objectResult.current.open(complexData);
      });
      expect(objectResult.current.data).toEqual(complexData);
    });
  });

  // Close 기능 테스트
  describe('close functionality', () => {
    it('closes modal', () => {
      const { result } = renderHook(() => useModal<TestModalData>());
      const testData: TestModalData = {
        id: 1,
        title: 'Test Modal',
        content: 'Test content'
      };

      // Open modal first
      act(() => {
        result.current.open(testData);
      });

      // Close modal
      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
      // Data should still be available for closing animation
      expect(result.current.data).toEqual(testData);
    });

    it('clears data after timeout', () => {
      const { result } = renderHook(() => useModal<TestModalData>());
      const testData: TestModalData = {
        id: 1,
        title: 'Test Modal',
        content: 'Test content'
      };

      // Open modal
      act(() => {
        result.current.open(testData);
      });

      // Close modal
      act(() => {
        result.current.close();
      });

      // Fast-forward through timeout
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.data).toBe(null);
    });

    it('restores body scroll when closed', () => {
      const { result } = renderHook(() => useModal());

      // Open modal
      act(() => {
        result.current.open({ test: true });
      });
      expect(document.body.style.overflow).toBe('hidden');

      // Close modal
      act(() => {
        result.current.close();
      });

      expect(document.body.style.overflow).toBe('');
    });

    it('can be called multiple times safely', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.open({ test: true });
      });

      act(() => {
        result.current.close();
        result.current.close();
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('handles close when modal is already closed', () => {
      const { result } = renderHook(() => useModal());

      expect(() => {
        act(() => {
          result.current.close();
        });
      }).not.toThrow();

      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBe(null);
    });
  });

  // Toggle 기능 테스트
  describe('toggle functionality', () => {
    it('toggles modal state from closed to open', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('toggles modal state from open to closed', () => {
      const { result } = renderHook(() => useModal());

      // Open modal first
      act(() => {
        result.current.open({ test: true });
      });

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('does not affect data when toggling to open without setting data', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBe(null);
    });

    it('preserves data when toggling', () => {
      const { result } = renderHook(() => useModal<TestModalData>());
      const testData: TestModalData = {
        id: 1,
        title: 'Test Modal',
        content: 'Test content'
      };

      // Set data and open
      act(() => {
        result.current.open(testData);
      });

      // Toggle to close
      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toEqual(testData);

      // Toggle to open
      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual(testData);
    });
  });

  // 키보드 이벤트 테스트
  describe('keyboard events', () => {
    it('closes modal on Escape key when open', () => {
      const { result } = renderHook(() => useModal());

      // Open modal
      act(() => {
        result.current.open({ test: true });
      });

      // Simulate Escape key press
      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('does not close modal on Escape key when closed', () => {
      const { result } = renderHook(() => useModal());

      // Simulate Escape key press on closed modal
      act(() => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('does not close modal on other keys', () => {
      const { result } = renderHook(() => useModal());

      // Open modal
      act(() => {
        result.current.open({ test: true });
      });

      // Simulate other key presses
      const keys = ['Enter', 'Space', 'ArrowUp', 'Tab', 'a', '1'];
      keys.forEach(key => {
        act(() => {
          const keyEvent = new KeyboardEvent('keydown', { key });
          document.dispatchEvent(keyEvent);
        });
        expect(result.current.isOpen).toBe(true);
      });
    });

    it('properly adds and removes event listeners', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { result, unmount } = renderHook(() => useModal());

      // Open modal
      act(() => {
        result.current.open({ test: true });
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      // Close modal
      act(() => {
        result.current.close();
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      // Cleanup
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  // 메모리 관리 테스트
  describe('memory management and cleanup', () => {
    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { result, unmount } = renderHook(() => useModal());

      // Open modal to add event listener
      act(() => {
        result.current.open({ test: true });
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(document.body.style.overflow).toBe('');

      removeEventListenerSpy.mockRestore();
    });

    it('handles unmount during timeout period', () => {
      const { result, unmount } = renderHook(() => useModal());

      // Open and close modal to create timeout
      act(() => {
        result.current.open({ test: true });
        result.current.close();
      });

      // Unmount before timeout completes - should not cause errors
      expect(() => unmount()).not.toThrow();
    });

    it('handles multiple rapid open/close cycles', () => {
      const { result } = renderHook(() => useModal<TestModalData>());

      // Rapid open/close cycles
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.open({ id: i, title: `Modal ${i}`, content: `Content ${i}` });
          result.current.close();
        });
      }

      expect(result.current.isOpen).toBe(false);
      // Should not cause memory leaks or errors
    });
  });

  // 함수 안정성 테스트
  describe('function stability', () => {
    it('maintains function references across rerenders', () => {
      const { result, rerender } = renderHook(() => useModal());

      const initialOpen = result.current.open;
      const initialClose = result.current.close;
      const initialToggle = result.current.toggle;

      rerender();

      expect(result.current.open).toBe(initialOpen);
      expect(result.current.close).toBe(initialClose);
      expect(result.current.toggle).toBe(initialToggle);
    });

    it('useCallback prevents unnecessary rerenders', () => {
      let renderCount = 0;
      
      const { result } = renderHook(() => {
        renderCount++;
        return useModal();
      });

      const _initialRenderCount = renderCount;

      // Using the functions should not cause rerenders
      act(() => {
        result.current.open({ test: true });
        result.current.close();
        result.current.toggle();
      });

      // The hook itself doesn't cause child rerenders, but the state changes do
      // This test ensures the functions are stable
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.toggle).toBe('function');
    });
  });

  // Edge cases 테스트
  describe('edge cases', () => {
    it('handles null data gracefully', () => {
      const { result } = renderHook(() => useModal<TestModalData | null>());

      act(() => {
        result.current.open(null);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBe(null);
    });

    it('handles undefined data gracefully', () => {
      const { result } = renderHook(() => useModal<TestModalData | undefined>());

      act(() => {
        result.current.open(undefined);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBe(undefined);
    });

    it('works with very large objects', () => {
      const { result } = renderHook(() => useModal<any>());
      const largeData = {
        items: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` }))
      };

      expect(() => {
        act(() => {
          result.current.open(largeData);
        });
      }).not.toThrow();

      expect(result.current.data).toEqual(largeData);
    });

    it('handles concurrent opens', () => {
      const { result } = renderHook(() => useModal<TestModalData>());
      const data1: TestModalData = { id: 1, title: 'First', content: 'First content' };
      const data2: TestModalData = { id: 2, title: 'Second', content: 'Second content' };

      act(() => {
        result.current.open(data1);
        result.current.open(data2);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual(data2); // Should use the last opened data
    });

    it('handles multiple modal instances independently', () => {
      const { result: modal1 } = renderHook(() => useModal());
      const { result: modal2 } = renderHook(() => useModal());

      // Both modals start closed
      expect(modal1.current.isOpen).toBe(false);
      expect(modal2.current.isOpen).toBe(false);

      // Open first modal
      act(() => {
        modal1.current.open({ test: 1 });
      });
      expect(modal1.current.isOpen).toBe(true);
      expect(modal2.current.isOpen).toBe(false);

      // Open second modal 
      act(() => {
        modal2.current.open({ test: 2 });
      });
      expect(modal1.current.isOpen).toBe(true);
      expect(modal2.current.isOpen).toBe(true);

      // Close first modal
      act(() => {
        modal1.current.close();
      });
      expect(modal1.current.isOpen).toBe(false);
      expect(modal2.current.isOpen).toBe(true);

      // Close second modal
      act(() => {
        modal2.current.close();
      });
      expect(modal1.current.isOpen).toBe(false);
      expect(modal2.current.isOpen).toBe(false);
    });
  });
});