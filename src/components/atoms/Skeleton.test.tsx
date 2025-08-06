import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonProps } from './Skeleton';

describe('Skeleton', () => {
  // 기본 렌더링 테스트
  it('renders skeleton element', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.tagName).toBe('DIV');
  });

  it('renders with default props', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('bg-gray-800', 'rounded', 'animate-pulse');
  });

  // Variant 테스트
  describe('variants', () => {
    const variants: Array<{ variant: SkeletonProps['variant']; expectedClass: string; expectedHeight: string }> = [
      { variant: 'text', expectedClass: 'rounded', expectedHeight: '1em' },
      { variant: 'circular', expectedClass: 'rounded-full', expectedHeight: '40px' },
      { variant: 'rectangular', expectedClass: 'rounded-lg', expectedHeight: '100px' },
    ];

    it.each(variants)('applies correct class and height for $variant variant', ({ variant, expectedClass, expectedHeight }) => {
      render(<Skeleton variant={variant} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass(expectedClass);
      expect(skeleton).toHaveStyle({ height: expectedHeight });
    });

    it('applies text variant by default', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded');
      expect(skeleton).toHaveStyle({ height: '1em' });
    });

    it('sets different default widths for variants', () => {
      const { rerender } = render(<Skeleton variant="text" data-testid="skeleton" />);
      let skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '100%' });

      rerender(<Skeleton variant="circular" data-testid="skeleton" />);
      skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '40px' });

      rerender(<Skeleton variant="rectangular" data-testid="skeleton" />);
      skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '100%' });
    });
  });

  // Animation 테스트
  describe('animations', () => {
    const animations: Array<{ animation: SkeletonProps['animation']; expectedClass: string }> = [
      { animation: 'pulse', expectedClass: 'animate-pulse' },
      { animation: 'wave', expectedClass: 'animate-shimmer' },
      { animation: 'none', expectedClass: '' },
    ];

    it.each(animations)('applies correct class for $animation animation', ({ animation, expectedClass }) => {
      render(<Skeleton animation={animation} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      
      if (expectedClass) {
        expect(skeleton).toHaveClass(expectedClass);
      } else {
        expect(skeleton).not.toHaveClass('animate-pulse', 'animate-shimmer');
      }
    });

    it('applies pulse animation by default', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('can disable animation', () => {
      render(<Skeleton animation="none" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).not.toHaveClass('animate-pulse', 'animate-shimmer');
    });
  });

  // 사이즈 테스트
  describe('sizing', () => {
    it('applies custom width as string', () => {
      render(<Skeleton width="200px" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('applies custom width as number', () => {
      render(<Skeleton width={150} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '150px' });
    });

    it('applies custom height as string', () => {
      render(<Skeleton height="50px" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ height: '50px' });
    });

    it('applies custom height as number', () => {
      render(<Skeleton height={75} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ height: '75px' });
    });

    it('allows both width and height customization', () => {
      render(<Skeleton width="300px" height="200px" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ 
        width: '300px',
        height: '200px'
      });
    });

    it('overrides default dimensions with custom ones', () => {
      render(<Skeleton variant="circular" width="60px" height="60px" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ 
        width: '60px',
        height: '60px'
      });
      // Should not have default circular dimensions
      expect(skeleton).not.toHaveStyle({ 
        width: '40px',
        height: '40px'
      });
    });
  });

  // 스타일링 테스트
  describe('styling', () => {
    it('applies custom className', () => {
      render(<Skeleton className="custom-class" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(<Skeleton className="custom-class" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass(
        'custom-class',
        'bg-gray-800',
        'rounded',
        'animate-pulse'
      );
    });

    it('applies custom style object', () => {
      const customStyle = {
        backgroundColor: 'red',
        borderRadius: '8px',
        opacity: 0.5
      };
      
      render(<Skeleton style={customStyle} data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      
      expect(skeleton).toHaveStyle({
        backgroundColor: 'red',
        borderRadius: '8px',
        opacity: 0.5
      });
    });

    it('merges custom style with internal styles', () => {
      render(
        <Skeleton 
          width="100px" 
          height="50px" 
          style={{ backgroundColor: 'blue', margin: '10px' }}
          data-testid="skeleton" 
        />
      );
      const skeleton = screen.getByTestId('skeleton');
      
      expect(skeleton).toHaveStyle({
        width: '100px',
        height: '50px',
        backgroundColor: 'blue',
        margin: '10px'
      });
    });

    it('applies base classes to all variants', () => {
      const variants: SkeletonProps['variant'][] = ['text', 'circular', 'rectangular'];
      
      variants.forEach((variant) => {
        const { unmount } = render(<Skeleton variant={variant} data-testid={`skeleton-${variant}`} />);
        const skeleton = screen.getByTestId(`skeleton-${variant}`);
        
        expect(skeleton).toHaveClass('bg-gray-800');
        unmount();
      });
    });
  });

  // HTML 속성 테스트
  describe('HTML attributes', () => {
    it('passes through additional props', () => {
      render(
        <Skeleton
          data-testid="custom-skeleton"
          data-custom="value"
          role="progressbar"
          aria-label="Loading content"
        />
      );
      
      const skeleton = screen.getByTestId('custom-skeleton');
      expect(skeleton).toHaveAttribute('data-custom', 'value');
      expect(skeleton).toHaveAttribute('role', 'progressbar');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });

    it('supports id attribute', () => {
      render(<Skeleton id="unique-skeleton" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('id', 'unique-skeleton');
    });
  });

  // 접근성 테스트
  describe('accessibility', () => {
    it('can be used with proper ARIA attributes for loading states', () => {
      render(
        <Skeleton
          role="progressbar"
          aria-label="Loading content"
          aria-live="polite"
          data-testid="skeleton"
        />
      );
      
      const skeleton = screen.getByRole('progressbar');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });

    it('can be hidden from screen readers when appropriate', () => {
      render(<Skeleton aria-hidden="true" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('supports aria-describedby for additional context', () => {
      render(
        <>
          <Skeleton aria-describedby="loading-description" data-testid="skeleton" />
          <div id="loading-description">Content is loading, please wait...</div>
        </>
      );
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-describedby', 'loading-description');
    });
  });

  // 실제 사용 사례 테스트
  describe('real-world usage scenarios', () => {
    it('renders text skeleton for loading paragraphs', () => {
      const { container } = render(
        <div>
          <Skeleton variant="text" width="100%" height="1em" />
          <Skeleton variant="text" width="80%" height="1em" />
          <Skeleton variant="text" width="60%" height="1em" />
        </div>
      );
      
      const skeletons = container.querySelectorAll('div[class*="bg-gray-800"]');
      expect(skeletons).toHaveLength(3);
    });

    it('renders avatar skeleton', () => {
      render(
        <Skeleton 
          variant="circular" 
          width="48px" 
          height="48px"
          data-testid="avatar-skeleton"
        />
      );
      
      const skeleton = screen.getByTestId('avatar-skeleton');
      expect(skeleton).toHaveClass('rounded-full');
      expect(skeleton).toHaveStyle({ width: '48px', height: '48px' });
    });

    it('renders card skeleton', () => {
      render(
        <div data-testid="card-skeleton">
          <Skeleton variant="rectangular" height="200px" className="mb-4" />
          <Skeleton variant="text" height="1.5em" className="mb-2" />
          <Skeleton variant="text" height="1em" width="80%" />
        </div>
      );
      
      const cardSkeleton = screen.getByTestId('card-skeleton');
      expect(cardSkeleton).toBeInTheDocument();
    });

    it('renders list item skeleton', () => {
      render(
        <div className="flex items-center space-x-4" data-testid="list-item-skeleton">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1">
            <Skeleton variant="text" height="1em" width="60%" className="mb-1" />
            <Skeleton variant="text" height="0.875em" width="40%" />
          </div>
        </div>
      );
      
      const listSkeleton = screen.getByTestId('list-item-skeleton');
      expect(listSkeleton).toBeInTheDocument();
    });
  });

  // 조합 테스트
  describe('variant, animation, and sizing combinations', () => {
    it('works with all combinations', () => {
      const variants: SkeletonProps['variant'][] = ['text', 'circular', 'rectangular'];
      const animations: SkeletonProps['animation'][] = ['pulse', 'wave', 'none'];

      variants.forEach((variant) => {
        animations.forEach((animation) => {
          const { unmount } = render(
            <Skeleton 
              variant={variant} 
              animation={animation}
              width="100px"
              height="50px"
              data-testid={`skeleton-${variant}-${animation}`}
            />
          );
          
          const skeleton = screen.getByTestId(`skeleton-${variant}-${animation}`);
          expect(skeleton).toBeInTheDocument();
          expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
          
          unmount();
        });
      });
    });

    it('maintains consistency across different prop combinations', () => {
      render(
        <Skeleton 
          variant="rectangular"
          animation="wave"
          width="200px"
          height="100px"
          className="my-custom-class"
          style={{ borderRadius: '12px' }}
          data-testid="complex-skeleton"
        />
      );
      
      const skeleton = screen.getByTestId('complex-skeleton');
      expect(skeleton).toHaveClass('bg-gray-800', 'rounded-lg', 'animate-shimmer', 'my-custom-class');
      expect(skeleton).toHaveStyle({ 
        width: '200px',
        height: '100px',
        borderRadius: '12px'
      });
    });
  });
});