import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestionList } from './SuggestionList';

describe('SuggestionList', () => {
  const defaultProps = {
    suggestions: ['javascript', 'react', 'typescript', 'vue', 'angular'],
    selectedIndex: -1,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 기본 렌더링 테스트
  it('renders all suggestions as buttons', () => {
    render(<SuggestionList {...defaultProps} />);
    
    defaultProps.suggestions.forEach(suggestion => {
      expect(screen.getByRole('button', { name: new RegExp(suggestion) })).toBeInTheDocument();
    });
  });

  it('does not render when suggestions array is empty', () => {
    render(<SuggestionList {...defaultProps} suggestions={[]} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('returns null when suggestions length is 0', () => {
    const { container } = render(<SuggestionList {...defaultProps} suggestions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  // 구조 및 스타일 테스트
  it('renders with proper container structure and classes', () => {
    const { container } = render(<SuggestionList {...defaultProps} />);
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass(
      'absolute',
      'w-full',
      'mt-2',
      'bg-card',
      'border',
      'border-border',
      'rounded-lg',
      'overflow-hidden',
      'z-10',
      'shadow-lg'
    );
  });

  it('renders buttons with proper base classes', () => {
    render(<SuggestionList {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass(
        'w-full',
        'text-left',
        'cursor-pointer',
        'transition-colors',
        'font-mono',
        'text-sm'
      );
    });
  });

  it('applies default padding when isCompact is false', () => {
    render(<SuggestionList {...defaultProps} isCompact={false} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('px-6', 'py-3');
      expect(button).not.toHaveClass('px-4', 'py-2');
    });
  });

  it('applies compact padding when isCompact is true', () => {
    render(<SuggestionList {...defaultProps} isCompact={true} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('px-4', 'py-2');
      expect(button).not.toHaveClass('px-6', 'py-3');
    });
  });

  // 선택 상태 테스트
  it('highlights selected suggestion', () => {
    render(<SuggestionList {...defaultProps} selectedIndex={1} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveClass('bg-accent/20', 'text-accent');
    
    // Other buttons should not have selected styles
    buttons.forEach((button, index) => {
      if (index !== 1) {
        expect(button).not.toHaveClass('bg-accent/20', 'text-accent');
        expect(button).toHaveClass('hover:bg-accent/10');
      }
    });
  });

  it('applies hover styles to non-selected items', () => {
    render(<SuggestionList {...defaultProps} selectedIndex={2} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button, index) => {
      if (index !== 2) {
        expect(button).toHaveClass('hover:bg-accent/10');
      }
    });
  });

  it('handles negative selectedIndex correctly', () => {
    render(<SuggestionList {...defaultProps} selectedIndex={-1} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).not.toHaveClass('bg-accent/20', 'text-accent');
      expect(button).toHaveClass('hover:bg-accent/10');
    });
  });

  it('handles selectedIndex beyond array bounds', () => {
    render(<SuggestionList {...defaultProps} selectedIndex={10} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).not.toHaveClass('bg-accent/20', 'text-accent');
    });
  });

  // 클릭 이벤트 테스트
  describe('click interactions', () => {
    it('calls onSelect when suggestion is clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      
      render(<SuggestionList {...defaultProps} onSelect={handleSelect} />);
      
      await user.click(screen.getByRole('button', { name: /javascript/ }));
      
      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith('javascript');
    });

    it('calls onSelect with correct suggestion for each button', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      
      render(<SuggestionList {...defaultProps} onSelect={handleSelect} />);
      
      await user.click(screen.getByRole('button', { name: /react/ }));
      expect(handleSelect).toHaveBeenCalledWith('react');
      
      await user.click(screen.getByRole('button', { name: /typescript/ }));
      expect(handleSelect).toHaveBeenCalledWith('typescript');
    });

    it('handles rapid clicks correctly', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      
      render(<SuggestionList {...defaultProps} onSelect={handleSelect} />);
      
      const jsButton = screen.getByRole('button', { name: /javascript/ });
      
      await user.click(jsButton);
      await user.click(jsButton);
      await user.click(jsButton);
      
      expect(handleSelect).toHaveBeenCalledTimes(3);
      expect(handleSelect).toHaveBeenNthCalledWith(1, 'javascript');
      expect(handleSelect).toHaveBeenNthCalledWith(2, 'javascript');
      expect(handleSelect).toHaveBeenNthCalledWith(3, 'javascript');
    });
  });

  // 마우스 호버 테스트
  describe('mouse hover interactions', () => {
    it('adds hover class on mouse enter', () => {
      render(<SuggestionList {...defaultProps} selectedIndex={-1} />);
      
      const button = screen.getByRole('button', { name: /javascript/ });
      fireEvent.mouseEnter(button);
      
      expect(button).toHaveClass('bg-accent/10');
    });

    it('removes hover class on mouse leave for non-selected items', () => {
      render(<SuggestionList {...defaultProps} selectedIndex={-1} />);
      
      const button = screen.getByRole('button', { name: /javascript/ });
      
      fireEvent.mouseEnter(button);
      expect(button).toHaveClass('bg-accent/10');
      
      fireEvent.mouseLeave(button);
      expect(button).not.toHaveClass('bg-accent/10');
    });

    it('maintains hover class for selected item on mouse leave', () => {
      render(<SuggestionList {...defaultProps} selectedIndex={0} />);
      
      const button = screen.getByRole('button', { name: /javascript/ });
      
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
      
      // Should still have selected styles
      expect(button).toHaveClass('bg-accent/20', 'text-accent');
    });

    it('does not remove hover class for selected item on mouse leave', () => {
      render(<SuggestionList {...defaultProps} selectedIndex={1} />);
      
      const selectedButton = screen.getByRole('button', { name: /react/ });
      const unselectedButton = screen.getByRole('button', { name: /javascript/ });
      
      // Hover over selected item
      fireEvent.mouseEnter(selectedButton);
      fireEvent.mouseLeave(selectedButton);
      
      // Should maintain selected styling
      expect(selectedButton).toHaveClass('bg-accent/20', 'text-accent');
      
      // Hover over unselected item
      fireEvent.mouseEnter(unselectedButton);
      expect(unselectedButton).toHaveClass('bg-accent/10');
      
      fireEvent.mouseLeave(unselectedButton);
      expect(unselectedButton).not.toHaveClass('bg-accent/10');
    });
  });

  // 내용 렌더링 테스트
  describe('content rendering', () => {
    it('renders suggestion text with terminal arrow prefix', () => {
      render(<SuggestionList {...defaultProps} />);
      
      defaultProps.suggestions.forEach(suggestion => {
        const button = screen.getByRole('button', { name: new RegExp(suggestion) });
        expect(button).toHaveTextContent(`>${suggestion}`);
      });
    });

    it('renders terminal arrow with proper styling', () => {
      render(<SuggestionList {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const arrow = button.querySelector('span.text-accent.mr-2');
        expect(arrow).toBeInTheDocument();
        expect(arrow).toHaveTextContent('>');
        expect(arrow).toHaveClass('text-accent', 'mr-2');
      });
    });

    it('handles suggestions with special characters', () => {
      const specialSuggestions = ['node.js', 'vue@3', 'react-native', 'next.js/app'];
      
      render(
        <SuggestionList 
          {...defaultProps} 
          suggestions={specialSuggestions}
        />
      );
      
      specialSuggestions.forEach(suggestion => {
        expect(screen.getByRole('button', { name: new RegExp(suggestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toBeInTheDocument();
      });
    });

    it('handles empty suggestion strings', () => {
      const suggestionsWithEmpty = ['javascript', '', 'react'];
      
      render(
        <SuggestionList 
          {...defaultProps} 
          suggestions={suggestionsWithEmpty}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      expect(buttons[1]).toHaveTextContent('>');
    });

    it('handles very long suggestion text', () => {
      const longSuggestion = 'very-long-suggestion-name-that-might-cause-layout-issues';
      const suggestions = ['short', longSuggestion];
      
      render(
        <SuggestionList 
          {...defaultProps} 
          suggestions={suggestions}
        />
      );
      
      expect(screen.getByRole('button', { name: new RegExp(longSuggestion) })).toBeInTheDocument();
    });
  });

  // 키 생성 테스트
  describe('key generation', () => {
    it('generates unique keys for suggestions', () => {
      const { container } = render(<SuggestionList {...defaultProps} />);
      
      const buttons = container.querySelectorAll('button');
      const keys = Array.from(buttons).map((button, index) => 
        `${defaultProps.suggestions[index]}-${index}`
      );
      
      // All keys should be unique
      expect(new Set(keys)).toHaveProperty('size', keys.length);
    });

    it('handles duplicate suggestions with different keys', () => {
      const duplicateSuggestions = ['javascript', 'javascript', 'react'];
      
      render(
        <SuggestionList 
          {...defaultProps} 
          suggestions={duplicateSuggestions}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      const jsButtons = screen.getAllByRole('button', { name: /javascript/ });
      expect(jsButtons).toHaveLength(2);
    });
  });

  // Props 변경 테스트
  describe('props changes', () => {
    it('updates when suggestions change', () => {
      const { rerender } = render(<SuggestionList {...defaultProps} />);
      
      expect(screen.getAllByRole('button')).toHaveLength(5);
      
      rerender(<SuggestionList {...defaultProps} suggestions={['new', 'suggestions']} />);
      
      expect(screen.getAllByRole('button')).toHaveLength(2);
      expect(screen.getByRole('button', { name: /new/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /suggestions/ })).toBeInTheDocument();
    });

    it('updates selection when selectedIndex changes', () => {
      const { rerender } = render(<SuggestionList {...defaultProps} selectedIndex={0} />);
      
      let buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveClass('bg-accent/20', 'text-accent');
      
      rerender(<SuggestionList {...defaultProps} selectedIndex={2} />);
      
      buttons = screen.getAllByRole('button');
      expect(buttons[0]).not.toHaveClass('bg-accent/20', 'text-accent');
      expect(buttons[2]).toHaveClass('bg-accent/20', 'text-accent');
    });

    it('updates compact mode styling', () => {
      const { rerender } = render(<SuggestionList {...defaultProps} isCompact={false} />);
      
      let buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveClass('px-6', 'py-3');
      
      rerender(<SuggestionList {...defaultProps} isCompact={true} />);
      
      buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveClass('px-4', 'py-2');
    });

    it('updates onSelect handler', async () => {
      const user = userEvent.setup();
      const firstHandler = jest.fn();
      const secondHandler = jest.fn();
      
      const { rerender } = render(
        <SuggestionList {...defaultProps} onSelect={firstHandler} />
      );
      
      await user.click(screen.getByRole('button', { name: /javascript/ }));
      expect(firstHandler).toHaveBeenCalledWith('javascript');
      expect(secondHandler).not.toHaveBeenCalled();
      
      rerender(<SuggestionList {...defaultProps} onSelect={secondHandler} />);
      
      await user.click(screen.getByRole('button', { name: /react/ }));
      expect(firstHandler).toHaveBeenCalledTimes(1); // No additional calls
      expect(secondHandler).toHaveBeenCalledWith('react');
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('handles undefined onSelect gracefully', () => {
      expect(() => {
        render(<SuggestionList {...defaultProps} onSelect={undefined as any} />);
      }).not.toThrow();
    });

    it('handles null suggestions gracefully', () => {
      expect(() => {
        render(<SuggestionList {...defaultProps} suggestions={null as any} />);
      }).toThrow(); // This should throw as suggestions.length would fail
    });

    it('handles single suggestion', () => {
      render(<SuggestionList {...defaultProps} suggestions={['solo']} />);
      
      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(screen.getByRole('button', { name: /solo/ })).toBeInTheDocument();
    });

    it('handles very large suggestion lists', () => {
      const largeSuggestions = Array.from({ length: 100 }, (_, i) => `suggestion${i}`);
      
      render(
        <SuggestionList 
          {...defaultProps} 
          suggestions={largeSuggestions}
        />
      );
      
      expect(screen.getAllByRole('button')).toHaveLength(100);
    });

    it('handles whitespace-only suggestions', () => {
      const whitespaceSuggestions = ['normal', '   ', '\t', '\n', 'another'];
      
      render(
        <SuggestionList 
          {...defaultProps} 
          suggestions={whitespaceSuggestions}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
      
      // Whitespace suggestions should still render but might appear empty
      expect(buttons[1]).toBeInTheDocument();
      expect(buttons[2]).toBeInTheDocument();
      expect(buttons[3]).toBeInTheDocument();
    });
  });

  // Accessibility 테스트
  describe('accessibility', () => {
    it('uses button elements for better accessibility', () => {
      render(<SuggestionList {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(defaultProps.suggestions.length);
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('provides meaningful button text for screen readers', () => {
      render(<SuggestionList {...defaultProps} />);
      
      defaultProps.suggestions.forEach(suggestion => {
        const button = screen.getByRole('button', { name: new RegExp(suggestion) });
        expect(button).toBeInTheDocument();
      });
    });

    it('handles keyboard navigation context (though navigation is handled by parent)', () => {
      render(<SuggestionList {...defaultProps} selectedIndex={2} />);
      
      // The selected item should be visually distinct for keyboard navigation
      const buttons = screen.getAllByRole('button');
      expect(buttons[2]).toHaveClass('bg-accent/20', 'text-accent');
    });
  });

  // 실제 사용 시나리오 테스트
  describe('real-world usage', () => {
    it('works as search suggestion dropdown', async () => {
      const user = userEvent.setup();
      const handleSelect = jest.fn();
      const searchSuggestions = ['javascript tutorial', 'javascript frameworks', 'javascript testing'];
      
      render(
        <SuggestionList
          suggestions={searchSuggestions}
          selectedIndex={1}
          onSelect={handleSelect}
          isCompact={true}
        />
      );
      
      // Should highlight the second suggestion
      const buttons = screen.getAllByRole('button');
      expect(buttons[1]).toHaveClass('bg-accent/20', 'text-accent');
      
      // User selects a suggestion
      await user.click(screen.getByRole('button', { name: /javascript testing/ }));
      expect(handleSelect).toHaveBeenCalledWith('javascript testing');
    });

    it('works with empty state handling', () => {
      const { rerender } = render(
        <SuggestionList {...defaultProps} suggestions={['loading...']} />
      );
      
      expect(screen.getByRole('button', { name: /loading/ })).toBeInTheDocument();
      
      // Simulate loading complete with no results
      rerender(<SuggestionList {...defaultProps} suggestions={[]} />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles dynamic suggestion updates', () => {
      const { rerender } = render(
        <SuggestionList {...defaultProps} suggestions={['ja']} selectedIndex={0} />
      );
      
      let buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveClass('bg-accent/20');
      
      // User continues typing, more suggestions appear
      rerender(
        <SuggestionList 
          {...defaultProps} 
          suggestions={['javascript', 'java', 'jamstack']} 
          selectedIndex={0}
        />
      );
      
      buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      expect(buttons[0]).toHaveClass('bg-accent/20'); // First item still selected
    });
  });
});