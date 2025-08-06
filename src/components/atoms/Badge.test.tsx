import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge, BadgeProps } from './Badge';

describe('Badge', () => {
  // 기본 렌더링 테스트
  it('renders badge with correct text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders as span element', () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('SPAN');
  });

  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'font-mono',
      'border',
      'px-3',
      'py-1',
      'text-xs',
      'bg-card',
      'border-border',
      'text-foreground'
    );
  });

  // Variant 테스트
  describe('variants', () => {
    const variants: Array<{ variant: BadgeProps['variant']; expectedClasses: string[] }> = [
      { 
        variant: 'default', 
        expectedClasses: ['bg-card', 'border-border', 'text-foreground'] 
      },
      { 
        variant: 'accent', 
        expectedClasses: ['bg-accent/20', 'text-accent', 'border-accent/30'] 
      },
      { 
        variant: 'success', 
        expectedClasses: ['bg-green-500/20', 'text-green-400', 'border-green-500/30'] 
      },
      { 
        variant: 'warning', 
        expectedClasses: ['bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500/30'] 
      },
      { 
        variant: 'error', 
        expectedClasses: ['bg-red-500/20', 'text-red-400', 'border-red-500/30'] 
      },
    ];

    it.each(variants)('applies correct classes for $variant variant', ({ variant, expectedClasses }) => {
      render(<Badge variant={variant}>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expectedClasses.forEach(className => {
        expect(badge).toHaveClass(className);
      });
    });

    it('applies default variant by default', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('bg-card', 'border-border', 'text-foreground');
    });
  });

  // Size 테스트
  describe('sizes', () => {
    const sizes: Array<{ size: BadgeProps['size']; expectedClasses: string[] }> = [
      { size: 'sm', expectedClasses: ['px-2', 'py-0.5', 'text-xs'] },
      { size: 'md', expectedClasses: ['px-3', 'py-1', 'text-xs'] },
    ];

    it.each(sizes)('applies correct classes for $size size', ({ size, expectedClasses }) => {
      render(<Badge size={size}>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expectedClasses.forEach(className => {
        expect(badge).toHaveClass(className);
      });
    });

    it('applies medium size by default', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-xs');
    });
  });

  // 컨텐츠 테스트
  describe('content', () => {
    it('renders text content', () => {
      render(<Badge>Simple Text</Badge>);
      expect(screen.getByText('Simple Text')).toBeInTheDocument();
    });

    it('renders React node content', () => {
      render(
        <Badge>
          <span data-testid="icon">🔥</span>
          <span>Hot</span>
        </Badge>
      );
      expect(screen.getByTestId('icon')).toHaveTextContent('🔥');
      expect(screen.getByText('Hot')).toBeInTheDocument();
    });

    it('renders number content', () => {
      render(<Badge>{42}</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders when children is empty', () => {
      render(<Badge data-testid="empty-badge"></Badge>);
      const badge = screen.getByTestId('empty-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });
  });

  // 스타일링 테스트
  describe('styling', () => {
    it('applies custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(<Badge className="custom-class">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass(
        'custom-class',
        'inline-flex',
        'items-center',
        'rounded-full',
        'font-mono',
        'border'
      );
    });

    it('applies base classes to all variants and sizes', () => {
      const baseClasses = [
        'inline-flex',
        'items-center',
        'rounded-full',
        'font-mono',
        'border'
      ];

      render(<Badge variant="accent" size="sm">Badge</Badge>);
      const badge = screen.getByText('Badge');
      
      baseClasses.forEach(className => {
        expect(badge).toHaveClass(className);
      });
    });
  });

  // HTML 속성 테스트
  describe('HTML attributes', () => {
    it('passes through additional props', () => {
      render(
        <Badge
          data-testid="custom-badge"
          data-custom="value"
          title="Badge tooltip"
          role="status"
        >
          Badge
        </Badge>
      );
      
      const badge = screen.getByTestId('custom-badge');
      expect(badge).toHaveAttribute('data-custom', 'value');
      expect(badge).toHaveAttribute('title', 'Badge tooltip');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('supports id attribute', () => {
      render(<Badge id="unique-badge">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('id', 'unique-badge');
    });

    it('supports click handler', () => {
      const handleClick = jest.fn();
      render(
        <Badge onClick={handleClick} role="button" tabIndex={0}>
          Clickable Badge
        </Badge>
      );
      
      const badge = screen.getByRole('button');
      badge.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // 접근성 테스트
  describe('accessibility', () => {
    it('supports aria-label', () => {
      render(<Badge aria-label="Status indicator">New</Badge>);
      const badge = screen.getByText('New');
      expect(badge).toHaveAttribute('aria-label', 'Status indicator');
    });

    it('supports role attribute', () => {
      render(<Badge role="status">Loading</Badge>);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Loading');
    });

    it('can be used as interactive element with proper attributes', () => {
      render(
        <Badge
          role="button" 
          tabIndex={0}
          aria-label="Remove tag"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              console.warn('Badge activated');
            }
          }}
        >
          ×
        </Badge>
      );
      
      const badge = screen.getByRole('button');
      expect(badge).toHaveAttribute('tabIndex', '0');
      expect(badge).toHaveAttribute('aria-label', 'Remove tag');
    });
  });

  // 실제 사용 사례 테스트
  describe('real-world usage', () => {
    it('renders status badge correctly', () => {
      render(<Badge variant="success">Active</Badge>);
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-green-500/20', 'text-green-400');
    });

    it('renders error badge correctly', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-red-500/20', 'text-red-400');
    });

    it('renders notification count badge', () => {
      render(<Badge variant="accent" size="sm">{99}</Badge>);
      const badge = screen.getByText('99');
      expect(badge).toHaveClass('bg-accent/20', 'text-accent', 'px-2', 'py-0.5');
    });

    it('renders tag with remove functionality', () => {
      const handleRemove = jest.fn();
      render(
        <Badge className="cursor-pointer hover:bg-red-500/10">
          JavaScript
          <button
            onClick={handleRemove}
            className="ml-1 hover:text-red-400"
            aria-label="Remove JavaScript tag"
          >
            ×
          </button>
        </Badge>
      );
      
      const removeButton = screen.getByRole('button', { name: 'Remove JavaScript tag' });
      removeButton.click();
      
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });

  // 조합 테스트
  describe('variant and size combinations', () => {
    it('works with all variant and size combinations', () => {
      const variants: BadgeProps['variant'][] = ['default', 'accent', 'success', 'warning', 'error'];
      const sizes: BadgeProps['size'][] = ['sm', 'md'];

      variants.forEach((variant) => {
        sizes.forEach((size) => {
          const { unmount } = render(
            <Badge variant={variant} size={size} data-testid={`badge-${variant}-${size}`}>
              {variant} {size}
            </Badge>
          );
          
          const badge = screen.getByTestId(`badge-${variant}-${size}`);
          expect(badge).toBeInTheDocument();
          expect(badge).toHaveTextContent(`${variant} ${size}`);
          
          unmount();
        });
      });
    });
  });
});