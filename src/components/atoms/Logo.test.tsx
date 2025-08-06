import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Logo, LogoProps } from './Logo';

describe('Logo', () => {
  // 기본 렌더링 테스트
  it('renders logo with correct text', () => {
    render(<Logo />);
    expect(screen.getByRole('heading', { name: 'Claude Hub' })).toBeInTheDocument();
  });

  it('renders as h1 element', () => {
    render(<Logo />);
    const logo = screen.getByRole('heading');
    expect(logo.tagName).toBe('H1');
  });

  it('renders with default props', () => {
    render(<Logo />);
    const logo = screen.getByRole('heading');
    expect(logo).toHaveClass(
      'font-bold',
      'text-accent',
      'cursor-pointer',
      'select-none',
      'text-2xl'
    );
    expect(logo).toHaveTextContent('Claude Hub');
  });

  // Size 테스트
  describe('sizes', () => {
    const sizes: Array<{ size: LogoProps['size']; expectedClass: string }> = [
      { size: 'sm', expectedClass: 'text-xl' },
      { size: 'md', expectedClass: 'text-2xl' },
      { size: 'lg', expectedClass: 'text-4xl' },
      { size: 'xl', expectedClass: 'text-6xl' },
    ];

    it.each(sizes)('applies correct class for $size size', ({ size, expectedClass }) => {
      render(<Logo size={size} />);
      const logo = screen.getByRole('heading');
      expect(logo).toHaveClass(expectedClass);
    });

    it('applies medium size by default', () => {
      render(<Logo />);
      const logo = screen.getByRole('heading');
      expect(logo).toHaveClass('text-2xl');
    });
  });

  // 스타일링 테스트
  describe('styling', () => {
    it('applies custom className', () => {
      render(<Logo className="custom-class" />);
      const logo = screen.getByRole('heading');
      expect(logo).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(<Logo className="custom-class" />);
      const logo = screen.getByRole('heading');
      expect(logo).toHaveClass(
        'custom-class',
        'font-bold',
        'text-accent',
        'cursor-pointer',
        'select-none'
      );
    });

    it('applies base classes to all sizes', () => {
      const baseClasses = [
        'font-bold',
        'text-accent',
        'cursor-pointer',
        'select-none'
      ];

      render(<Logo size="lg" />);
      const logo = screen.getByRole('heading');
      
      baseClasses.forEach(className => {
        expect(logo).toHaveClass(className);
      });
    });

    it('maintains text content regardless of size', () => {
      const sizes: LogoProps['size'][] = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { unmount } = render(<Logo size={size} />);
        expect(screen.getByRole('heading')).toHaveTextContent('Claude Hub');
        unmount();
      });
    });
  });

  // 상호작용 테스트
  describe('interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Logo onClick={handleClick} />);
      const logo = screen.getByRole('heading');
      
      await user.click(logo);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Logo onClick={handleClick} tabIndex={0} />);
      const logo = screen.getByRole('heading');
      
      await user.tab();
      expect(logo).toHaveFocus();
      
      // h1 elements don't naturally respond to keyboard events like Enter
      // This test verifies focus ability rather than keyboard interaction
      expect(logo).toHaveAttribute('tabIndex', '0');
    });

    it('prevents text selection due to select-none class', () => {
      render(<Logo />);
      const logo = screen.getByRole('heading');
      expect(logo).toHaveClass('select-none');
    });

    it('shows pointer cursor', () => {
      render(<Logo />);
      const logo = screen.getByRole('heading');
      expect(logo).toHaveClass('cursor-pointer');
    });
  });

  // HTML 속성 테스트
  describe('HTML attributes', () => {
    it('passes through additional props', () => {
      render(
        <Logo
          data-testid="custom-logo"
          data-custom="value"
          title="Navigate to home"
          id="main-logo"
        />
      );
      
      const logo = screen.getByTestId('custom-logo');
      expect(logo).toHaveAttribute('data-custom', 'value');
      expect(logo).toHaveAttribute('title', 'Navigate to home');
      expect(logo).toHaveAttribute('id', 'main-logo');
    });

    it('supports role attribute override', () => {
      render(<Logo role="banner" />);
      const logo = screen.getByRole('banner');
      expect(logo).toHaveTextContent('Claude Hub');
    });

    it('supports aria attributes', () => {
      render(
        <Logo 
          aria-label="Claude Hub - Home" 
          aria-describedby="logo-description"
        />
      );
      const logo = screen.getByRole('heading');
      expect(logo).toHaveAttribute('aria-label', 'Claude Hub - Home');
      expect(logo).toHaveAttribute('aria-describedby', 'logo-description');
    });
  });

  // 접근성 테스트
  describe('accessibility', () => {
    it('is properly recognized as a heading by screen readers', () => {
      render(<Logo />);
      const logo = screen.getByRole('heading', { level: 1 });
      expect(logo).toBeInTheDocument();
    });

    it('can be made focusable for keyboard navigation', () => {
      render(<Logo tabIndex={0} />);
      const logo = screen.getByRole('heading');
      expect(logo).toHaveAttribute('tabIndex', '0');
    });

    it('can be used as a skip link target', () => {
      render(<Logo id="main-content" />);
      const logo = screen.getByRole('heading');
      expect(logo).toHaveAttribute('id', 'main-content');
    });

    it('provides semantic heading structure', () => {
      render(
        <>
          <Logo />
          <h2>Secondary heading</h2>
        </>
      );
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      const subHeading = screen.getByRole('heading', { level: 2 });
      
      expect(mainHeading).toHaveTextContent('Claude Hub');
      expect(subHeading).toHaveTextContent('Secondary heading');
    });
  });

  // 실제 사용 사례 테스트
  describe('real-world usage scenarios', () => {
    it('works as a navigation home link', async () => {
      const user = userEvent.setup();
      const handleHomeNavigation = jest.fn();
      
      render(
        <Logo 
          onClick={handleHomeNavigation}
          role="button"
          tabIndex={0}
          aria-label="Navigate to home page"
        />
      );
      
      const logo = screen.getByRole('button');
      await user.click(logo);
      
      expect(handleHomeNavigation).toHaveBeenCalledTimes(1);
    });

    it('works in header with different sizes', () => {
      const { rerender } = render(<Logo size="lg" />);
      let logo = screen.getByRole('heading');
      expect(logo).toHaveClass('text-4xl');
      
      rerender(<Logo size="sm" />);
      logo = screen.getByRole('heading');
      expect(logo).toHaveClass('text-xl');
    });

    it('works with custom styling for themes', () => {
      render(
        <Logo 
          className="dark:text-white light:text-black hover:scale-105 transition-transform"
          size="xl"
        />
      );
      
      const logo = screen.getByRole('heading');
      expect(logo).toHaveClass(
        'dark:text-white',
        'light:text-black',
        'hover:scale-105',
        'transition-transform',
        'text-6xl'
      );
    });

    it('maintains brand consistency', () => {
      render(<Logo />);
      const logo = screen.getByRole('heading');
      
      // Brand text should never change
      expect(logo).toHaveTextContent('Claude Hub');
      expect(logo).not.toHaveTextContent('claude hub');
      expect(logo).not.toHaveTextContent('CLAUDE HUB');
    });
  });

  // 사이즈별 동작 검증
  describe('size-specific behavior', () => {
    it('all sizes maintain consistent base styling', () => {
      const sizes: LogoProps['size'][] = ['sm', 'md', 'lg', 'xl'];
      const baseClasses = ['font-bold', 'text-accent', 'cursor-pointer', 'select-none'];
      
      sizes.forEach(size => {
        const { unmount } = render(<Logo size={size} data-testid={`logo-${size}`} />);
        const logo = screen.getByTestId(`logo-${size}`);
        
        baseClasses.forEach(className => {
          expect(logo).toHaveClass(className);
        });
        
        unmount();
      });
    });

    it('size classes are mutually exclusive', () => {
      const { rerender } = render(<Logo size="sm" />);
      let logo = screen.getByRole('heading');
      expect(logo).toHaveClass('text-xl');
      expect(logo).not.toHaveClass('text-2xl', 'text-4xl', 'text-6xl');
      
      rerender(<Logo size="xl" />);
      logo = screen.getByRole('heading');
      expect(logo).toHaveClass('text-6xl');
      expect(logo).not.toHaveClass('text-xl', 'text-2xl', 'text-4xl');
    });
  });
});