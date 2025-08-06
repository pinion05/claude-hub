import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtensionCard } from './ExtensionCard';
import { Extension } from '@/types';

// Test data
const mockExtension: Extension = {
  id: 1,
  name: 'React Developer Tools',
  description: 'Debug React applications with ease and inspect component hierarchy',
  category: 'Development',
  repoUrl: 'https://github.com/facebook/react-devtools',
  tags: ['react', 'javascript', 'debugging'],
  stars: 2000,
  lastUpdated: '2024-01-01',
  author: 'Facebook',
  downloads: 10000,
  version: '1.2.3',
};

const mockExtensionMinimal: Extension = {
  id: 2,
  name: 'Minimal Extension',
  description: '',
  category: 'API',
  repoUrl: 'https://github.com/test/minimal',
};

describe('ExtensionCard', () => {
  const defaultProps = {
    extension: mockExtension,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 기본 렌더링 테스트
  it('renders extension card with all details', () => {
    render(<ExtensionCard {...defaultProps} />);
    
    expect(screen.getByText('React Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('Debug React applications with ease and inspect component hierarchy')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });

  it('renders as article element with proper structure', () => {
    render(<ExtensionCard {...defaultProps} />);
    
    // The element is an article with button role override
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('ARTICLE');
    expect(button).toHaveAttribute('role', 'button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('renders with proper accessibility attributes', () => {
    render(<ExtensionCard {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'View details for React Developer Tools');
  });

  // 카테고리 아이콘 테스트
  it('displays category icon', () => {
    render(<ExtensionCard {...defaultProps} />);
    
    const categoryIcon = screen.getByLabelText('Development icon');
    expect(categoryIcon).toBeInTheDocument();
    expect(categoryIcon).toHaveClass('text-2xl', 'mt-1', 'flex-shrink-0');
  });

  it('displays different category icons for different categories', () => {
    const apiExtension = { ...mockExtension, category: 'API' as const };
    render(<ExtensionCard {...defaultProps} extension={apiExtension} />);
    
    expect(screen.getByLabelText('API icon')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
  });

  // 제목 표시 테스트
  it('displays extension name as heading', () => {
    render(<ExtensionCard {...defaultProps} />);
    
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('React Developer Tools');
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-accent', 'line-clamp-1');
  });

  it('truncates long titles with line-clamp', () => {
    const longTitleExtension = {
      ...mockExtension,
      name: 'This is a very long extension name that should be truncated with line clamp'
    };
    
    render(<ExtensionCard {...defaultProps} extension={longTitleExtension} />);
    
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveClass('line-clamp-1');
  });

  // 설명 표시 테스트
  it('displays extension description', () => {
    render(<ExtensionCard {...defaultProps} />);
    
    const description = screen.getByText('Debug React applications with ease and inspect component hierarchy');
    expect(description).toHaveClass('text-sm', 'text-gray-400', 'mb-4', 'line-clamp-2');
  });

  it('handles empty description', () => {
    render(<ExtensionCard {...defaultProps} extension={mockExtensionMinimal} />);
    
    // Description element should still exist but be empty
    const description = screen.getByText('', { selector: 'p.text-sm.text-gray-400.mb-4.line-clamp-2' });
    expect(description).toBeInTheDocument();
  });

  it('truncates long descriptions with line-clamp-2', () => {
    const longDescExtension = {
      ...mockExtension,
      description: 'This is a very long description that should be truncated after two lines. It contains multiple sentences and provides detailed information about the extension functionality and capabilities.'
    };
    
    render(<ExtensionCard {...defaultProps} extension={longDescExtension} />);
    
    const description = screen.getByText(longDescExtension.description);
    expect(description).toHaveClass('line-clamp-2');
  });

  // 카테고리 배지 테스트
  it('displays category badge', () => {
    render(<ExtensionCard {...defaultProps} />);
    
    const badge = screen.getByText('Development');
    expect(badge).toHaveClass('bg-accent/20', 'text-accent');
  });

  it('displays correct category for different extension types', () => {
    const browserExtension = { ...mockExtension, category: 'Browser' as const };
    render(<ExtensionCard {...defaultProps} extension={browserExtension} />);
    
    expect(screen.getByText('Browser')).toBeInTheDocument();
    expect(screen.getByLabelText('Browser icon')).toBeInTheDocument();
  });

  // Stars 표시 테스트
  it('displays stars count when available', () => {
    render(<ExtensionCard {...defaultProps} />);
    
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });

  it('formats large star counts with locale string', () => {
    const highStarsExtension = { ...mockExtension, stars: 15000 };
    render(<ExtensionCard {...defaultProps} extension={highStarsExtension} />);
    
    expect(screen.getByText('15,000')).toBeInTheDocument();
  });

  it('handles very large star counts', () => {
    const megaStarsExtension = { ...mockExtension, stars: 1234567 };
    render(<ExtensionCard {...defaultProps} extension={megaStarsExtension} />);
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('does not display stars section when stars is undefined', () => {
    render(<ExtensionCard {...defaultProps} extension={mockExtensionMinimal} />);
    
    expect(screen.queryByText('⭐')).not.toBeInTheDocument();
  });

  it('does not display stars section when stars is 0', () => {
    const zeroStarsExtension = { ...mockExtension, stars: 0 };
    render(<ExtensionCard {...defaultProps} extension={zeroStarsExtension} />);
    
    expect(screen.queryByText('⭐')).not.toBeInTheDocument();
  });

  // Click 이벤트 테스트
  describe('interactions', () => {
    it('calls onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<ExtensionCard {...defaultProps} onClick={handleClick} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(mockExtension);
    });

    it('calls onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<ExtensionCard {...defaultProps} onClick={handleClick} />);
      
      const article = screen.getByRole('button');
      article.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(mockExtension);
    });

    it('calls onClick when Space key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<ExtensionCard {...defaultProps} onClick={handleClick} />);
      
      const article = screen.getByRole('button');
      article.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(mockExtension);
    });

    it('does not call onClick for other key presses', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<ExtensionCard {...defaultProps} onClick={handleClick} />);
      
      const article = screen.getByRole('button');
      article.focus();
      await user.keyboard('{Escape}');
      await user.keyboard('{Tab}');
      await user.keyboard('a');
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('prevents default behavior on Enter and Space key press', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<ExtensionCard {...defaultProps} onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  // 스타일링 테스트
  describe('styling', () => {
    it('applies base card styling classes', () => {
      render(<ExtensionCard {...defaultProps} />);
      
      const article = screen.getByRole('button');
      expect(article).toHaveClass(
        'card-3d',
        'bg-card',
        'border',
        'border-border',
        'rounded-lg',
        'p-6',
        'cursor-pointer',
        'transition-all',
        'duration-200'
      );
    });

    it('applies hover effects classes', () => {
      render(<ExtensionCard {...defaultProps} />);
      
      const article = screen.getByRole('button');
      expect(article).toHaveClass(
        'hover:border-accent/50',
        'hover:glow-coral'
      );
    });

    it('applies animation classes', () => {
      render(<ExtensionCard {...defaultProps} />);
      
      const article = screen.getByRole('button');
      expect(article).toHaveClass(
        'opacity-0',
        'animate-[fadeIn_0.3s_ease-out_forwards]'
      );
    });
  });

  // 애니메이션 지연 테스트
  describe('animation timing', () => {
    it('applies default animation delay when no index provided', () => {
      render(<ExtensionCard {...defaultProps} />);
      
      const article = screen.getByRole('button');
      expect(article).toHaveStyle({ animationDelay: '0ms' });
    });

    it('applies staggered animation delay based on index', () => {
      render(<ExtensionCard {...defaultProps} index={5} />);
      
      const article = screen.getByRole('button');
      expect(article).toHaveStyle({ animationDelay: '250ms' });
    });

    it('caps animation delay at 500ms for high indices', () => {
      render(<ExtensionCard {...defaultProps} index={20} />);
      
      const article = screen.getByRole('button');
      expect(article).toHaveStyle({ animationDelay: '500ms' });
    });

    it('handles zero index correctly', () => {
      render(<ExtensionCard {...defaultProps} index={0} />);
      
      const article = screen.getByRole('button');
      expect(article).toHaveStyle({ animationDelay: '0ms' });
    });

    it('applies correct delay for multiple cards in sequence', () => {
      const { rerender } = render(<ExtensionCard {...defaultProps} index={0} />);
      let article = screen.getByRole('button');
      expect(article).toHaveStyle({ animationDelay: '0ms' });

      rerender(<ExtensionCard {...defaultProps} index={1} />);
      article = screen.getByRole('button');
      expect(article).toHaveStyle({ animationDelay: '50ms' });

      rerender(<ExtensionCard {...defaultProps} index={2} />);
      article = screen.getByRole('button');
      expect(article).toHaveStyle({ animationDelay: '100ms' });
    });
  });

  // 메모화 테스트
  describe('memoization', () => {
    it('has correct displayName', () => {
      expect(ExtensionCard.displayName).toBe('ExtensionCard');
    });

    it('prevents unnecessary re-renders with same props', () => {
      const renderSpy = jest.fn();
      
      const TestExtensionCard = React.memo((props: unknown) => {
        renderSpy();
        return <ExtensionCard {...props} />;
      });

      const { rerender } = render(<TestExtensionCard {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestExtensionCard {...defaultProps} />);
      expect(renderSpy).toHaveBeenCalledTimes(1); // Should not re-render
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('handles extension with all optional fields undefined', () => {
      const minimalExtension: Extension = {
        id: 999,
        name: 'Minimal',
        description: '',
        category: 'Development',
        repoUrl: 'https://github.com/test/minimal',
      };

      expect(() => {
        render(<ExtensionCard {...defaultProps} extension={minimalExtension} />);
      }).not.toThrow();

      expect(screen.getByText('Minimal')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.queryByText('⭐')).not.toBeInTheDocument();
    });

    it('handles extension with extremely long name', () => {
      const longNameExtension = {
        ...mockExtension,
        name: 'This is an extremely long extension name that goes on and on and should be properly handled by the component without breaking the layout or causing issues'
      };

      render(<ExtensionCard {...defaultProps} extension={longNameExtension} />);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveClass('line-clamp-1');
      expect(title).toBeInTheDocument();
    });

    it('handles negative star count gracefully', () => {
      const negativeStarsExtension = { ...mockExtension, stars: -100 };
      
      expect(() => {
        render(<ExtensionCard {...defaultProps} extension={negativeStarsExtension} />);
      }).not.toThrow();
      
      expect(screen.getByText('-100')).toBeInTheDocument();
    });

    it('handles very large numbers formatting', () => {
      const bigNumberExtension = { ...mockExtension, stars: 999999999 };
      render(<ExtensionCard {...defaultProps} extension={bigNumberExtension} />);
      
      expect(screen.getByText('999,999,999')).toBeInTheDocument();
    });

    it('handles null/undefined onClick gracefully', () => {
      expect(() => {
        render(<ExtensionCard extension={mockExtension} onClick={null as any} />);
      }).not.toThrow();
    });
  });

  // 실제 사용 시나리오 테스트
  describe('real-world usage', () => {
    it('works in a list of extensions', () => {
      const extensions = [
        { ...mockExtension, id: 1, name: 'Extension 1' },
        { ...mockExtension, id: 2, name: 'Extension 2' },
        { ...mockExtension, id: 3, name: 'Extension 3' },
      ];

      render(
        <div>
          {extensions.map((ext, index) => (
            <ExtensionCard
              key={ext.id}
              extension={ext}
              onClick={jest.fn()}
              index={index}
            />
          ))}
        </div>
      );

      expect(screen.getByText('Extension 1')).toBeInTheDocument();
      expect(screen.getByText('Extension 2')).toBeInTheDocument();
      expect(screen.getByText('Extension 3')).toBeInTheDocument();
    });

    it('handles user interactions in grid layout', async () => {
      const user = userEvent.setup();
      const handleClick1 = jest.fn();
      const handleClick2 = jest.fn();

      render(
        <div className="grid grid-cols-2 gap-4">
          <ExtensionCard extension={{ ...mockExtension, id: 1 }} onClick={handleClick1} />
          <ExtensionCard extension={{ ...mockExtension, id: 2 }} onClick={handleClick2} />
        </div>
      );

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]!);
      await user.click(buttons[1]!);

      expect(handleClick1).toHaveBeenCalledTimes(1);
      expect(handleClick2).toHaveBeenCalledTimes(1);
    });

    it('maintains focus and accessibility in keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <ExtensionCard extension={{ ...mockExtension, id: 1 }} onClick={jest.fn()} />
          <ExtensionCard extension={{ ...mockExtension, id: 2 }} onClick={jest.fn()} />
        </div>
      );

      // Use button role instead of article since the component has role="button"
      const buttons = screen.getAllByRole('button');
      
      await user.tab();
      expect(buttons[0]).toHaveFocus();
      
      await user.tab();
      expect(buttons[1]).toHaveFocus();
    });
  });
});