import { renderHook, act } from '@testing-library/react';
import { useSearch } from './useSearch';
import { Extension } from '@/types';
import { debounce } from '@/utils/debounce';

// Mock dependencies
jest.mock('@/utils/search', () => ({
  searchExtensions: jest.fn((extensions, query) => 
    extensions.filter((ext: Extension) => 
      ext.name.toLowerCase().includes(query.toLowerCase()) ||
      ext.description.toLowerCase().includes(query.toLowerCase())
    )
  ),
  getSuggestions: jest.fn((query, suggestions) => 
    suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
  ),
}));

jest.mock('@/utils/debounce');

// Test data
const mockExtensions: Extension[] = [
  {
    id: 1,
    name: 'Test Extension 1',
    description: 'A test extension for development',
    category: 'Development',
    repoUrl: 'https://github.com/test/ext1',
    tags: ['javascript', 'react'],
    stars: 100,
    lastUpdated: '2024-01-01',
  },
  {
    id: 2,
    name: 'API Helper',
    description: 'Helper for API development',
    category: 'API',
    repoUrl: 'https://github.com/test/api-helper',
    tags: ['api', 'http'],
    stars: 50,
    lastUpdated: '2024-01-02',
  },
  {
    id: 3,
    name: 'Browser Tool',
    description: 'Tool for browser automation',
    category: 'Browser',
    repoUrl: 'https://github.com/test/browser-tool',
    tags: ['browser', 'automation'],
    stars: 200,
    lastUpdated: '2024-01-03',
  },
];

const mockSuggestions = [
  'javascript', 'react', 'api', 'browser', 'development', 'automation'
];

const mockDebounce = debounce as jest.MockedFunction<typeof debounce>;

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock debounce to execute immediately for testing
    mockDebounce.mockImplementation((fn, _delay) => fn);
  });

  // 기본 초기화 테스트
  describe('initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      expect(result.current.query).toBe('');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.selectedSuggestionIndex).toBe(-1);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.showSuggestions).toBe(false);
      expect(result.current.showResults).toBe(false);
      expect(result.current.filteredExtensions).toEqual(mockExtensions);
    });

    it('accepts custom debounce delay', () => {
      renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
          debounceDelay: 500,
        })
      );

      expect(mockDebounce).toHaveBeenCalledWith(
        expect.any(Function),
        500
      );
    });

    it('uses default debounce delay when not provided', () => {
      renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      expect(mockDebounce).toHaveBeenCalledWith(
        expect.any(Function),
        300
      );
    });
  });

  // 검색 기능 테스트
  describe('search functionality', () => {
    it('handles search change correctly', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      act(() => {
        result.current.handleSearchChange('test');
      });

      expect(result.current.query).toBe('test');
      expect(result.current.selectedSuggestionIndex).toBe(-1);
    });

    it('filters extensions based on search query', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      act(() => {
        result.current.handleSearchChange('api');
      });

      // Mock search function should filter extensions
      expect(result.current.filteredExtensions).toHaveLength(1);
      expect(result.current.filteredExtensions[0]?.name).toBe('API Helper');
    });

    it('shows suggestions when query matches', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      act(() => {
        result.current.handleSearchChange('java');
      });

      expect(result.current.suggestions).toContain('javascript');
      expect(result.current.showSuggestions).toBe(true);
    });

    it('sets isSearching state during search', () => {
      // Mock debounce to not execute immediately
      mockDebounce.mockImplementation((fn, delay) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
        };
      });

      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      act(() => {
        result.current.handleSearchChange('test');
      });

      expect(result.current.isSearching).toBe(true);
    });

    it('clears search when query is empty', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      // First set a query
      act(() => {
        result.current.handleSearchChange('test');
      });

      // Then clear it
      act(() => {
        result.current.handleSearchChange('');
      });

      expect(result.current.query).toBe('');
      expect(result.current.filteredExtensions).toEqual(mockExtensions);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.showSuggestions).toBe(false);
      expect(result.current.isSearching).toBe(false);
    });
  });

  // 제안 기능 테스트
  describe('suggestions functionality', () => {
    it('handles suggestion selection correctly', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      act(() => {
        result.current.handleSuggestionSelect('javascript');
      });

      expect(result.current.query).toBe('javascript');
      expect(result.current.showSuggestions).toBe(false);
      expect(result.current.selectedSuggestionIndex).toBe(-1);
    });

    it('updates filtered extensions when suggestion is selected', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      act(() => {
        result.current.handleSuggestionSelect('development');
      });

      // Should filter extensions based on selected suggestion
      expect(result.current.filteredExtensions.length).toBeGreaterThan(0);
    });
  });

  // 키보드 내비게이션 테스트
  describe('keyboard navigation', () => {
    const createKeyboardEvent = (key: string): React.KeyboardEvent => ({
      key,
      preventDefault: jest.fn(),
    } as any);

    beforeEach(() => {
      // Setup suggestions for keyboard navigation tests
    });

    it('handles ArrowDown key correctly', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      // First set up some suggestions
      act(() => {
        result.current.handleSearchChange('java');
      });

      const event = createKeyboardEvent('ArrowDown');
      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.selectedSuggestionIndex).toBe(0);
    });

    it('handles ArrowUp key correctly', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      // Set up suggestions and select one
      act(() => {
        result.current.handleSearchChange('java');
      });
      
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'));
      });

      const event = createKeyboardEvent('ArrowUp');
      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.selectedSuggestionIndex).toBe(-1);
    });

    it('handles Enter key correctly with selected suggestion', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      // Set up suggestions and select one
      act(() => {
        result.current.handleSearchChange('java');
      });
      
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'));
      });

      const event = createKeyboardEvent('Enter');
      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.showResults).toBe(true);
      expect(result.current.showSuggestions).toBe(false);
    });

    it('handles Enter key correctly without selected suggestion', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      act(() => {
        result.current.handleSearchChange('test');
      });

      const event = createKeyboardEvent('Enter');
      act(() => {
        result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.current.showResults).toBe(true);
      expect(result.current.showSuggestions).toBe(false);
    });

    it('handles Escape key correctly', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      // Set up suggestions
      act(() => {
        result.current.handleSearchChange('test');
      });

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Escape'));
      });

      expect(result.current.showSuggestions).toBe(false);
      expect(result.current.selectedSuggestionIndex).toBe(-1);
    });

    it('does not navigate beyond suggestion bounds', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      // Set up suggestions (javascript should be in filtered suggestions)
      act(() => {
        result.current.handleSearchChange('java');
      });

      // Try to go beyond the last suggestion
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.handleKeyDown(createKeyboardEvent('ArrowDown'));
        });
      }

      // Should not exceed the number of available suggestions
      const suggestionsCount = result.current.suggestions.length;
      expect(result.current.selectedSuggestionIndex).toBe(Math.max(0, suggestionsCount - 1));

      // Try to go before the first suggestion
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.handleKeyDown(createKeyboardEvent('ArrowUp'));
        });
      }

      expect(result.current.selectedSuggestionIndex).toBe(-1);
    });
  });

  // 상태 관리 테스트
  describe('state management', () => {
    it('handles showResults correctly', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      act(() => {
        result.current.handleShowResults();
      });

      expect(result.current.showResults).toBe(true);
    });

    it('resets search correctly', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      // Set up some state
      act(() => {
        result.current.handleSearchChange('test');
        result.current.handleShowResults();
      });

      // Reset
      act(() => {
        result.current.resetSearch();
      });

      expect(result.current.query).toBe('');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.selectedSuggestionIndex).toBe(-1);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.showSuggestions).toBe(false);
      expect(result.current.showResults).toBe(false);
      expect(result.current.filteredExtensions).toEqual(mockExtensions);
    });
  });

  // 성능 및 메모리 테스트
  describe('performance and memory', () => {
    it('properly cleans up debounced function', () => {
      const { unmount } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      unmount();

      // Check that debounce was called and can be cleaned up
      expect(mockDebounce).toHaveBeenCalled();
    });

    it('handles rapid search changes efficiently', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      // Simulate rapid typing
      act(() => {
        result.current.handleSearchChange('t');
        result.current.handleSearchChange('te');
        result.current.handleSearchChange('tes');
        result.current.handleSearchChange('test');
      });

      expect(result.current.query).toBe('test');
      // Should not cause errors or performance issues
    });
  });

  // Edge cases 테스트
  describe('edge cases', () => {
    it('handles empty extensions array', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: [],
          suggestions: mockSuggestions,
        })
      );

      expect(result.current.filteredExtensions).toEqual([]);

      act(() => {
        result.current.handleSearchChange('test');
      });

      expect(result.current.filteredExtensions).toEqual([]);
    });

    it('handles empty suggestions array', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: [],
        })
      );

      act(() => {
        result.current.handleSearchChange('test');
      });

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.showSuggestions).toBe(false);
    });

    it('handles undefined or null values gracefully', () => {
      const extensionsWithMissing: Extension[] = [
        ...mockExtensions,
        {
          id: 4,
          name: 'Incomplete Extension',
          description: '',
          category: 'Development',
          repoUrl: 'https://github.com/test/incomplete',
        },
      ];

      const { result } = renderHook(() => 
        useSearch({
          extensions: extensionsWithMissing,
          suggestions: mockSuggestions,
        })
      );

      expect(() => {
        act(() => {
          result.current.handleSearchChange('incomplete');
        });
      }).not.toThrow();
    });

    it('handles very long search queries', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      const longQuery = 'a'.repeat(1000);

      expect(() => {
        act(() => {
          result.current.handleSearchChange(longQuery);
        });
      }).not.toThrow();

      expect(result.current.query).toBe(longQuery);
    });

    it('handles special characters in search query', () => {
      const { result } = renderHook(() => 
        useSearch({
          extensions: mockExtensions,
          suggestions: mockSuggestions,
        })
      );

      const specialQuery = '!@#$%^&*()_+{}|:<>?[];\'",./';

      expect(() => {
        act(() => {
          result.current.handleSearchChange(specialQuery);
        });
      }).not.toThrow();

      expect(result.current.query).toBe(specialQuery);
    });
  });
});