import { StateCreator, StoreMutatorIdentifier } from 'zustand';

// 로깅 미들웨어 타입
type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

// 개발 모드에서만 로깅하는 미들웨어
export const logger: Logger = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...a) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🏪 ${name || 'Store'} Update`);
      console.warn('Previous State:', get());
      set(...a);
      console.warn('New State:', get());
    } else {
      set(...a);
    }
  };
  
  return f(loggedSet, get, store);
};

// 성능 측정 미들웨어
type Performance = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

export const performance: Performance = (f, name) => (set, get, store) => {
  const perfSet: typeof set = (...a) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      set(...a);
      const end = performance.now();
      
      if (end - start > 1) { // 1ms 이상 걸린 경우만 로깅
        console.warn(`⚡ ${name || 'Store'} update took ${(end - start).toFixed(2)}ms`);
      }
    } else {
      set(...a);
    }
  };
  
  return f(perfSet, get, store);
};

// 상태 변화 추적 미들웨어
type StateTracker = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  trackFields?: (keyof T)[]
) => StateCreator<T, Mps, Mcs>;

export const stateTracker: StateTracker = (f, trackFields) => (set, get, store) => {
  let _previousState = get();
  
  const trackedSet: typeof set = (...a) => {
    const currentState = get();
    set(...a);
    const newState = get();
    
    if (process.env.NODE_ENV === 'development' && trackFields) {
      const changes = trackFields.reduce((acc, field) => {
        if (currentState[field] !== newState[field]) {
          acc[field] = {
            from: currentState[field],
            to: newState[field],
          };
        }
        return acc;
      }, {} as Record<string, { from: any; to: any }>);
      
      if (Object.keys(changes).length > 0) {
        console.warn('State Changes:', changes);
      }
    }
    
    _previousState = newState;
  };
  
  return f(trackedSet, get, store);
};

// 로컬 스토리지 동기화를 위한 커스텀 storage
export const createLocalStorage = <T>(key: string) => ({
  getItem: (): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },
  
  setItem: (value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },
  
  removeItem: (): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },
});

// 세션 스토리지 동기화를 위한 커스텀 storage
export const createSessionStorage = <T>(key: string) => ({
  getItem: (): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error);
      return null;
    }
  },
  
  setItem: (value: T): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
    }
  },
  
  removeItem: (): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  },
});

// 크로스 탭 동기화 미들웨어
type CrossTabSync = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  key: string
) => StateCreator<T, Mps, Mcs>;

export const crossTabSync: CrossTabSync = (f, key) => (set, get, store) => {
  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined') {
    // 다른 탭에서의 변경사항을 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          set(newState, true); // replace 옵션으로 전체 상태 교체
        } catch (error) {
          console.error('Error syncing cross-tab state:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    store.destroy = () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
  
  return f(set, get, store);
};

// 디바운스 미들웨어 (빈번한 상태 변경 최적화)
type Debounced = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  delay?: number
) => StateCreator<T, Mps, Mcs>;

export const debounced: Debounced = (f, delay = 100) => (set, get, store) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debouncedSet: typeof set = (...a) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      set(...a);
      timeoutId = null;
    }, delay);
  };
  
  return f(debouncedSet, get, store);
};

// 실행 취소/다시 실행을 위한 히스토리 미들웨어
type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

type WithHistory<T> = T & {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
};

type History = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  maxHistorySize?: number
) => StateCreator<WithHistory<T>, Mps, Mcs>;

export const history: History = (f, maxHistorySize = 50) => (set, get, store) => {
  const originalState = f(set, get, store) as any;
  let historyState: HistoryState<any> = {
    past: [],
    present: originalState,
    future: [],
  };
  
  const historySet: typeof set = (partial, replace) => {
    const currentState = get();
    const newState = typeof partial === 'function' ? partial(currentState) : partial;
    
    // 히스토리에 현재 상태 추가
    historyState = {
      past: [...historyState.past.slice(-maxHistorySize + 1), currentState],
      present: replace ? newState : { ...currentState, ...newState },
      future: [], // 새로운 변경 시 future 초기화
    };
    
    set(partial, replace);
  };
  
  return {
    ...f(historySet, get, store),
    
    undo: () => {
      if (historyState.past.length === 0) return;
      
      const previous = historyState.past[historyState.past.length - 1];
      const newPast = historyState.past.slice(0, -1);
      
      historyState = {
        past: newPast,
        present: previous,
        future: [historyState.present, ...historyState.future],
      };
      
      set(previous, true);
    },
    
    redo: () => {
      if (historyState.future.length === 0) return;
      
      const next = historyState.future[0];
      const newFuture = historyState.future.slice(1);
      
      historyState = {
        past: [...historyState.past, historyState.present],
        present: next,
        future: newFuture,
      };
      
      set(next, true);
    },
    
    canUndo: historyState.past.length > 0,
    canRedo: historyState.future.length > 0,
    
    clearHistory: () => {
      historyState = {
        past: [],
        present: get(),
        future: [],
      };
    },
  };
};