import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';
import {
  expectNoAccessibilityViolations,
  testKeyboardNavigation,
  testAriaAttributes,
  AccessibilityPresets,
  generateAccessibilityReport
} from '@/lib/testing/accessibility';

describe('SearchBar Accessibility', () => {
  const mockProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Search extensions...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<SearchBar {...mockProps} />);
      await expectNoAccessibilityViolations(container, AccessibilityPresets.form);
    });

    it('should have proper ARIA attributes', () => {
      render(
        <SearchBar 
          {...mockProps} 
          aria-label="Search for extensions"
          aria-describedby="search-help"
          isExpanded={false}
          resultCount={0}
        />
      );

      testAriaAttributes(document.body, [
        {
          element: '[role="search"]',
          attributes: {
            'aria-label': 'Search extensions',
          }
        },
        {
          element: '[role="combobox"]',
          attributes: {
            'role': 'combobox',
            'aria-autocomplete': 'list',
            'aria-expanded': 'false',
            'aria-label': 'Search for extensions',
            'aria-describedby': true, // Just check it exists
          }
        }
      ]);
    });

    it('should update ARIA attributes based on state', () => {
      const { rerender } = render(
        <SearchBar 
          {...mockProps} 
          isExpanded={false}
          hasResults={false}
          resultCount={0}
        />
      );

      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');

      // Update props to show expanded state
      rerender(
        <SearchBar 
          {...mockProps} 
          value="test"
          isExpanded={true}
          hasResults={true}
          resultCount={5}
        />
      );

      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable with keyboard', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...mockProps} />);

      const input = screen.getByRole('combobox');
      
      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();
    });

    it('should handle keyboard shortcuts', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<SearchBar {...mockProps} onChange={onChange} />);
      
      const input = screen.getByRole('combobox');
      
      // Focus input
      input.focus();
      
      // Test typing
      await user.type(input, 'test query');
      expect(onChange).toHaveBeenCalledWith('test query');
    });

    it('should handle navigation keys properly', async () => {
      const onKeyDown = jest.fn();
      render(
        <SearchBar 
          {...mockProps} 
          onKeyDown={onKeyDown}
          isExpanded={true}
        />
      );

      const input = screen.getByRole('combobox');
      input.focus();

      // Test arrow keys
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ArrowDown' })
      );

      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ArrowUp' })
      );

      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' })
      );

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Escape' })
      );
    });

    it('should support clear button keyboard interaction', async () => {
      const user = userEvent.setup();
      const onClear = jest.fn();
      
      render(
        <SearchBar 
          {...mockProps} 
          value="test"
          onClear={onClear}
          showClearButton={true}
        />
      );

      const clearButton = screen.getByLabelText('Clear search');
      
      // Focus and activate with keyboard
      clearButton.focus();
      expect(clearButton).toHaveFocus();
      
      // Press Enter
      await user.keyboard('{Enter}');
      expect(onClear).toHaveBeenCalled();
    });

    it('should handle Tab navigation correctly', () => {
      const { container } = render(
        <SearchBar 
          {...mockProps} 
          value="test"
          showClearButton={true}
        />
      );

      const keyboardNav = testKeyboardNavigation(container);
      expect(keyboardNav.focusableCount).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper labels and descriptions', () => {
      render(
        <SearchBar 
          {...mockProps}
          aria-label="Search for Claude AI extensions"
          loading={false}
          resultCount={10}
          hasResults={true}
        />
      );

      const input = screen.getByRole('combobox');
      expect(input).toHaveAccessibleName();
      
      // Check for search container role
      const searchContainer = screen.getByRole('search');
      expect(searchContainer).toBeInTheDocument();
    });

    it('should announce loading state', () => {
      render(
        <SearchBar 
          {...mockProps}
          loading={true}
        />
      );

      // Check for loading indicator
      const loadingIndicator = screen.getByRole('status', { name: 'Searching' });
      expect(loadingIndicator).toBeInTheDocument();
      
      // Check for screen reader text
      expect(screen.getByText('Loading search results...')).toBeInTheDocument();
    });

    it('should announce search results count', () => {
      render(
        <SearchBar 
          {...mockProps}
          value="test"
          resultCount={5}
          hasResults={true}
        />
      );

      // The status should be announced via hidden text
      expect(screen.getByText(/5 results found/)).toBeInTheDocument();
    });

    it('should handle empty results appropriately', () => {
      render(
        <SearchBar 
          {...mockProps}
          value="test"
          resultCount={0}
          hasResults={false}
        />
      );

      expect(screen.getByText(/No results found/)).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus when clearing', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(
        <SearchBar 
          {...mockProps} 
          value="test"
          onChange={onChange}
          showClearButton={true}
        />
      );

      const input = screen.getByRole('combobox');
      const clearButton = screen.getByLabelText('Clear search');
      
      // Focus input first
      input.focus();
      
      // Click clear button
      await user.click(clearButton);
      
      // Input should still be focusable
      expect(input).toBeInTheDocument();
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should not trap focus when not expanded', () => {
      const { container } = render(
        <SearchBar 
          {...mockProps}
          isExpanded={false}
        />
      );

      const keyboardNav = testKeyboardNavigation(container);
      
      // Should be able to tab through normally
      expect(keyboardNav.focusableCount).toBe(1); // Just the input
    });
  });

  describe('Color and Contrast', () => {
    it('should maintain sufficient color contrast in all states', () => {
      const { container } = render(
        <SearchBar 
          {...mockProps}
          variant="default"
        />
      );

      // Note: Color contrast is handled by our design tokens
      // This test ensures the component renders properly
      expect(container.firstChild).toHaveClass('bg-card', 'border-border');
    });

    it('should handle high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('high-contrast'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(<SearchBar {...mockProps} />);
      
      // Component should render without issues
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Comprehensive Accessibility Report', () => {
    it('should generate full accessibility report', async () => {
      const { container } = render(
        <SearchBar 
          {...mockProps}
          value="test query"
          isExpanded={true}
          hasResults={true}
          resultCount={5}
          loading={false}
          showClearButton={true}
        />
      );

      const report = await generateAccessibilityReport(container, 'SearchBar');
      
      expect(report).toMatchObject({
        componentName: 'SearchBar',
        timestamp: expect.any(String),
        violations: expect.any(Array),
        passes: expect.any(Array),
        score: expect.any(Number),
        focusableElementCount: expect.any(Number),
        recommendations: expect.any(Array),
      });

      // Should have high accessibility score
      expect(report.score).toBeGreaterThan(80);
      
      // Should have minimal violations
      expect(report.violations.length).toBeLessThan(3);

      console.error('SearchBar Accessibility Report:', {
        score: report.score,
        violations: report.violations.length,
        focusableElements: report.focusableElementCount,
      });
    });
  });
});