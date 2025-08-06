import { cn } from './classNames';

describe('cn (classNames utility)', () => {
  // 기본 동작 테스트
  it('joins string classes correctly', () => {
    expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('returns empty string when no arguments provided', () => {
    expect(cn()).toBe('');
  });

  it('handles single class correctly', () => {
    expect(cn('single-class')).toBe('single-class');
  });

  it('joins classes with single space', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
    expect(result.split(' ')).toHaveLength(2);
  });

  // Falsy 값 필터링 테스트
  it('filters out falsy values', () => {
    expect(cn('class1', false, 'class2', null, 'class3', undefined)).toBe('class1 class2 class3');
  });

  it('filters out empty strings', () => {
    expect(cn('class1', '', 'class2', '   ', 'class3')).toBe('class1 class2     class3');
  });

  it('handles all falsy values', () => {
    expect(cn(false, null, undefined, '', 0)).toBe('');
  });

  it('handles mixed truthy and falsy values', () => {
    expect(cn('valid-class', false, null, 'another-class', undefined, 'final-class'))
      .toBe('valid-class another-class final-class');
  });

  // Boolean 조건부 클래스 테스트
  it('applies conditional classes based on boolean values', () => {
    const isActive = true;
    const isDisabled = false;
    
    expect(cn('base-class', isActive && 'active', isDisabled && 'disabled'))
      .toBe('base-class active');
  });

  it('handles complex boolean expressions', () => {
    const condition1 = true;
    const condition2 = false;
    const condition3 = true;
    
    expect(cn(
      'base',
      condition1 && 'first',
      condition2 && 'second', 
      condition3 && condition1 && 'third'
    )).toBe('base first third');
  });

  it('works with ternary expressions', () => {
    const state = 'active';
    
    expect(cn(
      'button',
      state === 'active' ? 'btn-active' : 'btn-inactive',
      state === 'disabled' ? 'btn-disabled' : null
    )).toBe('button btn-active');
  });

  // 다양한 데이터 타입 테스트
  it('handles number values', () => {
    expect(cn('class1', 42, 'class2', 0, 'class3')).toBe('class1 42 class2 class3');
  });

  it('handles string with spaces', () => {
    expect(cn('class with spaces', 'normal-class')).toBe('class with spaces normal-class');
  });

  it('handles special characters in class names', () => {
    expect(cn('class-name', 'class_name', 'class:hover', 'class[active]'))
      .toBe('class-name class_name class:hover class[active]');
  });

  it('preserves leading/trailing spaces in individual classes', () => {
    expect(cn(' leading-space', 'trailing-space ', ' both-spaces '))
      .toBe(' leading-space trailing-space   both-spaces ');
  });

  // 실제 사용 사례 테스트
  it('works with Tailwind CSS classes', () => {
    expect(cn(
      'bg-blue-500',
      'text-white',
      'px-4',
      'py-2',
      'rounded',
      'hover:bg-blue-600'
    )).toBe('bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600');
  });

  it('handles component variant patterns', () => {
    const variant = 'primary';
    const size = 'lg';
    const disabled = false;
    
    const baseClasses = 'btn font-semibold';
    const variantClasses = variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
    const sizeClasses = size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-sm';
    const stateClasses = disabled && 'opacity-50 cursor-not-allowed';
    
    expect(cn(baseClasses, variantClasses, sizeClasses, stateClasses))
      .toBe('btn font-semibold bg-blue-500 text-white px-6 py-3 text-lg');
  });

  it('handles responsive design patterns', () => {
    expect(cn(
      'w-full',
      'md:w-1/2',
      'lg:w-1/3',
      'xl:w-1/4',
      'p-4',
      'sm:p-6',
      'lg:p-8'
    )).toBe('w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4 sm:p-6 lg:p-8');
  });

  it('works with state-based styling', () => {
    const isLoading = true;
    const hasError = false;
    const isSuccess = false;
    
    expect(cn(
      'transition-all',
      'duration-200',
      isLoading && 'opacity-50 cursor-wait',
      hasError && 'border-red-500 text-red-500',
      isSuccess && 'border-green-500 text-green-500'
    )).toBe('transition-all duration-200 opacity-50 cursor-wait');
  });

  // 성능 관련 테스트
  it('handles many arguments efficiently', () => {
    const manyClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`);
    const result = cn(...manyClasses);
    const expected = manyClasses.join(' ');
    
    expect(result).toBe(expected);
  });

  it('handles many falsy values efficiently', () => {
    const mixedValues = Array.from({ length: 100 }, (_, i) => 
      i % 2 === 0 ? `class-${i}` : false
    );
    
    const result = cn(...mixedValues);
    const expectedClasses = Array.from({ length: 50 }, (_, i) => `class-${i * 2}`);
    
    expect(result).toBe(expectedClasses.join(' '));
  });

  // Edge cases
  it('handles nested boolean expressions', () => {
    const a = true;
    const b = false;
    const c = true;
    
    expect(cn(
      'base',
      a && (b || c) && 'complex',
      (a && b) || (a && c) && 'another'
    )).toBe('base complex another');
  });

  it('handles function calls that return class names', () => {
    const getClass = (active: boolean) => active ? 'active-class' : 'inactive-class';
    const getConditionalClass = (show: boolean) => show && 'conditional-class';
    
    expect(cn(
      'base',
      getClass(true),
      getConditionalClass(false),
      getConditionalClass(true)
    )).toBe('base active-class conditional-class');
  });

  it('handles object destructuring patterns', () => {
    const styles = {
      base: 'btn rounded',
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-800',
    };
    
    const isPrimary = true;
    
    expect(cn(
      styles.base,
      isPrimary ? styles.primary : styles.secondary
    )).toBe('btn rounded bg-blue-500 text-white');
  });

  it('handles computed class names', () => {
    const prefix = 'btn';
    const variant = 'primary';
    const size = 'lg';
    
    expect(cn(
      `${prefix}-base`,
      `${prefix}-${variant}`,
      `${prefix}-${size}`,
      `hover:${prefix}-${variant}-hover`
    )).toBe('btn-base btn-primary btn-lg hover:btn-primary-hover');
  });

  // Type safety 테스트 (런타임 동작 확인)
  it('maintains type safety at runtime', () => {
    // 이 테스트들은 TypeScript 컴파일 시점의 타입 안정성을 런타임에서 확인
    expect(() => cn('valid-string')).not.toThrow();
    expect(() => cn(true)).not.toThrow();
    expect(() => cn(false)).not.toThrow();
    expect(() => cn(null)).not.toThrow();
    expect(() => cn(undefined)).not.toThrow();
  });

  // 실제 컴포넌트에서의 사용 패턴 테스트
  it('works in Button component pattern', () => {
    interface ButtonProps {
      variant?: 'primary' | 'secondary' | 'ghost';
      size?: 'sm' | 'md' | 'lg';
      disabled?: boolean;
      className?: string;
    }
    
    const getButtonClasses = ({ variant = 'primary', size = 'md', disabled = false, className }: ButtonProps) => {
      return cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        // Variant classes
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        variant === 'ghost' && 'hover:bg-gray-100',
        // Size classes
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        // State classes
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // Custom classes
        className
      );
    };
    
    expect(getButtonClasses({ variant: 'primary', size: 'lg', disabled: true, className: 'custom-class' }))
      .toBe('inline-flex items-center justify-center rounded-md font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-12 px-6 text-base opacity-50 cursor-not-allowed pointer-events-none custom-class');
  });

  it('works in Card component pattern', () => {
    const getCardClasses = (hover?: boolean, selected?: boolean, className?: string) => {
      return cn(
        'rounded-lg border bg-white shadow-sm',
        hover && 'hover:shadow-md transition-shadow',
        selected && 'ring-2 ring-blue-500 border-blue-500',
        className
      );
    };
    
    expect(getCardClasses(true, false, 'custom-card'))
      .toBe('rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow custom-card');
  });

  // 극한 케이스 테스트
  it('handles extremely long class names', () => {
    const longClassName = 'a'.repeat(1000);
    expect(cn('short', longClassName, 'another')).toBe(`short ${longClassName} another`);
  });

  it('handles many empty strings', () => {
    const emptyStrings = Array(100).fill('');
    expect(cn('start', ...emptyStrings, 'end')).toBe('start end');
  });

  it('handles alternating truthy/falsy values', () => {
    const values = Array.from({ length: 20 }, (_, i) => 
      i % 2 === 0 ? `class-${i}` : false
    );
    
    const result = cn(...values);
    const expected = Array.from({ length: 10 }, (_, i) => `class-${i * 2}`).join(' ');
    
    expect(result).toBe(expected);
  });
});