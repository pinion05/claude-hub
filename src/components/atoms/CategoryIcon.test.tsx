import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryIcon } from './CategoryIcon';
import { ExtensionCategory } from '@/types';

describe('CategoryIcon', () => {
  // 기본 렌더링 테스트
  it('renders category icon', () => {
    render(<CategoryIcon category="Development" />);
    const icon = screen.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon.tagName).toBe('SPAN');
  });

  // 카테고리별 아이콘 테스트
  describe('category icons', () => {
    const categoryIcons: Array<{ category: ExtensionCategory; expectedIcon: string }> = [
      { category: 'Development', expectedIcon: '⚡' },
      { category: 'API', expectedIcon: '🔌' },
      { category: 'Browser', expectedIcon: '🌐' },
      { category: 'Productivity', expectedIcon: '🚀' },
      { category: 'Terminal', expectedIcon: '💻' },
      { category: 'Data', expectedIcon: '📊' },
      { category: 'Mobile', expectedIcon: '📱' },
      { category: 'DevOps', expectedIcon: '🔧' },
      { category: 'CMS', expectedIcon: '📝' },
      { category: 'E-commerce', expectedIcon: '🛒' },
      { category: 'Education', expectedIcon: '🎓' },
    ];

    it.each(categoryIcons)('displays correct icon for $category category', ({ category, expectedIcon }) => {
      render(<CategoryIcon category={category} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveTextContent(expectedIcon);
    });

    it('displays fallback icon for unknown category', () => {
      // TypeScript에서는 이런 케이스가 불가능하지만, 런타임에서는 가능할 수 있음
      const unknownCategory = 'UnknownCategory' as ExtensionCategory;
      render(<CategoryIcon category={unknownCategory} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveTextContent('📦');
    });
  });

  // 접근성 테스트
  describe('accessibility', () => {
    it('has proper role attribute', () => {
      render(<CategoryIcon category="Development" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('role', 'img');
    });

    it('has descriptive aria-label', () => {
      render(<CategoryIcon category="API" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'API icon');
    });

    it('generates correct aria-label for all categories', () => {
      const categories: ExtensionCategory[] = [
        'Development', 'API', 'Browser', 'Productivity', 'Terminal', 
        'Data', 'Mobile', 'DevOps', 'CMS', 'E-commerce', 'Education'
      ];

      categories.forEach(category => {
        const { unmount } = render(<CategoryIcon category={category} />);
        const icon = screen.getByRole('img');
        expect(icon).toHaveAttribute('aria-label', `${category} icon`);
        unmount();
      });
    });

    it('is discoverable by assistive technologies', () => {
      render(<CategoryIcon category="Development" />);
      const icon = screen.getByLabelText('Development icon');
      expect(icon).toBeInTheDocument();
    });
  });

  // 스타일링 테스트
  describe('styling', () => {
    it('applies default classes', () => {
      render(<CategoryIcon category="Development" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('applies custom className', () => {
      render(<CategoryIcon category="Development" className="custom-class" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(<CategoryIcon category="Development" className="text-lg bg-blue-500" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveClass(
        'text-lg',
        'bg-blue-500',
        'inline-flex',
        'items-center',
        'justify-center'
      );
    });

    it('works without custom className', () => {
      render(<CategoryIcon category="Development" />);
      const icon = screen.getByRole('img');
      // Should not have undefined or empty class
      expect(icon.className).not.toMatch(/undefined/);
    });

    it('handles empty className gracefully', () => {
      render(<CategoryIcon category="Development" className="" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });
  });

  // 컨텐츠 검증 테스트
  describe('content validation', () => {
    it('renders emoji icons correctly', () => {
      render(<CategoryIcon category="Development" />);
      const icon = screen.getByRole('img');
      expect(icon.textContent).toMatch(/⚡/);
    });

    it('contains only the expected emoji character', () => {
      render(<CategoryIcon category="API" />);
      const icon = screen.getByRole('img');
      expect(icon.textContent).toBe('🔌');
      expect(icon.textContent?.length).toBe(2); // Emoji는 보통 2개의 UTF-16 코드 유닛
    });

    it('does not render additional text content', () => {
      render(<CategoryIcon category="Browser" />);
      const icon = screen.getByRole('img');
      expect(icon.textContent).toBe('🌐');
      expect(icon.textContent).not.toContain('Browser');
    });
  });

  // 실제 사용 사례 테스트
  describe('real-world usage scenarios', () => {
    it('works in lists of categories', () => {
      const categories: ExtensionCategory[] = ['Development', 'API', 'Browser'];
      
      render(
        <div>
          {categories.map((category, index) => (
            <CategoryIcon key={index} category={category} className="mr-2" />
          ))}
        </div>
      );

      const icons = screen.getAllByRole('img');
      expect(icons).toHaveLength(3);
      expect(icons[0]).toHaveTextContent('⚡');
      expect(icons[1]).toHaveTextContent('🔌');
      expect(icons[2]).toHaveTextContent('🌐');
    });

    it('works as part of a card header', () => {
      render(
        <div className="card-header" data-testid="card-header">
          <CategoryIcon category="Productivity" className="w-5 h-5 mr-2" />
          <span>Productivity Tools</span>
        </div>
      );

      const header = screen.getByTestId('card-header');
      const icon = screen.getByRole('img');
      
      expect(header).toContainElement(icon);
      expect(icon).toHaveTextContent('🚀');
      expect(icon).toHaveClass('w-5', 'h-5', 'mr-2');
    });

    it('works in navigation menus', () => {
      render(
        <nav>
          <a href="/terminal" className="nav-link">
            <CategoryIcon category="Terminal" className="inline mr-1" />
            Terminal Tools
          </a>
        </nav>
      );

      const link = screen.getByRole('link');
      const icon = screen.getByRole('img');
      
      expect(link).toContainElement(icon);
      expect(icon).toHaveTextContent('💻');
    });

    it('works with different styling contexts', () => {
      render(
        <div>
          <CategoryIcon category="Data" className="text-2xl p-2 bg-gray-100 rounded" />
          <CategoryIcon category="Mobile" className="text-sm opacity-50" />
          <CategoryIcon category="DevOps" className="hover:scale-110 transition-transform" />
        </div>
      );

      const icons = screen.getAllByRole('img');
      expect(icons[0]).toHaveClass('text-2xl', 'p-2', 'bg-gray-100', 'rounded');
      expect(icons[1]).toHaveClass('text-sm', 'opacity-50');
      expect(icons[2]).toHaveClass('hover:scale-110', 'transition-transform');
    });
  });

  // 타입 안정성 테스트
  describe('type safety', () => {
    it('accepts all valid ExtensionCategory types', () => {
      const validCategories: ExtensionCategory[] = [
        'Development', 'API', 'Browser', 'Productivity', 'Terminal',
        'Data', 'Mobile', 'DevOps', 'CMS', 'E-commerce', 'Education'
      ];

      validCategories.forEach(category => {
        expect(() => {
          render(<CategoryIcon category={category} />);
        }).not.toThrow();
      });
    });

    it('maintains consistency with ExtensionCategory type', () => {
      // 이 테스트는 컴파일 타임에 타입 체크가 제대로 되는지 확인
      const category: ExtensionCategory = 'Development';
      expect(() => {
        render(<CategoryIcon category={category} />);
      }).not.toThrow();
    });
  });

  // 성능 관련 테스트
  describe('performance considerations', () => {
    it('renders quickly with minimal DOM operations', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<CategoryIcon category="Development" />);
        unmount();
      }
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // 100개의 컴포넌트를 500ms 이내에 렌더링할 수 있어야 함
      expect(renderTime).toBeLessThan(500);
    });

    it('has minimal re-renders with same props', () => {
      const { rerender } = render(<CategoryIcon category="API" className="test-class" />);
      const icon = screen.getByRole('img');
      const initialElement = icon;
      
      // 같은 props로 리렌더링
      rerender(<CategoryIcon category="API" className="test-class" />);
      const rerenderedIcon = screen.getByRole('img');
      
      // DOM 노드가 재사용되어야 함 (React의 최적화로 인해)
      expect(rerenderedIcon).toBe(initialElement);
    });
  });

  // Edge cases 테스트
  describe('edge cases', () => {
    it('handles undefined className gracefully', () => {
      render(<CategoryIcon category="CMS" className={undefined as any} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('renders correctly when used in different React contexts', () => {
      const TestContext = React.createContext({ theme: 'dark' });
      
      render(
        <TestContext.Provider value={{ theme: 'dark' }}>
          <CategoryIcon category="E-commerce" className="themed-icon" />
        </TestContext.Provider>
      );

      const icon = screen.getByRole('img');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('🛒');
    });
  });
});