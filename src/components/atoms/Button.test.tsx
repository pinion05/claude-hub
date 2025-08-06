import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, ButtonProps } from './Button';

describe('Button', () => {
  // 기본 렌더링 테스트
  it('renders button with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders as anchor when as="a" prop is provided', () => {
    render(
      <Button as="a" href="/test">
        Link Button
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  // Variant 테스트
  describe('variants', () => {
    const variants: Array<{ variant: ButtonProps['variant']; expectedClass: string }> = [
      { variant: 'primary', expectedClass: 'bg-accent text-white hover:bg-accent/80' },
      { variant: 'secondary', expectedClass: 'bg-card border border-border hover:border-accent/50' },
      { variant: 'ghost', expectedClass: 'hover:bg-accent/10' },
      { variant: 'link', expectedClass: 'text-accent hover:underline p-0 h-auto' },
    ];

    it.each(variants)('applies correct classes for $variant variant', ({ variant, expectedClass }) => {
      render(<Button variant={variant}>Button</Button>);
      const button = screen.getByRole('button');
      expectedClass.split(' ').forEach(className => {
        expect(button).toHaveClass(className);
      });
    });

    it('applies primary variant by default', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent', 'text-white');
    });
  });

  // Size 테스트
  describe('sizes', () => {
    const sizes: Array<{ size: ButtonProps['size']; expectedClass: string }> = [
      { size: 'sm', expectedClass: 'h-8 px-3 text-sm' },
      { size: 'md', expectedClass: 'h-10 px-4 text-sm' },
      { size: 'lg', expectedClass: 'h-12 px-6 text-base' },
    ];

    it.each(sizes)('applies correct classes for $size size', ({ size, expectedClass }) => {
      render(<Button size={size}>Button</Button>);
      const button = screen.getByRole('button');
      expectedClass.split(' ').forEach(className => {
        expect(button).toHaveClass(className);
      });
    });

    it('applies medium size by default', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4', 'text-sm');
    });

    it('does not apply size classes for link variant', () => {
      render(<Button variant="link" size="lg">Link Button</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('h-12', 'px-6');
      expect(button).toHaveClass('p-0', 'h-auto');
    });
  });

  // 접근성 테스트
  describe('accessibility', () => {
    it('supports custom aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('can be disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick}>Clickable Button</Button>);
      const button = screen.getByRole('button');
      
      await user.tab();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  // 이벤트 핸들링 테스트
  describe('event handling', () => {
    it('calls onClick when button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when button is disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('passes through additional props to button element', () => {
      render(
        <Button
          data-testid="custom-button"
          data-custom="value"
          type="submit"
        >
          Custom Button
        </Button>
      );
      
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('data-custom', 'value');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('passes through additional props to anchor element', () => {
      render(
        <Button
          as="a"
          href="/test"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="custom-link"
        >
          Link Button
        </Button>
      );
      
      const link = screen.getByTestId('custom-link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // 스타일링 테스트
  describe('styling', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'custom-class',
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-lg',
        'font-mono'
      );
    });

    it('applies base classes to all variants', () => {
      const baseClasses = [
        'inline-flex',
        'items-center', 
        'justify-center',
        'rounded-lg',
        'font-mono',
        'transition-all',
        'duration-200'
      ];

      render(<Button variant="secondary">Button</Button>);
      const button = screen.getByRole('button');
      
      baseClasses.forEach(className => {
        expect(button).toHaveClass(className);
      });
    });
  });

  // forwardRef 테스트
  describe('ref forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });

    it('forwards ref to anchor element', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(<Button as="a" href="/test" ref={ref}>Link</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
      expect(ref.current?.tagName).toBe('A');
    });
  });

  // displayName 테스트
  it('has correct displayName', () => {
    expect(Button.displayName).toBe('Button');
  });
});