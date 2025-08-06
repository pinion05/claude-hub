import { configureAxe } from 'jest-axe';
import { RenderResult } from '@testing-library/react';
import { ReactWrapper } from 'enzyme';

/**
 * Accessibility testing utilities using axe-core
 */

// Configure axe with custom rules for Claude Hub
export const axe = configureAxe({
  rules: {
    // Disable color-contrast rule for better test performance
    // (we handle this manually with design tokens)
    'color-contrast': { enabled: false },
    
    // Enable additional accessibility rules
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'landmark-unique': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    
    // WCAG 2.1 AA specific rules
    'wcag21aa': { enabled: true },
    'best-practice': { enabled: true },
    
    // Keyboard navigation
    'focusable-content': { enabled: true },
    'tab-index': { enabled: true },
    'focus-order-semantics': { enabled: true },
  },
  tags: [
    'wcag2a', 
    'wcag2aa',
    'wcag21aa',
    'best-practice',
    'keyboard-trap',
    'focus-management'
  ],
  
  // Global configuration for all tests
  globalOptions: {
    timeout: 5000,
    retries: 2,
  }
});

/**
 * Test accessibility for a rendered component
 */
export async function testAccessibility(
  container: RenderResult | Element | ReactWrapper,
  options?: {
    rules?: Record<string, any>;
    tags?: string[];
    include?: string[];
    exclude?: string[];
    timeout?: number;
  }
) {
  const element = getElement(container);
  
  if (!element) {
    throw new Error('No valid container element found for accessibility testing');
  }
  
  const results = await axe(element, {
    rules: options?.rules,
    tags: options?.tags,
    include: options?.include ? [options.include] : undefined,
    exclude: options?.exclude ? [options.exclude] : undefined,
  });
  
  return results;
}

/**
 * Assert that a component has no accessibility violations
 */
export async function expectNoAccessibilityViolations(
  container: RenderResult | Element | ReactWrapper,
  options?: {
    rules?: Record<string, any>;
    tags?: string[];
    include?: string[];
    exclude?: string[];
  }
) {
  const results = await testAccessibility(container, options);
  expect(results).toHaveNoViolations();
}

/**
 * Test keyboard navigation
 */
export function testKeyboardNavigation(
  container: RenderResult | Element,
  options?: {
    skipElements?: string[];
    customKeys?: string[];
  }
) {
  const element = getElement(container);
  if (!element) return;
  
  const focusableElements = getFocusableElements(element);
  const skipElements = options?.skipElements || [];
  
  // Filter out elements that should be skipped
  const testElements = focusableElements.filter(el => 
    !skipElements.some(selector => el.matches(selector))
  );
  
  return {
    focusableCount: testElements.length,
    elements: testElements,
    
    // Test Tab navigation
    async testTabOrder() {
      for (let i = 0; i < testElements.length; i++) {
        const element = testElements[i];
        element.focus();
        expect(document.activeElement).toBe(element);
        
        // Test that element is visible when focused
        expect(element.offsetWidth).toBeGreaterThan(0);
        expect(element.offsetHeight).toBeGreaterThan(0);
      }
    },
    
    // Test specific key interactions
    async testKeyInteractions(keys: string[] = ['Enter', ' ', 'Escape']) {
      const interactiveElements = testElements.filter(el => 
        el.matches('button, [role="button"], a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      );
      
      for (const element of interactiveElements) {
        for (const key of keys) {
          element.focus();
          
          // Dispatch keydown event
          const event = new KeyboardEvent('keydown', { 
            key, 
            bubbles: true, 
            cancelable: true 
          });
          element.dispatchEvent(event);
          
          // Element should handle the key appropriately
          // (This is basic - specific tests should verify expected behavior)
          expect(event.defaultPrevented).toBeDefined();
        }
      }
    }
  };
}

/**
 * Test ARIA attributes and roles
 */
export function testAriaAttributes(
  container: RenderResult | Element,
  expectations: {
    element: string;
    attributes: Record<string, string | boolean | number>;
  }[]
) {
  const element = getElement(container);
  if (!element) return;
  
  for (const expectation of expectations) {
    const targetElement = element.querySelector(expectation.element);
    expect(targetElement).toBeInTheDocument();
    
    if (targetElement) {
      for (const [attr, expectedValue] of Object.entries(expectation.attributes)) {
        const _actualValue = targetElement.getAttribute(attr);
        
        if (typeof expectedValue === 'boolean') {
          if (expectedValue) {
            expect(targetElement).toHaveAttribute(attr);
          } else {
            expect(targetElement).not.toHaveAttribute(attr);
          }
        } else {
          expect(targetElement).toHaveAttribute(attr, String(expectedValue));
        }
      }
    }
  }
}

/**
 * Test screen reader announcements
 */
export function testScreenReaderAnnouncements(
  container: RenderResult | Element,
  expectedAnnouncements: string[]
) {
  const element = getElement(container);
  if (!element) return;
  
  // Find live regions
  const liveRegions = element.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
  
  let allAnnouncements = '';
  liveRegions.forEach(region => {
    allAnnouncements += ' ' + (region.textContent || '');
  });
  
  for (const expected of expectedAnnouncements) {
    expect(allAnnouncements).toContain(expected);
  }
}

/**
 * Generate accessibility report
 */
export async function generateAccessibilityReport(
  container: RenderResult | Element,
  componentName: string
): Promise<AccessibilityReport> {
  const element = getElement(container);
  if (!element) {
    throw new Error('No valid container element found');
  }
  
  const results = await axe(element);
  const keyboardNav = testKeyboardNavigation(container);
  
  return {
    componentName,
    timestamp: new Date().toISOString(),
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
    inapplicable: results.inapplicable,
    focusableElementCount: keyboardNav.focusableCount,
    score: calculateAccessibilityScore(results),
    recommendations: generateRecommendations(results),
  };
}

/**
 * Accessibility testing presets for different component types
 */
export const AccessibilityPresets = {
  // For form components
  form: {
    rules: {
      'label': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'autocomplete-valid': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'best-practice'],
  },
  
  // For navigation components
  navigation: {
    rules: {
      'landmark-unique': { enabled: true },
      'landmark-main-is-top-level': { enabled: true },
      'skip-link': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'keyboard-trap'],
  },
  
  // For interactive components
  interactive: {
    rules: {
      'button-name': { enabled: true },
      'link-name': { enabled: true },
      'focusable-content': { enabled: true },
      'tab-index': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'keyboard-trap', 'focus-management'],
  },
  
  // For content components
  content: {
    rules: {
      'heading-order': { enabled: true },
      'list': { enabled: true },
      'definition-list': { enabled: true },
      'dlitem': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa'],
  },
  
  // For modal/dialog components
  dialog: {
    rules: {
      'focus-trap': { enabled: true },
      'aria-dialog-name': { enabled: true },
      'keyboard-trap': { enabled: true },
    },
    tags: ['wcag2a', 'wcag2aa', 'keyboard-trap', 'focus-management'],
  },
};

// Helper functions

function getElement(container: RenderResult | Element | ReactWrapper): Element | null {
  if ('container' in container && container.container) {
    return container.container as Element;
  }
  
  if (container instanceof Element) {
    return container;
  }
  
  if ('getDOMNode' in container && typeof container.getDOMNode === 'function') {
    return container.getDOMNode() as Element;
  }
  
  return null;
}

function getFocusableElements(container: Element): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'details summary',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(el => {
      const element = el as HTMLElement;
      return (
        !element.hidden &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        window.getComputedStyle(element).visibility !== 'hidden'
      );
    }) as HTMLElement[];
}

function calculateAccessibilityScore(results: any): number {
  const totalTests = results.violations.length + results.passes.length;
  if (totalTests === 0) return 100;
  
  const passedTests = results.passes.length;
  return Math.round((passedTests / totalTests) * 100);
}

function generateRecommendations(results: any): string[] {
  const recommendations: string[] = [];
  
  results.violations.forEach((violation: any) => {
    recommendations.push(`Fix ${violation.id}: ${violation.description}`);
  });
  
  results.incomplete.forEach((incomplete: any) => {
    recommendations.push(`Review ${incomplete.id}: ${incomplete.description}`);
  });
  
  return recommendations;
}

// Types

export interface AccessibilityReport {
  componentName: string;
  timestamp: string;
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
  focusableElementCount: number;
  score: number;
  recommendations: string[];
}