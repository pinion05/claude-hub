import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, InputProps } from './Input';

describe('Input', () => {
  // 기본 렌더링 테스트
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'w-full',
      'rounded-lg',
      'outline-none',
      'font-mono',
      'h-10',
      'px-4',
      'text-sm',
      'bg-card',
      'border',
      'border-border'
    );
  });

  // Variant 테스트
  describe('variants', () => {
    const variants: Array<{ variant: InputProps['variant']; expectedClasses: string[] }> = [
      { 
        variant: 'default', 
        expectedClasses: ['bg-card', 'border', 'border-border', 'focus:ring-2', 'focus:ring-accent/20', 'focus:border-accent'] 
      },
      { 
        variant: 'search', 
        expectedClasses: ['bg-transparent', 'border-none', 'focus:ring-0'] 
      },
    ];

    it.each(variants)('applies correct classes for $variant variant', ({ variant, expectedClasses }) => {
      render(<Input variant={variant} />);
      const input = screen.getByRole('textbox');
      expectedClasses.forEach(className => {
        expect(input).toHaveClass(className);
      });
    });

    it('applies default variant by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-card', 'border', 'border-border');
    });
  });

  // Size 테스트
  describe('sizes', () => {
    const sizes: Array<{ size: InputProps['size']; expectedClasses: string[] }> = [
      { size: 'sm', expectedClasses: ['h-8', 'px-3', 'text-sm'] },
      { size: 'md', expectedClasses: ['h-10', 'px-4', 'text-sm'] },
      { size: 'lg', expectedClasses: ['h-14', 'px-6', 'text-base'] },
    ];

    it.each(sizes)('applies correct classes for $size size', ({ size, expectedClasses }) => {
      render(<Input size={size} />);
      const input = screen.getByRole('textbox');
      expectedClasses.forEach(className => {
        expect(input).toHaveClass(className);
      });
    });

    it('applies medium size by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-10', 'px-4', 'text-sm');
    });
  });

  // 접근성 테스트
  describe('accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Search input" />);
      const input = screen.getByRole('textbox', { name: 'Search input' });
      expect(input).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <div id="help-text">Help text</div>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('can be disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('can be readonly', () => {
      render(<Input readOnly value="readonly value" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('readonly value');
    });

    it('supports required attribute', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('supports different input types', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });
  });

  // 이벤트 핸들링 테스트
  describe('event handling', () => {
    it('calls onChange when input value changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'Hello');
      
      expect(handleChange).toHaveBeenCalledTimes(5); // One for each character
      expect(input).toHaveValue('Hello');
    });

    it('calls onFocus when input is focused', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
      expect(input).toHaveFocus();
    });

    it('calls onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const handleBlur = jest.fn();
      
      render(
        <>
          <Input onBlur={handleBlur} />
          <button>Other element</button>
        </>
      );
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.click(input);
      await user.click(button);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
      expect(input).not.toHaveFocus();
    });

    it('calls onKeyDown when keys are pressed', async () => {
      const user = userEvent.setup();
      const handleKeyDown = jest.fn();
      
      render(<Input onKeyDown={handleKeyDown} />);
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      await user.keyboard('{Enter}');
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({
        key: 'Enter'
      }));
    });

    it('does not call onChange when input is disabled', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      
      render(<Input onChange={handleChange} disabled />);
      const input = screen.getByRole('textbox');
      
      await user.type(input, 'Hello');
      
      expect(handleChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('');
    });
  });

  // 스타일링 테스트
  describe('styling', () => {
    it('applies custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'custom-class',
        'w-full',
        'rounded-lg',
        'outline-none',
        'font-mono'
      );
    });

    it('applies base classes to all variants', () => {
      const baseClasses = [
        'w-full',
        'rounded-lg',
        'outline-none',
        'font-mono',
        'placeholder-gray-500',
        'transition-all',
        'duration-200'
      ];

      render(<Input variant="search" />);
      const input = screen.getByRole('textbox');
      
      baseClasses.forEach(className => {
        expect(input).toHaveClass(className);
      });
    });
  });

  // 폼 관련 테스트
  describe('form integration', () => {
    it('works with form submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="testInput" />
          <button type="submit">Submit</button>
        </form>
      );
      
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      
      await user.type(input, 'test value');
      await user.click(submitButton);
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('supports name and id attributes', () => {
      render(<Input name="testName" id="testId" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'testName');
      expect(input).toHaveAttribute('id', 'testId');
    });

    it('supports defaultValue', () => {
      render(<Input defaultValue="default text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('default text');
    });

    it('supports controlled input', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState('initial');
        return (
          <Input 
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };
      
      render(<TestComponent />);
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveValue('initial');
      
      await user.clear(input);
      await user.type(input, 'updated');
      
      expect(input).toHaveValue('updated');
    });
  });

  // forwardRef 테스트
  describe('ref forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });

    it('ref can be used to focus input', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      ref.current?.focus();
      
      expect(ref.current).toHaveFocus();
    });
  });

  // displayName 테스트
  it('has correct displayName', () => {
    expect(Input.displayName).toBe('Input');
  });
});