import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // 기본 동작 테스트
  it('delays function execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2');
    
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('cancels previous call when called again within delay', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first call');
    jest.advanceTimersByTime(50);
    debouncedFn('second call');
    
    jest.advanceTimersByTime(100);
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second call');
  });

  it('executes multiple times if enough time passes between calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first call');
    jest.advanceTimersByTime(100);
    
    debouncedFn('second call');
    jest.advanceTimersByTime(100);
    
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenNthCalledWith(1, 'first call');
    expect(mockFn).toHaveBeenNthCalledWith(2, 'second call');
  });

  // 타입 안정성 테스트
  it('preserves function signature and return type', () => {
    const originalFn = jest.fn((a: string, b: number): string => `${a}-${b}`);
    const debouncedFn = debounce(originalFn, 100);

    debouncedFn('test', 42);
    jest.advanceTimersByTime(100);

    expect(originalFn).toHaveBeenCalledWith('test', 42);
  });

  it('works with functions that have no parameters', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith();
  });

  it('works with functions that have many parameters', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('a', 'b', 'c', 'd', 'e', 1, 2, 3, { test: true }, [1, 2, 3]);
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('a', 'b', 'c', 'd', 'e', 1, 2, 3, { test: true }, [1, 2, 3]);
  });

  // 지연 시간 테스트
  it('uses specified delay', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn();
    jest.advanceTimersByTime(400);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('works with zero delay', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 0);

    debouncedFn();
    jest.advanceTimersByTime(0);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('works with very small delays', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1);

    debouncedFn();
    jest.advanceTimersByTime(1);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('works with very large delays', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 10000);

    debouncedFn();
    jest.advanceTimersByTime(9999);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  // 빠른 호출 테스트
  it('handles rapid successive calls correctly', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    // Call 100 times rapidly
    for (let i = 0; i < 100; i++) {
      debouncedFn(`call-${i}`);
    }

    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('call-99'); // Last call wins
  });

  it('resets timeout on each call within delay period', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    jest.advanceTimersByTime(50);
    
    debouncedFn('second');
    jest.advanceTimersByTime(50);
    
    debouncedFn('third');
    jest.advanceTimersByTime(50);
    
    expect(mockFn).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(50);
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  // 컨텍스트 및 this 테스트
  it('preserves this context when called as method', () => {
    const obj = {
      value: 'test',
      method: jest.fn(function(this: any) {
        return this?.value || 'fallback';
      })
    };

    const debouncedMethod = debounce(obj.method.bind(obj), 100);
    debouncedMethod();

    jest.advanceTimersByTime(100);

    expect(obj.method).toHaveBeenCalledTimes(1);
  });

  // 에러 핸들링 테스트
  it('handles errors in debounced function', () => {
    const errorFn = jest.fn(() => {
      throw new Error('Test error');
    });
    const debouncedFn = debounce(errorFn, 100);

    debouncedFn();
    
    expect(() => {
      jest.advanceTimersByTime(100);
    }).toThrow('Test error');

    expect(errorFn).toHaveBeenCalledTimes(1);
  });

  it('continues to work after error', () => {
    let shouldThrow = true;
    const conditionalErrorFn = jest.fn(() => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return 'success';
    });
    const debouncedFn = debounce(conditionalErrorFn, 100);

    // First call throws
    debouncedFn();
    expect(() => {
      jest.advanceTimersByTime(100);
    }).toThrow('Test error');

    // Second call succeeds
    shouldThrow = false;
    debouncedFn();
    jest.advanceTimersByTime(100);

    expect(conditionalErrorFn).toHaveBeenCalledTimes(2);
  });

  // 메모리 관리 테스트
  it('clears timeout properly', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('first');
    debouncedFn('second'); // This should clear the first timeout

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  // 실제 사용 사례 테스트
  it('works correctly for search input scenario', () => {
    const searchFn = jest.fn();
    const debouncedSearch = debounce(searchFn, 300);

    // Simulate user typing
    debouncedSearch('h');
    jest.advanceTimersByTime(100);
    
    debouncedSearch('he');
    jest.advanceTimersByTime(100);
    
    debouncedSearch('hel');
    jest.advanceTimersByTime(100);
    
    debouncedSearch('hell');
    jest.advanceTimersByTime(100);
    
    debouncedSearch('hello');
    
    // Should not have called the function yet
    expect(searchFn).not.toHaveBeenCalled();
    
    // After delay, should call with final value
    jest.advanceTimersByTime(300);
    expect(searchFn).toHaveBeenCalledTimes(1);
    expect(searchFn).toHaveBeenCalledWith('hello');
  });

  it('works correctly for resize event scenario', () => {
    const resizeFn = jest.fn();
    const debouncedResize = debounce(resizeFn, 250);

    // Simulate rapid resize events
    for (let i = 0; i < 50; i++) {
      debouncedResize({ width: 1000 + i, height: 800 + i });
      jest.advanceTimersByTime(10);
    }

    // Should not have called during rapid events
    expect(resizeFn).not.toHaveBeenCalled();

    // After delay, should call once with final value
    jest.advanceTimersByTime(250);
    expect(resizeFn).toHaveBeenCalledTimes(1);
    expect(resizeFn).toHaveBeenCalledWith({ width: 1049, height: 849 });
  });

  it('works correctly for API call scenario', () => {
    const apiCall = jest.fn().mockResolvedValue('API response');
    const debouncedApiCall = debounce(apiCall, 500);

    // Simulate rapid API call triggers
    debouncedApiCall('param1');
    debouncedApiCall('param2');
    debouncedApiCall('param3');

    jest.advanceTimersByTime(500);

    expect(apiCall).toHaveBeenCalledTimes(1);
    expect(apiCall).toHaveBeenCalledWith('param3');
  });

  // Edge cases
  it('handles undefined and null arguments', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn(undefined, null);
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith(undefined, null);
  });

  it('handles complex object arguments', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    const complexArg = {
      nested: { deep: { value: 'test' } },
      array: [1, 2, 3, { inner: true }],
      fn: () => 'function'
    };

    debouncedFn(complexArg);
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith(complexArg);
  });

  it('maintains separate timers for different debounced functions', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const debouncedFn1 = debounce(fn1, 100);
    const debouncedFn2 = debounce(fn2, 200);

    debouncedFn1('fn1');
    debouncedFn2('fn2');

    jest.advanceTimersByTime(100);
    expect(fn1).toHaveBeenCalledWith('fn1');
    expect(fn2).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn2).toHaveBeenCalledWith('fn2');
  });

  // 성능 테스트
  it('should not leak memory with many calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    // Make many calls to test for memory leaks
    for (let i = 0; i < 10000; i++) {
      debouncedFn(i);
    }

    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(9999);
  });
});